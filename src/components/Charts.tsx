import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTHLY_CHART_DATA, PIE_SERVICE_DATA } from "@/data/index";
import { formatCurrency } from "@/lib/index";

const CHART_COLORS = {
  primary: "oklch(0.68 0.21 225)",
  success: "#22c55e",
  warning: "#eab308",
  violet: "#8b5cf6",
  danger: "#ef4444",
};

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
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
            {entry.name === "Comissões (R$)"
              ? formatCurrency(entry.value)
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function IndicationsChart() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Indicações & Instalações (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MONTHLY_CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
            <YAxis tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span style={{ color: "oklch(0.58 0.015 240)", fontSize: 11 }}>{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="indications"
              name="Indicações"
              stroke={CHART_COLORS.primary}
              fill="url(#colorIndications)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="installations"
              name="Instalações"
              stroke={CHART_COLORS.success}
              fill="url(#colorInstallations)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CommissionsChart() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Comissões Pagas (R$)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_CHART_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.025 240)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "oklch(0.58 0.015 240)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="commissions"
              name="Comissões (R$)"
              fill={CHART_COLORS.violet}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ServiceTypePieChart() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Tipos de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={PIE_SERVICE_DATA}
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {PIE_SERVICE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Percentual"]}
                contentStyle={{
                  background: "oklch(0.16 0.021 240)",
                  border: "1px solid oklch(0.25 0.025 240)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 flex-1">
            {PIE_SERVICE_DATA.map((item) => (
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
      </CardContent>
    </Card>
  );
}
