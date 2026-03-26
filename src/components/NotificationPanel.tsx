import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, TrendingUp, AlertCircle, Info, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useMarkAllRead, useMarkNotificationRead } from "@/hooks/useNotifications";
import type { AppNotification } from "@/hooks/useNotifications";
import { formatDate } from "@/lib/index";

const TYPE_CONFIG = {
  new_indication: { icon: TrendingUp,   color: "text-primary",     bg: "bg-primary/10"     },
  status_change:  { icon: TrendingUp,   color: "text-amber-400",   bg: "bg-amber-400/10"   },
  commission:     { icon: CheckCheck,   color: "text-emerald-400", bg: "bg-emerald-400/10" },
  info:           { icon: Info,         color: "text-blue-400",    bg: "bg-blue-400/10"    },
};

function NotifIcon({ type }: { type: AppNotification["type"] }) {
  const { icon: Icon, color, bg } = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
  return (
    <div className={`shrink-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
      <Icon size={14} className={color} />
    </div>
  );
}

export function NotificationPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useNotifications();
  const markRead    = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unread = notifications.filter((n) => !n.read);
  const hasUnread = unread.length > 0;

  const handleMarkAll = () => {
    markAllRead.mutate(notifications.map((n) => n.id));
  };

  const handleClickNotif = (n: AppNotification) => {
    // Marca como lida
    if (!n.read) markRead.mutate(n.id);

    // Fecha o dropdown e navega
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative"
          aria-label="Notificações"
        >
          <Bell size={18} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 dark"
        sideOffset={8}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-primary" />
            <span className="font-semibold text-sm text-foreground">Notificações</span>
            {hasUnread && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unread.length}
              </span>
            )}
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
              onClick={handleMarkAll}
            >
              <CheckCheck size={12} className="mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Lista */}
        <div className="max-h-[360px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <AlertCircle size={28} className="opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
              <p className="text-xs opacity-60">Você está em dia! ✅</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickNotif(n)}
                className={`
                  group flex items-start gap-3 px-4 py-3
                  border-b border-border last:border-0
                  transition-colors
                  ${n.link ? "cursor-pointer hover:bg-muted/50" : "cursor-default hover:bg-muted/20"}
                  ${!n.read ? "bg-primary/5" : ""}
                `}
              >
                <NotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-tight ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />
                      )}
                      {/* Seta de navegação — aparece no hover se tiver link */}
                      {n.link && (
                        <ArrowRight
                          size={11}
                          className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5 opacity-0 group-hover:opacity-100"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground/60">
              Mostrando notificações dos últimos 7 dias
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
