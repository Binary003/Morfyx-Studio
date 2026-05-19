import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, checkAuth } = useAuthStore();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Quick sync check based on localStorage
        const hasAuth = localStorage.getItem("morfyx_admin_auth");
        const hasUser = localStorage.getItem("morfyx_admin_user");

        if (!hasAuth || !hasUser) {
            // No auth found in localStorage, redirect immediately
            setIsChecking(false);
            return;
        }

        // Auth exists, verify with backend in background
        checkAuth().finally(() => setIsChecking(false));
    }, [checkAuth]);

    if (isChecking) {
        return <div className="flex items-center justify-center min-h-screen">Checking session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
}
