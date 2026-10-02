import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PublicReservation } from '../../core/types/agenda.model';
import { countdownTo, dateParts, ticketStage, todayInMexico } from '../../core/utils/date-mx';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Ticket digital de reservación (refs. Ticket_reservación 01–03): sobre con los nombres,
 * monograma, mini calendario con el día marcado y la cuenta regresiva.
 *
 * Es una tira 9:16 dimensionada con unidades de contenedor (cqw): se ve igual en cualquier
 * pantalla y al capturarla como imagen (1080×1920) para historias de Instagram/WhatsApp.
 * Solo muestra datos públicos (nunca pagos ni contacto).
 */
@Component({
  selector: 'app-reservation-ticket',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'ticket ticket--' + reservation().palette" },
  templateUrl: './reservation-ticket.html',
  styleUrl: './reservation-ticket.css',
})
export class ReservationTicket {
  readonly reservation = input.required<PublicReservation>();
  /** Instante actual (ms); lo actualiza la página cada segundo en el navegador. */
  readonly now = input.required<number>();

  protected readonly weekdays = WEEKDAYS;
  protected readonly pad = pad;

  /** "Camila & Sebastián" → ["Camila", "Sebastián"]; un solo nombre → [nombre]. */
  protected readonly names = computed(() => {
    const parts = this.reservation()
      .title.split(/\s+(?:&|y)\s+/i)
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.length >= 2 ? parts.slice(0, 2) : [this.reservation().title];
  });

  /** Tamaño del script según el nombre más largo, para que no se desborde del sobre. */
  protected readonly nameSize = computed(() => {
    const longest = Math.max(...this.names().map((n) => n.length));
    return `${Math.min(9.5, Math.max(5.4, (9.5 * 12) / longest))}cqw`;
  });

  protected readonly monogram = computed(() => {
    const raw = this.reservation().monogram?.trim();
    if (!raw) return this.names().map((n) => n[0]?.toUpperCase() ?? '');
    return raw.includes('|') ? raw.split('|').map((l) => l.trim()) : [raw];
  });

  protected readonly date = computed(() => dateParts(this.reservation().eventDate));

  protected readonly shortDate = computed(() => {
    const [y, m, d] = this.reservation().eventDate.split('-');
    return `${d}.${m}.${y}`;
  });

  /** Estado según el día en México (no el del visitante). */
  protected readonly stage = computed(() => ticketStage(this.reservation().eventDate, todayInMexico(new Date(this.now()))).stage);

  protected readonly countdown = computed(() => {
    const r = this.reservation();
    return countdownTo(r.eventDate, r.startTime, this.now());
  });

  protected readonly time = computed(() => {
    const { startTime, endTime } = this.reservation();
    if (!startTime) return null;
    return endTime ? `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)} hrs` : `${startTime.slice(0, 5)} hrs`;
  });

  protected readonly place = computed(() => {
    const { venue, city } = this.reservation();
    return [venue, city].filter(Boolean).join(', ') || null;
  });

  /** Mini calendario del mes del evento (semanas de lunes a domingo). */
  protected readonly calendar = computed(() => {
    const [year, month, day] = this.reservation().eventDate.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);
    return { cells, day };
  });
}
