import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Pino (ref. Sesiones navideñas / "A Slim Tree"): la foto de la sala con el pino y su sombra en la pared.
 * La información va a la derecha, donde la referencia tenía su texto (limpiado de la imagen).
 * La almohada del sillón lleva el monograma AO bordado (ya viene en la imagen).
 * Medidas en cqw sobre el lienzo de 1080×1920 (1 cqw = 10.8 px).
 */
@Component({
  selector: 'app-ticket-pine',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="bg" src="/tickets/navidad/pine.webp" alt="" width="1080" height="1920" />

    <div class="copy">
      <p class="eyebrow">Sesión navideña</p>
      <h1 class="names" [style.font-size]="nameSize()">
        @for (name of v().names; track $index) {
          @if (!$first) {
            <i>&amp;</i>
          }
          <span>{{ name }}</span>
        }
      </h1>
      <span class="rule" aria-hidden="true"></span>
      <p class="date">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>
      @if (v().time) {
        <p class="detail">{{ v().time }}</p>
      }
      @if (v().place) {
        <p class="detail">{{ v().place }}</p>
      }
      <app-ticket-status class="status" [v]="v()" />
    </div>

    <footer class="foot">
      @if (v().message; as message) {
        <p class="message">{{ message }}</p>
      }
      <img class="logo" src="/brand/logo-ao-horizontal-dark.webp" alt="Armando Ovalle" width="600" height="121" />
    </footer>
  `,
  styles: `
    :host {
      --status-scale: 0.66;
      --status-weight: 500;
      --status-font: var(--font-serif);

      position: relative;
      display: block;
      height: 100%;
      color: var(--t-ink);
      overflow: hidden;
    }
    p, h1 { margin: 0; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

    .copy { position: absolute; top: 20cqw; left: 54cqw; right: 3cqw; display: flex; flex-direction: column; align-items: flex-start; }
    .eyebrow { font-size: 2.7cqw; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--t-accent); }
    .names { display: grid; margin-top: 3.4cqw; font-family: var(--font-serif); font-weight: 600; line-height: 1.02; overflow-wrap: anywhere; }
    .names i { font-size: 0.8em; font-weight: 400; line-height: 1.1; }
    .rule { width: 19cqw; height: 0.35cqw; margin: 4cqw 0 3.4cqw; background: var(--t-accent); }
    /* Cabe en un renglón con holgura: si queda justo, la pantalla y la imagen descargada lo cortan distinto. */
    .date { font-size: 2.7cqw; font-weight: 600; letter-spacing: 0.05em; line-height: 1.35; text-transform: uppercase; color: var(--t-accent); }
    .detail { font-size: 2.5cqw; font-weight: 500; letter-spacing: 0.06em; line-height: 1.5; text-transform: uppercase; }

    .status { margin-top: 4.4cqw; align-items: flex-start; color: var(--t-ink); }

    .foot { position: absolute; left: 8cqw; right: 8cqw; bottom: 7cqw; display: grid; justify-items: center; gap: 3.6cqw; text-align: center; }
    .message {
      display: -webkit-box;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 4.2cqw;
      font-style: italic;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    /* El logo trae el monograma champán: sobre la alfombra clara se pinta oscuro para que se lea. */
    .logo { width: 38cqw; height: auto; filter: brightness(0); opacity: 0.78; }
  `,
})
export class TicketPine {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 10, 6, 8));
}
