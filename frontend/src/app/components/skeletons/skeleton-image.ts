import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Bloque de imagen en carga con proporción fija (evita saltos de layout). */
@Component({
  selector: 'app-skeleton-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'skeleton', '[style.aspect-ratio]': 'ratio()' },
  template: ``,
  styles: `
    :host { width: 100%; }
  `,
})
export class SkeletonImage {
  /** Ej.: '3 / 4', '16 / 9', '1'. */
  readonly ratio = input('3 / 4');
}
