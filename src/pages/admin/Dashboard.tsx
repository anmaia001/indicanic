import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatCard, PipelineStep, StatusBadge } from "@/components/Stats";
import { IndicationsChart, CommissionsChart, ServiceTypePieChart } from "@/components/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAffiliates } from "@/hooks/useAffiliates";
import { useIndications } from "@/hooks/useIndications";
import { useCommissions } from "@/hooks/useCommissions";
import { formatCurrency, formatDate, SERVICE_LABELS } from "@/lib/index";

export default function AdminDashboard() {
  const { data: affiliates = [], isLoading: loadingAff } = useAffiliates();
  const { data: indications = [], isLoading: loadingInd } = useIndications();
  const { data: commissions = [], isLoading: loadingComm } = useCommissions();

  const isLoading = loadingAff || loadingInd || loadingComm;

  const kpis = {
    totalIndications: indications.length,
    totalRevenue: indications.reduce((s, i) => s + (i.contractValue ?? 0), 0),
    pendingCommissions: commissions
      .filter((c) => c.status !== "paid")
      .reduce((s, c) => s + c.value, 0),
    activeAffiliates: affiliates.filter((a) => a.isActive).length,
    indication: indications.filter((i) => i.status === "indication").length,
    budget: indications.filter((i) => i.status === "budget").length,
    installation: indications.filter((i) => i.status === "installation").length,
    active: indications.filter((i) => i.status === "active").length,
    paid: indications.filter((i) => i.status === "commission_paid").length,
    cancelled: indications.filter((i) => i.status === "cancelled").length,
  };

  const recentIndications = [...indications].slice(0, 6);

  const topAffiliates = [...affiliates]
    .sort((a, b) => b.totalIndications - a.totalIndications)
    .slice(0, 5);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-sm text-muted-foreground">Visão geral da plataforma em tempo real</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Indicações" value={kpis.totalIndications} icon={Target} color="primary" delay={0} />
          <StatCard title="Receita Total" value={kpis.totalRevenue} icon={TrendingUp} color="success" isCurrency delay={0.05} />
          <StatCard title="Comissões a Pagar" value={kpis.pendingCommissions} icon={DollarSign} color="warning" isCurrency delay={0.1} />
          <StatCard title="Afiliados Ativos" value={kpis.activeAffiliates} icon={Users} color="violet" delay={0.15} />
        </div>

        {/* Pipeline overview */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pipeline Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 flex-wrap">
              <PipelineStep step={1} label="Indicação" count={kpis.indication} color="text-muted-foreground" bg="bg-muted/50" />
              <PipelineStep step={2} label="Orçamento" count={kpis.budget} color="text-amber-400" bg="bg-amber-400/10" />
              <PipelineStep step={3} label="Instalação" count={kpis.installation} color="text-primary" bg="bg-primary/10" />
              <PipelineStep step={4} label="Mensalidade" count={kpis.active} color="text-emerald-400" bg="bg-emerald-400/10" />
              <PipelineStep step={5} label="Com. Paga" count={kpis.paid} color="text-violet-400" bg="bg-violet-400/10" isLast />
            </div>
            {kpis.cancelled > 0 && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <AlertCircle size={12} /> {kpis.cancelled} indicação(ões) cancelada(s)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <IndicationsChart />
            <CommissionsChart />
          </div>
          <ServiceTypePieChart />
        </div>

        {/* Top affiliates + Recent indications */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Top Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              {topAffiliates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum afiliado cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {topAffiliates.map((aff, idx) => (
                    <div key={aff.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{aff.name}</p>
                        <p className="text-xs text-muted-foreground">{aff.totalIndications} indicações</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(aff.totalCommissions)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Indicações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIndications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma indicação</p>
              ) : (
                <div className="space-y-3">
                  {recentIndications.map((ind) => (
                    <div key={ind.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{ind.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {ind.affiliateName} · {SERVICE_LABELS[ind.serviceType]}
                        </p>
                      </div>
                      <StatusBadge status={ind.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
