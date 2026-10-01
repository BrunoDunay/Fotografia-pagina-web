export const STUDIO_TIMEZONE = 'America/Mexico_City';

/** Hoy (YYYY-MM-DD) en la zona horaria del estudio, sin importar la del visitante. */
export function todayInMexico(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: STUDIO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Días enteros entre dos fechas YYYY-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export type TicketStage = 'upcoming' | 'today' | 'past';

/** Estado del ticket de reservación: "Faltan X días" / "Hoy es el gran día" / "Evento realizado". */
export function ticketStage(eventDate: string, today: string): { stage: TicketStage; daysLeft: number } {
  const daysLeft = daysBetween(today, eventDate);
  return { stage: daysLeft > 0 ? 'upcoming' : daysLeft === 0 ? 'today' : 'past', daysLeft: Math.max(daysLeft, 0) };
}

/** "2026-10-24" → "sábado, 24 de octubre de 2026" (sin desfase de zona horaria). */
export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatMoney(amount: number | null | undefined, currency = 'MXN'): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
