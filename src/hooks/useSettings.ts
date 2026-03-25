import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CompanySettings {
  id?: string;
  company_name: string;
  phone: string;
  email: string;
  website: string;
  default_commission_rate: number;
  payment_due_days: number;
  notify_new_indication: boolean;
  notify_status_change: boolean;
  notify_commission_approved: boolean;
  notify_weekly_report: boolean;
}

const DEFAULT_SETTINGS: CompanySettings = {
  company_name: "",
  phone: "",
  email: "",
  website: "",
  default_commission_rate: 10,
  payment_due_days: 15,
  notify_new_indication: true,
  notify_status_change: true,
  notify_commission_approved: true,
  notify_weekly_report: false,
};

export function useSettings() {
  return useQuery({
    queryKey: ["company_settings"],
    queryFn: async (): Promise<CompanySettings> => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return DEFAULT_SETTINGS;

      return {
        id: data.id,
        company_name: data.company_name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        default_commission_rate: data.default_commission_rate ?? 10,
        payment_due_days: data.payment_due_days ?? 15,
        notify_new_indication: data.notify_new_indication ?? true,
        notify_status_change: data.notify_status_change ?? true,
        notify_commission_approved: data.notify_commission_approved ?? true,
        notify_weekly_report: data.notify_weekly_report ?? false,
      };
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: CompanySettings) => {
      // Verificar se já existe um registro
      const { data: existing } = await supabase
        .from("company_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        // Atualizar registro existente
        const { error } = await supabase
          .from("company_settings")
          .update({
            company_name: settings.company_name,
            phone: settings.phone,
            email: settings.email,
            website: settings.website,
            default_commission_rate: settings.default_commission_rate,
            payment_due_days: settings.payment_due_days,
            notify_new_indication: settings.notify_new_indication,
            notify_status_change: settings.notify_status_change,
            notify_commission_approved: settings.notify_commission_approved,
            notify_weekly_report: settings.notify_weekly_report,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from("company_settings")
          .insert({
            company_name: settings.company_name,
            phone: settings.phone,
            email: settings.email,
            website: settings.website,
            default_commission_rate: settings.default_commission_rate,
            payment_due_days: settings.payment_due_days,
            notify_new_indication: settings.notify_new_indication,
            notify_status_change: settings.notify_status_change,
            notify_commission_approved: settings.notify_commission_approved,
            notify_weekly_report: settings.notify_weekly_report,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company_settings"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
  });
}
