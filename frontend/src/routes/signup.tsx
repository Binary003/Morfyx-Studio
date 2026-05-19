import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Sign Up — Morfyx Studio" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; phone?: string }>({});

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!form.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errors.password = "Password must contain uppercase, lowercase & numbers";
    }

    if (!form.phone) {
      errors.phone = "Phone number is required";
    } else {
      const phoneDigits = form.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        errors.phone = "Phone number must be exactly 10 digits";
      }
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
      // Call backend API to register user
      const response = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.replace(/\D/g, ""),
      });

      // Backend sets JWT in httpOnly cookie automatically
      // Response format: { success, message, data: { user: {...} } }
      if (response?.data?.user) {
        login(response.data.user);
        navigate({ to: "/" });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero eyebrow="Account" title="Join the collector guild" desc="Create your account to place orders and view your order history." />

      <section className="pb-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="glass neon-border rounded-3xl p-8">
            <form onSubmit={submit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => { setForm({ ...form, name: event.target.value }); setFieldErrors(prev => ({ ...prev, name: undefined })); }}
                  placeholder="Hiro Tanaka"
                  className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 outline-none transition focus:border-accent ${fieldErrors.name ? "border-red-500/50" : "border-border"
                    }`}
                />
                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
              </div>

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
                  placeholder="Min 6 chars with A-Z, a-z, 0-9"
                  className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 outline-none transition focus:border-accent ${fieldErrors.password ? "border-red-500/50" : "border-border"
                    }`}
                />
                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Phone Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) => {
                    // Allow only digits and common phone separators
                    const value = event.target.value.replace(/[^\d\s\-\+]/g, "");
                    // Limit to 10 digits + separators
                    const digits = value.replace(/\D/g, "");
                    if (digits.length <= 10) {
                      setForm({ ...form, phone: value });
                      setFieldErrors(prev => ({ ...prev, phone: undefined }));
                    }
                  }}
                  placeholder="10-digit number"
                  maxLength={14}
                  className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 outline-none transition focus:border-accent ${fieldErrors.phone ? "border-red-500/50" : "border-border"
                    }`}
                />
                {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
              </div>

              {error && (
                <div className="text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-600 font-medium">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            <div className="mt-6 text-sm text-muted-foreground text-center">
              Already have an account? <Link to="/login" className="text-foreground">Log in</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
