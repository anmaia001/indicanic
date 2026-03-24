import { motion } from "framer-motion";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Wrench,
  CheckCircle,
  Clock,
  UserPlus,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatCard, PipelineStep } from "@/components/Stats";
import { IndicationsChart, CommissionsChart, ServiceTypePieChart } from "@/components/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/Stats";
import {
  MOCK_INDICATIONS,
  MOCK_AFFILIATES,
  MOCK_COMMISSIONS,
} from "@/data/index";
import { SERVICE_LABELS, formatCurrency, formatDate } from "@/lib/index";

export default function AdminDashboard() {
  const allIndications = MOCK_INDICATIONS;
  const stats = {
    total: allIndications.length,
    indication: allIndications.filter((i) => i.status === "indication").length,
    budget: allIndications.filter((i) => i.status === "budget").length,
    installation: allIndications.filter((i) => i.status === "installation").length,
    active: allIndications.filter((i) => i.status === "active").length,
    paid: allIndications.filter((i) => i.status === "commission_paid").length,
    totalRevenue: allIndications
      .filter((i) => i.contractValue)
      .reduce((s, i) => s + (i.contractValue ?? 0), 0),
    totalCommissions: MOCK_COMMISSIONS.reduce((s, c) => s + c.value, 0),
    pendingCommissions: MOCK_COMMISSIONS
      .filter((c) => c.status !== "paid")
      .reduce((s, c) => s + c.value, 0),
    paidCommissions: MOCK_COMMISSIONS
      .filter((c) => c.status === "paid")
      .reduce((s, c) => s + c.value, 0),
  };

  const recentIndications = [...allIndications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const activeAffiliates = MOCK_AFFILIATES.filter((a) => a.isActive);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral de toda a plataforma · Atualizado agora
          </p>
        </motion.div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total de Indicações"
            value={stats.total}
            icon={FileText}
            color="primary"
            change={15}
            changeLabel="vs. mês anterior"
            delay={0}
          />
          <StatCard
            title="Receita Total"
            value={stats.totalRevenue}
            icon={TrendingUp}
            color="success"
            isCurrency
            change={22}
            delay={0.05}
          />
          <StatCard
            title="Comissões Pendentes"
            value={stats.pendingCommissions}
            icon={Clock}
            color="warning"
            isCurrency
            delay={0.1}
          />
          <StatCard
            title="Afiliados Ativos"
            value={activeAffiliates.length}
            icon={Users}
            color="violet"
            delay={0.15}
          />
        </div>

        {/* Pipeline overview */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              Visão Geral do Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 flex-wrap">
              <PipelineStep
                step={1}
                label="Indicação"
                count={stats.indication}
                color="text-muted-foreground"
                bg="bg-muted/50"
              />
              <PipelineStep
                step={2}
                label="Orçamento"
                count={stats.budget}
                color="text-amber-400"
                bg="bg-amber-400/10"
              />
              <PipelineStep
                step={3}
                label="Instalação"
                count={stats.installation}
                color="text-primary"
                bg="bg-primary/10"
              />
              <PipelineStep
                step={4}
                label="Mensalidade"
                count={stats.active}
                color="text-emerald-400"
                bg="bg-emerald-400/10"
              />
              <PipelineStep
                step={5}
                label="Comissão Paga"
                count={stats.paid}
                color="text-violet-400"
                bg="bg-violet-400/10"
                isLast
              />
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <IndicationsChart />
            <CommissionsChart />
          </div>
          <div className="space-y-4">
            <ServiceTypePieChart />

            {/* Top affiliates */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Top Afiliados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeAffiliates
                  .sort((a, b) => b.totalIndications - a.totalIndications)
                  .slice(0, 4)
                  .map((aff, i) => {
                    const initials = aff.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <div key={aff.id} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4 shrink-0 font-mono">
                          {i + 1}
                        </span>
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{aff.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {aff.totalIndications} indicações
                          </p>
                        </div>
                        <span className="text-xs font-medium text-emerald-400 shrink-0">
                          {aff.commissionRate}%
                        </span>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent indications */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus size={15} className="text-primary" />
              Indicações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Cliente", "Afiliado", "Serviço", "Valor", "Status", "Data"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-2 text-xs text-muted-foreground font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentIndications.map((ind) => (
                    <tr
                      key={ind.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium text-foreground">{ind.clientName}</td>
                      <td className="py-3 px-2 text-muted-foreground">{ind.affiliateName}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className="text-xs">
                          {SERVICE_LABELS[ind.serviceType]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {ind.contractValue ? formatCurrency(ind.contractValue) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={ind.status} />
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">
                        {formatDate(ind.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
