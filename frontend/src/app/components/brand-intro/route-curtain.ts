import { ChangeDetectionStrategy, Component, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateChildFn, NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { AO_FLIP, AO_MONOGRAM, AO_VIEWBOX_MONOGRAM } from '../../core/brand/ao-logo';

// El monograma termina de dibujarse ANTES de que el router cargue la página nueva: mientras se arma la página
// (trabajo pesado) ya no hay nada dibujándose, y la salida de la cortina usa transform (no se traba).
const COVER_MS = 500;
const MIN_SHOWN_MS = 560;
const LEAVE_MS = 520;

/**
 * Transición entre páginas: versión corta de la entrada. La cortina espresso sube, el monograma AO se dibuja
 * rápido y, cuando la página nueva ya está lista debajo, la cortina sigue de largo hacia arriba.
 * El router espera a que la cortina tape (guard `curtainGuard`), así el cambio de contenido nunca se ve.
 */
@Injectable({ providedIn: 'root' })
export class RouteCurtainService {
  readonly phase = signal<'idle' | 'in' | 'out'>('idle');
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private coveredAt = 0;
  private covering: Promise<void> | null = null;

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) this.reveal();
    });
  }

  /** Tapa la pantalla; la promesa se resuelve cuando ya no se ve nada de la página anterior. */
  cover(): Promise<void> {
    // La primera carga la cubre la entrada; en el servidor no hay nada que animar.
    if (!this.browser || !this.router.navigated) return Promise.resolve();
    if (this.covering) return this.covering;
    this.phase.set('in');
    this.coveredAt = performance.now();
    this.covering = new Promise((resolve) => setTimeout(resolve, COVER_MS));
    return this.covering;
  }

  private reveal(): void {
    if (this.phase() !== 'in') return;
    const wait = Math.max(0, MIN_SHOWN_MS - (performance.now() - this.coveredAt));
    setTimeout(() => {
      this.covering = null;
      this.phase.set('out');
      setTimeout(() => this.phase() === 'out' && this.phase.set('idle'), LEAVE_MS);
    }, wait);
  }
}

/** Antes de mostrar otra página del sitio público, espera a que la cortina tape la pantalla. */
export const curtainGuard: CanActivateChildFn = () => inject(RouteCurtainService).cover().then(() => true);

@Component({
  selector: 'app-route-curtain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.is-in]': 'curtain.phase() === "in"', '[class.is-out]': 'curtain.phase() === "out"' },
  template: `
    @if (curtain.phase() !== 'idle') {
      <svg class="mark" [attr.viewBox]="viewBox">
        <defs>
          <linearGradient id="ao-curtain-fill" gradientUnits="userSpaceOnUse" x1="780" y1="540" x2="1250" y2="1140">
            <stop offset="0" stop-color="#e2dac9" />
            <stop offset="0.5" stop-color="#c6baa2" />
            <stop offset="1" stop-color="#d8cfbd" />
          </linearGradient>
        </defs>
        <g class="fill" fill="url(#ao-curtain-fill)" [attr.transform]="flip">
          <path [attr.d]="m.o" /><path [attr.d]="m.a" /><path [attr.d]="m.footLeft" /><path [attr.d]="m.footRight" />
        </g>
        <g class="outline" [attr.transform]="flip">
          <path [attr.d]="m.o" pathLength="1" />
          <path [attr.d]="m.a" pathLength="1" style="animation-delay: 60ms" />
          <path [attr.d]="m.footLeft" pathLength="1" style="animation-delay: 160ms" />
          <path [attr.d]="m.footRight" pathLength="1" style="animation-delay: 170ms" />
        </g>
      </svg>
    }
  `,
  styles: `
    :host { position: fixed; inset: 0; z-index: 999; display: grid; place-items: center; background: #2a2421; pointer-events: none; visibility: hidden; transform: translateY(100%); will-change: transform; }
    :host(.is-in) { visibility: visible; pointer-events: auto; animation: cover 380ms cubic-bezier(0.76, 0, 0.24, 1) forwards; }
    :host(.is-out) { visibility: visible; transform: none; animation: leave 520ms cubic-bezier(0.76, 0, 0.24, 1) forwards; }
    .mark { width: 64px; height: auto; overflow: visible; will-change: opacity; }
    :host(.is-out) .mark { animation: fade 200ms ease-in forwards; }
    .fill { opacity: 0; animation: fade-in 200ms ease-out 330ms forwards; }
    .outline { fill: none; stroke: #d3c7b0; stroke-width: 5; animation: fade 160ms ease-out 400ms forwards; }
    .outline path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 300ms cubic-bezier(0.65, 0, 0.35, 1) 60ms forwards; }
    @keyframes cover { from { transform: translateY(100%); } to { transform: none; } }
    @keyframes leave { from { transform: none; } to { transform: translateY(-100%); } }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fade-in { to { opacity: 1; } }
    @keyframes fade { to { opacity: 0; } }
    /* "Reducir movimiento": la cortina aparece y se va con un fundido, sin deslizarse. */
    @media (prefers-reduced-motion: reduce) {
      @keyframes cover { from { opacity: 0; transform: none; } to { opacity: 1; transform: none; } }
      @keyframes leave { from { opacity: 1; transform: none; } to { opacity: 0; transform: none; } }
    }
  `,
})
export class RouteCurtain {
  protected readonly curtain = inject(RouteCurtainService);
  protected readonly viewBox = AO_VIEWBOX_MONOGRAM;
  protected readonly flip = AO_FLIP;
  protected readonly m = AO_MONOGRAM;
}
