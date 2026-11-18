import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Pino (ref. Sesiones navideñas / "A Slim Tree"): la foto de la sala con el pino y su sombra en la pared.
 * La información va a la derecha, donde la referencia tenía su texto (limpiado de la imagen).
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
      --status-scale: 0.6;
      --status-font: var(--font-serif);

      position: relative;
      display: block;
      height: 100%;
      color: var(--t-ink);
      overflow: hidden;
    }
    p, h1 { margin: 0; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

    .copy { position: absolute; top: 22.4cqw; left: 55cqw; right: 4cqw; display: flex; flex-direction: column; align-items: flex-start; }
    .eyebrow { font-size: 1.9cqw; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--t-accent); }
    .names { display: grid; margin-top: 4cqw; font-family: var(--font-serif); font-weight: 600; line-height: 1.02; overflow-wrap: anywhere; }
    .names i { font-size: 0.8em; font-weight: 400; line-height: 1.1; }
    .rule { width: 17.5cqw; height: 0.28cqw; margin: 4.5cqw 0 3.6cqw; background: var(--t-accent); }
    .date { font-size: 1.9cqw; font-weight: 600; letter-spacing: 0.16em; line-height: 1.5; text-transform: uppercase; color: var(--t-accent); }
    .detail { font-size: 1.8cqw; letter-spacing: 0.12em; line-height: 1.6; text-transform: uppercase; }

    .status { margin-top: 5cqw; align-items: flex-start; }

    .foot { position: absolute; left: 8cqw; right: 8cqw; bottom: 7cqw; display: grid; justify-items: center; gap: 3.6cqw; text-align: center; }
    .message {
      display: -webkit-box;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.6cqw;
      font-style: italic;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .logo { width: 26cqw; height: auto; opacity: 0.85; }
  `,
})
export class TicketPine {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 8, 4.6, 9));
}
