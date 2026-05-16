import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = {
    name: string;
    email: string;
};

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("morfyx-user");
        if (raw) {
            try {
                setUser(JSON.parse(raw));
            } catch {
                localStorage.removeItem("morfyx-user");
            }
        }
    }, []);

    const login = (nextUser: User) => {
        setUser(nextUser);
        localStorage.setItem("morfyx-user", JSON.stringify(nextUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("morfyx-user");
    };

    const value = useMemo(
        () => ({ user, isAuthenticated: !!user, login, logout }),
        [user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
