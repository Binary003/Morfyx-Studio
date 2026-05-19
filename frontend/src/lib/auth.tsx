import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: any[];
    orderHistory?: any[];
    role?: "customer" | "admin";
};

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "morfyx-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    // Load user from localStorage on mount
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsedUser = JSON.parse(raw);
                setUser(parsedUser);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setMounted(true);
    }, []);

    const login = (nextUser: User) => {
        setUser(nextUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        // Clear auth cookies
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };

    const value = useMemo(
        () => ({ user, isAuthenticated: !!user, login, logout }),
        [user],
    );

    if (!mounted) return null; // Prevent hydration mismatch

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
