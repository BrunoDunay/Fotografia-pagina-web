import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonImage } from './skeleton-image';
import { SkeletonText } from './skeleton-text';

/** Card de servicio/paquete en carga. */
@Component({
  selector: 'app-skeleton-card',
  imports: [SkeletonImage, SkeletonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <app-skeleton-image [ratio]="ratio()" />
    <span class="skeleton title"></span>
    @if (lines() > 0) {
      <app-skeleton-text [lines]="lines()" lineHeight="0.75em" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-3); }
    .title { width: 55%; height: 1.2em; margin-top: var(--space-2); }
  `,
})
export class SkeletonCard {
  readonly ratio = input('3 / 4');
  readonly lines = input(2);
}
