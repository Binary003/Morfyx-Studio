import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
    head: () => ({
        meta: [{ title: "Login — Morfyx Studio" }],
    }),
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const errors: typeof fieldErrors = {};

        if (!form.email) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = "Please enter a valid email";
        }

        if (!form.password) {
            errors.password = "Password is required";
        } else if (form.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Call backend API to login
            const response = await api.post("/auth/login", {
                email: form.email.trim(),
                password: form.password,
            });

            // Backend sets JWT in httpOnly cookie automatically
            // Response format: { success, message, data: { user: {...} } }
            if (response?.data?.user) {
                if (response.data.user.role === "admin") {
                    throw new Error("Please use the admin portal to sign in.");
                }

                if (response.data.accessToken) {
                    api.setAccessToken(response.data.accessToken);
                }
                login(response.data.user, response.data.accessToken);
                navigate({ to: "/" });
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err: any) {
            const status = err.response?.status;
            const backendMessage = err.response?.data?.message || err.message;
            const message = status === 401
                ? "We couldn't sign you in with those details. If you're new here, create an account to continue."
                : backendMessage || "Login failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell>
            <PageHero eyebrow="Account" title="Welcome back" desc="Log in to track orders, save favorites, and continue checkout." />

            <section className="pb-24">
                <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
                    <div className="glass neon-border rounded-3xl p-8">
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Email Address</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => { setForm({ ...form, email: event.target.value }); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                                    placeholder="you@example.com"
                                    className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 outline-none transition focus:border-accent ${fieldErrors.email ? "border-red-500/50" : "border-border"
                                        }`}
                                />
                                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Password</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => { setForm({ ...form, password: event.target.value }); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                                    placeholder="Enter your password"
                                    className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 outline-none transition focus:border-accent ${fieldErrors.password ? "border-red-500/50" : "border-border"
                                        }`}
                                />
                                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                            </div>

                            {error && (
                                <div className="text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-600 font-medium">
                                    ⚠ {error}
                                    {error.includes("create an account") && (
                                        <div className="mt-2">
                                            <Link to="/signup" className="font-semibold text-foreground underline underline-offset-4">
                                                Sign up here
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Logging in..." : "Log In"}
                            </button>
                        </form>
                        <div className="mt-6 text-sm text-muted-foreground text-center">
                            New here? <Link to="/signup" className="text-foreground">Create an account</Link>
                        </div>
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
