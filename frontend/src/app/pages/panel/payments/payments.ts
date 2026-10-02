import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AgendaApiService, PendingPaymentRow } from '../../../core/services/api/agenda-api.service';
import { formatMoney, todayInMexico } from '../../../core/utils/date-mx';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { PAYMENT_STATUS_LABEL, shortDate } from '../shared/labels';

/** Saldos pendientes: reemplaza el "cuaderno" de cobros. Solo visible en el panel. */
@Component({
  selector: 'app-payments',
  imports: [RouterLink, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Pagos" subtitle="Eventos con saldo pendiente. Los pagos se registran desde cada evento." />

    @if (data(); as d) {
      <div class="stats">
        <div class="p-card"><span class="p-card__title">Saldo por cobrar</span><strong>{{ money(d.totals.balance) }}</strong></div>
        <div class="p-card"><span class="p-card__title">Eventos con saldo</span><strong>{{ d.totals.events }}</strong></div>
      </div>

      @if (d.items.length) {
        <div class="p-table-wrap">
          <table class="p-table">
            <thead>
              <tr><th>Fecha</th><th>Evento</th><th>Cliente</th><th>Estado</th><th class="num">Total</th><th class="num">Pagado</th><th class="num">Pendiente</th><th>Último pago</th></tr>
            </thead>
            <tbody>
              @for (row of d.items; track row.eventId) {
                <tr class="is-link" (click)="open(row)" tabindex="0" (keydown.enter)="open(row)" [class.overdue]="row.eventDate < today">
                  <td>{{ shortDate(row.eventDate) }}</td>
                  <td><strong>{{ row.title }}</strong></td>
                  <td>{{ row.client.name }}</td>
                  <td><span class="p-badge" [class]="'p-badge p-badge--' + row.status">{{ statusLabel[row.status] }}</span></td>
                  <td class="num">{{ money(row.total) }}</td>
                  <td class="num">{{ money(row.paid) }}</td>
                  <td class="num"><strong>{{ money(row.balance) }}</strong></td>
                  <td>{{ row.lastPaymentAt ? shortDate(row.lastPaymentAt) : '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="p-help">Las filas resaltadas son eventos que ya pasaron y aún tienen saldo.</p>
      } @else {
        <div class="p-card p-empty">No hay saldos pendientes. <a class="p-link" routerLink="/panel/events">Ver eventos</a></div>
      }
    } @else {
      <app-skeleton-table [rows]="5" [columns]="6" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); }
    .stats strong { font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 400; }
    tr.overdue td { background: var(--color-warning-soft); }
  `,
})
export class Payments {
  private readonly router = inject(Router);
  protected readonly today = todayInMexico();
  protected readonly money = formatMoney;
  protected readonly shortDate = shortDate;
  protected readonly statusLabel = PAYMENT_STATUS_LABEL;
  protected readonly data = toSignal(inject(AgendaApiService).pendingPayments().pipe(catchError(() => of({ items: [], totals: { events: 0, balance: 0 } }))));

  protected open(row: PendingPaymentRow): void {
    void this.router.navigate(['/panel/events', row.eventId]);
  }
}
