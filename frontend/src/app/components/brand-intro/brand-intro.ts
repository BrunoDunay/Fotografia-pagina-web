import { ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AO_FLIP, AO_MONOGRAM, AO_SEEDS, AO_VIEWBOX_FULL, AO_WORDMARK } from '../../core/brand/ao-logo';

/** Lo que dura la entrada completa (debe coincidir con la última animación de abajo). */
const INTRO_MS = 2500;
const SEEN_KEY = 'ao-intro';

/**
 * Entrada del sitio (basada en la referencia "animación para logo de entrada", pero mucho más ágil):
 * 1. Pantalla color espresso de la marca y dos puntos dorados donde nace el trazo.
 * 2. Los contornos de la O y la A se dibujan en dorado fino, luego se rellenan con el degradado del logo.
 * 3. Sube el nombre ARMANDO OVALLE letra por letra.
 * 4. El logo se desvanece y la cortina sube para descubrir la página.
 *
 * Todo es CSS sobre el HTML que ya manda el servidor, así que arranca con el primer pintado (sin esperar a
 * Angular) y, si el JS fallara, la cortina se retira sola igual. Se ve una vez por visita: un script en
 * index.html marca la página antes de pintarse si ya se vio, y entonces no aparece ni un instante.
 */
@Component({
  selector: 'app-brand-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!done()) {
      <div class="intro" aria-hidden="true">
        <svg class="mark" [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ao-intro-gold" gradientUnits="userSpaceOnUse" x1="780" y1="540" x2="1250" y2="1140">
              <stop offset="0" stop-color="#e3cf9f" />
              <stop offset="0.45" stop-color="#bf9d5f" />
              <stop offset="0.7" stop-color="#a8854a" />
              <stop offset="1" stop-color="#d6bd85" />
            </linearGradient>
          </defs>
          @for (s of seeds; track $index) {
            <circle class="seed" [attr.cx]="s.x" [attr.cy]="s.y" r="7" [style.--d]="$index * 70 + 'ms'" />
          }
          <g [attr.transform]="flip">
            <path class="part" [attr.d]="m.o" pathLength="1" style="--draw: 120ms; --fill: 760ms" />
            <path class="part" [attr.d]="m.a" pathLength="1" style="--draw: 200ms; --fill: 820ms" />
            <path class="part part--foot" [attr.d]="m.footLeft" pathLength="1" style="--draw: 520ms; --fill: 860ms" />
            <path class="part part--foot" [attr.d]="m.footRight" pathLength="1" style="--draw: 560ms; --fill: 880ms" />
          </g>
          <g class="word">
            @for (l of word; track $index) {
              <g class="letter" [style.--i]="$index"><path [attr.transform]="l.transform" [attr.d]="l.d" /></g>
            }
          </g>
        </svg>
      </div>
    }
  `,
  styles: `
    .intro {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      background: #2a2421;
      animation: curtain-up 560ms cubic-bezier(0.76, 0, 0.24, 1) 1940ms forwards;
    }
    .mark { width: min(68vw, 460px); height: auto; overflow: visible; animation: mark-out 380ms ease-in 1760ms forwards; }

    .seed { fill: #d6bd85; transform-box: fill-box; transform-origin: center; scale: 0; animation: seed 520ms ease-out var(--d) forwards; }

    .part {
      fill: url(#ao-intro-gold);
      fill-opacity: 0;
      stroke: url(#ao-intro-gold);
      stroke-width: 2.6;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation:
        draw 680ms cubic-bezier(0.65, 0, 0.35, 1) var(--draw) forwards,
        fill-in 380ms ease-out var(--fill) forwards;
    }
    .part--foot { animation-duration: 380ms, 380ms; }

    .letter { opacity: 0; translate: 0 14px; animation: rise 420ms cubic-bezier(0.22, 1, 0.36, 1) calc(980ms + var(--i) * 28ms) forwards; }
    .letter path { fill: #faf7f3; }

    @keyframes seed { 0% { scale: 0; opacity: 1; } 35% { scale: 1; } 70% { opacity: 1; } 100% { scale: 1; opacity: 0; } }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fill-in { to { fill-opacity: 1; stroke-opacity: 0; } }
    @keyframes rise { to { opacity: 1; translate: 0 0; } }
    @keyframes mark-out { to { opacity: 0; transform: translateY(-12px) scale(0.97); } }
    @keyframes curtain-up { to { clip-path: inset(0 0 100% 0); visibility: hidden; } }
  `,
})
export class BrandIntro {
  protected readonly viewBox = AO_VIEWBOX_FULL;
  protected readonly flip = AO_FLIP;
  protected readonly m = AO_MONOGRAM;
  protected readonly word = AO_WORDMARK;
  protected readonly seeds = AO_SEEDS;
  protected readonly done = signal(false);

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    afterNextRender(() => {
      if (!browser) return;
      const seen = document.documentElement.classList.contains('ao-intro-seen');
      if (seen) {
        this.done.set(true);
        return;
      }
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // Modo privado sin almacenamiento: la entrada se verá en cada visita, nada más.
      }
      setTimeout(() => this.done.set(true), INTRO_MS + 100);
    });
  }
}
