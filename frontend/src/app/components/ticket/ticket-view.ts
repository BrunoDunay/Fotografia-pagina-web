import { Countdown, TicketStage } from '../../core/utils/date-mx';
import { TicketMarkKind } from './ticket-mark';

/** Datos ya preparados que recibe cada diseño de ticket (solo información pública). */
export interface TicketView {
  /** Título completo, ej. "Camila & Sebastián". */
  title: string;
  /** ["Camila", "Sebastián"] o [título] si es un solo nombre. */
  names: string[];
  /** Iniciales, ej. ["C", "S"]. */
  monogram: string[];
  /** "sábado", 24, "octubre", 2026. */
  date: { weekday: string; day: number; month: string; year: number };
  /** Fecha ISO del evento, "2026-10-24". */
  iso: string;
  /** "24.10.2026" */
  shortDate: string;
  /** "24" · "10" · "26" (para diseños con la fecha en números grandes). */
  digits: { day: string; month: string; year: string };
  stage: TicketStage;
  countdown: Countdown;
  /** "17:00 – 23:30 hrs" (solo si el fotógrafo decidió mostrarla). */
  time: string | null;
  place: string | null;
  message: string | null;
  /** Ícono del día según el tipo de evento (corazón, corona, birrete, biberón, estrella). */
  mark: TicketMarkKind;
  /** Foto propia de la reservación (URL optimizada); hoy ningún diseño la usa. */
  photo: string | null;
  /** El "papel" de la variación es oscuro (ej. playa al anochecer): usar el logo claro. */
  darkPaper: boolean;
  /** El color principal de la variación es muy claro: el texto que va encima debe ser oscuro. */
  lightMain: boolean;
  /** Mes del evento: celdas (null = vacío) de lunes a domingo y el día marcado. */
  calendar: { cells: (number | null)[]; day: number };
}

/** Texto que usan los diseños con mensaje cuando el fotógrafo no escribió uno. */
export const DEFAULT_TICKET_NOTE = 'Con mucha alegría queremos que seas parte de este día tan especial.';

/** Tamaño de letra (en cqw) que se reduce si el texto es largo, para que no se desborde. */
export function fitSize(text: string, max: number, min: number, comfortableLength: number): string {
  return `${Math.min(max, Math.max(min, (max * comfortableLength) / Math.max(text.length, 1)))}cqw`;
}
