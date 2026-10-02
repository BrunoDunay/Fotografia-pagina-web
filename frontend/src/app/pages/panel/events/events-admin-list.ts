import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, switchMap } from 'rxjs';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { EventStatus, EventSummary } from '../../../core/types/agenda.model';
import { formatMoney, todayInMexico } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { EVENT_STATUS_LABEL, PAYMENT_STATUS_LABEL, entries, shortDate, shortTime } from '../shared/labels';

type Range = 'upcoming' | 'past' | 'all';

@Component({
  selector: 'app-events-admin-list',
  imports: [FormsModule, RouterLink, Btn, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Eventos" subtitle="Todos los eventos contratados.">
      <a appBtn routerLink="/panel/events/new">+ Nuevo evento</a>
    </app-page-header>

    <div class="p-row filters">
      <div class="p-tabs">
        @for (r of ranges; track r.value) {
          <button type="button" class="p-tab" [class.is-active]="range() === r.value" (click)="range.set(r.value)">{{ r.label }}</button>
        }
      </div>
      <span class="p-spacer"></span>
      <select class="field__control narrow" [ngModel]="status()" (ngModelChange)="status.set($event)" aria-label="Filtrar por estado">
        <option value="">Todos los estados</option>
        @for (o of statusOptions; track o.value) {
          <option [value]="o.value">{{ o.label }}</option>
        }
      </select>
      <input class="field__control narrow" type="search" placeholder="Buscar evento o cliente" [ngModel]="query()" (ngModelChange)="query.set($event)" aria-label="Buscar" />
    </div>

    @if (events(); as list) {
      @if (list.length) {
        <div class="p-table-wrap">
          <table class="p-table">
            <thead>
              <tr><th>Fecha</th><th>Evento</th><th>Cliente</th><th>Tipo</th><th>Estado</th><th class="num">Total</th><th class="num">Saldo</th></tr>
            </thead>
            <tbody>
              @for (e of list; track e.id) {
                <tr class="is-link" (click)="open(e)" tabindex="0" (keydown.enter)="open(e)">
                  <td>{{ shortDate(e.eventDate) }} <span class="p-help">{{ shortTime(e.startTime) }}</span></td>
                  <td><strong>{{ e.title }}</strong></td>
                  <td>{{ e.client.name }}</td>
                  <td>{{ e.service?.name ?? '—' }}</td>
                  <td><span class="p-badge" [class]="'p-badge p-badge--' + e.status">{{ statusLabel[e.status] }}</span></td>
                  <td class="num">{{ money(e.payment.total) }}</td>
                  <td class="num">
                    <span class="p-badge" [class]="'p-badge p-badge--' + e.payment.status">
                      {{ e.payment.balance > 0 ? money(e.payment.balance) : paymentLabel[e.payment.status] }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="p-card p-empty">
          <p>No hay eventos con estos filtros.</p>
          <a appBtn variant="outline" routerLink="/panel/events/new">Registrar un evento</a>
        </div>
      }
    } @else {
      <app-skeleton-table [rows]="6" [columns]="6" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .narrow { width: auto; min-width: 12rem; }
    .p-empty { display: grid; justify-items: center; gap: var(--space-4); }
  `,
})
export class EventsAdminList {
  private readonly agenda = inject(AgendaApiService);
  private readonly router = inject(Router);

  protected readonly ranges: { value: Range; label: string }[] = [
    { value: 'upcoming', label: 'Próximos' },
    { value: 'past', label: 'Pasados' },
    { value: 'all', label: 'Todos' },
  ];
  protected readonly statusOptions = entries(EVENT_STATUS_LABEL);
  protected readonly statusLabel = EVENT_STATUS_LABEL;
  protected readonly paymentLabel = PAYMENT_STATUS_LABEL;
  protected readonly money = formatMoney;
  protected readonly shortDate = shortDate;
  protected readonly shortTime = shortTime;

  protected readonly range = signal<Range>('upcoming');
  protected readonly status = signal<EventStatus | ''>('');
  protected readonly query = signal('');

  private readonly filters = computed(() => ({ range: this.range(), status: this.status(), q: this.query().trim() }));

  protected readonly events = toSignal(
    toObservable(this.filters).pipe(
      debounceTime(200),
      switchMap((f) => {
        const today = todayInMexico();
        return this.agenda
          .events({
            from: f.range === 'upcoming' ? today : undefined,
            to: f.range === 'past' ? today : undefined,
            status: f.status || undefined,
            q: f.q || undefined,
          })
          .pipe(
            map((list) => (f.range === 'past' ? [...list].reverse() : list)),
            catchError(() => of([] as EventSummary[])),
          );
      }),
    ),
  );

  protected open(e: EventSummary): void {
    void this.router.navigate(['/panel/events', e.id]);
  }
}
