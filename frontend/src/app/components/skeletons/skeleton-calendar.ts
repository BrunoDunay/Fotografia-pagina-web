import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="header">
      <span class="skeleton nav"></span>
      <span class="skeleton month"></span>
      <span class="skeleton nav"></span>
    </div>
    <div class="grid">
      @for (cell of cells; track $index) {
        <span class="skeleton day"></span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); }
    .nav { width: 2rem; height: 2rem; }
    .month { width: 9rem; height: 1.4rem; }
    .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); }
    .day { aspect-ratio: 1; }
  `,
})
export class SkeletonCalendar {
  protected readonly cells = Array.from({ length: 35 });
}
