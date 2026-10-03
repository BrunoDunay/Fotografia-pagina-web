import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TicketView } from './ticket-view';

/**
 * Estado del evento, compartido por todos los diseños:
 * "Faltan" + cuenta regresiva · "¡Hoy es el gran día!" · "Evento realizado".
 * Hereda el color del diseño; el tamaño se ajusta con --status-scale.
 */
@Component({
  selector: 'app-ticket-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.divided]': 'divided()' },
  template: `
    @switch (v().stage) {
      @case ('upcoming') {
        <p class="label">Faltan</p>
        <div class="countdown" role="timer" [attr.aria-label]="'Faltan ' + v().countdown.days + ' días'">
          <span class="unit"><strong>{{ v().countdown.days }}</strong><small>días</small></span>
          <span class="sep">:</span>
          <span class="unit"><strong>{{ pad(v().countdown.hours) }}</strong><small>horas</small></span>
          <span class="sep">:</span>
          <span class="unit"><strong>{{ pad(v().countdown.minutes) }}</strong><small>min</small></span>
          <span class="sep">:</span>
          <span class="unit"><strong>{{ pad(v().countdown.seconds) }}</strong><small>seg</small></span>
        </div>
      }
      @case ('today') {
        <p class="script">¡Hoy es el gran día!</p>
      }
      @case ('past') {
        <p class="label">Evento realizado</p>
        <p class="script script--sm">Gracias por dejarme ser parte</p>
      }
    }
  `,
  styles: `
    :host {
      --s: var(--status-scale, 1);

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(1.6cqw * var(--s));
      text-align: center;
    }
    p { margin: 0; }
    .label {
      font-family: var(--font-sans);
      font-size: calc(2.6cqw * var(--s));
      font-weight: 500;
      letter-spacing: 0.4em;
      text-transform: uppercase;
    }
    .countdown { display: flex; align-items: flex-start; justify-content: center; gap: calc(1.6cqw * var(--s)); }
    .unit { display: grid; justify-items: center; min-width: calc(11cqw * var(--s)); }
    .unit strong {
      font-family: var(--status-font, var(--font-sans));
      font-size: calc(8.6cqw * var(--s));
      font-weight: 300;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .unit small {
      margin-top: calc(0.8cqw * var(--s));
      font-family: var(--font-sans);
      font-size: calc(1.9cqw * var(--s));
      letter-spacing: 0.18em;
      text-transform: uppercase;
      opacity: 0.85;
    }
    .sep { font-size: calc(7cqw * var(--s)); font-weight: 200; line-height: 1; opacity: 0.7; }
    :host(.divided) .countdown { align-items: stretch; gap: 0; }
    :host(.divided) .unit { padding: 0 calc(3.2cqw * var(--s)); }
    :host(.divided) .sep { width: calc(0.2cqw * var(--s)); background: currentColor; font-size: 0; opacity: 0.35; }
    .script { font-family: var(--font-script); font-size: calc(8.5cqw * var(--s)); line-height: 1.1; }
    .script--sm { font-size: calc(6.2cqw * var(--s)); }
  `,
})
export class TicketStatus {
  readonly v = input.required<TicketView>();
  /** Separa las unidades con líneas verticales en lugar de dos puntos (diseños con barra). */
  readonly divided = input(false);
  protected readonly pad = (n: number) => String(n).padStart(2, '0');
}
