import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib/index";

type Step = "loading" | "form" | "success" | "invalid";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]               = useState<Step>("loading");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [error, setError]             = useState("");
  const [submitting, setSubmitting]   = useState(false);

  // Supabase envia o token como hash fragment: #access_token=...&type=recovery
  // O HashRouter já usa "#" para rotas, então o Supabase coloca os parâmetros
  // como query string no hash: /#/redefinir-senha?access_token=...&type=recovery
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash   = new URLSearchParams(window.location.hash.replace(/^#\/?[^?]*\??/, ""));

    const token = params.get("access_token") ?? hash.get("access_token");
    const type  = params.get("type")         ?? hash.get("type");

    if (token && type === "recovery") {
      // Estabelece a sessão com o token de recovery
      supabase.auth.setSession({ access_token: token, refresh_token: hash.get("refresh_token") ?? "" })
        .then(({ error }) => {
          if (error) { setStep("invalid"); }
          else       { setStep("form");    }
        });
    } else {
      // Tenta pegar sessão já estabelecida pelo onAuthStateChange (PASSWORD_RECOVERY event)
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setStep("form");
        else              setStep("invalid");
      });
    }
  }, []);

  // Escuta evento PASSWORD_RECOVERY disparado pelo Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStep("form");
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message ?? "Erro ao redefinir senha. Tente novamente.");
    } else {
      await supabase.auth.signOut();
      setStep("success");
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)                   s++;
    if (/[A-Z]/.test(password))                 s++;
    if (/[0-9]/.test(password))                 s++;
    if (/[^A-Za-z0-9]/.test(password))          s++;
    return s;
  })();

  const strengthLabel = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const strengthColor = ["", "bg-red-500", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Shield size={20} className="text-primary" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Indica<span className="text-primary">Nic</span>
          </span>
        </div>

        {/* ── Loading ── */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm">Verificando link...</p>
          </div>
        )}

        {/* ── Link inválido ── */}
        {step === "invalid" && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle size={28} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Este link de redefinição expirou ou já foi utilizado.
                Solicite um novo na tela de login.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate(ROUTE_PATHS.LOGIN)}>
              Voltar ao login
            </Button>
          </div>
        )}

        {/* ── Formulário ── */}
        {step === "form" && (
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                Nova senha
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha uma senha segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nova senha */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/90">Nova senha</Label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPass ? "text" : "password"}
                    className="pl-10 pr-10 h-11 bg-background/60 border-border/60 focus:border-primary/50"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    autoFocus
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Barra de força */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-border"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${strength <= 1 ? "text-red-400" : strength === 2 ? "text-amber-400" : strength === 3 ? "text-yellow-400" : "text-emerald-400"}`}>
                      Força: {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/90">Confirmar senha</Label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showConf ? "text" : "password"}
                    className={`pl-10 pr-10 h-11 bg-background/60 border-border/60 focus:border-primary/50 transition-colors ${
                      confirm && confirm !== password ? "border-destructive/60" : confirm && confirm === password ? "border-emerald-500/50" : ""
                    }`}
                    placeholder="Repita a senha"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    required
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConf(!showConf)}>
                    {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {confirm && confirm === password && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Senhas coincidem
                  </p>
                )}
              </div>

              {/* Erro */}
              {error && (
                <motion.div
                  className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3.5 py-3"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</>
                  : "Redefinir senha"
                }
              </Button>
            </form>
          </div>
        )}

        {/* ── Sucesso ── */}
        {step === "success" && (
          <motion.div
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-4"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Senha redefinida!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sua senha foi atualizada com sucesso. Faça login com a nova senha.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate(ROUTE_PATHS.LOGIN)}>
              Ir para o login
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
