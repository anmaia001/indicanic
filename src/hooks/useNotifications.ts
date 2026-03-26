import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ROUTE_PATHS } from "@/lib/index";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "new_indication" | "status_change" | "commission" | "info";
  read: boolean;
  createdAt: string;
  link?: string;
}

// Gera notificações derivadas das tabelas reais (indications + commissions)
export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id, user?.role],
    enabled: !!user,
    queryFn: async (): Promise<AppNotification[]> => {
      const notifications: AppNotification[] = [];
      const readIds: string[] = JSON.parse(
        localStorage.getItem(`notif_read_${user!.id}`) ?? "[]"
      );

      const isRead = (id: string) => readIds.includes(id);

      if (user!.role === "admin") {
        // ── Admin: indicações criadas nos últimos 7 dias ──
        const since = new Date();
        since.setDate(since.getDate() - 7);

        const { data: recentInd } = await supabase
          .from("indications")
          .select("id, client_name, created_at, affiliate_id, profiles!indications_affiliate_id_fkey(name)")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false })
          .limit(10);

        for (const ind of recentInd ?? []) {
          const id = `ind_new_${ind.id}`;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const affiliateName = (ind as any).profiles?.name ?? "Afiliado";
          notifications.push({
            id,
            title: "Nova indicação",
            message: `${affiliateName} indicou ${ind.client_name}`,
            type: "new_indication",
            read: isRead(id),
            createdAt: ind.created_at,
            link: ROUTE_PATHS.ADMIN_INDICATIONS,
          });
        }

        // ── Admin: comissões pendentes de aprovação ──
        const { data: pendingComm } = await supabase
          .from("commissions")
          .select("id, value, profiles!commissions_affiliate_id_fkey(name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);

        for (const comm of pendingComm ?? []) {
          const id = `comm_pending_${comm.id}`;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const affiliateName = (comm as any).profiles?.name ?? "Afiliado";
          notifications.push({
            id,
            title: "Comissão aguardando aprovação",
            message: `${affiliateName} — R$ ${Number(comm.value).toFixed(2).replace(".", ",")}`,
            type: "commission",
            read: isRead(id),
            createdAt: new Date().toISOString(),
            link: ROUTE_PATHS.ADMIN_REPORTS,
          });
        }
      } else {
        // ── Afiliado: suas indicações com status atualizado nos últimos 7 dias ──
        const since = new Date();
        since.setDate(since.getDate() - 7);

        const { data: myInd } = await supabase
          .from("indications")
          .select("id, client_name, status, updated_at")
          .eq("affiliate_id", user!.id)
          .gte("updated_at", since.toISOString())
          .order("updated_at", { ascending: false })
          .limit(10);

        const statusLabel: Record<string, string> = {
          indication: "Indicação recebida",
          budget: "Em orçamento",
          installation: "Em instalação",
          active: "Instalação concluída ✅",
          commission_paid: "Comissão paga 💰",
          cancelled: "Cancelada",
        };

        for (const ind of myInd ?? []) {
          const id = `ind_status_${ind.id}_${ind.status}`;
          notifications.push({
            id,
            title: statusLabel[ind.status] ?? "Status atualizado",
            message: `Indicação de ${ind.client_name}`,
            type: "status_change",
            read: isRead(id),
            createdAt: ind.updated_at,
            link: ROUTE_PATHS.AFFILIATE_INDICATIONS,
          });
        }

        // ── Afiliado: comissões aprovadas ou pagas ──
        const { data: myComm } = await supabase
          .from("commissions")
          .select("id, value, status, updated_at")
          .eq("affiliate_id", user!.id)
          .in("status", ["approved", "paid"])
          .gte("updated_at", since.toISOString())
          .order("updated_at", { ascending: false })
          .limit(5);

        for (const comm of myComm ?? []) {
          const id = `comm_${comm.id}_${comm.status}`;
          notifications.push({
            id,
            title: comm.status === "paid" ? "Comissão paga! 💰" : "Comissão aprovada ✅",
            message: `R$ ${Number(comm.value).toFixed(2).replace(".", ",")} ${comm.status === "paid" ? "depositado" : "aprovado para pagamento"}`,
            type: "commission",
            read: isRead(id),
            createdAt: comm.updated_at,
            link: ROUTE_PATHS.AFFILIATE_COMMISSIONS,
          });
        }
      }

      // Ordenar do mais recente para o mais antigo
      return notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    refetchInterval: 30_000, // atualiza a cada 30 segundos
  });
}

// Marca uma notificação como lida (persiste no localStorage)
export function useMarkNotificationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const key = `notif_read_${user!.id}`;
      const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!existing.includes(notificationId)) {
        localStorage.setItem(key, JSON.stringify([...existing, notificationId]));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Marca todas como lidas
export function useMarkAllRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const key = `notif_read_${user!.id}`;
      localStorage.setItem(key, JSON.stringify(ids));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
