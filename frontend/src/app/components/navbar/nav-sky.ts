import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Generador pseudoaleatorio con semilla: el mismo cielo en cada visita. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const random = seeded(2027);
const STARS = Array.from({ length: 70 }, () => ({
  left: Math.round(random() * 1000) / 10,
  top: Math.round(random() * 1000) / 10,
  size: Math.round((1 + random() * 1.4) * 10) / 10,
  delay: -Math.round(random() * 60) / 10,
  duration: Math.round((2.6 + random() * 3.4) * 10) / 10,
}));

/** Fuegos diminutos repartidos a lo largo de la barra (se evita el centro, donde va el logotipo). */
const BURSTS = [
  { left: 9, top: 46, radius: 11, delay: 0, color: '#f6dc9a' },
  { left: 71, top: 54, radius: 13, delay: 1.9, color: '#ffffff' },
  { left: 30, top: 40, radius: 10, delay: 3.8, color: '#f2b8a8' },
  { left: 92, top: 44, radius: 12, delay: 5.7, color: '#f6dc9a' },
  { left: 19, top: 58, radius: 9, delay: 7.6, color: '#cfe3f5' },
  { left: 82, top: 40, radius: 10, delay: 9.5, color: '#f2b8a8' },
];
const RAYS = Array.from({ length: 10 }, (_, i) => i * 36);

/**
 * Cielo nocturno del navbar durante el tema de Año Nuevo: estrellas que titilan y
 * fuegos artificiales muy pequeños (solo CSS). Se pinta detrás del contenido de la barra.
 */
@Component({
  selector: 'app-nav-sky',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @for (s of stars; track $index) {
      <i class="star" [style.left.%]="s.left" [style.top.%]="s.top" [style.width.px]="s.size" [style.height.px]="s.size" [style.animation-delay.s]="s.delay" [style.animation-duration.s]="s.duration"></i>
    }
    @for (b of bursts; track $index) {
      <span class="burst" [style.left.%]="b.left" [style.top.%]="b.top" [style.--r]="b.radius + 'px'" [style.--delay]="b.delay + 's'" [style.--spark]="b.color">
        @for (a of rays; track a) {
          <i class="spark" [style.--a]="a + 'deg'"></i>
        }
      </span>
    }
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
      animation: sky-in 0.6s ease-out both;
    }
    @keyframes sky-in { from { opacity: 0; } }

    .star {
      position: absolute;
      display: block;
      border-radius: 50%;
      background: #fff;
      animation: twinkle ease-in-out infinite alternate;
    }
    @keyframes twinkle {
      from { opacity: 0.15; }
      to { opacity: 0.9; }
    }

    .burst { position: absolute; width: 0; height: 0; filter: drop-shadow(0 0 2px var(--spark)); }
    .spark {
      position: absolute;
      top: 0;
      left: -0.5px;
      display: block;
      width: 1px;
      height: calc(var(--r) * 0.45);
      border-radius: 1px;
      background: linear-gradient(to top, transparent, var(--spark) 60%, #fff);
      opacity: 0;
      transform-origin: 0.5px 0;
      animation: mini-spark 11.4s linear infinite;
      animation-delay: var(--delay);
    }
    /* Igual que los fuegos grandes: se abren frenando y se apagan conforme se alejan del centro. */
    @keyframes mini-spark {
      0% { opacity: 0; transform: rotate(var(--a)) translateY(0) scaleY(0.2); }
      1% { opacity: 1; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.12)) scaleY(0.6); }
      4% { opacity: 0.95; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.46)) scaleY(1); }
      8% { opacity: 0.65; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.74)) scaleY(0.9); }
      12% { opacity: 0.32; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.9)) scaleY(0.75); }
      17%, 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--r) * -1)) scaleY(0.5); }
    }

    @media (max-width: 700px) {
      .burst:nth-child(even) { display: none; }
    }

    /* Es la decoración del tema elegido: con "reducir movimiento" no se apaga. */
    @media (prefers-reduced-motion: reduce) {
      .star, .spark { animation-iteration-count: infinite !important; }
      .star { animation-duration: 5s !important; }
      .spark { animation-duration: 11.4s !important; }
    }
  `,
})
export class NavSky {
  protected readonly stars = STARS;
  protected readonly bursts = BURSTS;
  protected readonly rays = RAYS;
}
