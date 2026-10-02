import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { EventSummary } from '../../../core/types/agenda.model';
import { formatLongDate, todayInMexico } from '../../../core/utils/date-mx';
import { monthRange, shiftMonth } from '../../../components/calendar/month-calendar';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonCalendar } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { EVENT_STATUS_LABEL, shortTime } from '../shared/labels';

interface Block {
  id: string;
  date: string;
  privateReason: string | null;
}

interface AgendaDay {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  events: EventSummary[];
  block: Block | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Calendario administrativo: eventos por día, creación rápida desde una fecha y bloqueos manuales. */
@Component({
  selector: 'app-agenda',
  imports: [FormsModule, RouterLink, Btn, Icon, SkeletonCalendar, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  private readonly agenda = inject(AgendaApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly today = todayInMexico();
  protected readonly month = signal(this.today.slice(0, 7));
  protected readonly selected = signal<string | null>(null);
  protected readonly blockReason = signal('');
  private readonly reload = signal(0);

  protected readonly weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  protected readonly statusLabel = EVENT_STATUS_LABEL;
  protected readonly shortTime = shortTime;
  protected readonly longDate = formatLongDate;

  private readonly data = toSignal(
    toObservable(computed(() => ({ month: this.month(), reload: this.reload() }))).pipe(
      switchMap(({ month }) => {
        const { from, to } = monthRange(month);
        // Incluye los días de relleno de la semana anterior/siguiente.
        const gridFrom = shiftDays(from, -7);
        const gridTo = shiftDays(to, 7);
        return forkJoin({
          events: this.agenda.events({ from: gridFrom, to: gridTo }).pipe(catchError(() => of([] as EventSummary[]))),
          blocks: this.agenda.availabilityBlocks(gridFrom, gridTo).pipe(catchError(() => of([] as Block[]))),
        });
      }),
    ),
  );

  protected readonly loading = computed(() => !this.data());

  protected readonly title = computed(() => {
    const [y, m] = this.month().split('-').map(Number);
    const text = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)));
    return text.charAt(0).toUpperCase() + text.slice(1);
  });

  protected readonly days = computed<AgendaDay[]>(() => {
    const data = this.data();
    const [y, m] = this.month().split('-').map(Number);
    const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7;

    const byDate = new Map<string, EventSummary[]>();
    for (const e of data?.events ?? []) byDate.set(e.eventDate, [...(byDate.get(e.eventDate) ?? []), e]);
    const blocks = new Map((data?.blocks ?? []).map((b) => [b.date, b]));

    return Array.from({ length: cells }, (_, i) => {
      const d = new Date(Date.UTC(y, m - 1, 1 - offset + i));
      const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      return {
        date,
        day: d.getUTCDate(),
        inMonth: d.getUTCMonth() === m - 1,
        isToday: date === this.today,
        isPast: date < this.today,
        events: byDate.get(date) ?? [],
        block: blocks.get(date) ?? null,
      };
    });
  });

  protected readonly selectedDay = computed(() => this.days().find((d) => d.date === this.selected()) ?? null);

  protected readonly monthCount = computed(
    () => this.days().filter((d) => d.inMonth).reduce((sum, d) => sum + d.events.filter((e) => e.status !== 'cancelled').length, 0),
  );

  protected go(delta: number): void {
    this.month.set(shiftMonth(this.month(), delta));
    this.selected.set(null);
  }

  protected goToday(): void {
    this.month.set(this.today.slice(0, 7));
    this.selected.set(this.today);
  }

  protected newEvent(date: string): void {
    void this.router.navigate(['/panel/events/new'], { queryParams: { date } });
  }

  protected block(date: string): void {
    this.agenda.createAvailabilityBlock(date, this.blockReason() || undefined).subscribe(() => {
      this.toast.success('Día bloqueado: se mostrará como ocupado en el calendario público.');
      this.blockReason.set('');
      this.reload.update((n) => n + 1);
    });
  }

  protected unblock(block: Block): void {
    this.agenda.deleteAvailabilityBlock(block.id).subscribe(() => {
      this.toast.success('Día desbloqueado.');
      this.reload.update((n) => n + 1);
    });
  }
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
