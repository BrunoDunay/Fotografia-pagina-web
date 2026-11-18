import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Esfera (ref. Sesiones navideñas / esfera de cristal): la foto de la esfera con nieve colgando del pino.
 * Los nombres van dentro de la esfera (hasta dos renglones), donde la referencia tenía su marca; fecha y cuenta regresiva debajo.
 * Medidas en cqw sobre el lienzo de 1080×1920 (1 cqw = 10.8 px).
 */
@Component({
  selector: 'app-ticket-ornament',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="bg" src="/tickets/navidad/ornament.webp" alt="" width="1080" height="1920" />

    <div class="inside">
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
    </div>

    <div class="info">
      <p class="date">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-ao-horizontal-light.webp" alt="Armando Ovalle" width="600" height="121" />
    </div>
  `,
  styles: `
    :host {
      --status-scale: 0.8;
      --status-font: var(--font-serif);

      position: relative;
      display: block;
      height: 100%;
      color: var(--t-paper);
      text-align: center;
      overflow: hidden;
    }
    p, h1 { margin: 0; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

    /* Dentro de la esfera, arriba del sillón. */
    .inside {
      position: absolute;
      top: 60cqw;
      left: 50%;
      width: 56cqw;
      height: 36cqw;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.4cqw;
      translate: -50% 0;
      text-shadow: 0 0.3cqw 1.2cqw rgb(0 0 0 / 0.7), 0 0 0.4cqw rgb(0 0 0 / 0.5);
    }
    .names { font-family: var(--font-script); font-weight: 400; line-height: 1.05; overflow-wrap: break-word; }

    .info {
      position: absolute;
      left: 6cqw;
      right: 6cqw;
      bottom: 6cqw;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.8cqw;
      text-shadow: 0 0.2cqw 1cqw rgb(0 0 0 / 0.5);
    }
    .date { font-size: 3.5cqw; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
    .where { font-size: 2.8cqw; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.9; }
    .info app-ticket-status { margin-top: 1.4cqw; }
    .logo { width: 30cqw; height: auto; margin-top: 2.4cqw; opacity: 0.95; }
  `,
})
export class TicketOrnament {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 12.5, 8, 12));
}
