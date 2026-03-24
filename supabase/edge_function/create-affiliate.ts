import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // --- 1. Verificar token do chamador ---
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) return json({ error: "Token ausente no header Authorization" }, 401);

  const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !caller) return json({ error: `Token inválido: ${authErr?.message}` }, 401);

  // --- 2. Verificar se é admin ---
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .maybeSingle();

  const role = profile?.role ?? caller.user_metadata?.role;
  if (role !== "admin") {
    return json({
      error: `Acesso negado. Seu perfil tem role="${role ?? "indefinido"}". Execute no SQL Editor: UPDATE public.profiles SET role='admin' WHERE email='${caller.email}';`
    }, 403);
  }

  // --- 3. Ler e validar body ---
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido — envie JSON" }, 400);
  }

  const { name, email, phone, commissionRate, temporaryPassword } = body as {
    name: string; email: string; phone?: string;
    commissionRate?: number; temporaryPassword: string;
  };

  if (!name || !email || !temporaryPassword) {
    return json({ error: "Campos obrigatórios: name, email, temporaryPassword" }, 400);
  }
  if (String(temporaryPassword).length < 6) {
    return json({ error: "Senha temporária deve ter no mínimo 6 caracteres" }, 400);
  }

  // --- 4. Criar usuário ---
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: String(email),
    password: String(temporaryPassword),
    email_confirm: true,
    user_metadata: { name, role: "affiliate" },
  });

  if (createErr) return json({ error: `Erro ao criar usuário: ${createErr.message}` }, 400);

  // --- 5. Atualizar perfil com phone e commission_rate ---
  if (created.user) {
    await new Promise((r) => setTimeout(r, 600)); // aguarda trigger criar profile
    await supabaseAdmin
      .from("profiles")
      .update({ phone: phone ?? null, commission_rate: Number(commissionRate ?? 10) })
      .eq("id", created.user.id);
  }

  return json({ success: true, userId: created.user?.id });
});
