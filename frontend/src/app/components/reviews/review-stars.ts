import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const STAR = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z';

/** Calificación de 1 a 5 (solo lectura). */
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
    svg.off { fill: var(--color-border-strong); }
  `,
})
export class ReviewStars {
  readonly rating = input.required<number>();
  readonly size = input(14);
  protected readonly star = STAR;
}

export { STAR as STAR_PATH };
