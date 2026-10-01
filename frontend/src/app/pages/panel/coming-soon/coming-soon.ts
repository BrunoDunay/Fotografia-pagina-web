import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Marcador para las secciones del panel que se construyen en la Fase 4. */
@Component({
  selector: 'app-panel-coming-soon',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>En construcción</h1>
    <p class="text-muted">Esta sección del panel se construye en la Fase 4.</p>
    <a routerLink="/panel">← Volver al dashboard</a>
  `,
  styles: `
    :host { display: grid; gap: var(--space-3); }
    h1 { font-size: var(--text-3xl); }
    a { color: var(--color-primary); }
  `,
})
export class PanelComingSoon {}
