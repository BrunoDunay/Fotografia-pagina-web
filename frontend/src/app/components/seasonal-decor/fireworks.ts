import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type BurstKind = 'rays' | 'willow' | 'ring' | 'double' | 'comet' | 'letters' | 'flower';

interface Burst {
  left: number;
  top: number;
  radius: number;
  color: string;
  color2: string;
  kind: BurstKind;
}

/** Un estallido cada 2.2 s; el ciclo completo dura (número de estallidos × 2.2) segundos. */
const INTERVAL = 2.2;

const GOLD = '#f6dc9a';
const WHITE = '#ffffff';
const ROSE = '#f2b8a8';
const ICE = '#cfe3f5';

/** Año Nuevo: dorados, blancos y rosados. */
const NEW_YEAR: Burst[] = [
  { left: 22, top: 30, radius: 112, color: GOLD, color2: WHITE, kind: 'rays' },
  { left: 76, top: 24, radius: 132, color: WHITE, color2: GOLD, kind: 'willow' },
  { left: 50, top: 42, radius: 94, color: ROSE, color2: WHITE, kind: 'ring' },
  { left: 88, top: 50, radius: 86, color: GOLD, color2: ROSE, kind: 'double' },
  { left: 14, top: 26, radius: 80, color: GOLD, color2: WHITE, kind: 'comet' },
  { left: 36, top: 20, radius: 120, color: GOLD, color2: ICE, kind: 'double' },
  { left: 64, top: 52, radius: 78, color: WHITE, color2: GOLD, kind: 'ring' },
  { left: 92, top: 22, radius: 104, color: ROSE, color2: GOLD, kind: 'willow' },
];

const GREEN = '#35b56f';
const RED = '#e8434f';

/** Feria de San Marcos: solo verde, blanco y rojo; uno dibuja "AGS" y dos estallan en forma de flor. */
const FERIA: Burst[] = [
  { left: 20, top: 30, radius: 110, color: GREEN, color2: WHITE, kind: 'double' },
  { left: 74, top: 30, radius: 100, color: RED, color2: WHITE, kind: 'flower' },
  { left: 48, top: 24, radius: 96, color: WHITE, color2: WHITE, kind: 'letters' },
  { left: 88, top: 48, radius: 88, color: RED, color2: GREEN, kind: 'double' },
  { left: 12, top: 28, radius: 80, color: WHITE, color2: GREEN, kind: 'comet' },
  { left: 32, top: 46, radius: 92, color: GREEN, color2: RED, kind: 'ring' },
  { left: 62, top: 50, radius: 84, color: WHITE, color2: GREEN, kind: 'flower' },
  { left: 90, top: 22, radius: 104, color: RED, color2: WHITE, kind: 'willow' },
];

const RAYS = Array.from({ length: 16 }, (_, i) => i * 22.5);
const PETALS = Array.from({ length: 8 }, (_, i) => i * 45);

/** Destellos que deja el cometa: altura sobre su punto final (svh) y momento en que pasa por ahí (s). */
const GLITTER = [
  { y: 30, at: 0.5, x: -3 },
  { y: 25, at: 0.6, x: 4 },
  { y: 20, at: 0.72, x: -2 },
  { y: 15.5, at: 0.85, x: 3 },
  { y: 11.5, at: 0.98, x: -4 },
  { y: 8, at: 1.12, x: 2 },
  { y: 5, at: 1.28, x: -3 },
  { y: 2.5, at: 1.45, x: 3 },
];

/** Letras de 5×7 puntos para el estallido "AGS" (Aguascalientes). */
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.###.'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
};
const PITCH = 7;

/** Puntos de "AGS" centrados en el estallido: la A en verde, la G en blanco y la S en rojo. */
const LETTER_DOTS = (() => {
  const word = ['A', 'G', 'S'];
  const colors = [GREEN, WHITE, RED];
  const letterWidth = 5 * PITCH;
  const gap = 2 * PITCH;
  const total = word.length * letterWidth + (word.length - 1) * gap;
  const dots: { x: number; y: number; color: string }[] = [];
  word.forEach((letter, index) => {
    FONT[letter].forEach((row, r) => {
      [...row].forEach((cell, c) => {
        if (cell !== '#') return;
        dots.push({ x: index * (letterWidth + gap) + c * PITCH - total / 2 + PITCH / 2, y: (r - 3) * PITCH, color: colors[index] });
      });
    });
  });
  return dots;
})();

/**
 * Fuegos artificiales sobre la foto de portada (solo CSS). Cada estallido sube frenando, hace una
 * pausa y se abre; las chispas se apagan conforme se alejan del centro. Tipos: rayos, rayos largos,
 * anillo de puntos, doble color, cometa (no estalla), letras "AGS" y flor.
 */
@Component({
  selector: 'app-fireworks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[style.--cycle]': 'cycle()' },
  templateUrl: './fireworks.html',
  styleUrl: './fireworks.css',
})
export class Fireworks {
  /** "new-year": dorados y blancos · "feria": verde, blanco y rojo, con las letras AGS y flores. */
  readonly palette = input<'new-year' | 'feria'>('new-year');

  protected readonly bursts = computed(() =>
    (this.palette() === 'feria' ? FERIA : NEW_YEAR).map((burst, index) => ({ ...burst, delay: Math.round(index * INTERVAL * 10) / 10 })),
  );
  protected readonly cycle = computed(() => `${Math.round(this.bursts().length * INTERVAL * 10) / 10}s`);

  protected readonly rays = RAYS;
  protected readonly petals = PETALS;
  protected readonly glitter = GLITTER;
  protected readonly letterDots = LETTER_DOTS;
}
