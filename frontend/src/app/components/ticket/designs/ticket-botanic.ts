import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Botánico (refs. Sesiones normales/sombra plantas en pared y Elegante plantas): pared con luz de ventana y sombra de hojas. */
@Component({
  selector: 'app-ticket-botanic',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Sombra de una rama sobre la pared -->
    <svg class="shadow" viewBox="0 0 100 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g>
        <path style="fill: none; stroke: var(--t-dark); stroke-width: 1.4; stroke-linecap: round" d="M96 6C70 40 44 86 22 176" />
        <path d="M88 18c-12-6-22-4-30 6 12 4 22 2 30-6zM80 30c2-13 10-20 22-22-2 13-10 20-22 22zM74 42c-13-4-23 0-30 12 13 2 23-2 30-12zM68 54c4-13 13-18 25-18-4 12-13 18-25 18zM60 70c-13-3-23 3-28 15 13 1 23-4 28-15zM54 84c5-12 15-16 27-14-6 11-15 16-27 14zM46 102c-13-2-22 5-26 17 13 0 22-6 26-17zM40 118c6-11 16-14 28-11-7 10-16 14-28 11zM33 136c-12-1-20 6-23 17 12-1 20-7 23-17zM28 152c6-10 15-13 26-10-6 9-15 13-26 10z" />
      </g>
    </svg>

    <p class="eyebrow">{{ v().service ?? 'Fecha reservada' }}</p>

    <h1 class="names" [style.font-size]="nameSize()">
      @for (name of v().names; track $index) {
        @if (!$first) {
          <i>&amp;</i>
        }
        <span>{{ name }}</span>
      }
    </h1>

    <span class="rule" aria-hidden="true"></span>

    <div class="date">
      <p class="date__day">{{ v().date.day }}</p>
      <p class="date__rest">{{ v().date.weekday }} · {{ v().date.month }} {{ v().date.year }}</p>
    </div>

    @if (v().time || v().place) {
      <p class="detail">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
    }
    @if (v().package; as pkg) {
      <p class="detail">Paquete {{ pkg }}</p>
    }
    @if (v().message; as message) {
      <p class="message">{{ message }}</p>
    }

    <div class="band">
      <app-ticket-status [v]="v()" />
    </div>
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --status-scale: 0.78;

      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 16cqw 9cqw 7cqw;
      /* Luz de ventana: franjas claras en diagonal sobre la pared. */
      background:
        linear-gradient(104deg, transparent 22%, rgb(255 255 255 / 0.5) 22% 40%, transparent 40% 44%, rgb(255 255 255 / 0.5) 44% 62%, transparent 62%),
        linear-gradient(160deg, color-mix(in srgb, var(--t-paper) 80%, white), var(--t-paper) 55%, color-mix(in srgb, var(--t-paper) 82%, var(--t-dark)));
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    .shadow { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; fill: var(--t-dark); opacity: 0.3; filter: blur(0.9cqw); }
    .eyebrow { font-size: 2.3cqw; letter-spacing: 0.46em; text-transform: uppercase; }
    .names { display: grid; justify-items: center; font-family: var(--font-script); font-weight: 400; line-height: 1.1; overflow-wrap: anywhere; }
    .names i { font-family: var(--font-serif); font-size: 0.4em; font-style: italic; line-height: 1.4; }
    .rule { width: 0.25cqw; height: 9cqw; background: currentColor; opacity: 0.6; }
    .date { display: grid; gap: 3cqw; }
    .date__day { font-family: var(--font-serif); font-size: 18cqw; line-height: 1; }
    .date__rest { font-size: 2.6cqw; letter-spacing: 0.3em; text-transform: uppercase; }
    .detail { font-size: 2.3cqw; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; }
    .message {
      display: -webkit-box;
      max-width: 64cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.3cqw;
      font-style: italic;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .band { width: calc(100% + 18cqw); padding: 4.5cqw 0; background: color-mix(in srgb, var(--t-main) 82%, var(--t-dark)); color: #fbf8f4; }
    .logo { width: 25cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketBotanic {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 12, 6, 10));
}
