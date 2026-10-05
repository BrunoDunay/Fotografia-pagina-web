import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Generador pseudoaleatorio con semilla: el mismo cielo en cada visita. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const random = seeded(2027);
const round = (n: number) => Math.round(n * 10) / 10;

const STARS = Array.from({ length: 46 }, () => ({
  left: round(random() * 100),
  top: round(random() * 100),
  size: round(1 + random() * 1.2),
  delay: -round(random() * 6),
  duration: round(2.6 + random() * 3.4),
}));

const GOLD = '#f6dc9a';
const WHITE = '#ffffff';
const ROSE = '#f7a8b8';
const AQUA = '#8fdcf0';
const VIOLET = '#c9a6f5';
const PARTY = [GOLD, ROSE, AQUA, VIOLET];

/** Luces de fiesta desenfocadas que respiran despacio al fondo. */
const GLOWS = Array.from({ length: 9 }, (_, i) => ({
  left: round(4 + i * 11.5 + random() * 5),
  top: round(15 + random() * 70),
  size: Math.round(26 + random() * 30),
  color: PARTY[i % PARTY.length],
  delay: -round(random() * 7),
  duration: round(4.5 + random() * 3.5),
}));

/** Fuegos diminutos a lo largo de la barra: uno cada 0.9 s (se evita el centro, donde va el logotipo). */
const BURSTS = [
  { left: 8, top: 44, radius: 13, color: GOLD },
  { left: 72, top: 56, radius: 15, color: ROSE },
  { left: 28, top: 40, radius: 12, color: AQUA },
  { left: 93, top: 44, radius: 14, color: GOLD },
  { left: 18, top: 60, radius: 11, color: VIOLET },
  { left: 62, top: 38, radius: 12, color: WHITE },
  { left: 37, top: 58, radius: 13, color: ROSE },
  { left: 84, top: 40, radius: 12, color: AQUA },
  { left: 3, top: 62, radius: 11, color: WHITE },
  { left: 67, top: 60, radius: 13, color: VIOLET },
].map((burst, index) => ({ ...burst, delay: round(index * 0.9) }));
const RAYS = Array.from({ length: 10 }, (_, i) => i * 36);

/** Serie de foquitos de colores en el borde inferior de la barra. */
const BULBS = Array.from({ length: 34 }, (_, i) => ({
  left: round(1.5 + i * (97 / 33)),
  color: PARTY[i % PARTY.length],
  delay: -round((i % 4) * 0.55 + random() * 0.3),
}));

/**
 * Noche de fiesta del navbar durante el tema de Año Nuevo: luces de colores desenfocadas, estrellas,
 * fuegos artificiales muy pequeños y una serie de foquitos en el borde (solo CSS).
 * Se pinta detrás del contenido de la barra.
 */
@Component({
  selector: 'app-nav-sky',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @for (g of glows; track $index) {
      <i class="glow" [style.left.%]="g.left" [style.top.%]="g.top" [style.width.px]="g.size" [style.height.px]="g.size" [style.--c]="g.color" [style.animation-delay.s]="g.delay" [style.animation-duration.s]="g.duration"></i>
    }
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
    <div class="lights">
      @for (l of bulbs; track $index) {
        <i class="bulb" [style.left.%]="l.left" [style.--c]="l.color" [style.animation-delay.s]="l.delay"></i>
      }
    </div>
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

    i { position: absolute; display: block; }

    /* Luces de fiesta al fondo */
    .glow {
      margin: -14px 0 0 -14px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--c), transparent 68%);
      filter: blur(3px);
      animation: glow-breathe ease-in-out infinite alternate;
    }
    @keyframes glow-breathe {
      from { opacity: 0.1; scale: 0.85; }
      to { opacity: 0.42; scale: 1.1; }
    }

    .star {
      border-radius: 50%;
      background: #fff;
      animation: twinkle ease-in-out infinite alternate;
    }
    @keyframes twinkle {
      from { opacity: 0.15; }
      to { opacity: 0.9; }
    }

    .burst { position: absolute; width: 0; height: 0; filter: drop-shadow(0 0 3px var(--spark)); }
    .spark {
      top: 0;
      left: -0.5px;
      width: 1.2px;
      height: calc(var(--r) * 0.45);
      border-radius: 1px;
      background: linear-gradient(to top, transparent, var(--spark) 60%, #fff);
      opacity: 0;
      transform-origin: 0.6px 0;
      animation: mini-spark 9s linear infinite;
      animation-delay: var(--delay);
    }
    /* Igual que los fuegos grandes: se abren frenando y se apagan conforme se alejan del centro. */
    @keyframes mini-spark {
      0% { opacity: 0; transform: rotate(var(--a)) translateY(0) scaleY(0.2); }
      1.2% { opacity: 1; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.12)) scaleY(0.6); }
      5% { opacity: 0.95; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.46)) scaleY(1); }
      10% { opacity: 0.65; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.74)) scaleY(0.9); }
      15% { opacity: 0.32; transform: rotate(var(--a)) translateY(calc(var(--r) * -0.9)) scaleY(0.75); }
      21%, 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--r) * -1)) scaleY(0.5); }
    }

    /* Serie de foquitos en el borde inferior */
    .lights { position: absolute; inset: auto 0 0; height: 0; }
    .bulb {
      bottom: 2px;
      width: 4px;
      height: 4px;
      margin-left: -2px;
      border-radius: 50%;
      background: var(--c);
      box-shadow: 0 0 6px 2px color-mix(in srgb, var(--c) 70%, transparent);
      animation: bulb-blink 2.2s ease-in-out infinite alternate;
    }
    @keyframes bulb-blink {
      from { opacity: 0.35; }
      to { opacity: 1; }
    }

    @media (max-width: 700px) {
      .burst:nth-of-type(even), .bulb:nth-child(even), .glow:nth-of-type(3n) { display: none; }
    }

    /* Es la decoración del tema elegido: con "reducir movimiento" no se apaga. */
    @media (prefers-reduced-motion: reduce) {
      .star, .spark, .glow, .bulb { animation-iteration-count: infinite !important; }
      .star { animation-duration: 5s !important; }
      .glow { animation-duration: 7s !important; }
      .bulb { animation-duration: 3s !important; }
      .spark { animation-duration: 9s !important; }
    }
  `,
})
export class NavSky {
  protected readonly glows = GLOWS;
  protected readonly stars = STARS;
  protected readonly bursts = BURSTS;
  protected readonly rays = RAYS;
  protected readonly bulbs = BULBS;
}
