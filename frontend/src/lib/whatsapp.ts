const DEFAULT_WHATSAPP_NUMBER = "919999999999";

export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER)
    .toString()
    .replace(/[^0-9]/g, "");

export function buildWhatsAppUrl(message: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
