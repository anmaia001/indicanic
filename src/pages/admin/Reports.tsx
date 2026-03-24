import { useState } from "react";
import {
  Download, BarChart3, TrendingUp, DollarSign, Users, FileSpreadsheet, Filter, Loader2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/Stats";
import { IndicationsChart, CommissionsChart, ServiceTypePieChart } from "@/components/Charts";
import { useIndications } from "@/hooks/useIndications";
import { useCommissions } from "@/hooks/useCommissions";
import { useAffiliates } from "@/hooks/useAffiliates";
import { SERVICE_LABELS, STATUS_CONFIG, formatCurrency, formatDate } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";

export default function AdminReports() {
  const { toast } = useToast();
  const [affiliateFilter, setAffiliateFilter] = useState("all");

  const { data: allIndications = [], isLoading: loadingInd } = useIndications();
  const { data: allCommissions = [], isLoading: loadingComm } = useCommissions();
  const { data: affiliates = [], isLoading: loadingAff } = useAffiliates();

  const isLoading = loadingInd || loadingComm || loadingAff;

  const filtered = allIndications.filter(
    (ind) => affiliateFilter === "all" || ind.affiliateId === affiliateFilter
  );

  const filteredComm = allCommissions.filter(
    (c) => affiliateFilter === "all" || c.affiliateId === affiliateFilter
  );

  const totalRevenue = filtered.reduce((s, i) => s + (i.contractValue ?? 0), 0);
  const totalCommissions = filteredComm.reduce((s, c) => s + c.value, 0);
  const conversionRate = filtered.length > 0
    ? Math.round((filtered.filter((i) => ["active", "commission_paid"].includes(i.status)).length / filtered.length) * 100)
    : 0;

  const exportCSV = (type: "indications" | "commissions") => {
    const source = type === "indications" ? filtered : filteredComm;

    if (source.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Não há registros no filtro selecionado.",
        variant: "destructive",
      });
      return;
    }

    let rows: string[][];
    let filename: string;

    if (type === "indications") {
      rows = [
        ["ID", "Cliente", "Telefone", "Afiliado", "Serviço", "Status", "Valor Contrato", "Comissão", "Data"],
        ...filtered.map((i) => [
          i.id,
          i.clientName,
          i.clientPhone,
          i.affiliateName,
          SERVICE_LABELS[i.serviceType],
          STATUS_CONFIG[i.status].label,
          i.contractValue != null ? `R$ ${i.contractValue.toFixed(2).replace(".", ",")}` : "",
          i.commissionValue != null ? `R$ ${i.commissionValue.toFixed(2).replace(".", ",")}` : "",
          formatDate(i.createdAt),
        ]),
      ];
      filename = `indicacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      rows = [
        ["ID", "Afiliado", "Cliente", "Valor", "Status", "Mês Ref.", "Data Pagamento"],
        ...filteredComm.map((c) => [
          c.id,
          c.affiliateName,
          c.clientName,
          `R$ ${c.value.toFixed(2).replace(".", ",")}`,
          c.status === "paid" ? "Pago" : c.status === "approved" ? "Aprovado" : "Pendente",
          c.referenceMonth,
          c.paidAt ? formatDate(c.paidAt) : "",
        ]),
      ];
      filename = `comissoes_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    // Montar CSV com BOM para Excel reconhecer acentos
    const csv = "\uFEFF" + rows.map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    ).join("\r\n");

    // Criar link no DOM e disparar download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    // Limpar após breve delay para garantir que o download iniciou
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);

    toast({
      title: "Download iniciado!",
      description: `${filename} (${source.length} registros)`,
    });
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
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Análise completa de indicações e comissões</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportCSV("indications")}>
              <Download size={14} className="mr-1.5" /> Indicações CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV("commissions")}>
              <FileSpreadsheet size={14} className="mr-1.5" /> Comissões CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[180px] text-sm">
              <Filter size={13} className="mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Afiliado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os afiliados</SelectItem>
              {affiliates.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total de Indicações" value={filtered.length} icon={Users} color="primary" />
          <StatCard title="Receita Gerada" value={totalRevenue} icon={TrendingUp} color="success" isCurrency />
          <StatCard title="Comissões Totais" value={totalCommissions} icon={DollarSign} color="warning" isCurrency />
          <StatCard title="Taxa de Conversão" value={`${conversionRate}%`} icon={BarChart3} color="violet" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <IndicationsChart />
            <CommissionsChart />
          </div>
          <ServiceTypePieChart />
        </div>

        {/* Affiliate performance table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance por Afiliado</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum afiliado cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Afiliado", "Indicações", "Instalados", "Receita", "Comissão", "Taxa Conv.", "Status"].map((h) => (
                        <th key={h} className="text-left py-2.5 px-2 text-xs text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((aff) => {
                      const affInds = allIndications.filter((i) => i.affiliateId === aff.id);
                      const installed = affInds.filter((i) => ["active", "commission_paid"].includes(i.status)).length;
                      const revenue = affInds.reduce((s, i) => s + (i.contractValue ?? 0), 0);
                      const conv = affInds.length > 0 ? Math.round((installed / affInds.length) * 100) : 0;
                      return (
                        <tr key={aff.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-2 font-medium">{aff.name}</td>
                          <td className="py-3 px-2 text-center">{affInds.length}</td>
                          <td className="py-3 px-2 text-center text-emerald-400">{installed}</td>
                          <td className="py-3 px-2">{formatCurrency(revenue)}</td>
                          <td className="py-3 px-2 text-emerald-400">{formatCurrency(aff.totalCommissions)}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[60px]">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${conv}%` }} />
                              </div>
                              <span className="text-xs">{conv}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className={`text-xs ${aff.isActive ? "text-emerald-400 border-emerald-400/30" : "text-muted-foreground"}`}>
                              {aff.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>
                        </tr>
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
