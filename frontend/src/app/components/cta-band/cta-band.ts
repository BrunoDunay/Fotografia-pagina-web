import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Media } from '../../core/types/common.model';
import { SettingsStore } from '../../core/services/settings.store';
import { Photo } from '../photo/photo';
import { Btn } from '../buttons/btn';

/** Banda a sangre con foto, título y acciones (disponibilidad / WhatsApp). */
@Component({
  selector: 'app-cta-band',
  imports: [RouterLink, Photo, Btn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band">
      <app-photo [media]="image()" sizes="100vw" alt="" />
      <div class="shade" aria-hidden="true"></div>
      <div class="content container container--narrow">
        @if (eyebrow()) {
          <p class="eyebrow">{{ eyebrow() }}</p>
        }
        <h2 class="title">{{ title() }}</h2>
        @if (text()) {
          <p class="text">{{ text() }}</p>
        }
        <div class="actions">
          <a appBtn variant="light" routerLink="/availability">Consultar disponibilidad</a>
          @if (settings.whatsappLink(); as wa) {
            <a appBtn variant="ghost" class="wa" [href]="wa" target="_blank" rel="noopener">Escribir por WhatsApp →</a>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .band { position: relative; display: grid; place-items: center; min-height: clamp(420px, 60vh, 640px); color: var(--color-text-inverse); overflow: hidden; }
    .shade { position: absolute; inset: 0; background: var(--color-overlay-strong); }
    .content { position: relative; display: grid; justify-items: center; gap: var(--space-4); padding-block: var(--space-9); text-align: center; }
    .eyebrow { color: var(--color-accent); }
    .title { font-size: var(--text-4xl); font-weight: 400; }
    .text { max-width: 52ch; opacity: 0.85; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); margin-top: var(--space-4); }
    .wa { color: var(--color-text-inverse); }
    .wa:hover { color: var(--color-accent); }
  `,
})
export class CtaBand {
  readonly title = input('¿Tu fecha está disponible?');
  readonly eyebrow = input<string | null>('Reserva tu fecha');
  readonly text = input<string | null>(
    'Consulta el calendario y escríbeme para apartar tu fecha. La reservación se formaliza con contrato y apartado.',
  );
  readonly image = input<Media | null>(null);

  protected readonly settings = inject(SettingsStore);
}
