import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { SITE_URL } from '../../../core/config/api.config';
import { todayInMexico } from '../../../core/utils/date-mx';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { Reservation, EventSummary } from '../../../core/types/agenda.model';
import { PALETTE_LABEL, shortDate } from '../shared/labels';

type ReservationRow = Reservation & { event: EventSummary };

/** Tickets digitales de cada evento: copiar enlace, activar/desactivar. */
@Component({
  selector: 'app-reservations',
  imports: [RouterLink, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Reservaciones" subtitle="Cada evento tiene un ticket digital para compartir con el cliente (sin pagos ni datos privados)." />

    @if (rows(); as list) {
      @if (list.length) {
        <div class="p-table-wrap">
          <table class="p-table">
            <thead><tr><th>Fecha</th><th>Ticket</th><th>Cliente</th><th>Color</th><th>Enlace</th><th>Activo</th></tr></thead>
            <tbody>
              @for (r of list; track r.id) {
                <tr [class.is-past]="r.event.eventDate < today">
                  <td>{{ shortDate(r.event.eventDate) }}</td>
                  <td><a class="p-link" [routerLink]="['/panel/events', r.event.id]">{{ r.displayTitle }}</a></td>
                  <td>{{ r.event.client.name }}</td>
                  <td><span class="swatch" [class]="'swatch swatch--' + r.ticketPalette"></span> {{ palette[r.ticketPalette] }}</td>
                  <td>
                    <button type="button" class="p-link copy" (click)="copy(r)">Copiar</button>
                    · <a class="p-link" [href]="url(r)" target="_blank" rel="noopener">Abrir</a>
                  </td>
                  <td>
                    <label class="p-check"><input type="checkbox" [checked]="r.isActive" (change)="toggle(r, $any($event.target).checked)" /> {{ r.isActive ? 'Sí' : 'No' }}</label>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="p-card p-empty">Los tickets se crean automáticamente al registrar un evento.</div>
      }
    } @else {
      <app-skeleton-table [rows]="5" [columns]="5" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    tr.is-past td { opacity: 0.6; }
    .copy { border: 0; background: none; padding: 0; }
    .swatch { display: inline-block; width: 0.9rem; height: 0.9rem; vertical-align: -2px; border-radius: 2px; }
    .swatch--mocha { background: var(--ticket-mocha); }
    .swatch--navy { background: var(--ticket-navy); }
    .swatch--burgundy { background: var(--ticket-burgundy); }
  `,
})
export class Reservations {
  private readonly agenda = inject(AgendaApiService);
  private readonly toast = inject(ToastService);
  private readonly siteUrl = inject(SITE_URL);
  private readonly reload = signal(0);

  protected readonly today = todayInMexico();
  protected readonly palette = PALETTE_LABEL;
  protected readonly shortDate = shortDate;
  protected readonly rows = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.agenda.reservations().pipe(catchError(() => of([] as ReservationRow[]))))),
  );

  protected url(r: ReservationRow): string {
    return `${this.siteUrl}/reservation/${r.publicCode}`;
  }

  protected copy(r: ReservationRow): void {
    navigator.clipboard.writeText(this.url(r)).then(
      () => this.toast.success('Enlace copiado.'),
      () => this.toast.error('No se pudo copiar el enlace.'),
    );
  }

  protected toggle(r: ReservationRow, isActive: boolean): void {
    this.agenda.updateReservation(r.id, { isActive }).subscribe(() => {
      this.toast.success(isActive ? 'Enlace activado.' : 'Enlace desactivado: el cliente ya no podrá abrirlo.');
      this.reload.update((n) => n + 1);
    });
  }
}
