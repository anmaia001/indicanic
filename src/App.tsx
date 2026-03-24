import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";

// Pages
import LoginPage from "./pages/login/Index";
import AffiliateDashboard from "./pages/affiliate/Dashboard";
import AffiliateIndications from "./pages/affiliate/Indications";
import AffiliateCommissions from "./pages/affiliate/Commissions";
import AffiliateProfile from "./pages/affiliate/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAffiliates from "./pages/admin/Affiliates";
import AdminIndications from "./pages/admin/Indications";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/not-found/Index";

const queryClient = new QueryClient();

function AuthGuard({ children, role }: { children: React.ReactNode; role?: "admin" | "affiliate" }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.AFFILIATE_DASHBOARD} replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  if (user.role === "admin") return <Navigate to={ROUTE_PATHS.ADMIN_DASHBOARD} replace />;
  return <Navigate to={ROUTE_PATHS.AFFILIATE_DASHBOARD} replace />;
}

function AppRoutes() {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path={ROUTE_PATHS.HOME} element={<HomeRedirect />} />
        <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />

        {/* Affiliate */}
        <Route path={ROUTE_PATHS.AFFILIATE_DASHBOARD} element={<AuthGuard role="affiliate"><AffiliateDashboard /></AuthGuard>} />
        <Route path={ROUTE_PATHS.AFFILIATE_INDICATIONS} element={<AuthGuard role="affiliate"><AffiliateIndications /></AuthGuard>} />
        <Route path={ROUTE_PATHS.AFFILIATE_COMMISSIONS} element={<AuthGuard role="affiliate"><AffiliateCommissions /></AuthGuard>} />
        <Route path={ROUTE_PATHS.AFFILIATE_PROFILE} element={<AuthGuard role="affiliate"><AffiliateProfile /></AuthGuard>} />

        {/* Admin */}
        <Route path={ROUTE_PATHS.ADMIN_DASHBOARD} element={<AuthGuard role="admin"><AdminDashboard /></AuthGuard>} />
        <Route path={ROUTE_PATHS.ADMIN_AFFILIATES} element={<AuthGuard role="admin"><AdminAffiliates /></AuthGuard>} />
        <Route path={ROUTE_PATHS.ADMIN_INDICATIONS} element={<AuthGuard role="admin"><AdminIndications /></AuthGuard>} />
        <Route path={ROUTE_PATHS.ADMIN_REPORTS} element={<AuthGuard role="admin"><AdminReports /></AuthGuard>} />
        <Route path={ROUTE_PATHS.ADMIN_SETTINGS} element={<AuthGuard role="admin"><AdminSettings /></AuthGuard>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
