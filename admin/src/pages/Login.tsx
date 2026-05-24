import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoading, error, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email || !password) {
            return;
        }

        const success = await login(email, password);
        if (success) {
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-background via-background to-accent/10">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin Control Center</CardTitle>
                        <p className="text-xs text-mutedForeground mt-2">
                            Sign in with your admin credentials
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Email</label>
                                <Input
                                    type="email"
                                    placeholder="Enter your admin email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-red-600">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
