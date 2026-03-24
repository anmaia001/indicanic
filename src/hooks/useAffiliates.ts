import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/lib/index";

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
      // Buscar token da sessão atual (admin)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sem sessão ativa — faça login novamente");

      // Chamar Edge Function (verify_jwt=false, auth manual dentro da função)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-affiliate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
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
      console.log("[create-affiliate] status:", response.status, "data:", data);

      if (!response.ok) {
        throw new Error(data?.error ?? `Erro HTTP ${response.status}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
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
