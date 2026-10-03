import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Playa (refs. Bodas en la playa/Playa al atardecer, Playa de día, Diseño palmeras): cielo, sol, mar y palmeras. */
@Component({
  selector: 'app-ticket-beach',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sky">
      <span class="sun" aria-hidden="true"></span>
      <p class="eyebrow">{{ v().service ?? 'Fecha reservada' }}</p>
      <div class="mono" aria-hidden="true">
        @for (letter of v().monogram.slice(0, 2); track $index) {
          @if (!$first) {
            <i>&amp;</i>
          }
          <span>{{ letter }}</span>
        }
      </div>
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
      <div class="date">
        <span class="side">{{ v().date.weekday }}</span>
        <span class="day">{{ v().date.day }}</span>
        <span class="side">{{ v().date.month }} {{ v().date.year }}</span>
      </div>
      @if (v().place; as place) {
        <p class="place">{{ place }}</p>
      }
      @if (v().time; as time) {
        <p class="time">{{ time }}</p>
      }
    </div>

    <!-- Mar con olas -->
    <svg class="sea" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
      <path style="fill: color-mix(in srgb, var(--t-dark) 55%, #2f6f86)" d="M0 6c8-4 16 3 25 0s17-4 25 0 17 3 25 0 17-3 25 0v20H0z" />
      <path style="fill: color-mix(in srgb, var(--t-dark) 30%, #3f8fa3)" d="M0 12c9-3 16 3 25 0s16-4 25 0 16 3 25 0 17-3 25 0v14H0z" />
      <path style="fill: var(--t-paper)" d="M0 19c9-3 17 3 25 0s17-3 25 0 16 3 25 0 17-3 25 0v7H0z" />
    </svg>

    <div class="sand">
      <!-- Palmeras -->
      <svg class="palm palm--start" viewBox="0 0 60 100" aria-hidden="true">
        <path d="M30 100C29 76 30 56 34 38" fill="none" stroke-width="2.6" stroke-linecap="round" />
        <path d="M34 38C26 30 14 30 4 36c10-12 22-12 30-2zM34 38c-2-12-10-20-22-24 14-2 22 8 24 22zM34 38c4-12 14-18 24-18-10-8-22-2-26 16zM34 38c10-6 20-4 26 4-6-12-18-14-28-6zM34 38c8 2 14 10 16 20 2-12-4-20-14-22z" stroke="none" />
      </svg>
      <svg class="palm palm--end" viewBox="0 0 60 100" aria-hidden="true">
        <path d="M30 100C29 76 30 56 34 38" fill="none" stroke-width="2.6" stroke-linecap="round" />
        <path d="M34 38C26 30 14 30 4 36c10-12 22-12 30-2zM34 38c-2-12-10-20-22-24 14-2 22 8 24 22zM34 38c4-12 14-18 24-18-10-8-22-2-26 16zM34 38c10-6 20-4 26 4-6-12-18-14-28-6zM34 38c8 2 14 10 16 20 2-12-4-20-14-22z" stroke="none" />
      </svg>

      <app-ticket-status [v]="v()" />
      <img class="logo" [src]="v().darkPaper ? '/brand/logo-light.webp' : '/brand/logo-dark.webp'" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </div>
  `,
  styles: `
    :host {
      --status-scale: 0.86;
      /* Sobre arena clara el texto se oscurece un poco; sobre arena oscura (anochecer) se queda claro. */
      --sand-ink: var(--t-ink);

      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .sky {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2.4cqw;
      min-height: 0;
      padding: 8cqw 8cqw 15cqw;
      overflow: hidden;
      background: linear-gradient(180deg, var(--t-main), color-mix(in srgb, var(--t-main) 45%, var(--t-dark)) 62%, var(--t-dark));
      isolation: isolate;
    }
    .sun {
      position: absolute;
      bottom: -15cqw;
      left: 50%;
      z-index: -1;
      width: 30cqw;
      height: 30cqw;
      border-radius: 50%;
      background: var(--t-accent);
      box-shadow: 0 0 9cqw 5cqw color-mix(in srgb, var(--t-accent) 55%, transparent);
      translate: -50% 0;
    }
    .eyebrow { font-size: 2.2cqw; letter-spacing: 0.44em; text-transform: uppercase; }
    .mono { display: flex; align-items: center; gap: 2cqw; font-family: var(--font-script); font-size: 27cqw; line-height: 1; }
    .mono i { font-size: 0.42em; font-style: normal; }
    .names { font-family: var(--font-sans); font-weight: 300; letter-spacing: 0.3em; line-height: 1.3; text-transform: uppercase; overflow-wrap: anywhere; }
    .date { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 3.4cqw; width: 100%; }
    .side { padding: 1cqw 0; border-block: 0.2cqw solid color-mix(in srgb, currentColor 55%, transparent); font-size: 2.2cqw; letter-spacing: 0.26em; text-transform: uppercase; }
    .day { font-family: var(--font-serif); font-size: 12cqw; line-height: 0.9; }
    .place { font-family: var(--font-script); font-size: 5.6cqw; line-height: 1.1; }
    .time { font-size: 2.3cqw; letter-spacing: 0.24em; text-transform: uppercase; }
    .sea { flex: none; display: block; width: 100%; height: 20cqw; margin-top: -0.2cqw; background: var(--t-dark); }
    /* Los colores de las figuras SVG van en línea (style="…"): al guardar el ticket como imagen no se copian los que llegan por clases. */
    .sand {
      position: relative;
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3cqw;
      height: 50cqw;
      padding: 0 16cqw 3cqw;
      background: var(--t-paper);
      color: var(--sand-ink);
    }
    .palm { position: absolute; bottom: 0; width: 26cqw; height: 44cqw; fill: var(--sand-ink); stroke: var(--sand-ink); opacity: 0.28; }
    .palm--start { left: -5cqw; }
    .palm--end { right: -5cqw; scale: -1 1; }
    .logo { width: 26cqw; height: auto; opacity: 0.85; }
  `,
})
export class TicketBeach {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 3.6, 2.4, 18));
}
