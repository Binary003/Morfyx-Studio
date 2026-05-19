import { create } from "zustand";
import { adminApi } from "../lib/api";

const STORAGE_KEY = "morfyx_admin_auth";
const USER_KEY = "morfyx_admin_user";

interface User {
    email: string;
    name: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setError: (error: string | null) => void;
}

// Restore user from localStorage on app load
const restoreUser = (): User | null => {
    try {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: !!localStorage.getItem(STORAGE_KEY),
    user: restoreUser(),
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const response = await adminApi.adminLogin({ email, password });

            // Response format: { success, message, data: { user: {...} } }
            if (response?.data?.user) {
                const user = {
                    email: response.data.user.email,
                    name: response.data.user.name
                };
                localStorage.setItem(STORAGE_KEY, "true");
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                set({
                    isAuthenticated: true,
                    user
                });
                return true;
            }

            throw new Error("Login failed");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed";
            set({ error: message });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });
            await adminApi.logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_KEY);
            set({
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null
            });
        }
    },

    checkAuth: async () => {
        // Check if stored auth flag and user exist
        const auth = localStorage.getItem(STORAGE_KEY);
        const user = restoreUser();

        if (!auth || !user) {
            set({ isAuthenticated: false, user: null });
            return;
        }

        try {
            // Verify with backend that token is still valid
            // (token is in httpOnly cookie, will be sent automatically)
            const response = await adminApi.verifyAuth();

            if (response) {
                set({ isAuthenticated: true, user });
            } else {
                // Token invalid or expired
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(USER_KEY);
                set({ isAuthenticated: false, user: null });
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_KEY);
            set({ isAuthenticated: false, user: null });
        }
    },

    setError: (error) => set({ error }),
}));

