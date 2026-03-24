import { motion } from "framer-motion";
import {
  UserPlus,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FileText,
  Clock,
  Star,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatCard, PipelineStep } from "@/components/Stats";
import { IndicationsChart, CommissionsChart } from "@/components/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_INDICATIONS, MOCK_COMMISSIONS } from "@/data/index";
import { STATUS_CONFIG, SERVICE_LABELS, formatCurrency, formatDate } from "@/lib/index";
import { StatusBadge } from "@/components/Stats";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const myIndications = MOCK_INDICATIONS.filter((i) => i.affiliateId === user?.id);
  const myCommissions = MOCK_COMMISSIONS.filter((c) => c.affiliateId === user?.id);

  const stats = {
    total: myIndications.length,
    indication: myIndications.filter((i) => i.status === "indication").length,
    budget: myIndications.filter((i) => i.status === "budget").length,
    installation: myIndications.filter((i) => i.status === "installation").length,
    active: myIndications.filter((i) => i.status === "active").length,
    paid: myIndications.filter((i) => i.status === "commission_paid").length,
    pendingCommission: myCommissions
      .filter((c) => c.status !== "paid")
      .reduce((s, c) => s + c.value, 0),
    paidCommission: myCommissions
      .filter((c) => c.status === "paid")
      .reduce((s, c) => s + c.value, 0),
  };

  const recentIndications = [...myIndications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-bold text-foreground">
            Olá, <span className="text-primary">{user?.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Sua taxa de comissão: <span className="text-emerald-400 font-semibold">{user?.commissionRate}%</span>
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total de Indicações"
            value={stats.total}
            icon={UserPlus}
            color="primary"
            delay={0}
          />
          <StatCard
            title="Comissões Pendentes"
            value={stats.pendingCommission}
            icon={Clock}
            color="warning"
            isCurrency
            delay={0.05}
          />
          <StatCard
            title="Comissões Recebidas"
            value={stats.paidCommission}
            icon={DollarSign}
            color="success"
            isCurrency
            delay={0.1}
          />
          <StatCard
            title="Instalações Ativas"
            value={stats.active}
            icon={CheckCircle}
            color="violet"
            delay={0.15}
          />
        </div>

        {/* Pipeline */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Pipeline de Indicações
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

        {/* Charts + Recent */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <IndicationsChart />
            <CommissionsChart />
          </div>

          {/* Recent indications */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp size={15} className="text-primary" />
                Últimas Indicações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentIndications.map((ind) => (
                <div
                  key={ind.id}
                  className="flex items-start justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ind.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {SERVICE_LABELS[ind.serviceType]} · {formatDate(ind.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={ind.status} />
                </div>
              ))}
              {recentIndications.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma indicação ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Commission rate info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Sua Taxa de Comissão</p>
                <p className="text-sm text-muted-foreground">Sobre o valor do contrato</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{user?.commissionRate}%</p>
              <p className="text-xs text-muted-foreground">por contrato fechado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
