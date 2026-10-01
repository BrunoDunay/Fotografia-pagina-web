import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SettingsStore } from '../../core/services/settings.store';
import { SeoService } from '../../core/services/seo.service';
import { formatLongDate, todayInMexico } from '../../core/utils/date-mx';
import { buildWhatsAppLink } from '../../core/utils/whatsapp-link';
import { CalendarDay, MonthCalendar, monthRange, shiftMonth } from '../../components/calendar/month-calendar';
import { SectionTitle } from '../../components/section-title/section-title';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';
import { SkeletonCalendar } from '../../components/skeletons';

const MONTHS_AHEAD = 24;

/**
 * Calendario público: el visitante solo ve "Disponible" u "Ocupado".
 * Sin reservación ni pago automático: para apartar, contacta por WhatsApp.
 */
@Component({
  selector: 'app-availability',
  imports: [MonthCalendar, SectionTitle, Btn, Icon, SkeletonCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './availability.html',
  styleUrl: './availability.css',
})
export class Availability {
  private readonly api = inject(PublicApiService);
  protected readonly settings = inject(SettingsStore);

  protected readonly today = signal(todayInMexico());
  protected readonly minMonth = this.today().slice(0, 7);
  protected readonly maxMonth = shiftMonth(this.minMonth, MONTHS_AHEAD);
  protected readonly month = signal(this.minMonth);
  protected readonly selected = signal<CalendarDay | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly busy = toSignal(
    toObservable(this.month).pipe(
      tap(() => this.loading.set(true)),
      switchMap((month) => {
        const { from, to } = monthRange(month);
        return this.api.availability(from, to).pipe(
          tap((res) => {
            this.today.set(res.today);
            this.failed.set(false);
          }),
          map((res) => new Set(res.days.map((d) => d.date)) as ReadonlySet<string>),
          catchError(() => {
            this.failed.set(true);
            return of(new Set<string>() as ReadonlySet<string>);
          }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null },
  );

  protected readonly selectedLabel = computed(() => {
    const day = this.selected();
    return day ? formatLongDate(day.date) : null;
  });

  /**
   * El visitante eligió una fecha: se incluye en el mensaje porque él mismo la seleccionó.
   * Sin selección se usa el mensaje genérico configurado en el panel.
   */
  protected readonly whatsappForDate = computed(() => {
    const s = this.settings.settings();
    const label = this.selectedLabel();
    if (!s) return null;
    const message = label ? `${s.whatsapp.message} Me gustaría consultar la fecha: ${label}.` : s.whatsapp.message;
    return buildWhatsAppLink(s.contact.whatsapp, message);
  });

  constructor() {
    inject(SeoService).setPage({
      title: 'Disponibilidad | Armando Ovalle Wedding Studio',
      description: 'Consulta si la fecha de tu boda o evento está disponible.',
      path: '/availability',
    });
  }

  protected changeMonth(month: string): void {
    this.selected.set(null);
    this.month.set(month);
  }
}
