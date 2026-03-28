import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, SERVICE_LABELS } from "@/lib/index";
import type { Indication, Commission, ServiceType } from "@/lib/index";

const CHART_COLORS = {
  primary: "oklch(0.68 0.21 225)",
  success: "#22c55e",
  warning: "#eab308",
  violet: "#8b5cf6",
  danger: "#ef4444",
};

const SERVICE_COLORS: Record<string, string> = {
  cftv:           "#0ea5e9",
  alarm:          "#22c55e",
  combo:          "#8b5cf6",
  access_control: "#eab308",
  other:          "#f97316",
};

// SERVICE_LABELS importado de @/lib/index para manter consistência com o resto do app

// Gera os últimos N meses como "Jan", "Fev", etc.
function lastNMonths(n: number) {
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ label: months[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

interface TooltipPayload { color: string; name: string; value: number; }

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: TooltipPayload[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 text-sm shadow-xl">
      <p className="text-muted-foreground mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {entry.name === "Comissões (R$)" ? formatCurrency(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── Gráfico de Indicações & Instalações ───────────────────────────────────
interface IndicationsChartProps { indications: Indication[]; }

export function IndicationsChart({ indications }: IndicationsChartProps) {
  const periods = lastNMonths(6);

  const data = periods.map(({ label, year, month }) => {
    const inMonth = indications.filter((ind) => {
      const d = new Date(ind.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    return {
      month: label,
      indications: inMonth.length,
      installations: inMonth.filter((i) => ["active", "commission_paid"].includes(i.status)).length,
    };
  });

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Indicações &amp; Instalações (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.indications === 0) ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            Nenhuma indicação registrada ainda
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIndications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInstallations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.025 240)" />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: "oklch(0.58 0.015 240)", fontSize: 11 }}>{v}</span>} />
              <Area type="monotone" dataKey="indications" name="Indicações"
                stroke={CHART_COLORS.primary} fill="url(#colorIndications)" strokeWidth={2} />
              <Area type="monotone" dataKey="installations" name="Instalações"
                stroke={CHART_COLORS.success} fill="url(#colorInstallations)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Gráfico de Comissões Pagas ─────────────────────────────────────────────
interface CommissionsChartProps { commissions: Commission[]; }

export function CommissionsChart({ commissions }: CommissionsChartProps) {
  const periods = lastNMonths(6);

  const data = periods.map(({ label, year, month }) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const total = commissions
      .filter((c) => c.status === "paid" && c.referenceMonth?.startsWith(monthStr))
      .reduce((s, c) => s + c.value, 0);
    return { month: label, commissions: total };
  });

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Comissões Pagas (R$)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.commissions === 0) ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            Nenhuma comissão paga ainda
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.025 240)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="commissions" name="Comissões (R$)"
                fill={CHART_COLORS.violet} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Gráfico de Tipos de Serviço ─────────────────────────────────────────────
interface ServiceTypePieChartProps { indications: Indication[]; }

export function ServiceTypePieChart({ indications }: ServiceTypePieChartProps) {
  const total = indications.length;

  const counts: Record<string, number> = {};
  for (const ind of indications) {
    counts[ind.serviceType] = (counts[ind.serviceType] ?? 0) + 1;
  }

  const pieData = Object.entries(counts)
    .map(([type, count]) => ({
      name: SERVICE_LABELS[type as ServiceType] ?? type,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      color: SERVICE_COLORS[type] ?? "#94a3b8",
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Tipos de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">
            Nenhuma indicação registrada ainda
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Percentual"]}
                  contentStyle={{
                    background: "oklch(0.16 0.021 240)",
                    border: "1px solid oklch(0.25 0.025 240)",
                    borderRadius: "8px", fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
