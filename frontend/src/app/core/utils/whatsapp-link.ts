/** Enlace wa.me con mensaje genérico. El número va solo en dígitos con lada (ej. 524499995998). */
export function buildWhatsAppLink(phoneDigits: string, message?: string | null): string {
  const digits = phoneDigits.replace(/\D/g, '');
  const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
  return `https://wa.me/${digits}${text}`;
}
