import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, Key, Percent, Edit, Save, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";

export default function AffiliateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    pixKey: user?.pixKey ?? "",
  });

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = () => {
    setEditing(false);
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações pessoais e dados de pagamento
          </p>
        </div>

        {/* Profile card */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge
                  variant="outline"
                  className="mt-1 text-xs border-emerald-500/40 text-emerald-400"
                >
                  Afiliado Ativo
                </Badge>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user?.commissionRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Comissão</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(user?.totalCommissions ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Recebido</p>
              </div>
            </div>

            {/* Edit form */}
            {editing ? (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="space-y-1.5">
                  <Label>Nome completo</Label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Chave PIX</Label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                      value={form.pixKey}
                      onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save size={14} className="mr-1.5" /> Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                  >
                    <X size={14} className="mr-1.5" /> Cancelar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {[
                  { icon: User, label: "Nome", value: user?.name },
                  { icon: Mail, label: "E-mail", value: user?.email },
                  { icon: Phone, label: "Telefone", value: user?.phone ?? "Não informado" },
                  { icon: Key, label: "Chave PIX", value: user?.pixKey ?? "Não informado" },
                  { icon: Percent, label: "Taxa de comissão", value: `${user?.commissionRate}%` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon size={15} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-32 shrink-0">{label}</span>
                    <span className="text-foreground font-medium truncate">{value}</span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setEditing(true)}
                >
                  <Edit size={14} className="mr-1.5" /> Editar Perfil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
