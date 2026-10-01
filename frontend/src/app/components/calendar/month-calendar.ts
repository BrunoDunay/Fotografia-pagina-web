import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isBusy: boolean;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** "2026-10" → { firstDay, lastDay } en formato YYYY-MM-DD. */
export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: iso(y, m, 1), to: iso(y, m, last) };
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/**
 * Calendario mensual reutilizable (público y panel).
 * Solo conoce fechas ocupadas: nunca recibe ni muestra información privada.
 */
@Component({
  selector: 'app-month-calendar',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './month-calendar.html',
  styleUrl: './month-calendar.css',
})
export class MonthCalendar {
  /** Mes visible, "YYYY-MM". */
  readonly month = input.required<string>();
  readonly today = input.required<string>();
  readonly busyDates = input<ReadonlySet<string>>(new Set());
  readonly selected = input<string | null>(null);
  readonly minMonth = input<string | null>(null);
  readonly maxMonth = input<string | null>(null);
  readonly loading = input(false);

  readonly monthChange = output<string>();
  readonly daySelect = output<CalendarDay>();

  protected readonly weekdays = WEEKDAYS;

  protected readonly title = computed(() => {
    const [y, m] = this.month().split('-').map(Number);
    return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)));
  });

  protected readonly canPrev = computed(() => !this.minMonth() || this.month() > this.minMonth()!);
  protected readonly canNext = computed(() => !this.maxMonth() || this.month() < this.maxMonth()!);

  /** Semanas que empiezan en lunes; incluye días de relleno del mes anterior/siguiente. */
  protected readonly days = computed<CalendarDay[]>(() => {
    const [y, m] = this.month().split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    const busy = this.busyDates();
    const today = this.today();

    return Array.from({ length: cells }, (_, i) => {
      const d = new Date(Date.UTC(y, m - 1, 1 - offset + i));
      const date = iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      return {
        date,
        day: d.getUTCDate(),
        inMonth: d.getUTCMonth() === m - 1,
        isPast: date < today,
        isToday: date === today,
        isBusy: busy.has(date),
      };
    });
  });

  protected go(delta: number): void {
    this.monthChange.emit(shiftMonth(this.month(), delta));
  }

  protected label(day: CalendarDay): string {
    const text = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
      new Date(`${day.date}T00:00:00Z`),
    );
    const state = day.isPast ? 'fecha pasada' : day.isBusy ? 'ocupado' : 'disponible';
    return `${text}: ${state}`;
  }
}
