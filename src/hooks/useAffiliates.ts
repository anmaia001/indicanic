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
// MUTATION: criar afiliado (admin cria user no Supabase Auth)
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
      // Criar usuário via Supabase Auth (signup)
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.temporaryPassword,
        options: {
          data: {
            name: input.name,
            role: "affiliate",
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Falha ao criar usuário");

      // Atualizar dados extras no profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: input.phone ?? null,
          commission_rate: input.commissionRate,
        })
        .eq("id", data.user.id);

      if (profileError) throw profileError;

      return data.user;
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
