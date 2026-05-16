import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Sign Up — Morfyx Studio" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login({ name: form.name, email: form.email });
    navigate({ to: "/" });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Account" title="Join the collector guild" desc="Create your account to place orders and view your order history." />

      <section className="pb-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="glass neon-border rounded-3xl p-8">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Hiro Tanaka"
                className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
              />
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
                className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
              />
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</label>
              <input
                required
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="+91 99999 99999"
                className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="mt-2 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
              >
                Create Account
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
