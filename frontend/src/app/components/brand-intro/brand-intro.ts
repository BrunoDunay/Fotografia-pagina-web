import { ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AO_FLIP, AO_MONOGRAM, AO_SEEDS, AO_VIEWBOX_FULL, AO_WORDMARK } from '../../core/brand/ao-logo';

/** Lo que dura la entrada desde que arranca (debe coincidir con la última animación de abajo). */
const INTRO_MS = 2450;
const SEEN_KEY = 'ao-intro';

/**
 * Entrada del sitio (basada en la referencia "animación para logo de entrada", pero ágil):
 * 1. Pantalla espresso de la marca y dos puntos de luz donde nace el trazo.
 * 2. Los contornos de la O y la A se dibujan en champán, se rellenan con el degradado del logo
 *    y un destello fino lo recorre.
 * 3. Sube el nombre ARMANDO OVALLE letra por letra.
 * 4. Todo se desvanece (medio segundo) y deja ver la página que ya estaba detrás.
 *
 * Fluidez: la pantalla espresso viene en el HTML del servidor (tapa la página desde el primer cuadro),
 * pero el dibujo arranca hasta que Angular terminó de cargar (clase .play): así no compite con el arranque
 * del sitio y no se traba. El contorno es de un solo color (barato de pintar) y la salida es un fundido de
 * `opacity`, que el navegador anima sin usar el hilo principal. Si el JS fallara, la pantalla se va sola.
 * Se ve una vez por visita (index.html la oculta antes de pintarse si ya se vio).
 */
@Component({
  selector: 'app-brand-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!done()) {
      <div class="intro" [class.play]="playing()" aria-hidden="true">
        <svg class="mark" [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ao-intro-fill" gradientUnits="userSpaceOnUse" x1="780" y1="540" x2="1250" y2="1140">
              <stop offset="0" stop-color="#e2dac9" />
              <stop offset="0.42" stop-color="#cdc1a9" />
              <stop offset="0.72" stop-color="#b3a793" />
              <stop offset="1" stop-color="#d8cfbd" />
            </linearGradient>
            <linearGradient id="ao-intro-shine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stop-color="#fff" stop-opacity="0" />
              <stop offset="0.5" stop-color="#fff" stop-opacity="0.8" />
              <stop offset="1" stop-color="#fff" stop-opacity="0" />
            </linearGradient>
            <clipPath id="ao-intro-clip">
              <path [attr.transform]="flip" [attr.d]="m.o" /><path [attr.transform]="flip" [attr.d]="m.a" />
              <path [attr.transform]="flip" [attr.d]="m.footLeft" /><path [attr.transform]="flip" [attr.d]="m.footRight" />
            </clipPath>
          </defs>
          @for (s of seeds; track $index) {
            <circle class="seed" [attr.cx]="s.x" [attr.cy]="s.y" r="6" [style.animation-delay]="$index * 60 + 'ms'" />
          }
          <g class="fill" fill="url(#ao-intro-fill)" [attr.transform]="flip">
            <path [attr.d]="m.o" /><path [attr.d]="m.a" /><path [attr.d]="m.footLeft" /><path [attr.d]="m.footRight" />
          </g>
          <g class="outline" [attr.transform]="flip">
            <path [attr.d]="m.o" pathLength="1" style="animation-delay: 80ms" />
            <path [attr.d]="m.a" pathLength="1" style="animation-delay: 150ms" />
            <path class="foot" [attr.d]="m.footLeft" pathLength="1" style="animation-delay: 420ms" />
            <path class="foot" [attr.d]="m.footRight" pathLength="1" style="animation-delay: 450ms" />
          </g>
          <g clip-path="url(#ao-intro-clip)">
            <g transform="skewX(-18)"><rect class="shine" x="760" y="500" width="120" height="700" fill="url(#ao-intro-shine)" /></g>
          </g>
          <g class="word">
            @for (l of word; track $index) {
              <!-- Se anima el grupo: el path conserva la posición que trae del PDF. -->
              <g class="letter" [style.animation-delay]="1000 + $index * 26 + 'ms'"><path [attr.transform]="l.transform" [attr.d]="l.d" /></g>
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
      will-change: opacity;
      /* Respaldo: si el JS no llegara a arrancar la entrada, la pantalla se desvanece sola. */
      animation: dissolve-fallback 500ms ease-out 5s forwards;
    }
    .mark { width: min(68vw, 460px); height: auto; overflow: visible; will-change: transform, opacity; }
    .seed { fill: #e2dac9; opacity: 0; }
    .fill { opacity: 0; }
    .outline { fill: none; stroke: #d3c7b0; stroke-width: 2.4; }
    .outline path { stroke-dasharray: 1; stroke-dashoffset: 1; }
    .shine { opacity: 0; }
    .word path { fill: #faf7f3; }
    .letter { opacity: 0; }

    /* --- Arranca cuando el sitio ya cargó --- */
    /* Salida: el logo y el fondo se desvanecen juntos, rápido, mostrando la página de a poco. */
    .play { animation: dissolve 520ms cubic-bezier(0.4, 0, 0.2, 1) 1880ms forwards; }
    .play .seed { transform-box: fill-box; transform-origin: center; animation: seed 520ms ease-out forwards; }
    .play .outline path { animation: draw 640ms cubic-bezier(0.65, 0, 0.35, 1) forwards; }
    .play .outline .foot { animation-duration: 360ms; }
    .play .outline { animation: fade-out 320ms ease-out 820ms forwards; }
    .play .fill { animation: fade-in 380ms ease-out 680ms forwards; }
    .play .shine { animation: shine 820ms cubic-bezier(0.4, 0, 0.2, 1) 1060ms forwards; }
    .play .letter { animation: letter 460ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .play .mark { animation: mark-out 520ms cubic-bezier(0.4, 0, 0.2, 1) 1880ms forwards; }

    @keyframes seed { 0% { opacity: 0; transform: scale(0); } 30% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fade-in { to { opacity: 1; } }
    @keyframes fade-out { to { opacity: 0; } }
    @keyframes shine { 0% { opacity: 1; transform: translateX(0); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(560px); } }
    @keyframes letter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    @keyframes mark-out { to { opacity: 0; transform: scale(1.03); } }
    @keyframes dissolve { to { opacity: 0; visibility: hidden; } }
    /* Nombre distinto a propósito: si fuera el mismo, el navegador no reinicia el reloj al arrancar .play. */
    @keyframes dissolve-fallback { to { opacity: 0; visibility: hidden; } }

    /* "Reducir movimiento" (por ejemplo, Windows con los efectos de animación apagados): el logo se dibuja igual,
       pero en vez de deslizarse, las letras y la cortina solo se desvanecen. */
    @media (prefers-reduced-motion: reduce) {
      @keyframes letter { from { opacity: 0; } to { opacity: 1; } }
      @keyframes mark-out { to { opacity: 0; } }
    }
  `,
})
export class BrandIntro {
  protected readonly viewBox = AO_VIEWBOX_FULL;
  protected readonly flip = AO_FLIP;
  protected readonly m = AO_MONOGRAM;
  protected readonly word = AO_WORDMARK;
  protected readonly seeds = AO_SEEDS;
  protected readonly done = signal(false);
  protected readonly playing = signal(false);

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    afterNextRender(() => {
      if (!browser) return;
      if (document.documentElement.classList.contains('ao-intro-seen')) {
        this.done.set(true);
        return;
      }
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // Modo privado sin almacenamiento: la entrada se verá en cada visita, nada más.
      }
      // Dos cuadros después de cargar: el navegador ya pintó y terminó el trabajo pesado del arranque.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          this.playing.set(true);
          setTimeout(() => this.done.set(true), INTRO_MS + 100);
        }),
      );
    });
  }
}
