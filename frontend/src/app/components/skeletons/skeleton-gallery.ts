import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Proporciones variadas para imitar el masonry real de la galería.
const RATIOS = ['3 / 4', '4 / 3', '2 / 3', '1', '3 / 4', '4 / 5', '3 / 2', '2 / 3', '4 / 3'];

@Component({
  selector: 'app-skeleton-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @for (ratio of ratios(); track $index) {
      <span class="skeleton tile" [style.aspect-ratio]="ratio"></span>
    }
  `,
  styles: `
    :host { display: block; columns: 3 260px; column-gap: var(--space-3); }
    .tile { width: 100%; margin-bottom: var(--space-3); break-inside: avoid; }
  `,
})
export class SkeletonGallery {
  readonly count = input(9);
  protected readonly ratios = computed(() => Array.from({ length: this.count() }, (_, i) => RATIOS[i % RATIOS.length]));
}
