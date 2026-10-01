import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsStore } from '../../core/services/settings.store';
import { SeoService } from '../../core/services/seo.service';
import { ContactDetails } from '../../components/contact-details/contact-details';
import { Photo } from '../../components/photo/photo';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';

/** Contacto sin formulario público (según el brief): WhatsApp, email y redes. */
@Component({
  selector: 'app-contact',
  imports: [RouterLink, ContactDetails, Photo, Btn, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container page">
      <div class="media">
        <app-photo [media]="settings.settings()?.home?.aboutTeaser?.image" ratio="3 / 4" sizes="(max-width: 900px) 100vw, 40vw" />
      </div>
      <div class="content">
        <p class="eyebrow eyebrow--dash">Contacto</p>
        <h1 class="title">Hablemos de tu evento</h1>
        <p class="text-muted lead">
          Cuéntame la fecha, el lugar y el tipo de evento. Te respondo con disponibilidad y opciones. Trabajo en Aguascalientes,
          en todo México y fuera del país con cotización personalizada.
        </p>
        <div class="actions">
          <a appBtn [href]="settings.whatsappLink()" target="_blank" rel="noopener"><app-icon name="whatsapp" [size]="18" /> WhatsApp</a>
          <a appBtn variant="outline" routerLink="/availability">Ver disponibilidad</a>
        </div>
        <app-contact-details />
      </div>
    </section>
  `,
  styles: `
    .page {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: clamp(2rem, 6vw, 6rem);
      align-items: center;
      padding-bottom: var(--section-padding);
    }
    .content { display: grid; gap: var(--space-4); }
    .title { font-size: var(--text-4xl); }
    .lead { max-width: 50ch; }
    .actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin: var(--space-3) 0 var(--space-6); }
    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .media { max-width: 420px; }
    }
  `,
})
export class Contact {
  protected readonly settings = inject(SettingsStore);

  constructor() {
    inject(SeoService).setPage({
      title: 'Contacto | Armando Ovalle Wedding Studio',
      description: 'Contacta a Jorge Armando Ovalle por WhatsApp, email, Instagram o Facebook.',
      path: '/contact',
    });
  }
}
