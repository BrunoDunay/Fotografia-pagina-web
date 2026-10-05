import { EventStatus, PaymentConcept, PaymentMethod, PaymentStatus } from '../../../core/types/agenda.model';
import { ThemeDecoration } from '../../../core/types/catalog.model';

/** Textos en español para los valores internos de la API. */

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  tentative: 'Por confirmar',
  confirmed: 'Confirmado',
  completed: 'Realizado',
  cancelled: 'Cancelado',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Sin pagos',
  partial: 'Con saldo',
  paid: 'Liquidado',
};

export const PAYMENT_CONCEPT_LABEL: Record<PaymentConcept, string> = {
  apartado: 'Apartado',
  abono: 'Abono',
  liquidacion: 'Liquidación',
  otro: 'Otro',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
};

export const DECORATION_LABEL: Record<ThemeDecoration, string> = {
  none: 'Sin decoración',
  snow: 'Nieve',
  christmas: 'Navidad (copos, galletas, bastones, muérdago)',
  hearts: 'Corazones',
  petals: 'Pétalos',
  sunshine: 'Destellos de verano',
  leaves: 'Hojas',
  confetti: 'Confeti de colores',
  papel_picado: 'Papel picado tricolor',
  dia_de_muertos: 'Día de Muertos (calaveritas y cempasúchil)',
  fireworks: 'Fuegos artificiales',
  mothers_day: 'Arreglo de flores bajo el logotipo',
};

export const entries = <K extends string>(record: Record<K, string>) =>
  Object.entries(record).map(([value, label]) => ({ value: value as K, label: label as string }));

/** "2026-10-24" → "sáb 24 oct 2026" (formato corto para tablas). */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** "17:00:00" → "17:00". */
export const shortTime = (time: string | null | undefined) => (time ? time.slice(0, 5) : '');
