import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const savedEmail = localStorage.getItem("indicanic_remembered_email") ?? "";
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(!!savedEmail);
  const [error, setError] = useState("");

  // Se já havia e-mail salvo, focar no campo de senha
  useEffect(() => {
    if (savedEmail) {
      document.getElementById("password-input")?.focus();
    }
  }, [savedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, password, remember);
    if (ok) {
      const state = useAuth.getState();
      if (state.user?.role === "admin") {
        navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTE_PATHS.AFFILIATE_DASHBOARD);
      }
    } else {
      setError("E-mail ou senha incorretos. Verifique as credenciais.");
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col lg:flex-row">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-primary rounded-full"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 30 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_oklch(0.68_0.21_225/0.3)]">
            <Shield size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Indica<span className="text-primary">Nic</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Plataforma de Indicações
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Gerencie suas indicações, acompanhe comissões e monitore
            cada etapa da instalação em tempo real.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3 text-left">
            {[
              "Pipeline visual de etapas",
              "Cálculo automático de comissões",
              "Dashboard com métricas em tempo real",
              "Relatórios exportáveis",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <Shield size={28} className="text-primary" />
          <span className="text-2xl font-bold">
            Indica<span className="text-primary">Nic</span>
          </span>
        </div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Faça login para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-1.5">
              <Label htmlFor="email-input">E-mail</Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email-input"
                  type="email"
                  className="pl-9"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="password-input">Senha</Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center gap-2.5 py-0.5">
              <Checkbox
                id="remember-me"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="remember-me"
                className="text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
              >
                Lembrar meu e-mail neste dispositivo
              </label>
            </div>

            {error && (
              <motion.div
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Acesso exclusivo para afiliados cadastrados.<br />Entre em contato com o administrador para obter suas credenciais.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
