import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TicketView } from './ticket-view';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Mini calendario del mes del evento con el día marcado con un corazón.
 * Colores: --cal-accent (corazón y encabezados) y --cal-on (número sobre el corazón).
 * Tamaño: --cal-scale.
 */
@Component({
  selector: 'app-ticket-calendar',
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
            <svg viewBox="0 0 24 24"><path d="M12 20.5S3.5 15 3.5 9.2A4.4 4.4 0 0112 6.6a4.4 4.4 0 018.5 2.6C20.5 15 12 20.5 12 20.5z" /></svg>
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
    .day svg {
      position: absolute;
      inset: 50% auto auto 50%;
      z-index: -1;
      width: calc(6cqw * var(--s));
      height: calc(6cqw * var(--s));
      fill: var(--cal-accent, currentColor);
      translate: -50% -52%;
    }
  `,
})
export class TicketCalendar {
  readonly v = input.required<TicketView>();
  readonly showTitle = input(true);
  protected readonly weekdays = WEEKDAYS;
}
