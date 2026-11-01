import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { AO_FLIP, AO_MONOGRAM, AO_WORDMARK } from '../../core/brand/ao-logo';

export type AoLayout = 'horizontal' | 'stacked' | 'monogram';

/*
 * Medidas del dibujo (unidades del PDF). Monograma: x 772–1256, y 538–1138. Nombre: x 494–1467, y 1233–1312.
 * La versión horizontal pone el monograma a la izquierda y el nombre centrado a su derecha, igual que
 * logo-ao-horizontal-*.webp (el nombre mide ~0.31 de la altura del monograma y queda a 150 unidades).
 */
const LAYOUTS: Record<AoLayout, { viewBox: string; mono: string; word: string | null }> = {
  monogram: { viewBox: '772 538 484 600', mono: '', word: null },
  stacked: { viewBox: '470 530 1020 800', mono: '', word: '' },
  horizontal: {
    viewBox: '0 0 2950 600',
    mono: 'translate(-772 -538)',
    word: 'translate(-541.7 -2728.5) scale(2.38)',
  },
};

let next = 0;

/**
 * El logotipo AO dibujado en línea (no como imagen), con los trazos del PDF del cliente.
 * Al pasar el cursor se vuelve a "formar": el monograma se apaga, su contorno se dibuja en champán,
 * se rellena y un destello fino lo recorre; las letras del nombre se encienden una tras otra.
 * La animación siempre termina completa aunque el cursor salga antes (no se corta a la mitad).
 * El nombre usa el color del texto que lo rodea (currentColor): claro sobre fondos oscuros y al revés.
 */
@Component({
  selector: 'app-ao-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-playing]': 'playing()',
    '(mouseenter)': 'play()',
    '(focusin)': 'play()',
  },
  template: `
    <svg [attr.viewBox]="l().viewBox" role="img" [attr.aria-label]="label()">
      <defs>
        <linearGradient [attr.id]="ids.fill" gradientUnits="userSpaceOnUse" x1="780" y1="540" x2="1250" y2="1140">
          <stop offset="0" stop-color="#ddd4c2" />
          <stop offset="0.42" stop-color="#c6baa2" />
          <stop offset="0.72" stop-color="#ab9f8c" />
          <stop offset="1" stop-color="#d3c9b5" />
        </linearGradient>
        <linearGradient [attr.id]="ids.shine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.75" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <clipPath [attr.id]="ids.clip">
          <path [attr.transform]="flip" [attr.d]="m.o" />
          <path [attr.transform]="flip" [attr.d]="m.a" />
          <path [attr.transform]="flip" [attr.d]="m.footLeft" />
          <path [attr.transform]="flip" [attr.d]="m.footRight" />
        </clipPath>
      </defs>
      <g [attr.transform]="l().mono || null">
        <g class="mono" [attr.fill]="'url(#' + ids.fill + ')'">
          <g [attr.transform]="flip">
            <path [attr.d]="m.o" /><path [attr.d]="m.a" /><path [attr.d]="m.footLeft" /><path [attr.d]="m.footRight" />
          </g>
        </g>
        <g class="outline" [attr.transform]="flip">
          <path [attr.d]="m.o" pathLength="1" /><path [attr.d]="m.a" pathLength="1" style="animation-delay: 70ms" />
          <path [attr.d]="m.footLeft" pathLength="1" style="animation-delay: 200ms" /><path [attr.d]="m.footRight" pathLength="1" style="animation-delay: 220ms" />
        </g>
        <!-- Destello: una franja de luz inclinada que cruza el monograma (recortada a su forma). -->
        <g [attr.clip-path]="'url(#' + ids.clip + ')'">
          <g transform="skewX(-18)">
            <rect class="shine" x="700" y="500" width="110" height="700" [attr.fill]="'url(#' + ids.shine + ')'" />
          </g>
        </g>
      </g>
      @if (l().word !== null) {
        <g class="word" [attr.transform]="l().word || null">
          @for (w of word; track $index) {
            <path [attr.transform]="w.transform" [attr.d]="w.d" [style.--i]="$index" />
          }
        </g>
      }
    </svg>
  `,
  styles: `
    :host { display: inline-block; line-height: 0; }
    svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .word { fill: currentColor; }
    .outline { fill: none; stroke: #cdbfa5; stroke-width: 3; opacity: 0; }
    .outline path { stroke-dasharray: 1; stroke-dashoffset: 1; }
    .shine { opacity: 0; }

    /* Al pasar el cursor: el monograma se vuelve a formar (~1.2 s). */
    :host(.is-playing) .mono { animation: ao-mono 1000ms cubic-bezier(0.45, 0, 0.2, 1) both; }
    :host(.is-playing) .outline { animation: ao-outline 1000ms ease both; }
    :host(.is-playing) .outline path { animation: ao-draw 560ms cubic-bezier(0.65, 0, 0.35, 1) 90ms both; }
    :host(.is-playing) .shine { animation: ao-shine 760ms cubic-bezier(0.4, 0, 0.2, 1) 820ms both; }
    :host(.is-playing) .word path { animation: ao-letter 520ms ease both; animation-delay: calc(140ms + var(--i) * 26ms); }

    @keyframes ao-mono { 0% { opacity: 1; } 18%, 55% { opacity: 0.12; } 85%, 100% { opacity: 1; } }
    @keyframes ao-outline { 0% { opacity: 0; } 10%, 62% { opacity: 1; } 90%, 100% { opacity: 0; } }
    @keyframes ao-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @keyframes ao-shine { from { opacity: 1; transform: translateX(0); } 85% { opacity: 1; } to { opacity: 0; transform: translateX(620px); } }
    @keyframes ao-letter { 0% { opacity: 1; } 30% { opacity: 0.3; } 100% { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { :host(.is-playing) * { animation: none !important; } }
  `,
})
export class AoLogo {
  readonly layout = input<AoLayout>('horizontal');
  readonly label = input('Armando Ovalle');
  protected readonly l = computed(() => LAYOUTS[this.layout()]);
  protected readonly flip = AO_FLIP;
  protected readonly m = AO_MONOGRAM;
  protected readonly word = AO_WORDMARK;
  protected readonly playing = signal(false);
  private readonly n = ++next;
  protected readonly ids = { fill: `ao-fill-${this.n}`, shine: `ao-shine-${this.n}`, clip: `ao-clip-${this.n}` };
  private timer?: ReturnType<typeof setTimeout>;

  protected play(): void {
    if (this.playing()) return;
    this.playing.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.playing.set(false), 1650);
  }
}
