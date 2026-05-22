import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const SUPPORT_MESSAGE = "Hi Morfyx Studio, I need help with an order / product inquiry.";

export function FloatingWhatsAppButton() {
    return (
        <a
            href={buildWhatsAppUrl(SUPPORT_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with Morfyx Studio on WhatsApp"
            className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_20px_50px_rgba(37,211,102,0.35)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366]/70 sm:bottom-6 sm:right-6"
        >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
                <MessageCircle className="h-5 w-5" />
            </span>
            <span className="hidden text-left sm:block">
                <span className="block text-[10px] uppercase tracking-[0.24em] text-white/80">WhatsApp</span>
                <span className="block text-sm font-semibold leading-tight">Chat with admin</span>
            </span>
        </a>
    );
}
