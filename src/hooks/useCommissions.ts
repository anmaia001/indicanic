import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Commission } from "@/lib/index";
import { useAuth } from "./useAuth";

interface CommissionRow {
  id: string;
  indication_id: string;
  affiliate_id: string;
  value: number;
  status: string;
  reference_month: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { name: string } | null;
  indications?: { client_name: string } | null;
}

function rowToCommission(row: CommissionRow): Commission {
  return {
    id: row.id,
    indicationId: row.indication_id,
    affiliateId: row.affiliate_id,
    affiliateName: row.profiles?.name ?? "—",
    clientName: row.indications?.client_name ?? "—",
    value: Number(row.value),
    status: row.status as "pending" | "approved" | "paid",
    referenceMonth: row.reference_month,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
  };
}

// ============================================================
// QUERY: listar comissões
// ============================================================

export function useCommissions(affiliateId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["commissions", affiliateId ?? "all"],
    queryFn: async (): Promise<Commission[]> => {
      let query = supabase
        .from("commissions")
        .select("*, profiles(name), indications(client_name)")
        .order("created_at", { ascending: false });

      if (user?.role === "affiliate") {
        query = query.eq("affiliate_id", user.id);
      } else if (affiliateId) {
        query = query.eq("affiliate_id", affiliateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as CommissionRow[]).map(rowToCommission);
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

// ============================================================
// MUTATION: aprovar comissão (admin)
// ============================================================

export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { data, error } = await supabase
        .from("commissions")
        .update({ status: "approved" })
        .eq("id", commissionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

// ============================================================
// MUTATION: marcar comissão como paga (admin)
// ============================================================

export function usePayCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commissionId,
      paymentMethod,
    }: {
      commissionId: string;
      paymentMethod: string;
    }) => {
      const { data, error } = await supabase
        .from("commissions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
        })
        .eq("id", commissionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["indications"] });
    },
  });
}
