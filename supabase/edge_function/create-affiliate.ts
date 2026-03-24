import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar autenticação do chamador
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado: sem token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: `Token inválido: ${authError?.message ?? "usuário não encontrado"}` }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se é admin — tenta perfil no banco, fallback nos metadados
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerUser.id)
      .maybeSingle();

    const roleFromMeta = callerUser.user_metadata?.role;
    const roleFromProfile = callerProfile?.role;
    const isAdmin = roleFromProfile === "admin" || roleFromMeta === "admin";

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          error: `Acesso negado. Role no perfil: "${roleFromProfile ?? "sem perfil"}", Role nos metadados: "${roleFromMeta ?? "não definido"}". Execute: UPDATE public.profiles SET role = 'admin' WHERE email = '${callerUser.email}';`
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ler dados do novo afiliado
    const body = await req.json();
    const { name, email, phone, commissionRate, temporaryPassword } = body;

    if (!name || !email || !temporaryPassword) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios ausentes: name, email, temporaryPassword" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (temporaryPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar usuário via Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { name, role: "affiliate" },
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${createError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aguardar trigger criar o perfil e atualizar dados extras
    if (newUser.user) {
      // Pequena pausa para o trigger disparar
      await new Promise((r) => setTimeout(r, 500));

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          phone: phone ?? null,
          commission_rate: commissionRate ?? 10,
        })
        .eq("id", newUser.user.id);

      if (updateError) {
        console.error("Aviso: erro ao atualizar perfil:", updateError.message);
        // Não falha — usuário já foi criado
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `Erro interno: ${msg}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
