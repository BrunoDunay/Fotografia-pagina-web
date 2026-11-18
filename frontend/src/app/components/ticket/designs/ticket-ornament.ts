import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Esfera (ref. Sesiones navideñas / esfera de cristal): la foto de la esfera con nieve colgando del pino.
 * Los nombres van dentro de la esfera, donde la referencia tenía su marca; fecha y cuenta regresiva debajo.
 * Medidas en cqw sobre el lienzo de 1080×1920 (1 cqw = 10.8 px).
 */
@Component({
  selector: 'app-ticket-ornament',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="bg" src="/tickets/navidad/ornament.webp" alt="" width="1080" height="1920" />

    <div class="inside">
      <p class="eyebrow">Sesión navideña</p>
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
      <p class="short">{{ v().shortDate }}</p>
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
      --status-scale: 0.66;
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
      top: 66cqw;
      left: 50%;
      width: 60cqw;
      height: 29cqw;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.4cqw;
      translate: -50% 0;
      text-shadow: 0 0.3cqw 1.4cqw rgb(0 0 0 / 0.55);
    }
    .eyebrow { font-size: 1.9cqw; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.9; }
    .names { font-family: var(--font-script); font-weight: 400; line-height: 1.1; overflow-wrap: anywhere; }
    .short { font-family: var(--font-serif); font-size: 3cqw; letter-spacing: 0.3em; }

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
    .date { font-size: 2.6cqw; letter-spacing: 0.26em; text-transform: uppercase; }
    .where { font-size: 2.1cqw; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.85; }
    .info app-ticket-status { margin-top: 1.4cqw; }
    .logo { width: 26cqw; height: auto; margin-top: 2.4cqw; opacity: 0.9; }
  `,
})
export class TicketOrnament {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 9.4, 5, 14));
}
