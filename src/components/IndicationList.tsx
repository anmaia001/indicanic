import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  UserPlus,
  FileText,
  Wrench,
  CheckCircle,
  DollarSign,
  XCircle,
  Phone,
  Mail,
  Eye,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/Stats";
import type { Indication, IndicationStatus, ServiceType } from "@/lib/index";
import {
  STATUS_CONFIG,
  SERVICE_LABELS,
  PIPELINE_STEPS,
  formatCurrency,
  formatDate,
  formatPhone,
  calculateCommission,
} from "@/lib/index";
import { useUpdateIndicationValues } from "@/hooks/useIndications";
import { useToast } from "@/hooks/use-toast";

const STEP_ICONS: Record<IndicationStatus, React.ReactNode> = {
  indication: <UserPlus size={14} />,
  budget: <FileText size={14} />,
  installation: <Wrench size={14} />,
  active: <CheckCircle size={14} />,
  commission_paid: <DollarSign size={14} />,
  cancelled: <XCircle size={14} />,
};

// ==============================
// PIPELINE PROGRESS BAR
// ==============================

function PipelineProgress({ status }: { status: IndicationStatus }) {
  const currentStep = STATUS_CONFIG[status].step;
  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STEPS.map((s, i) => {
        const stepNum = STATUS_CONFIG[s].step;
        const isActive = currentStep >= stepNum;
        const isCurrent = currentStep === stepNum;
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? isCurrent
                    ? "bg-primary w-6"
                    : "bg-primary/60 w-4"
                  : "bg-muted w-4"
              }`}
            />
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`w-1 h-1 rounded-full ${isActive ? "bg-primary/40" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==============================
// INDICATION CARD
// ==============================

function IndicationCard({
  indication,
  onView,
}: {
  indication: Indication;
  onView: (ind: Indication) => void;
}) {
  const config = STATUS_CONFIG[indication.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="border-border hover:border-primary/30 hover:shadow-[0_4px_20px_-4px_oklch(0.68_0.21_225/0.15)] transition-all duration-200 cursor-pointer overflow-hidden"
        onClick={() => onView(indication)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {indication.clientName}
                </h4>
                <StatusBadge status={indication.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                <span className="flex items-center gap-1 shrink-0">
                  <Phone size={11} /> {formatPhone(indication.clientPhone)}
                </span>
                {indication.clientEmail && (
                  <span className="flex items-center gap-1 truncate min-w-0">
                    <Mail size={11} className="shrink-0" />
                    <span className="truncate">{indication.clientEmail}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {SERVICE_LABELS[indication.serviceType]}
                </Badge>
                {indication.contractValue && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Contrato: <span className="text-foreground font-medium">{formatCurrency(indication.contractValue)}</span>
                  </span>
                )}
                {indication.commissionValue && (
                  <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">
                    Comissão: {formatCurrency(indication.commissionValue)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{formatDate(indication.createdAt)}</span>
              <PipelineProgress status={indication.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==============================
// NEW INDICATION FORM
// ==============================

interface NewIndicationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Indication>) => void;
  affiliateId?: string;
  commissionRate?: number;
}

export function NewIndicationModal({
  open,
  onClose,
  onSubmit,
  commissionRate = 10,
}: NewIndicationFormProps) {
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    serviceType: "cftv" as ServiceType,
    notes: "",
    contractValue: "",
  });

  const estimatedCommission = form.contractValue
    ? calculateCommission(parseFloat(form.contractValue), commissionRate)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      contractValue: form.contractValue ? parseFloat(form.contractValue) : undefined,
      commissionValue: estimatedCommission || undefined,
      status: "indication",
    });
    setForm({
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      clientAddress: "",
      serviceType: "cftv",
      notes: "",
      contractValue: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg dark">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            Nova Indicação
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome do Cliente *</Label>
              <Input
                placeholder="Nome completo ou empresa"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone *</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Endereço</Label>
              <Input
                placeholder="Rua, número, bairro - cidade/UF"
                value={form.clientAddress}
                onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Serviço *</Label>
              <Select
                value={form.serviceType}
                onValueChange={(v) => setForm({ ...form, serviceType: v as ServiceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor do Contrato (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={form.contractValue}
                onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
              />
            </div>
            {estimatedCommission > 0 && (
              <div className="col-span-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20 p-3 flex items-center justify-between">
                <span className="text-sm text-emerald-400">Comissão estimada ({commissionRate}%)</span>
                <span className="font-bold text-emerald-400">{formatCurrency(estimatedCommission)}</span>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                placeholder="Informações adicionais sobre o cliente ou serviço..."
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!form.clientName || !form.clientPhone}>
              <Plus size={16} className="mr-1" />
              Cadastrar Indicação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==============================
// INDICATION DETAIL MODAL
// ==============================

export function IndicationDetailModal({
  indication,
  open,
  onClose,
  isAdmin = false,
  onStatusChange,
}: {
  indication: Indication | null;
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (id: string, status: IndicationStatus) => void;
}) {
  const { toast } = useToast();
  const updateValues = useUpdateIndicationValues();

  // Estado de edição financeira
  const [editing, setEditing] = useState(false);
  const [contractValue, setContractValue] = useState("");
  const [monthlyFee, setMonthlyFee]       = useState("");
  const [adminNotes, setAdminNotes]       = useState("");

  // Pré-preenche ao abrir/trocar indicação
  useEffect(() => {
    if (indication) {
      setContractValue(indication.contractValue?.toString() ?? "");
      setMonthlyFee(indication.monthlyFee?.toString() ?? "");
      setAdminNotes(indication.adminNotes ?? "");
      setEditing(false);
    }
  }, [indication?.id]);

  if (!indication) return null;

  // Comissão calculada em tempo real com o valor digitado
  const parsedContract = parseFloat(contractValue) || 0;
  const liveCommission = parsedContract > 0
    ? Math.round(parsedContract * indication.commissionRate) / 100
    : 0;

  const handleSave = async () => {
    try {
      await updateValues.mutateAsync({
        id: indication.id,
        contractValue: contractValue ? parseFloat(contractValue) : null,
        monthlyFee:    monthlyFee    ? parseFloat(monthlyFee)    : null,
        commissionRate: indication.commissionRate,
        adminNotes,
      });
      toast({ title: "Valores atualizados!", description: `Comissão recalculada para ${indication.commissionRate}% do contrato.` });
      setEditing(false);
    } catch {
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setContractValue(indication.contractValue?.toString() ?? "");
    setMonthlyFee(indication.monthlyFee?.toString() ?? "");
    setAdminNotes(indication.adminNotes ?? "");
    setEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg dark">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            Detalhes da Indicação
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Pipeline */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PIPELINE_STEPS.map((s, i) => {
              const stepNum = STATUS_CONFIG[s].step;
              const currentStep = STATUS_CONFIG[indication.status].step;
              const isActive = currentStep >= stepNum;
              const isCurrent = s === indication.status;
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border border-current/30`
                      : isActive
                      ? "bg-primary/10 text-primary/60 border border-primary/20"
                      : "bg-muted text-muted-foreground border border-transparent"
                  }`}>
                    {STEP_ICONS[s]}
                    {STATUS_CONFIG[s].label}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <ChevronRight size={12} className={isActive ? "text-primary/40" : "text-muted-foreground/30"} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Client info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Cliente</p>
              <p className="font-semibold text-foreground">{indication.clientName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Telefone</p>
              <p className="font-medium text-foreground">{formatPhone(indication.clientPhone)}</p>
            </div>
            {indication.clientEmail && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-0.5">E-mail</p>
                <p className="font-medium text-foreground">{indication.clientEmail}</p>
              </div>
            )}
            {indication.clientAddress && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-0.5">Endereço</p>
                <p className="font-medium text-foreground">{indication.clientAddress}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Serviço</p>
              <Badge variant="secondary">{SERVICE_LABELS[indication.serviceType]}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Data</p>
              <p className="font-medium text-foreground">{formatDate(indication.createdAt)}</p>
            </div>
          </div>

          {/* ── Painel financeiro (admin pode editar) ── */}
          <div className="border border-border rounded-xl overflow-hidden">
            {/* Header do painel */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/30 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={12} className="text-primary" /> Valores Financeiros
              </span>
              {isAdmin && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Pencil size={11} /> Editar
                </button>
              )}
              {isAdmin && editing && (
                <div className="flex items-center gap-2">
                  <button onClick={handleCancel} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <X size={11} /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateValues.isPending}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  >
                    <Save size={11} /> {updateValues.isPending ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3.5 space-y-3">
              {/* Linha: Contrato + Mensalidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Valor do Contrato (R$)</label>
                  {editing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="font-bold text-primary text-base">
                      {indication.contractValue ? formatCurrency(indication.contractValue) : <span className="text-muted-foreground text-sm font-normal">—</span>}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Mensalidade (R$)</label>
                  {editing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="font-bold text-amber-400 text-base">
                      {indication.monthlyFee ? formatCurrency(indication.monthlyFee) : <span className="text-muted-foreground text-sm font-normal">—</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Comissão — calculada em tempo real no modo edição */}
              <div className={`rounded-lg p-3 flex items-center justify-between transition-colors ${
                editing && liveCommission > 0
                  ? "bg-emerald-400/15 border border-emerald-400/30"
                  : indication.commissionValue
                  ? "bg-emerald-400/10 border border-emerald-400/20"
                  : "bg-muted/40 border border-border"
              }`}>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Comissão do afiliado <span className="text-foreground font-medium">({indication.commissionRate}%)</span>
                  </p>
                  {editing && liveCommission > 0 && (
                    <p className="text-[10px] text-emerald-400/70 mt-0.5">Será salvo automaticamente</p>
                  )}
                </div>
                <p className={`font-bold text-lg ${
                  (editing ? liveCommission : indication.commissionValue)
                    ? "text-emerald-400"
                    : "text-muted-foreground"
                }`}>
                  {editing
                    ? (liveCommission > 0 ? formatCurrency(liveCommission) : "—")
                    : (indication.commissionValue ? formatCurrency(indication.commissionValue) : "—")
                  }
                </p>
              </div>

              {/* Notas do admin */}
              {(isAdmin || indication.adminNotes) && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Notas internas (admin)</label>
                  {editing ? (
                    <Textarea
                      placeholder="Anotações internas sobre esta indicação..."
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="text-sm resize-none"
                    />
                  ) : (
                    indication.adminNotes
                      ? <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{indication.adminNotes}</p>
                      : <p className="text-xs text-muted-foreground/50 italic">Sem notas</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {indication.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Observações do afiliado</p>
              <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{indication.notes}</p>
            </div>
          )}

          {/* Admin status change */}
          {isAdmin && onStatusChange && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Atualizar etapa:</p>
              <div className="flex flex-wrap gap-2">
                {PIPELINE_STEPS.filter(s => s !== indication.status && s !== "cancelled").map(s => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className={`text-xs ${STATUS_CONFIG[s].color} border-current/30 hover:${STATUS_CONFIG[s].bg}`}
                    onClick={() => { onStatusChange(indication.id, s); onClose(); }}
                  >
                    {STEP_ICONS[s]}
                    <span className="ml-1">{STATUS_CONFIG[s].label}</span>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-destructive border-destructive/30"
                  onClick={() => { onStatusChange(indication.id, "cancelled"); onClose(); }}
                >
                  <XCircle size={12} className="mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==============================
// INDICATION LIST WITH FILTERS
// ==============================

interface IndicationListProps {
  indications: Indication[];
  showAffiliate?: boolean;
  onStatusChange?: (id: string, status: IndicationStatus) => void;
  onAdd?: (data: Partial<Indication>) => Promise<void> | void;
  commissionRate?: number;
  affiliateId?: string;
}

export function IndicationList({
  indications,
  showAffiliate = false,
  onStatusChange,
  onAdd,
  commissionRate,
  affiliateId,
}: IndicationListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Indication | null>(null);
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  const filtered = indications.filter((ind) => {
    const matchSearch =
      !search ||
      ind.clientName.toLowerCase().includes(search.toLowerCase()) ||
      ind.clientPhone.includes(search);
    const matchStatus = statusFilter === "all" || ind.status === statusFilter;
    const matchService = serviceFilter === "all" || ind.serviceType === serviceFilter;
    return matchSearch && matchStatus && matchService;
  });

  const handleAdd = async (data: Partial<Indication>) => {
    if (onAdd) {
      await onAdd(data);
    } else {
      toast({
        title: "Indicação cadastrada!",
        description: `${data.clientName} foi adicionado com sucesso.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 h-9 text-sm"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm">
              <Filter size={13} className="mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG)
                .filter(([key]) => key !== "cancelled")
                .map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[150px] text-sm">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os serviços</SelectItem>
              {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {onAdd && (
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={15} className="mr-1" /> Nova Indicação
          </Button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "indicação" : "indicações"} encontrada{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhuma indicação encontrada.
          </div>
        ) : (
          filtered.map((ind) => (
            <IndicationCard
              key={ind.id}
              indication={ind}
              onView={setSelected}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <IndicationDetailModal
        indication={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        isAdmin={!!onStatusChange}
        onStatusChange={onStatusChange}
      />
      <NewIndicationModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onSubmit={handleAdd}
        affiliateId={affiliateId}
        commissionRate={commissionRate}
      />
    </div>
  );
}

export { IndicationCard };
