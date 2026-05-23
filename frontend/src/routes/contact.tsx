import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Morfyx Studio" },
      { name: "description", content: "Get in touch with the Morfyx Studio team in India." },
      { property: "og:title", content: "Contact — Morfyx Studio" },
      { property: "og:description", content: "Get in touch with our collector concierge." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const whatsappUrl = buildWhatsAppUrl("Hi Morfyx Studio, I have a question about an order / product.");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formError, setFormError] = useState("");

  const subject = (form.subject || "Contact request from website").trim();
  const body = [
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    "",
    "Message:",
    form.message.trim(),
  ].join("\n");
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("morfyxstudio@gmail.com")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <PageShell>
      <PageHero eyebrow="Contact" title="Talk to our studio team" desc="We reply within 24 hours. For custom commissions, message us on WhatsApp." />
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_1fr] gap-8">
          <form className="glass neon-border rounded-3xl p-8 flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                maxLength={120}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
              />
              <input
                required
                type="email"
                maxLength={255}
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
              />
            </div>
            <input
              maxLength={200}
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
            />
            <textarea
              required
              maxLength={1500}
              rows={6}
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent resize-none"
            />
            {formError && <div className="text-sm text-red-400">{formError}</div>}
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
                  e.preventDefault();
                  setFormError("Please fill in name, email, and message before sending.");
                  return;
                }
                setFormError("");
              }}
              className="self-start inline-flex items-center gap-2 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
            >
              Send Message
            </a>
          </form>

          <div className="flex flex-col gap-4">
            {[
              { icon: Mail, t: "Email", d: "morfyxstudio@gmail.com" },
              { icon: MessageCircle, t: "WhatsApp", d: "+91 9696881479 ", href: whatsappUrl },
              { icon: MapPin, t: "Studio", d: "India · Single studio" },
            ].map((c) => (
              <a
                key={c.t}
                href={c.href}
                target={c.href ? "_blank" : undefined}
                rel={c.href ? "noreferrer" : undefined}
                className="glass rounded-2xl p-6 flex gap-4 items-start hover:glow-pink transition"
              >
                <div className="h-12 w-12 shrink-0 rounded-xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground glow-pink">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-accent">{c.t}</div>
                  <div className="font-display text-lg font-bold mt-1">{c.d}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
