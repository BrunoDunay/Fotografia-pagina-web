import { ChangeDetectionStrategy, Component, afterNextRender, computed, input, signal } from '@angular/core';
import { ThemeDecoration } from '../../core/types/catalog.model';

interface Particle {
  left: number;
  size: number;
  /** Retraso negativo: cada partícula arranca en un punto distinto de su ciclo (lluvia continua). */
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  tone: number;
}

interface DecorConfig {
  count: number;
  /** Variantes de color/forma (clases tone-0 … tone-n), con su peso relativo. */
  weights: number[];
  /** Giro máximo (grados) a lo largo de la caída. */
  spin: number;
  size: [number, number];
  duration: [number, number];
  /** Guirnalda de papel picado bajo el navbar. */
  garland?: 'tricolor' | 'muertos';
  /** Las partículas suben en lugar de caer (destellos de verano). */
  rise?: boolean;
}

const CONFIG: Record<Exclude<ThemeDecoration, 'none'>, DecorConfig> = {
  snow: { count: 34, weights: [3, 2, 1], spin: 0, size: [0.6, 1.4], duration: [11, 20] },
  petals: { count: 26, weights: [1, 1, 1], spin: 540, size: [0.7, 1.4], duration: [12, 22] },
  leaves: { count: 22, weights: [1, 1, 1], spin: 540, size: [0.7, 1.4], duration: [12, 22] },
  confetti: { count: 40, weights: [1, 1, 1, 1, 1, 1], spin: 720, size: [0.7, 1.3], duration: [9, 16] },
  // Navidad: copos con forma de copo (la mayoría) + bastón, galleta de jengibre, gorrito, muérdago y esfera.
  christmas: { count: 30, weights: [7, 1, 1, 1, 1, 1], spin: 200, size: [0.8, 1.5], duration: [13, 22] },
  hearts: { count: 26, weights: [2, 2, 1, 1], spin: 40, size: [0.7, 1.4], duration: [12, 20] },
  sunshine: { count: 18, weights: [1, 1, 1], spin: 0, size: [0.7, 1.6], duration: [14, 24], rise: true },
  // Día de Muertos: flores y pétalos de cempasúchil + papel picado de calaveritas.
  dia_de_muertos: { count: 22, weights: [2, 2, 1], spin: 360, size: [0.8, 1.5], duration: [13, 22], garland: 'muertos' },
  papel_picado: { count: 0, weights: [1], spin: 0, size: [1, 1], duration: [1, 1], garland: 'tricolor' },
};

/** Generador pseudoaleatorio con semilla: mismas partículas en cada visita (sin "saltos"). */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function pickTone(weights: number[], r: number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (const [i, w] of weights.entries()) {
    acc += w / total;
    if (r < acc) return i;
  }
  return weights.length - 1;
}

const FLAGS = 14;

/**
 * Decoración del tema estacional (nieve, Navidad, corazones, pétalos, hojas, confeti, verano,
 * papel picado o Día de Muertos).
 * - Solo sobre el área del Hero, detrás del navbar y sin capturar clics.
 * - Solo CSS (sin canvas ni librerías), se monta en el navegador después de pintar.
 * - Con `prefers-reduced-motion` cae más lento y sin giros.
 */
@Component({
  selector: 'app-seasonal-decor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class]': "'decor decor--' + decoration()" },
  templateUrl: './seasonal-decor.html',
  styleUrl: './seasonal-decor.css',
})
export class SeasonalDecor {
  readonly decoration = input.required<Exclude<ThemeDecoration, 'none'>>();

  protected readonly ready = signal(false);
  protected readonly config = computed(() => CONFIG[this.decoration()]);

  protected readonly particles = computed<Particle[]>(() => {
    const { count, weights, spin, size, duration, rise } = this.config();
    const random = seeded(this.decoration().length * 7919 + 17);
    return Array.from({ length: count }, () => {
      const d = duration[0] + random() * (duration[1] - duration[0]);
      return {
        left: random() * 100,
        size: size[0] + random() * (size[1] - size[0]),
        delay: -random() * d,
        duration: d,
        drift: (random() - 0.5) * (rise ? 80 : 140),
        spin: (random() > 0.5 ? 1 : -1) * spin * (0.5 + random() * 0.5),
        tone: pickTone(weights, random()),
      };
    });
  });

  /** Banderitas: tricolor (verde, blanco, rojo) o colores de Día de Muertos (6). */
  protected readonly flags = computed(() => {
    const colors = this.config().garland === 'muertos' ? 6 : 3;
    return Array.from({ length: FLAGS }, (_, i) => i % colors);
  });

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }
}
