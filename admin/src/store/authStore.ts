import { create } from "zustand";

const STORAGE_KEY = "morfyx_admin_auth";
const ADMIN_PASSWORD = "morfyx-admin";

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: localStorage.getItem(STORAGE_KEY) === "true",
  login: (password) => {
    const ok = password === ADMIN_PASSWORD;
    if (ok) {
      localStorage.setItem(STORAGE_KEY, "true");
      set({ isAuthenticated: true });
    }
    return ok;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAuthenticated: false });
  },
}));
