import { motion } from "framer-motion";
import { UserPlus, DollarSign, CheckCircle, Clock, Star, TrendingUp, Loader2, LayoutDashboard } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatCard, PipelineStep } from "@/components/Stats";
import { PageHeader, SectionLabel } from "@/components/PageHeader";
import { IndicationsChart, CommissionsChart } from "@/components/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useIndications } from "@/hooks/useIndications";
import { useCommissions } from "@/hooks/useCommissions";
import { SERVICE_LABELS, formatCurrency, formatDate } from "@/lib/index";
import { StatusBadge } from "@/components/Stats";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { data: indications = [], isLoading: loadingInd } = useIndications();
  const { data: commissions = [], isLoading: loadingComm } = useCommissions();

  const stats = {
    total: indications.length,
    indication: indications.filter((i) => i.status === "indication").length,
    budget: indications.filter((i) => i.status === "budget").length,
    installation: indications.filter((i) => i.status === "installation").length,
    active: indications.filter((i) => i.status === "active").length,
    paid: indications.filter((i) => i.status === "commission_paid").length,
    pendingCommission: commissions
      .filter((c) => c.status !== "paid")
      .reduce((s, c) => s + c.value, 0),
    paidCommission: commissions
      .filter((c) => c.status === "paid")
      .reduce((s, c) => s + c.value, 0),
  };

  const recentIndications = [...indications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loadingInd || loadingComm) {
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
      <div className="space-y-7">

        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <PageHeader
            title={`Olá, ${user?.name.split(" ")[0]} 👋`}
            subtitle={`Sua taxa de comissão: ${user?.commissionRate}% por contrato fechado`}
            icon={LayoutDashboard}
          />
        </motion.div>

        {/* Stats */}
        <div>
          <SectionLabel label="Resumo" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Total de Indicações"  value={stats.total}              icon={UserPlus}   color="primary" delay={0}    />
            <StatCard title="Comissões Pendentes"  value={stats.pendingCommission}  icon={Clock}      color="warning" isCurrency delay={0.05} />
            <StatCard title="Comissões Recebidas"  value={stats.paidCommission}     icon={DollarSign} color="success" isCurrency delay={0.1}  />
            <StatCard title="Instalações Ativas"   value={stats.active}             icon={CheckCircle} color="violet" delay={0.15} />
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <SectionLabel label="Pipeline de Indicações" />
          <Card className="border-border/60 overflow-hidden bg-card/80">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
                <PipelineStep step={1} label="Indicação"    count={stats.indication}   color="text-muted-foreground" bg="bg-muted/40"       />
                <PipelineStep step={2} label="Orçamento"    count={stats.budget}        color="text-amber-400"        bg="bg-amber-400/10"   />
                <PipelineStep step={3} label="Instalação"   count={stats.installation}  color="text-primary"          bg="bg-primary/10"     />
                <PipelineStep step={4} label="Mensalidade"  count={stats.active}        color="text-emerald-400"      bg="bg-emerald-400/10" />
                <PipelineStep step={5} label="Comissão Paga" count={stats.paid}         color="text-violet-400"       bg="bg-violet-400/10" isLast />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts + Recent */}
        <div>
          <SectionLabel label="Evolução" />
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <IndicationsChart indications={indications} />
              <CommissionsChart commissions={commissions} />
            </div>

            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary" />
                  Últimas Indicações
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {recentIndications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma indicação ainda</p>
                ) : (
                  <div className="mt-1">
                    {recentIndications.map((ind, i) => (
                      <div key={ind.id} className={`flex items-start gap-3 py-2.5 ${i < recentIndications.length - 1 ? "border-b border-border/40" : ""}`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{ind.clientName}</p>
                          <p className="text-xs text-muted-foreground">{SERVICE_LABELS[ind.serviceType]} · {formatDate(ind.createdAt)}</p>
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

        {/* Commission rate card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/8 to-primary/3 overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Star size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  Sua Taxa de Comissão
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Sobre o valor do contrato fechado</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-4xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {user?.commissionRate}%
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
