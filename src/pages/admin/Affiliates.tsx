import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Percent,
  Phone,
  Mail,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MOCK_AFFILIATES } from "@/data/index";
import type { User } from "@/lib/index";
import { formatCurrency, formatDate } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/Stats";

export default function AdminAffiliates() {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState(MOCK_AFFILIATES);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({
    name: "",
    email: "",
    phone: "",
    commissionRate: 10,
  });

  const filtered = affiliates.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setAffiliates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
    const aff = affiliates.find((a) => a.id === id);
    toast({
      title: aff?.isActive ? "Afiliado desativado" : "Afiliado ativado",
      description: `${aff?.name} foi ${aff?.isActive ? "desativado" : "ativado"}.`,
    });
  };

  const handleAddAffiliate = () => {
    const newAff: User = {
      id: `aff-${Date.now()}`,
      name: newAffiliate.name,
      email: newAffiliate.email,
      phone: newAffiliate.phone,
      role: "affiliate",
      commissionRate: newAffiliate.commissionRate,
      totalCommissions: 0,
      pendingCommissions: 0,
      totalIndications: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setAffiliates((prev) => [newAff, ...prev]);
    setShowAddModal(false);
    setNewAffiliate({ name: "", email: "", phone: "", commissionRate: 10 });
    toast({
      title: "Afiliado cadastrado!",
      description: `${newAffiliate.name} foi adicionado à plataforma.`,
    });
  };

  const totalCommissions = affiliates.reduce((s, a) => s + a.totalCommissions, 0);
  const totalPending = affiliates.reduce((s, a) => s + a.pendingCommissions, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Afiliados</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os afiliados da plataforma
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus size={15} className="mr-1.5" /> Novo Afiliado
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            title="Afiliados Ativos"
            value={affiliates.filter((a) => a.isActive).length}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Total Comissões"
            value={totalCommissions}
            icon={TrendingUp}
            color="primary"
            isCurrency
          />
          <StatCard
            title="Comissões a Pagar"
            value={totalPending}
            icon={DollarSign}
            color="warning"
            isCurrency
          />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Affiliates list */}
        <div className="grid gap-3">
          {filtered.map((aff) => {
            const initials = aff.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <motion.div
                key={aff.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-border hover:border-primary/20 transition-all ${!aff.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{aff.name}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              aff.isActive
                                ? "text-emerald-400 border-emerald-400/30"
                                : "text-muted-foreground border-muted-foreground/30"
                            }`}
                          >
                            {aff.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {aff.email}
                          </span>
                          {aff.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={11} /> {aff.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-primary">
                            <Percent size={11} /> {aff.commissionRate}% comissão
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-center">
                        <div>
                          <p className="text-base font-bold text-foreground">{aff.totalIndications}</p>
                          <p className="text-xs text-muted-foreground">Indicações</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-emerald-400">{formatCurrency(aff.totalCommissions)}</p>
                          <p className="text-xs text-muted-foreground">Comissões</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-amber-400">{formatCurrency(aff.pendingCommissions)}</p>
                          <p className="text-xs text-muted-foreground">Pendente</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelected(aff)}
                        >
                          <Edit size={15} />
                        </Button>
                        <Switch
                          checked={aff.isActive}
                          onCheckedChange={() => toggleActive(aff.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add affiliate modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md dark">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={18} className="text-primary" />
              Novo Afiliado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input
                value={newAffiliate.name}
                onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                placeholder="Nome do afiliado"
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={newAffiliate.email}
                onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={newAffiliate.phone}
                onChange={(e) => setNewAffiliate({ ...newAffiliate, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Taxa de Comissão (%)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={newAffiliate.commissionRate}
                onChange={(e) =>
                  setNewAffiliate({ ...newAffiliate, commissionRate: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddAffiliate}
              disabled={!newAffiliate.name || !newAffiliate.email}
            >
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit affiliate modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md dark">
          <DialogHeader>
            <DialogTitle>Editar Afiliado</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Indicações</p>
                  <p className="font-bold text-foreground">{selected.totalIndications}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total comissões</p>
                  <p className="font-bold text-emerald-400">{formatCurrency(selected.totalCommissions)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Membro desde</Label>
                <p className="font-medium">{formatDate(selected.createdAt)}</p>
              </div>
              <div>
                <Label>Taxa de Comissão (%)</Label>
                <Input
                  type="number"
                  defaultValue={selected.commissionRate}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast({ title: "Afiliado atualizado!", description: "Alterações salvas." });
              setSelected(null);
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
