import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children?: React.ReactNode; // slot para botões de ação
}

export function PageHeader({ title, subtitle, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Icon size={19} className="text-primary" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <h1
            className="text-xl font-bold text-foreground leading-tight truncate"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}

/* ── Section separator with label ───────────────────────────────── */
export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
        {label}
      </p>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}
