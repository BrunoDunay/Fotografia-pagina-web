import { ChangeDetectionStrategy, Component, afterNextRender, computed, input, signal } from '@angular/core';
import { ThemeDecoration } from '../../core/types/catalog.model';

interface Particle {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  tone: number;
  /** Posición vertical fija (solo con movimiento reducido). */
  top: number;
}

/** Generador pseudoaleatorio con semilla: mismas partículas en cada visita (sin "saltos"). */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const COUNT = 26;

/**
 * Decoración del tema estacional (nieve, hojas, pétalos, confeti o papel picado).
 * - Solo sobre el área del Hero, detrás del navbar y sin capturar clics.
 * - Solo CSS (sin canvas ni librerías), se monta en el navegador después de pintar.
 * - Con `prefers-reduced-motion` las partículas se quedan quietas (sin animación).
 */
@Component({
  selector: 'app-seasonal-decor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class]': "'decor decor--' + decoration()" },
  templateUrl: './seasonal-decor.html',
  styleUrl: './seasonal-decor.css',
})
export class SeasonalDecor {
  readonly decoration = input.required<ThemeDecoration>();

  protected readonly ready = signal(false);

  protected readonly particles = computed<Particle[]>(() => {
    const random = seeded(this.decoration().length * 7919 + 17);
    return Array.from({ length: COUNT }, () => ({
      left: random() * 100,
      size: 0.6 + random() * 0.8,
      delay: -random() * 18,
      duration: 12 + random() * 12,
      drift: (random() - 0.5) * 120,
      spin: (random() > 0.5 ? 1 : -1) * (180 + random() * 360),
      tone: Math.floor(random() * 3),
      top: 4 + random() * 88,
    }));
  });

  /** Banderitas del papel picado (verde, blanco, rojo). */
  protected readonly flags = Array.from({ length: 14 }, (_, i) => i % 3);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }
}
