import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/lib/index";
import { useAuth } from "./useAuth";

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  cpf: string | null;
  pix_key: string | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

interface ProfileWithStats extends ProfileRow {
  indication_count: number;
  total_commissions: number;
  pending_commissions: number;
}

function rowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as "affiliate" | "admin",
    phone: row.phone ?? undefined,
    cpf: row.cpf ?? undefined,
    pixKey: row.pix_key ?? undefined,
    commissionRate: Number(row.commission_rate),
    totalCommissions: 0,
    pendingCommissions: 0,
    totalIndications: 0,
    createdAt: row.created_at,
    isActive: row.is_active,
  };
}

// ============================================================
// QUERY: listar afiliados (admin)
// ============================================================

export function useAffiliates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["affiliates"],
    queryFn: async (): Promise<User[]> => {
      // Buscar perfis com contagem de indicações e comissões
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "affiliate")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      // Para cada afiliado, buscar estatísticas
      const usersWithStats: User[] = await Promise.all(
        (profiles as ProfileRow[]).map(async (p) => {
          const [indicationsRes, commissionsRes] = await Promise.all([
            supabase
              .from("indications")
              .select("id", { count: "exact" })
              .eq("affiliate_id", p.id),
            supabase
              .from("commissions")
              .select("value, status")
              .eq("affiliate_id", p.id),
          ]);

          const totalIndications = indicationsRes.count ?? 0;
          const allCommissions = commissionsRes.data ?? [];
          const totalCommissions = allCommissions
            .filter((c) => c.status === "paid")
            .reduce((s, c) => s + Number(c.value), 0);
          const pendingCommissions = allCommissions
            .filter((c) => c.status !== "paid")
            .reduce((s, c) => s + Number(c.value), 0);

          return {
            ...rowToUser(p),
            totalIndications,
            totalCommissions,
            pendingCommissions,
          };
        })
      );

      return usersWithStats;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
    staleTime: 60_000,
  });
}

// ============================================================
// MUTATION: criar afiliado via Edge Function (não desloga admin)
// ============================================================

export function useCreateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      phone?: string;
      commissionRate: number;
      temporaryPassword: string;
    }) => {
      // 1. Tenta obter sessão ativa; se expirada, força refresh
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session;
      }
      if (!session?.access_token) {
        throw new Error("Sessão expirada — faça login novamente");
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // 2. Tenta até 3 vezes com backoff exponencial
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 800 * attempt));
        }
        try {
          const response = await fetch(
            `${supabaseUrl}/functions/v1/create-affiliate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
                "apikey": supabaseAnonKey,
              },
              body: JSON.stringify({
                name: input.name,
                email: input.email,
                phone: input.phone ?? null,
                commissionRate: input.commissionRate,
                temporaryPassword: input.temporaryPassword,
              }),
            }
          );

          const data = await response.json();
          console.log(`[create-affiliate] tentativa ${attempt + 1}, status:`, response.status, data);

          if (!response.ok) {
            // Erro de negócio (ex: email duplicado) — não tenta de novo
            throw new Error(data?.error ?? `Erro HTTP ${response.status}`);
          }

          return data;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          // Só retentar em erros de rede/timeout, não de negócio
          const isNetworkError = !(err instanceof Error && /HTTP \d{3}/.test(err.message));
          if (!isNetworkError || attempt === 2) break;
          console.warn(`[create-affiliate] tentativa ${attempt + 1} falhou, retentando...`, lastError.message);
        }
      }

      throw lastError ?? new Error("Erro desconhecido ao cadastrar afiliado");
    },
    onSuccess: () => {
      // Invalida e força refetch imediato
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      queryClient.refetchQueries({ queryKey: ["affiliates"] });
    },
  });
}

// ============================================================
// MUTATION: atualizar afiliado (admin)
// ============================================================

export function useUpdateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      phone?: string;
      commissionRate?: number;
      isActive?: boolean;
    }) => {
      const payload: Record<string, unknown> = {};
      if (input.name !== undefined) payload.name = input.name;
      if (input.phone !== undefined) payload.phone = input.phone;
      if (input.commissionRate !== undefined) payload.commission_rate = input.commissionRate;
      if (input.isActive !== undefined) payload.is_active = input.isActive;

      const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

// ============================================================
// MUTATION: atualizar próprio perfil (afiliado)
// ============================================================

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      phone?: string;
      pixKey?: string;
    }) => {
      const payload: Record<string, unknown> = {};
      if (input.name !== undefined) payload.name = input.name;
      if (input.phone !== undefined) payload.phone = input.phone;
      if (input.pixKey !== undefined) payload.pix_key = input.pixKey;

      const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}
