import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Moño (ref. Sesiones navideñas / "Mini Christmas Sessions"): la foto clara del pino con regalos y los moños
 * dibujados a mano. La información ocupa el centro, en los mismos renglones que el texto de la referencia.
 * Medidas en cqw sobre el lienzo de 1080×1920 (1 cqw = 10.8 px).
 */
@Component({
  selector: 'app-ticket-ribbon',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="bg" src="/tickets/navidad/ribbon.webp" alt="" width="1080" height="1920" />

    <div class="title">
      <p class="script">Sesión navideña</p>
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
    </div>
    <p class="message">{{ v().message || 'Recuerdos de Navidad para guardar en casa' }}</p>

    <div class="status">
      <app-ticket-status [v]="v()" />
    </div>

    <span class="rule" aria-hidden="true"></span>
    <p class="date">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>
    @if (v().place) {
      <p class="place">{{ v().place }}</p>
    }
    @if (v().time) {
      <p class="time">{{ v().time }}</p>
    }

    <img class="logo" src="/brand/logo-ao-horizontal-dark.webp" alt="Armando Ovalle" width="600" height="121" />
  `,
  styles: `
    :host {
      --status-scale: 0.66;
      --status-font: var(--font-serif);

      position: relative;
      display: block;
      height: 100%;
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
    }
    p, h1 { margin: 0; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .title, .message, .status, .rule, .date, .place, .time, .logo { position: absolute; left: 50%; translate: -50% 0; }

    .title { top: 45cqw; width: 76cqw; display: grid; justify-items: center; gap: 1cqw; }
    .script { font-family: var(--font-script); font-size: 8cqw; line-height: 1; color: var(--t-accent); }
    .names { font-family: var(--font-serif); font-weight: 500; line-height: 1.02; overflow-wrap: anywhere; }
    .message {
      top: 64.5cqw;
      display: -webkit-box;
      width: 66cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.4cqw;
      font-style: italic;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .status { top: 73.4cqw; }
    .rule { top: 89.5cqw; width: 44cqw; height: 0.25cqw; background: var(--t-accent); opacity: 0.7; }
    .date { top: 93.4cqw; width: 80cqw; font-size: 3.2cqw; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--t-accent); }
    .place { top: 98.8cqw; width: 80cqw; font-size: 2.4cqw; letter-spacing: 0.04em; text-transform: uppercase; }
    .time { top: 118.4cqw; width: 70cqw; font-size: 2.6cqw; letter-spacing: 0.06em; text-transform: uppercase; }
    .logo { top: 131.5cqw; width: 27cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketRibbon {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 8.4, 5, 14));
}
