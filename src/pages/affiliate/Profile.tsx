import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useAffiliates";
import { useIndications } from "@/hooks/useIndications";
import { useCommissions } from "@/hooks/useCommissions";
import { formatDate, formatCurrency } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AffiliateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();
  const { data: indications = [] } = useIndications();
  const { data: commissions = [] } = useCommissions();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [pixKey, setPixKey] = useState(user?.pixKey ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = (user?.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.value, 0);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        name,
        phone,
        pixKey,
      });
      toast({ title: "Perfil atualizado!", description: "Seus dados foram salvos." });
    } catch {
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: "Senha inválida", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Senha alterada!", description: "Sua nova senha está ativa." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Erro ao alterar senha", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>

        {/* Profile Card */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-5 mb-6">
              <Avatar className="h-16 w-16 ring-2 ring-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-primary font-medium">
                  Afiliado · {user?.commissionRate}% de comissão
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <UserPlus size={11} /> Indicações
                </p>
                <p className="text-xl font-bold text-foreground">{indications.length}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <CheckCircle size={11} /> Ativas
                </p>
                <p className="text-xl font-bold text-emerald-400">
                  {indications.filter((i) => ["active", "commission_paid"].includes(i.status)).length}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <TrendingUp size={11} /> Comissões
                </p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalPaid)}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Membro desde {formatDate(user?.createdAt ?? "")}
            </p>
          </CardContent>
        </Card>

        {/* Personal data */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User size={15} className="text-primary" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8 opacity-60" value={user?.email ?? ""} disabled />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Chave PIX para pagamento</Label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="CPF, e-mail ou chave aleatória"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full"
            >
              {savingProfile ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Save size={15} className="mr-1.5" />}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock size={15} className="text-primary" /> Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword}
              className="w-full"
            >
              {savingPassword ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Lock size={15} className="mr-1.5" />}
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
