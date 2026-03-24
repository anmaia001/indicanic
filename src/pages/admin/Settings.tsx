import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Percent,
  Bell,
  Save,
  Building2,
  Phone,
  Mail,
  Globe,
  Clock,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [companySettings, setCompanySettings] = useState({
    name: "NicSeg Segurança Eletrônica",
    phone: "(11) 3000-0001",
    email: "contato@nicseg.com.br",
    website: "www.nicseg.com.br",
    defaultCommissionRate: 10,
    paymentDueDays: 15,
  });

  const [notifications, setNotifications] = useState({
    newIndication: true,
    statusChange: true,
    commissionApproved: true,
    weeklyReport: false,
  });

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "As alterações foram aplicadas com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações da plataforma
          </p>
        </div>

        {/* Company settings */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 size={15} className="text-primary" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome da empresa</Label>
                <Input
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
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
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission settings */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent size={15} className="text-primary" />
              Configurações de Comissão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Taxa padrão de comissão (%)</Label>
                <div className="relative">
                  <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    className="pl-8"
                    value={companySettings.defaultCommissionRate}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        defaultCommissionRate: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Aplicado automaticamente a novos afiliados
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Prazo de pagamento (dias)</Label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    className="pl-8"
                    value={companySettings.paymentDueDays}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        paymentDueDays: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Dias para pagamento após aprovação
                </p>
              </div>
            </div>

            {/* Commission calculation example */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Exemplo de cálculo</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Contrato de R$ 10.000,00</span>
                <span className="font-bold text-primary">
                  = R$ {(10000 * companySettings.defaultCommissionRate / 100).toFixed(2).replace(".", ",")} de comissão
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell size={15} className="text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "newIndication", label: "Nova indicação cadastrada", desc: "Receba alertas quando um afiliado cadastrar nova indicação" },
              { key: "statusChange", label: "Mudança de status", desc: "Notifique os afiliados ao atualizar etapas" },
              { key: "commissionApproved", label: "Comissão aprovada", desc: "Envie e-mail ao afiliado quando aprovar comissão" },
              { key: "weeklyReport", label: "Relatório semanal", desc: "Resumo automático às segundas-feiras" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={(v) => setNotifications({ ...notifications, [key]: v })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield size={15} className="text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Autenticação em dois fatores</p>
                <p className="text-xs text-muted-foreground">Adiciona camada extra de segurança</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label>Nova senha de administrador</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar nova senha</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          <Save size={16} className="mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </Layout>
  );
}
