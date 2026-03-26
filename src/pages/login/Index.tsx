import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";

const FEATURES = [
  "Pipeline visual de todas as etapas",
  "Cálculo automático de comissões",
  "Dashboard com métricas em tempo real",
  "Relatórios e exportação de dados",
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const savedEmail = localStorage.getItem("indicanic_remembered_email") ?? "";
  const [email, setEmail]               = useState(savedEmail);
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(!!savedEmail);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (savedEmail) document.getElementById("password-input")?.focus();
  }, [savedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, password, remember);
    if (ok) {
      const state = useAuth.getState();
      navigate(state.user?.role === "admin" ? ROUTE_PATHS.ADMIN_DASHBOARD : ROUTE_PATHS.AFFILIATE_DASHBOARD);
    } else {
      setError("E-mail ou senha incorretos. Verifique as credenciais.");
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col lg:flex-row">

      {/* ── Left — branding panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col items-center justify-center p-14"
           style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, oklch(0.14 0.025 225) 100%)" }}>

        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none">
          {[320, 520, 720, 900].map((size) => (
            <div key={size} className="absolute rounded-full border border-primary/8"
              style={{ width: size, height: size, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
          {/* Glowing dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 28 }}
        >
          {/* Logo mark */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-8 shadow-[0_8px_40px_oklch(0.68_0.21_225/0.35)]">
            <Shield size={38} className="text-primary" strokeWidth={1.8} />
          </div>

          <h1 className="text-5xl font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
            Indica<span className="text-primary">Nic</span>
          </h1>
          <p className="text-muted-foreground text-base mb-2 font-medium">Plataforma de Indicações</p>
          <p className="text-sm text-muted-foreground/60 uppercase tracking-widest font-medium mb-10">
            Segurança Eletrônica
          </p>

          {/* Feature list */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 size={16} className="text-primary/70 shrink-0" strokeWidth={2} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <p className="absolute bottom-8 text-xs text-muted-foreground/40 text-center tracking-wide">
          IndicaNic © {new Date().getFullYear()} · Todos os direitos reservados
        </p>
      </div>

      {/* ── Right — form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background">

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Indica<span className="text-primary">Nic</span>
          </span>
        </div>

        <motion.div
          className="w-full max-w-[360px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
              Bem-vindo!
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Faça login para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email-input" className="text-sm font-medium text-foreground/90">E-mail</Label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email-input"
                  type="email"
                  className="pl-10 h-11 bg-card/60 border-border/60 focus:border-primary/50 transition-colors"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password-input" className="text-sm font-medium text-foreground/90">Senha</Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-11 bg-card/60 border-border/60 focus:border-primary/50 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="remember-me"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
                className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                Lembrar meu e-mail neste dispositivo
              </label>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3.5 py-3"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full h-11 font-semibold text-sm gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-8 border-t border-border/50 pt-6">
            <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
              Acesso exclusivo para afiliados cadastrados.
              <br />
              Entre em contato com o administrador para obter suas credenciais.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
