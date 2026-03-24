import { create } from "zustand";
import type { User } from "@/lib/index";
import {
  MOCK_ADMIN,
  MOCK_AFFILIATES,
} from "@/data/index";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Demo credentials
const DEMO_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  "admin@indicanic.com.br": { password: "admin123", userId: "admin-001" },
  "carlos@email.com": { password: "carlos123", userId: "aff-001" },
  "ana@email.com": { password: "ana123", userId: "aff-002" },
  "roberto@email.com": { password: "roberto123", userId: "aff-003" },
  "fernanda@email.com": { password: "fernanda123", userId: "aff-004" },
};

function findUser(userId: string): User | null {
  if (userId === "admin-001") return MOCK_ADMIN;
  return MOCK_AFFILIATES.find((a) => a.id === userId) ?? null;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800)); // simulate API
    const cred = DEMO_CREDENTIALS[email.toLowerCase()];
    if (cred && cred.password === password) {
      const user = findUser(cred.userId);
      if (user) {
        set({ user, isLoading: false });
        return true;
      }
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => set({ user: null }),
}));
