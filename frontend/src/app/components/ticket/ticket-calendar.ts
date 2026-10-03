import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TicketMark } from './ticket-mark';
import { TicketView } from './ticket-view';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Mini calendario del mes del evento con el día marcado.
 * - Eventos románticos: un corazón detrás del número.
 * - XV años, graduaciones, baby shower y demás: un círculo con el ícono del evento (corona, birrete, biberón, estrella).
 * Colores: --cal-accent (marca y encabezados) y --cal-on (número sobre la marca). Tamaño: --cal-scale.
 */
@Component({
  selector: 'app-ticket-calendar',
  imports: [TicketMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @if (showTitle()) {
      <p class="title">{{ v().date.month }} {{ v().date.year }}</p>
    }
    <div class="grid">
      @for (w of weekdays; track $index) {
        <span class="wd">{{ w }}</span>
      }
      @for (cell of v().calendar.cells; track $index) {
        <span class="day" [class.is-event]="cell === v().calendar.day">
          @if (cell === v().calendar.day) {
            @if (v().mark === 'heart') {
              <app-ticket-mark class="heart" kind="heart" />
            } @else {
              <span class="dot"></span>
              <app-ticket-mark class="badge" [kind]="v().mark" />
            }
          }
          {{ cell ?? '' }}
        </span>
      }
    </div>
  `,
  styles: `
    :host {
      --s: var(--cal-scale, 1);

      display: block;
      width: calc(52cqw * var(--s));
      font-family: var(--font-sans);
      text-align: center;
    }
    .title {
      margin: 0 0 calc(1.6cqw * var(--s));
      font-size: calc(2.3cqw * var(--s));
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--cal-accent, currentColor);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      row-gap: calc(0.3cqw * var(--s));
      font-size: calc(2.3cqw * var(--s));
      line-height: calc(3.3cqw * var(--s));
    }
    .wd { font-size: calc(1.9cqw * var(--s)); font-weight: 500; color: var(--cal-accent, currentColor); }
    .day { position: relative; font-weight: 300; }
    .day.is-event { isolation: isolate; color: var(--cal-on, #fff); font-weight: 500; }
    .heart,
    .dot {
      position: absolute;
      inset: 50% auto auto 50%;
      z-index: -1;
      color: var(--cal-accent, currentColor);
    }
    .heart { width: calc(6cqw * var(--s)); height: calc(6cqw * var(--s)); translate: -50% -52%; }
    .dot { width: calc(4.4cqw * var(--s)); height: calc(4.4cqw * var(--s)); border-radius: 50%; background: var(--cal-accent, currentColor); translate: -50% -50%; }
    /* El ícono va como insignia, arriba a la derecha del día, en el hueco entre números. */
    .badge {
      position: absolute;
      inset: 50% auto auto 50%;
      width: calc(2.9cqw * var(--s));
      height: calc(2.9cqw * var(--s));
      color: var(--cal-accent, currentColor);
      translate: 45% -128%;
      rotate: 12deg;
    }
  `,
})
export class TicketCalendar {
  readonly v = input.required<TicketView>();
  readonly showTitle = input(true);
  protected readonly weekdays = WEEKDAYS;
}
