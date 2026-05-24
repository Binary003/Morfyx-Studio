import { useState, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Send, Sparkles } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Ctx = { open: () => void; close: () => void };
const ModalCtx = createContext<Ctx>({ open: () => { }, close: () => { } });

export const useCustomFigureModal = () => useContext(ModalCtx);

export function CustomFigureModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <ModalCtx.Provider value={{ open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
      <AnimatePresence>{isOpen && <Modal onClose={() => setOpen(false)} />}</AnimatePresence>
    </ModalCtx.Provider>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", character: "", budget: "", description: "" });
  const [fileName, setFileName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `*Custom Figure Enquiry — Morfyx Studio*\n\n*Name:* ${form.name}\n*Anime Character:* ${form.character}\n*Budget:* ${form.budget}\n*Description:* ${form.description}${fileName ? `\n*Reference Image:* ${fileName} (will share next)` : ""}`;
    window.open(buildWhatsAppUrl(msg), "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-sm:max-w-[calc(100vw-1rem)] glass neon-border rounded-2xl sm:rounded-3xl p-5 pt-14 sm:p-10 my-4 sm:my-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full glass grid place-items-center hover:glow-pink transition sm:top-4 sm:right-4 sm:h-9 sm:w-9"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-accent">
          <Sparkles className="h-3 w-3" /> Custom Commission
        </div>
        <h3 className="font-display text-2xl sm:text-4xl font-bold mt-4 leading-tight">
          Request your <span className="text-gradient-neon">custom figure</span>
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
          Fill the form — we'll continue the conversation directly on WhatsApp.
        </p>

        <form onSubmit={submit} className="mt-5 sm:mt-6 grid sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Your Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Hiro Tanaka" />
          <Field label="Anime Character" required value={form.character} onChange={(v) => setForm({ ...form, character: v })} placeholder="Gojo Satoru" />
          <Field label="Budget (INR)" required value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="₹30,000 – ₹50,000" />
          <FileField fileName={fileName} onChange={setFileName} />
          <div className="sm:col-span-2 flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Description</label>
            <textarea
              required maxLength={1000} rows={4}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Pose, scale, base, paint style, references…"
              className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent resize-none"
            />
          </div>
          <button type="submit" className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gradient-neon)] px-6 py-3.5 font-semibold text-primary-foreground glow-pink hover:scale-[1.02] transition">
            <Send className="h-4 w-4" /> Send Enquiry on WhatsApp
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input
        required={required} maxLength={120} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="bg-secondary/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
      />
    </div>
  );
}

function FileField({ fileName, onChange }: { fileName: string; onChange: (n: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reference Image</label>
      <label className="cursor-pointer bg-secondary/40 border border-dashed border-border rounded-xl px-4 py-3 flex items-center gap-2 hover:border-accent transition text-sm">
        <Upload className="h-4 w-4 text-accent" />
        <span className="truncate text-muted-foreground">{fileName || "Upload reference"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0]?.name || "")} />
      </label>
    </div>
  );
}
