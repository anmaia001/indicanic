import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from "lucide-react";
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
    icon: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "shadow-[0_4px_20px_-4px_oklch(0.68_0.21_225/0.25)]",
  },
  success: {
    icon: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    glow: "shadow-[0_4px_20px_-4px_rgba(34,197,94,0.2)]",
  },
  warning: {
    icon: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    glow: "shadow-[0_4px_20px_-4px_rgba(234,179,8,0.2)]",
  },
  danger: {
    icon: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    glow: "shadow-[0_4px_20px_-4px_rgba(239,68,68,0.2)]",
  },
  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    glow: "shadow-[0_4px_20px_-4px_rgba(139,92,246,0.2)]",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = "primary",
  isCurrency = false,
  delay = 0,
}: StatCardProps) {
  const colors = COLOR_MAP[color];
  const displayValue = isCurrency && typeof value === "number"
    ? formatCurrency(value)
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={`border ${colors.border} ${colors.glow} bg-card hover:scale-[1.01] transition-transform duration-200`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <Icon size={20} className={colors.icon} />
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {displayValue}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
            {changeLabel && (
              <p className="text-xs text-muted-foreground/70 mt-1">{changeLabel}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==============================
// PIPELINE STEP CARD
// ==============================

interface PipelineStepProps {
  step: number;
  label: string;
  count: number;
  color: string;
  bg: string;
  isLast?: boolean;
}

export function PipelineStep({ step, label, count, color, bg, isLast }: PipelineStepProps) {
  return (
    <div className="flex items-center gap-1">
      <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${bg} border border-white/5 min-w-[80px]`}>
        <span className={`text-lg font-bold ${color}`}>{count}</span>
        <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
      </div>
      {!isLast && (
        <div className="text-muted-foreground/30 text-lg font-light">›</div>
      )}
    </div>
  );
}

// ==============================
// STATUS BADGE
// ==============================

import type { IndicationStatus } from "@/lib/index";
import { STATUS_CONFIG } from "@/lib/index";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: IndicationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.color} border-current/30 ${config.bg}`}
    >
      {config.label}
    </Badge>
  );
}

// ==============================
// EMPTY STATE
// ==============================

export function EmptyState({ title, description, icon: Icon }: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
