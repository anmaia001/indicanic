import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/index";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  color?: "primary" | "success" | "warning" | "danger" | "violet";
  isCurrency?: boolean;
  delay?: number;
}

const COLOR_MAP = {
  primary: {
    icon:   "text-primary",
    bg:     "bg-primary/10",
    border: "border-primary/15",
    glow:   "shadow-[0_2px_16px_-4px_oklch(0.68_0.21_225/0.2)]",
    dot:    "bg-primary",
  },
  success: {
    icon:   "text-emerald-400",
    bg:     "bg-emerald-400/10",
    border: "border-emerald-400/15",
    glow:   "shadow-[0_2px_16px_-4px_rgba(34,197,94,0.15)]",
    dot:    "bg-emerald-400",
  },
  warning: {
    icon:   "text-amber-400",
    bg:     "bg-amber-400/10",
    border: "border-amber-400/15",
    glow:   "shadow-[0_2px_16px_-4px_rgba(234,179,8,0.15)]",
    dot:    "bg-amber-400",
  },
  danger: {
    icon:   "text-destructive",
    bg:     "bg-destructive/10",
    border: "border-destructive/15",
    glow:   "shadow-[0_2px_16px_-4px_rgba(239,68,68,0.15)]",
    dot:    "bg-destructive",
  },
  violet: {
    icon:   "text-violet-400",
    bg:     "bg-violet-400/10",
    border: "border-violet-400/15",
    glow:   "shadow-[0_2px_16px_-4px_rgba(139,92,246,0.15)]",
    dot:    "bg-violet-400",
  },
};

export function StatCard({ title, value, icon: Icon, change, changeLabel, color = "primary", isCurrency = false, delay = 0 }: StatCardProps) {
  const c = COLOR_MAP[color];
  const displayValue = isCurrency && typeof value === "number" ? formatCurrency(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, type: "spring", stiffness: 280, damping: 28 }}
    >
      <Card className={`border ${c.border} ${c.glow} bg-card overflow-hidden transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg`}>
        <CardContent className="p-5">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
              <Icon size={18} className={c.icon} strokeWidth={2} />
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                change >= 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-destructive/10 text-destructive"
              }`}>
                {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          {/* Value */}
          <p className="text-2xl font-bold text-foreground tracking-tight truncate leading-none" style={{ fontFamily: "var(--font-display)" }}>
            {displayValue}
          </p>
          {/* Label */}
          <p className="text-xs text-muted-foreground mt-1.5 truncate font-medium uppercase tracking-wide">
            {title}
          </p>
          {changeLabel && (
            <p className="text-[11px] text-muted-foreground/60 mt-1 truncate">{changeLabel}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Pipeline Step ─────────────────────────────────────────────────

interface PipelineStepProps {
  step: number;
  label: string;
  count: number;
  color: string;
  bg: string;
  isLast?: boolean;
}

export function PipelineStep({ label, count, color, bg, isLast }: PipelineStepProps) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl ${bg} border border-white/5 min-w-[76px] max-w-[110px] overflow-hidden`}>
        <span className={`text-xl font-bold leading-none ${color}`} style={{ fontFamily: "var(--font-display)" }}>{count}</span>
        <span className="text-[11px] text-muted-foreground text-center leading-tight line-clamp-2 font-medium">{label}</span>
      </div>
      {!isLast && (
        <span className="text-muted-foreground/25 text-lg font-light select-none shrink-0">›</span>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────

import type { IndicationStatus } from "@/lib/index";
import { STATUS_CONFIG } from "@/lib/index";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: IndicationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`text-[11px] font-semibold px-2 py-0.5 ${config.color} border-current/25 ${config.bg} whitespace-nowrap`}
    >
      {config.label}
    </Badge>
  );
}

// ── Empty State ───────────────────────────────────────────────────

export function EmptyState({ title, description, icon: Icon }: {
  title: string; description: string; icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center mb-4">
        <Icon size={26} className="text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
