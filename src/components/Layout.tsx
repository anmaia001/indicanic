import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
  BarChart3,
  UserCircle,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

const AFFILIATE_NAV: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    to: ROUTE_PATHS.AFFILIATE_DASHBOARD,
  },
  {
    label: "Minhas Indicações",
    icon: <Users size={18} />,
    to: ROUTE_PATHS.AFFILIATE_INDICATIONS,
  },
  {
    label: "Comissões",
    icon: <DollarSign size={18} />,
    to: ROUTE_PATHS.AFFILIATE_COMMISSIONS,
  },
  {
    label: "Meu Perfil",
    icon: <UserCircle size={18} />,
    to: ROUTE_PATHS.AFFILIATE_PROFILE,
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    to: ROUTE_PATHS.ADMIN_DASHBOARD,
  },
  {
    label: "Afiliados",
    icon: <Users size={18} />,
    to: ROUTE_PATHS.ADMIN_AFFILIATES,
  },
  {
    label: "Indicações",
    icon: <FileText size={18} />,
    to: ROUTE_PATHS.ADMIN_INDICATIONS,
  },
  {
    label: "Relatórios",
    icon: <BarChart3 size={18} />,
    to: ROUTE_PATHS.ADMIN_REPORTS,
  },
  {
    label: "Configurações",
    icon: <Settings size={18} />,
    to: ROUTE_PATHS.ADMIN_SETTINGS,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === "admin" ? ADMIN_NAV : AFFILIATE_NAV;
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden dark">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent
          navItems={navItems}
          user={user}
          initials={initials ?? "?"}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar — mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
              <SidebarContent
                navItems={navItems}
                user={user}
                initials={initials ?? "?"}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              {user?.role === "admin" ? (
                <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                  Administrador
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400">
                  Afiliado
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      user?.role === "admin"
                        ? ROUTE_PATHS.ADMIN_SETTINGS
                        : ROUTE_PATHS.AFFILIATE_PROFILE
                    )
                  }
                >
                  <UserCircle size={14} className="mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut size={14} className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  user,
  initials,
  onLogout,
}: {
  navItems: NavItem[];
  user: import("@/lib/index").User | null;
  initials: string;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Shield size={16} className="text-primary" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-foreground">
            Indica<span className="text-primary">Nic</span>
          </span>
          <div className="text-[10px] text-muted-foreground leading-none">
            Segurança Eletrônica
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-primary/60" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
