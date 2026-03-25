import { create } from "zustand";
import type { User } from "@/lib/index";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as "affiliate" | "admin",
    phone: data.phone ?? undefined,
    cpf: data.cpf ?? undefined,
    pixKey: data.pix_key ?? undefined,
    commissionRate: Number(data.commission_rate),
    totalCommissions: 0,
    pendingCommissions: 0,
    totalIndications: 0,
    createdAt: data.created_at,
    isActive: data.is_active,
  };
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    set({ isLoading: true });

    // Verificar sessão existente
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      set({ user: profile, isLoading: false, initialized: true });
    } else {
      set({ isLoading: false, initialized: true });
    }

    // Ouvir mudanças de autenticação
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ user: profile });
      } else if (event === "SIGNED_OUT") {
        set({ user: null });
      }
    });
  },

  login: async (email: string, password: string, remember: boolean) => {
    set({ isLoading: true });
    try {
      // Salvar ou limpar e-mail conforme preferência
      if (remember) {
        localStorage.setItem("indicanic_remembered_email", email.toLowerCase().trim());
      } else {
        localStorage.removeItem("indicanic_remembered_email");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error || !data.user) {
        set({ isLoading: false });
        return false;
      }

      const profile = await fetchProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        set({ isLoading: false });
        return false;
      }

      // Quando NÃO lembrar: agenda logout ao fechar o navegador (sessão temporária)
      if (!remember) {
        const handleUnload = () => { supabase.auth.signOut(); };
        window.addEventListener("beforeunload", handleUnload, { once: true });
      }

      set({ user: profile, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
