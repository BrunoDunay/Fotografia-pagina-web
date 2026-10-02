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

/** México centro no usa horario de verano desde 2022: UTC−6 todo el año. */
const STUDIO_UTC_OFFSET = '-06:00';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Tiempo restante hasta el evento (hora de inicio, o 00:00 si no hay hora) en la zona del estudio.
 * Nunca es negativo.
 */
export function countdownTo(eventDate: string, startTime: string | null, now = Date.now()): Countdown {
  const time = startTime ? startTime.slice(0, 5) : '00:00';
  const target = Date.parse(`${eventDate}T${time}:00${STUDIO_UTC_OFFSET}`);
  let rest = Math.max(0, Math.floor((target - now) / 1000));
  const days = Math.floor(rest / 86_400);
  rest -= days * 86_400;
  const hours = Math.floor(rest / 3_600);
  rest -= hours * 3_600;
  const minutes = Math.floor(rest / 60);
  return { days, hours, minutes, seconds: rest - minutes * 60 };
}

/** Partes de una fecha YYYY-MM-DD para el ticket: "sábado", 24, "octubre", 2026. */
export function dateParts(isoDate: string): { weekday: string; day: number; month: string; year: number } {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-MX', { ...options, timeZone: 'UTC' }).format(date);
  return { weekday: fmt({ weekday: 'long' }), day: date.getUTCDate(), month: fmt({ month: 'long' }), year: date.getUTCFullYear() };
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
