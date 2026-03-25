import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Shield, Percent, Bell, Save,
  Building2, Phone, Mail, Globe, Clock, Loader2, KeyRound,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSettings, useSaveSettings, useChangePassword } from "@/hooks/useSettings";
import type { CompanySettings } from "@/hooks/useSettings";

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: savedSettings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();
  const changePassword = useChangePassword();

  const [form, setForm] = useState<CompanySettings>({
    company_name: "",
    phone: "",
    email: "",
    website: "",
    default_commission_rate: 10,
    payment_due_days: 15,
    notify_new_indication: true,
    notify_status_change: true,
    notify_commission_approved: true,
    notify_weekly_report: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preencher formulário quando os dados chegarem do Supabase
  useEffect(() => {
    if (savedSettings) setForm(savedSettings);
  }, [savedSettings]);

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync(form);
      toast({
        title: "Configurações salvas!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast({ title: "Erro ao salvar", description: msg, variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas diferentes", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync({ newPassword });
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Senha alterada!", description: "Sua senha foi atualizada com sucesso." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar senha";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
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
      <motion.div
        className="max-w-2xl space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings size={20} className="text-primary" /> Configurações
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie as configurações da plataforma</p>
        </div>

        {/* Dados da empresa */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 size={15} className="text-primary" /> Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome da empresa</Label>
                <Input
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  placeholder="Nome da sua empresa"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(11) 9 0000-0000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>E-mail de contato</Label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    className="pl-8"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Website</Label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="www.suaempresa.com.br"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comissão */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent size={15} className="text-primary" /> Configurações de Comissão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Taxa padrão de comissão (%)</Label>
                <div className="relative">
                  <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number" min={1} max={50}
                    className="pl-8"
                    value={form.default_commission_rate}
                    onChange={(e) => setForm({ ...form, default_commission_rate: Number(e.target.value) })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Aplicado automaticamente a novos afiliados</p>
              </div>
              <div className="space-y-1.5">
                <Label>Prazo de pagamento (dias)</Label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number" min={1} max={60}
                    className="pl-8"
                    value={form.payment_due_days}
                    onChange={(e) => setForm({ ...form, payment_due_days: Number(e.target.value) })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Dias para pagamento após aprovação</p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Exemplo de cálculo</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Contrato de R$ 10.000,00</span>
                <span className="font-bold text-primary">
                  = R$ {(10000 * form.default_commission_rate / 100).toFixed(2).replace(".", ",")} de comissão
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell size={15} className="text-primary" /> Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "notify_new_indication", label: "Nova indicação cadastrada", desc: "Alertas quando um afiliado cadastrar nova indicação" },
              { key: "notify_status_change", label: "Mudança de status", desc: "Notifique os afiliados ao atualizar etapas" },
              { key: "notify_commission_approved", label: "Comissão aprovada", desc: "E-mail ao afiliado quando aprovar comissão" },
              { key: "notify_weekly_report", label: "Relatório semanal", desc: "Resumo automático às segundas-feiras" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={form[key as keyof CompanySettings] as boolean}
                  onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield size={15} className="text-primary" /> Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
              <KeyRound size={14} className="text-primary shrink-0" />
              Altere sua senha de acesso ao painel administrativo
            </div>
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleChangePassword}
              disabled={!newPassword || !confirmPassword || changePassword.isPending}
            >
              {changePassword.isPending
                ? <><Loader2 size={14} className="mr-2 animate-spin" /> Alterando...</>
                : <><KeyRound size={14} className="mr-2" /> Alterar Senha</>
              }
            </Button>
          </CardContent>
        </Card>

        {/* Botão salvar */}
        <Button
          onClick={handleSave}
          className="w-full"
          disabled={saveSettings.isPending}
        >
          {saveSettings.isPending
            ? <><Loader2 size={16} className="mr-2 animate-spin" /> Salvando...</>
            : <><Save size={16} className="mr-2" /> Salvar Configurações</>
          }
        </Button>
      </motion.div>
    </Layout>
  );
}
