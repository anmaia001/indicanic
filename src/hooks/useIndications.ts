import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Indication, IndicationStatus, ServiceType } from "@/lib/index";
import { useAuth } from "./useAuth";

// ============================================================
// TYPES: Supabase row → app type
// ============================================================

interface IndicationRow {
  id: string;
  affiliate_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  client_address: string | null;
  service_type: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  contract_value: number | null;
  monthly_fee: number | null;
  commission_value: number | null;
  commission_rate: number;
  budget_date: string | null;
  installation_date: string | null;
  activation_date: string | null;
  commission_paid_date: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { name: string } | null;
}

function rowToIndication(row: IndicationRow): Indication {
  return {
    id: row.id,
    affiliateId: row.affiliate_id,
    affiliateName: row.profiles?.name ?? "—",
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email ?? undefined,
    clientAddress: row.client_address ?? undefined,
    serviceType: row.service_type as ServiceType,
    status: row.status as IndicationStatus,
    notes: row.notes ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    contractValue: row.contract_value ?? undefined,
    monthlyFee: row.monthly_fee ?? undefined,
    commissionValue: row.commission_value ?? undefined,
    commissionRate: row.commission_rate,
    budgetDate: row.budget_date ?? undefined,
    installationDate: row.installation_date ?? undefined,
    activationDate: row.activation_date ?? undefined,
    commissionPaidDate: row.commission_paid_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// QUERY: listar indicações
// ============================================================

export function useIndications(affiliateId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["indications", affiliateId ?? "all"],
    queryFn: async (): Promise<Indication[]> => {
      let query = supabase
        .from("indications")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false });

      // Afiliado: filtra pelas próprias indicações
      if (user?.role === "affiliate") {
        query = query.eq("affiliate_id", user.id);
      } else if (affiliateId) {
        query = query.eq("affiliate_id", affiliateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as IndicationRow[]).map(rowToIndication);
    },
    enabled: !!user,
    retry: 3,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
    staleTime: 30_000,
  });
}

// ============================================================
// MUTATION: criar indicação
// ============================================================

interface CreateIndicationInput {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  serviceType: ServiceType;
  notes?: string;
  contractValue?: number;
}

export function useCreateIndication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateIndicationInput) => {
      if (!user) throw new Error("Usuário não autenticado");

      const commissionRate = user.commissionRate ?? 10;
      const commissionValue = input.contractValue
        ? Math.round(input.contractValue * commissionRate) / 100
        : null;

      const { data, error } = await supabase
        .from("indications")
        .insert({
          affiliate_id: user.id,
          client_name: input.clientName,
          client_phone: input.clientPhone,
          client_email: input.clientEmail ?? null,
          client_address: input.clientAddress ?? null,
          service_type: input.serviceType,
          status: "indication",
          notes: input.notes ?? null,
          contract_value: input.contractValue ?? null,
          commission_rate: commissionRate,
          commission_value: commissionValue,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indications"] });
    },
  });
}

// ============================================================
// MUTATION: atualizar status da indicação (admin)
// ============================================================

export function useUpdateIndicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
      contractValue,
      monthlyFee,
    }: {
      id: string;
      status: IndicationStatus;
      adminNotes?: string;
      contractValue?: number;
      monthlyFee?: number;
    }) => {
      const updates: Record<string, unknown> = { status };

      if (adminNotes !== undefined) updates.admin_notes = adminNotes;
      if (contractValue !== undefined) updates.contract_value = contractValue;
      if (monthlyFee !== undefined) updates.monthly_fee = monthlyFee;

      // Definir datas de etapa automaticamente
      const today = new Date().toISOString().split("T")[0];
      if (status === "budget") updates.budget_date = today;
      if (status === "installation") updates.installation_date = today;
      if (status === "active") updates.activation_date = today;

      const { data, error } = await supabase
        .from("indications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indications"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

// ============================================================
// MUTATION: atualizar indicação (afiliado - campos básicos)
// ============================================================

export function useUpdateIndication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      clientName?: string;
      clientPhone?: string;
      clientEmail?: string;
      clientAddress?: string;
      notes?: string;
      contractValue?: number;
    }) => {
      const payload: Record<string, unknown> = {};
      if (updates.clientName) payload.client_name = updates.clientName;
      if (updates.clientPhone) payload.client_phone = updates.clientPhone;
      if (updates.clientEmail !== undefined) payload.client_email = updates.clientEmail;
      if (updates.clientAddress !== undefined) payload.client_address = updates.clientAddress;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.contractValue !== undefined) payload.contract_value = updates.contractValue;

      const { data, error } = await supabase
        .from("indications")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indications"] });
    },
  });
}
