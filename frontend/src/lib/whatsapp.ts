const DEFAULT_WHATSAPP_NUMBER = "919999999999";

function normalizeWhatsAppNumber(rawNumber: string | undefined): string {
    const digitsOnly = (rawNumber || DEFAULT_WHATSAPP_NUMBER).toString().replace(/[^0-9]/g, "");

    if (digitsOnly.length === 10) {
        return `91${digitsOnly}`;
    }

    return digitsOnly;
}

export const WHATSAPP_NUMBER = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);

export function buildWhatsAppUrl(message: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
