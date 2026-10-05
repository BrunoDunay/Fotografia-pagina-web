import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Reveal } from '../reveal/reveal.directive';

/**
 * Encabezado de sección del sitio.
 * - layout "rule": título a la izquierda + hairline larga (ref. Sobre mi.jpg).
 * - layout "center": eyebrow con guion + título serif centrado (ref. Home/Servicios).
 */
@Component({
  selector: 'app-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Todos los títulos de sección aparecen suavemente al entrar en pantalla.
  hostDirectives: [Reveal],
  host: { '[class.layout-rule]': "layout() === 'rule'", '[class.layout-center]': "layout() === 'center'", '[class.layout-left]': "layout() === 'left'" },
  template: `
    @if (eyebrow()) {
      <span class="eyebrow" [class.eyebrow--dash]="layout() === 'center'">{{ eyebrow() }}</span>
    }
    <div class="title-row">
      @switch (level()) {
        @case (1) { <h1 class="title">{{ title() }}</h1> }
        @case (3) { <h3 class="title">{{ title() }}</h3> }
        @default { <h2 class="title">{{ title() }}</h2> }
      }
      @if (layout() === 'rule') {
        <span class="rule" aria-hidden="true"></span>
      }
    </div>
    <ng-content />
  `,
  styles: `
    :host { display: grid; gap: var(--space-3); margin-bottom: var(--space-7); }
    .title { font-size: var(--text-3xl); color: var(--color-text); }
    .title-row { display: flex; align-items: center; gap: var(--space-6); }
    .rule { flex: 1; height: 1px; background: var(--color-primary); opacity: 0.45; transform-origin: left; transition: transform 1.4s var(--ease-out) 0.25s; }
    /* La línea se dibuja cuando el título entra en pantalla (clases de appReveal). */
    :host(.reveal:not(.is-visible)) .rule { transform: scaleX(0); }
    :host(.layout-center) { justify-items: center; text-align: center; }
    :host(.layout-left) .title-row, :host(.layout-center) .title-row { display: block; }
  `,
})
export class SectionTitle {
  readonly title = input.required<string>();
  readonly eyebrow = input<string | null>(null);
  readonly layout = input<'rule' | 'center' | 'left'>('rule');
  readonly level = input<1 | 2 | 3>(2);
}
