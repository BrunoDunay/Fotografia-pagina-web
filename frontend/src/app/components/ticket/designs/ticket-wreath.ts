import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Corona (ref. Sesiones navideñas / "A Christmas Village"): la foto de la puerta con corona y farol a la
 * izquierda y el panel crema a la derecha, con su franja vino, la flor de lis y el pino dorado.
 * La información toma el lugar del texto de la referencia; la cuenta regresiva va abajo, a todo lo ancho.
 * Medidas en cqw sobre el lienzo de 1080×1920 (1 cqw = 10.8 px).
 */
@Component({
  selector: 'app-ticket-wreath',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="bg" src="/tickets/navidad/wreath.webp" alt="" width="1080" height="1920" />

    <img class="logo" src="/brand/logo-ao-horizontal-dark.webp" alt="Armando Ovalle" width="600" height="121" />
    <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
    <p class="season">Sesión navideña {{ v().date.year }}</p>

    <!-- Dentro de la franja vino de la imagen -->
    <p class="band">{{ v().date.weekday }}</p>
    <p class="day">{{ v().date.day }} <small>{{ v().date.month }}</small></p>
    <span class="rule" aria-hidden="true"></span>
    @if (v().time) {
      <p class="time">{{ v().time }}</p>
    }
    @if (v().place) {
      <p class="place">{{ v().place }}</p>
    }
    <p class="message">{{ v().message || 'La magia de siempre, en un recuerdo para siempre' }}</p>

    <div class="status">
      <app-ticket-status [v]="v()" />
    </div>
  `,
  styles: `
    :host {
      --status-scale: 0.82;
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
    /* Columna del panel crema: centro en 70 cqw, ancho ~50 cqw. */
    .logo, .names, .season, .band, .day, .rule, .time, .place, .message { position: absolute; left: 70cqw; translate: -50% 0; }

    .logo { top: 6.4cqw; width: 22cqw; height: auto; opacity: 0.8; }
    .names {
      top: 47cqw;
      width: 50cqw;
      font-family: var(--font-serif);
      font-weight: 500;
      line-height: 1.05;
      text-transform: uppercase;
      overflow-wrap: break-word;
      /* Crece hacia arriba desde "Sesión navideña", sin tocar el logo. */
      translate: -50% -100%;
    }
    .season { top: 50cqw; width: 52cqw; font-size: 1.9cqw; letter-spacing: 0.3em; text-transform: uppercase; }
    .band { top: 67cqw; width: 50cqw; font-family: var(--font-serif); font-size: 6cqw; line-height: 1; letter-spacing: 0.06em; text-transform: uppercase; color: var(--t-paper); translate: -50% -50%; }
    .day { top: 79cqw; width: 50cqw; font-family: var(--font-serif); font-size: 12cqw; line-height: 1; }
    .day small { font-size: 0.42em; letter-spacing: 0.06em; text-transform: uppercase; }
    .rule { top: 93.6cqw; width: 46cqw; height: 0.12cqw; background: color-mix(in srgb, #b08a4a 70%, transparent); }
    .time { top: 96.6cqw; width: 50cqw; font-size: 1.9cqw; letter-spacing: 0.26em; text-transform: uppercase; }
    .place { top: 100.4cqw; width: 50cqw; font-family: var(--font-serif); font-size: 3.2cqw; line-height: 1.15; }
    .message {
      top: 111.4cqw;
      display: -webkit-box;
      width: 46cqw;
      overflow: hidden;
      font-size: 1.9cqw;
      letter-spacing: 0.24em;
      line-height: 1.6;
      text-transform: uppercase;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .status { position: absolute; left: 0; right: 0; bottom: 12cqw; display: grid; justify-items: center; }
  `,
})
export class TicketWreath {
  readonly v = input.required<TicketView>();
  /** Como "A Christmas Village": letras grandes, una palabra por renglón cuando caben. */
  protected readonly nameSize = computed(() => {
    const words = this.v().title.split(/\s+/);
    const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
    return fitSize(longest, 9.6, 4.6, 7);
  });
}
