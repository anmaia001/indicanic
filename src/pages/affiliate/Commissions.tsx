import { motion } from "framer-motion";
import {
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/Stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCommissions } from "@/hooks/useCommissions";
import { formatCurrency, formatDate } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";

const STATUS_COMMISSION = {
  pending: { label: "Pendente", color: "text-amber-400", bg: "bg-amber-400/10" },
  approved: { label: "Aprovado", color: "text-primary", bg: "bg-primary/10" },
  paid: { label: "Pago", color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

export default function AffiliateCommissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: commissions = [], isLoading } = useCommissions();

  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.value, 0);
  const totalPending = commissions
    .filter((c) => c.status !== "paid")
    .reduce((s, c) => s + c.value, 0);

  const handleExport = () => {
    const rows = [
      ["Mês Ref.", "Cliente", "Valor", "Status", "Forma Pagamento", "Data Pagamento"],
      ...commissions.map((c) => [
        c.referenceMonth,
        c.clientName,
        c.value.toString(),
        STATUS_COMMISSION[c.status].label,
        c.paymentMethod ?? "-",
        c.paidAt ? formatDate(c.paidAt) : "-",
      ]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minhas_comissoes.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Relatório exportado!", description: "Arquivo CSV baixado." });
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Minhas Comissões</h1>
            <p className="text-sm text-muted-foreground">
              Taxa atual: <span className="text-primary font-medium">{user?.commissionRate}%</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={commissions.length === 0}>
            <Download size={15} className="mr-1.5" /> Exportar CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Total Comissões" value={commissions.length} icon={TrendingUp} color="primary" />
          <StatCard title="A Receber" value={totalPending} icon={Clock} color="warning" isCurrency />
          <StatCard title="Já Recebido" value={totalPaid} icon={CheckCircle} color="success" isCurrency />
        </div>

        {/* Table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign size={15} className="text-primary" />
              Histórico de Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">
                Nenhuma comissão registrada ainda. As comissões aparecem automaticamente quando suas indicações entram em mensalidade ativa.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-2 text-xs text-muted-foreground font-medium">Mês Ref.</th>
                      <th className="text-left py-2.5 px-2 text-xs text-muted-foreground font-medium">Cliente</th>
                      <th className="text-right py-2.5 px-2 text-xs text-muted-foreground font-medium">Valor</th>
                      <th className="text-center py-2.5 px-2 text-xs text-muted-foreground font-medium">Status</th>
                      <th className="text-center py-2.5 px-2 text-xs text-muted-foreground font-medium hidden sm:table-cell">Pagamento</th>
                      <th className="text-right py-2.5 px-2 text-xs text-muted-foreground font-medium hidden md:table-cell">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission) => {
                      const sc = STATUS_COMMISSION[commission.status];
                      return (
                        <motion.tr
                          key={commission.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td className="py-3 px-2 font-mono text-xs text-muted-foreground">{commission.referenceMonth}</td>
                          <td className="py-3 px-2 font-medium text-foreground">{commission.clientName}</td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-400">{formatCurrency(commission.value)}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant="outline" className={`text-xs ${sc.color} ${sc.bg} border-current/30`}>
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-center hidden sm:table-cell text-muted-foreground">
                            {commission.paymentMethod ?? "-"}
                          </td>
                          <td className="py-3 px-2 text-right hidden md:table-cell text-muted-foreground">
                            {commission.paidAt ? formatDate(commission.paidAt) : "-"}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
