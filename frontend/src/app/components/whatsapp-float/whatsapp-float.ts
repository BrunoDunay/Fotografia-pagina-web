import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsStore } from '../../core/services/settings.store';
import { Icon } from '../icon/icon';

/** Botón flotante de WhatsApp con el mensaje genérico editable desde el panel. */
@Component({
  selector: 'app-whatsapp-float',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (settings.whatsappLink(); as link) {
      <a class="fab" [href]="link" target="_blank" rel="noopener" aria-label="Escríbeme por WhatsApp">
        <span class="label">¿Hablamos?</span>
        <app-icon name="whatsapp" [size]="26" />
      </a>
    }
  `,
  styles: `
    .fab {
      position: fixed;
      right: calc(var(--space-5) + env(safe-area-inset-right, 0px));
      bottom: calc(var(--space-5) + env(safe-area-inset-bottom, 0px));
      z-index: var(--z-float);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      height: 56px;
      padding: 0 15px;
      border-radius: var(--radius-pill);
      background: var(--color-secondary);
      color: var(--color-text-inverse);
      box-shadow: var(--shadow-lg);
      transition: transform var(--duration) var(--ease-out), background-color var(--duration);
    }
    .fab:hover { transform: translateY(-2px); background: var(--color-primary); }
    .label {
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      transition: max-width var(--duration-slow) var(--ease-out);
    }
    .fab:hover .label, .fab:focus-visible .label { max-width: 8rem; }
    @media (max-width: 600px) {
      .fab { right: var(--space-4); bottom: var(--space-4); height: 52px; padding: 0 13px; }
    }
  `,
})
export class WhatsappFloat {
  protected readonly settings = inject(SettingsStore);
}
