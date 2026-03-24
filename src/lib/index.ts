// ==============================
// ROUTE PATHS
// ==============================
export const ROUTE_PATHS = {
  HOME: "/",
  LOGIN: "/login",
  // Affiliate routes
  AFFILIATE_DASHBOARD: "/afiliado/dashboard",
  AFFILIATE_INDICATIONS: "/afiliado/indicacoes",
  AFFILIATE_COMMISSIONS: "/afiliado/comissoes",
  AFFILIATE_PROFILE: "/afiliado/perfil",
  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_AFFILIATES: "/admin/afiliados",
  ADMIN_INDICATIONS: "/admin/indicacoes",
  ADMIN_REPORTS: "/admin/relatorios",
  ADMIN_SETTINGS: "/admin/configuracoes",
} as const;

// ==============================
// TYPES
// ==============================

export type UserRole = "affiliate" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  cpf?: string;
  pixKey?: string;
  commissionRate: number; // percentage
  totalCommissions: number;
  pendingCommissions: number;
  totalIndications: number;
  createdAt: string;
  isActive: boolean;
  avatar?: string;
}

export type IndicationStatus =
  | "indication"
  | "budget"
  | "installation"
  | "active"
  | "commission_paid"
  | "cancelled";

export type ServiceType =
  | "cftv"
  | "alarm"
  | "access_control"
  | "electric_fence"
  | "monitoring"
  | "combo";

export interface Indication {
  id: string;
  affiliateId: string;
  affiliateName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  serviceType: ServiceType;
  status: IndicationStatus;
  notes?: string;
  contractValue?: number;
  monthlyFee?: number;
  commissionValue?: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  budgetDate?: string;
  installationDate?: string;
  activationDate?: string;
  commissionPaidDate?: string;
  adminNotes?: string;
}

export interface Commission {
  id: string;
  indicationId: string;
  affiliateId: string;
  affiliateName: string;
  clientName: string;
  value: number;
  status: "pending" | "approved" | "paid";
  referenceMonth: string;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface DashboardStats {
  totalIndications: number;
  pendingIndications: number;
  budgetCount: number;
  installationCount: number;
  activeCount: number;
  commissionPaidCount: number;
  cancelledCount: number;
  totalRevenue: number;
  pendingCommissions: number;
  paidCommissions: number;
}

// ==============================
// CONSTANTS
// ==============================

export const STATUS_CONFIG: Record<
  IndicationStatus,
  { label: string; color: string; bg: string; icon: string; step: number }
> = {
  indication: {
    label: "Indicação",
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: "UserPlus",
    step: 1,
  },
  budget: {
    label: "Orçamento",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    icon: "FileText",
    step: 2,
  },
  installation: {
    label: "Instalação",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: "Wrench",
    step: 3,
  },
  active: {
    label: "Mensalidade",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: "CheckCircle",
    step: 4,
  },
  commission_paid: {
    label: "Comissão Paga",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    icon: "DollarSign",
    step: 5,
  },
  cancelled: {
    label: "Cancelado",
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: "XCircle",
    step: 0,
  },
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  cftv: "CFTV / Câmeras",
  alarm: "Alarme",
  access_control: "Controle de Acesso",
  electric_fence: "Cerca Elétrica",
  monitoring: "Monitoramento 24h",
  combo: "Combo / Pacote",
};

export const PIPELINE_STEPS: IndicationStatus[] = [
  "indication",
  "budget",
  "installation",
  "active",
  "commission_paid",
];

// ==============================
// HELPERS
// ==============================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr));
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function calculateCommission(
  contractValue: number,
  rate: number
): number {
  return (contractValue * rate) / 100;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
