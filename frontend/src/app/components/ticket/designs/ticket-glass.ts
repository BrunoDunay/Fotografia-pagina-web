import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Brindis (ref. Graduaciones/Minimalista fino): tarjeta oscura con una copa dibujada a línea,
 * el año dentro de la copa y una pestaña clara abajo con la cuenta regresiva.
 */
@Component({
  selector: 'app-ticket-glass',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />

    <!-- Copa: líquido de color y contorno a línea blanca -->
    <svg class="glass" viewBox="0 0 60 100" aria-hidden="true">
      <!-- líquido: tono base, fondo más profundo, luces y burbujas -->
      <path d="M16.200 16C15 34 19 50 30 58 41 50 45 34 43.800 16 39 13.500 21 13.500 16.200 16z" style="fill: var(--t-accent)" />
      <path d="M17.600 36C19.500 46 23.500 53.500 30 58 36.500 53.500 40.500 46 42.400 36 38 40 22 40 17.600 36z" style="fill: var(--t-main)" opacity="0.2" />
      <path d="M21.500 48.500C24 53 26.500 55.800 30 58 33.500 55.800 36 53 38.500 48.500 35 51 25 51 21.500 48.500z" style="fill: var(--t-main)" opacity="0.2" />
      <path d="M18.300 19C17.800 30 19.500 41 24.500 49.500 21.800 41 20.600 30 21 19.600z" fill="#fff" opacity="0.5" />
      <path d="M22.600 20.200C22.400 28 23.200 35 25.200 41.500 24.400 35 24 28 24.200 20.500z" fill="#fff" opacity="0.28" />
      <path d="M41.600 19.500C41.800 28 40.600 36 37.800 43 39.600 36 40.200 28 40 20z" fill="#fff" opacity="0.22" />
      <ellipse cx="30" cy="15.800" rx="13.800" ry="2.600" style="fill: color-mix(in srgb, var(--t-accent) 62%, white)" />
      <ellipse cx="27" cy="15.300" rx="7" ry="1.100" fill="#fff" opacity="0.45" />
      <g fill="#fff">
        <circle cx="29" cy="50" r="0.450" opacity="0.7" /><circle cx="31.500" cy="45" r="0.350" opacity="0.6" /><circle cx="28.200" cy="41" r="0.500" opacity="0.55" />
        <circle cx="32.400" cy="37.500" r="0.300" opacity="0.6" /><circle cx="27.600" cy="30" r="0.350" opacity="0.5" /><circle cx="33" cy="28" r="0.450" opacity="0.5" />
        <circle cx="30.200" cy="24.500" r="0.300" opacity="0.6" /><circle cx="35.200" cy="33" r="0.280" opacity="0.5" /><circle cx="26" cy="22" r="0.280" opacity="0.6" />
      </g>
      <!-- contorno del cáliz, tallo y base -->
      <g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="0.55">
        <path d="M17 6C13 30 17 50 30 59 43 50 47 30 43 6" />
        <ellipse cx="30" cy="6" rx="13" ry="2.400" />
        <path d="M29 59.500C29 70 28.500 82 28 90M31 59.500C31 70 31.500 82 32 90" />
        <ellipse cx="30" cy="92" rx="13" ry="2.800" />
        <path d="M17.500 92c2 2.200 23 2.200 25 0" stroke-width="0.4" />
        <!-- trazos de grabado -->
        <g stroke-width="0.3" opacity="0.8">
          <path d="M40.500 12C42 28 40 42 34 52M38.500 13C40 27 38 40 33.500 49M19.500 13C18 26 19.500 38 23.500 46" />
          <path d="M30.800 62v22M29.200 64v18" />
        </g>
      </g>
      <text x="30" y="36" text-anchor="middle" font-size="6.400" font-weight="600" letter-spacing="0.6" style="fill: var(--t-ink); font-family: var(--font-serif)">{{ v().date.year }}</text>
    </svg>

    <div class="info">
      <p class="eyebrow">Save the date</p>
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
      <p class="date">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
    </div>

    <!-- Pestaña clara, como la tarjeta que se desliza en la referencia -->
    <footer class="tab">
      <app-ticket-status [v]="v()" />
    </footer>
  `,
  styles: `
    :host {
      --status-scale: 0.76;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      padding-top: 9cqw;
      /* Sombras diagonales suaves, como luz que entra entre hojas. */
      background:
        linear-gradient(118deg, transparent 30%, rgb(0 0 0 / 0.16) 38% 46%, transparent 54%),
        linear-gradient(104deg, transparent 58%, rgb(0 0 0 / 0.12) 66% 72%, transparent 80%),
        linear-gradient(180deg, color-mix(in srgb, var(--t-main) 88%, white), var(--t-main) 40%, var(--t-dark));
      color: #fff;
      text-align: center;
    }
    p, h1 { margin: 0; }
    .logo { width: 30cqw; height: auto; opacity: 0.95; }
    .glass { flex: none; width: 44cqw; height: 74cqw; margin-top: 5cqw; filter: drop-shadow(0 1.4cqw 2cqw rgb(0 0 0 / 0.3)); }
    .info { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2cqw; min-height: 0; padding: 0 9cqw; }
    .eyebrow { font-size: 2.2cqw; letter-spacing: 0.44em; text-transform: uppercase; color: color-mix(in srgb, var(--t-accent) 80%, white); }
    .names { font-family: var(--font-serif); font-weight: 500; letter-spacing: 0.1em; line-height: 1.15; text-transform: uppercase; overflow-wrap: anywhere; }
    .date { font-size: 2.6cqw; letter-spacing: 0.26em; text-transform: uppercase; }
    .where { font-size: 2.1cqw; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8; }
    .tab {
      position: relative;
      flex: none;
      display: grid;
      justify-items: center;
      gap: 2cqw;
      width: 76cqw;
      padding: 5cqw 4cqw 6cqw;
      border-radius: 2.4cqw 2.4cqw 0 0;
      background: linear-gradient(180deg, color-mix(in srgb, var(--t-paper) 82%, white), var(--t-paper));
      color: var(--t-ink);
      box-shadow: 0 -1cqw 3cqw rgb(0 0 0 / 0.25);
      isolation: isolate;
    }
    /* Lengüeta semicircular en el borde superior. */
    .tab::before { content: ''; position: absolute; top: -5cqw; left: 50%; width: 16cqw; height: 10cqw; border-radius: 50%; background: color-mix(in srgb, var(--t-paper) 82%, white); translate: -50% 0; z-index: -1; }
  `,
})
export class TicketGlass {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 6, 3.6, 16));
}
