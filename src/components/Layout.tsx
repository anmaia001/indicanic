import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, DollarSign,
  Settings, LogOut, Menu, X, Shield,
  BarChart3, UserCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";

interface NavItem { label: string; icon: React.ReactNode; to: string; }

const AFFILIATE_NAV: NavItem[] = [
  { label: "Dashboard",         icon: <LayoutDashboard size={17} />, to: ROUTE_PATHS.AFFILIATE_DASHBOARD },
  { label: "Minhas Indicações", icon: <Users size={17} />,           to: ROUTE_PATHS.AFFILIATE_INDICATIONS },
  { label: "Comissões",         icon: <DollarSign size={17} />,      to: ROUTE_PATHS.AFFILIATE_COMMISSIONS },
  { label: "Meu Perfil",        icon: <UserCircle size={17} />,      to: ROUTE_PATHS.AFFILIATE_PROFILE },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",      icon: <LayoutDashboard size={17} />, to: ROUTE_PATHS.ADMIN_DASHBOARD },
  { label: "Afiliados",      icon: <Users size={17} />,           to: ROUTE_PATHS.ADMIN_AFFILIATES },
  { label: "Indicações",     icon: <FileText size={17} />,        to: ROUTE_PATHS.ADMIN_INDICATIONS },
  { label: "Relatórios",     icon: <BarChart3 size={17} />,       to: ROUTE_PATHS.ADMIN_REPORTS },
  { label: "Configurações",  icon: <Settings size={17} />,        to: ROUTE_PATHS.ADMIN_SETTINGS },
];

/* ── Sidebar label groups (visual separation) ─────────────────── */
const AFFILIATE_GROUPS = [
  { heading: "MENU", items: [0, 1, 2, 3] },
];
const ADMIN_GROUPS = [
  { heading: "VISÃO GERAL", items: [0] },
  { heading: "GESTÃO",      items: [1, 2] },
  { heading: "ANÁLISE",     items: [3, 4] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems  = user?.role === "admin" ? ADMIN_NAV      : AFFILIATE_NAV;
  const groups    = user?.role === "admin" ? ADMIN_GROUPS   : AFFILIATE_GROUPS;
  const initials  = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const dashRoute = user?.role === "admin" ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.AFFILIATE_DASHBOARD;

  const handleLogout = () => { logout(); navigate(ROUTE_PATHS.LOGIN); };

  return (
    <div className="flex h-screen bg-background overflow-hidden dark">

      {/* ── Sidebar desktop ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent
          navItems={navItems} groups={groups}
          user={user} initials={initials ?? "?"}
          dashRoute={dashRoute} onLogout={handleLogout}
        />
      </aside>

      {/* ── Sidebar mobile overlay ───────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
              <SidebarContent
                navItems={navItems} groups={groups}
                user={user} initials={initials ?? "?"}
                dashRoute={dashRoute} onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center justify-between px-5 shrink-0 overflow-hidden gap-3">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            {/* Breadcrumb role badge */}
            <div className="hidden lg:flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase ${
                user?.role === "admin"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {user?.role === "admin" ? "Administrador" : "Afiliado"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationPanel />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2.5 rounded-lg hover:bg-muted/60">
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-[11px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-[130px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={13} className="text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 dark">
                <div className="px-3 py-2.5 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate(user?.role === "admin" ? ROUTE_PATHS.ADMIN_SETTINGS : ROUTE_PATHS.AFFILIATE_PROFILE)}>
                  <UserCircle size={14} className="mr-2 text-muted-foreground" /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut size={14} className="mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── SidebarContent ─────────────────────────────────────────────── */
function SidebarContent({
  navItems, groups, user, initials, dashRoute, onLogout,
}: {
  navItems: NavItem[];
  groups: { heading: string; items: number[] }[];
  user: import("@/lib/index").User | null;
  initials: string;
  dashRoute: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <NavLink
        to={dashRoute}
        className="flex items-center gap-3 px-5 h-14 border-b border-sidebar-border shrink-0 hover:bg-sidebar-accent/40 transition-colors duration-150"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_12px_oklch(0.68_0.21_225/0.2)]">
          <Shield size={15} className="text-primary" />
        </div>
        <div className="leading-none">
          <p className="text-[15px] font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Indica<span className="text-primary">Nic</span>
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5 tracking-widest uppercase">
            Segurança Eletrônica
          </p>
        </div>
      </NavLink>

      {/* Nav with groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">
              {group.heading}
            </p>
            <div className="space-y-0.5">
              {group.items.map((idx) => {
                const item = navItems[idx];
                if (!item) return null;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold shadow-[inset_0_0_0_1px_oklch(0.68_0.21_225/0.2)]"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-muted-foreground"}`}>
                          {item.icon}
                        </span>
                        <span className="flex-1 leading-none">{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-3 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent/30">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate text-foreground leading-tight">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground/70 truncate leading-tight mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
