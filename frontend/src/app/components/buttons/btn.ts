import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BtnVariant = 'solid' | 'outline' | 'ghost' | 'light' | 'danger';

/**
 * Botón del sistema de diseño (rectangular, tracking amplio, como en las referencias).
 * Uso: <button appBtn variant="outline">…</button> o <a appBtn routerLink="…">…</a>
 */
@Component({
  selector: 'button[appBtn], a[appBtn]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'btn',
    '[class.btn--solid]': "variant() === 'solid'",
    '[class.btn--outline]': "variant() === 'outline'",
    '[class.btn--ghost]': "variant() === 'ghost'",
    '[class.btn--light]': "variant() === 'light'",
    '[class.btn--danger]': "variant() === 'danger'",
    '[class.btn--sm]': "size() === 'sm'",
    '[class.btn--block]': 'block()',
    '[attr.aria-busy]': 'loading() || null',
  },
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      min-height: 2.9rem;
      padding: 0.75rem 1.9rem;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      font-weight: 400;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      text-align: center;
      white-space: nowrap;
      transition: background-color var(--duration) var(--ease-out), color var(--duration) var(--ease-out),
        border-color var(--duration) var(--ease-out), transform var(--duration-fast);
    }
    :host:active { transform: translateY(1px); }
    :host([disabled]), :host([aria-disabled='true']) { opacity: 0.5; pointer-events: none; }
    :host(.btn--sm) { min-height: 2.2rem; padding: 0.4rem 1rem; }
    :host(.btn--block) { display: flex; width: 100%; }

    :host(.btn--solid) { background: var(--color-secondary); color: var(--color-text-inverse); }
    :host(.btn--solid:hover) { background: var(--color-secondary-hover); }
    :host(.btn--outline) { border-color: var(--color-primary); color: var(--color-primary); background: transparent; }
    :host(.btn--outline:hover) { background: var(--color-primary); color: var(--color-text-inverse); }
    :host(.btn--ghost) { background: transparent; color: var(--color-text); padding-inline: var(--space-3); }
    :host(.btn--ghost:hover) { color: var(--color-primary); }
    :host(.btn--light) { border-color: currentColor; color: var(--color-text-inverse); background: transparent; }
    :host(.btn--light:hover) { background: var(--color-text-inverse); color: var(--color-text); }
    :host(.btn--danger) { background: var(--color-danger); color: var(--color-text-inverse); }

    .spinner {
      width: 0.9em;
      height: 0.9em;
      border: 1.5px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
})
export class Btn {
  readonly variant = input<BtnVariant>('solid');
  readonly size = input<'md' | 'sm'>('md');
  readonly block = input(false);
  readonly loading = input(false);
}
