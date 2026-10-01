import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsStore } from '../../core/services/settings.store';
import { Icon } from '../icon/icon';

/** Datos de contacto (sin formulario público, según el brief). Todo viene del panel. */
@Component({
  selector: 'app-contact-details',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (settings.contact(); as c) {
      <ul class="list">
        <li class="who">
          <span class="who__name">{{ c.photographerName }}</span>
          <span class="who__studio">{{ c.studioName }}</span>
        </li>
        <li>
          <app-icon name="whatsapp" />
          <span class="label">WhatsApp</span>
          <a [href]="settings.whatsappLink()" target="_blank" rel="noopener">{{ c.phone ?? c.whatsapp }}</a>
        </li>
        @if (c.email) {
          <li>
            <app-icon name="mail" />
            <span class="label">Email</span>
            <a [href]="'mailto:' + c.email">{{ c.email }}</a>
          </li>
        }
        @if (c.instagram.handle) {
          <li>
            <app-icon name="instagram" />
            <span class="label">Instagram</span>
            @if (c.instagram.url) {
              <a [href]="c.instagram.url" target="_blank" rel="noopener">&#64;{{ c.instagram.handle }}</a>
            } @else {
              <span>&#64;{{ c.instagram.handle }}</span>
            }
          </li>
        }
        @if (c.facebook.name) {
          <li>
            <app-icon name="facebook" />
            <span class="label">Facebook</span>
            @if (c.facebook.url) {
              <a [href]="c.facebook.url" target="_blank" rel="noopener">{{ c.facebook.name }}</a>
            } @else {
              <span>{{ c.facebook.name }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .list { display: grid; list-style: none; }
    li {
      display: grid;
      grid-template-columns: auto 7rem 1fr;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) 0;
      border-bottom: var(--hairline);
    }
    li app-icon { color: var(--color-primary); }
    .label { font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); }
    a, li > span:last-child { font-weight: 400; overflow-wrap: anywhere; }
    a:hover { color: var(--color-primary); }
    .who { display: grid; grid-template-columns: 1fr; gap: 0; padding-top: 0; }
    .who__name { font-family: var(--font-serif); font-size: var(--text-2xl); }
    .who__studio { font-size: var(--text-xs); letter-spacing: var(--tracking-wider); text-transform: uppercase; color: var(--color-text-muted); }
    @media (max-width: 480px) {
      li { grid-template-columns: auto 1fr; }
      .label { display: none; }
    }
  `,
})
export class ContactDetails {
  protected readonly settings = inject(SettingsStore);
}
