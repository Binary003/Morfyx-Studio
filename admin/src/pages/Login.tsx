import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const login = useAuthStore((state) => state.login);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const ok = login(password.trim());
        if (!ok) {
            setError("Incorrect password. Try again.");
            return;
        }
        navigate("/", { replace: true });
    };

    return (
        <div className="min-h-screen grid place-items-center px-4">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                        <p className="text-xs text-mutedForeground">
                            Enter the admin password to access the control center.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Admin password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            {error && <div className="text-xs text-rose-300">{error}</div>}
                            <Button type="submit" className="w-full">
                                Enter Dashboard
                            </Button>
                            <div className="text-xs text-mutedForeground">
                                Dev password: <span className="text-neonCyan">morfyx-admin</span>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
