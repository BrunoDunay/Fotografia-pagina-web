import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const STAR = 'M12 2L14.29 9.44L22.08 9.32L15.71 13.81L18.23 21.18L12 16.5L5.77 21.18L8.29 13.81L1.92 9.32L9.71 9.44Z';

/** Calificación de 1 a 5 (solo lectura). Estrella fina de puntas delgadas; las vacías van solo con un filete. */
@Component({
  selector: 'app-review-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'rating() + " de 5 estrellas"' },
  template: `
    @for (i of [1, 2, 3, 4, 5]; track i) {
      <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()" [class.off]="i > rating()" aria-hidden="true">
        <path [attr.d]="star" />
      </svg>
    }
  `,
  styles: `
    :host { display: inline-flex; gap: 2px; color: var(--color-primary); }
    svg { fill: currentColor; }
    svg.off { fill: none; stroke: var(--color-border-strong); stroke-width: 1.2; stroke-linejoin: round; }
  `,
})
export class ReviewStars {
  readonly rating = input.required<number>();
  readonly size = input(14);
  protected readonly star = STAR;
}

export { STAR as STAR_PATH };
