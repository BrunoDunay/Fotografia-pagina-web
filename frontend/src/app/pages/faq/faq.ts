import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsStore } from '../../core/services/settings.store';
import { Faq as FaqItem } from '../../core/types/catalog.model';
import { SectionTitle } from '../../components/section-title/section-title';
import { FaqList } from '../../components/faq-list/faq-list';
import { Btn } from '../../components/buttons/btn';
import { SkeletonText } from '../../components/skeletons';

@Component({
  selector: 'app-faq',
  imports: [SectionTitle, FaqList, Btn, SkeletonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container container--narrow page">
      <app-section-title title="Preguntas frecuentes" eyebrow="FAQ" [level]="1" layout="center" />
      @if (faqs(); as list) {
        <app-faq-list [faqs]="list" [openFirst]="true" />
      } @else {
        <app-skeleton-text [lines]="8" lineHeight="1.6rem" />
      }
      <div class="more">
        <p class="text-muted">¿Tienes otra pregunta?</p>
        <a appBtn [href]="settings.whatsappLink()" target="_blank" rel="noopener">Escríbeme por WhatsApp</a>
      </div>
    </section>
  `,
  styles: `
    .page { padding-bottom: var(--section-padding); }
    .more { display: grid; justify-items: center; gap: var(--space-4); margin-top: var(--space-8); text-align: center; }
  `,
})
export class Faq {
  protected readonly settings = inject(SettingsStore);
  private readonly seo = inject(SeoService);

  protected readonly faqs = toSignal(
    inject(PublicApiService)
      .faqs()
      .pipe(
        tap((list) => this.setSeo(list)),
        catchError(() => of([] as FaqItem[])),
      ),
  );

  private setSeo(list: FaqItem[]): void {
    this.seo.setPage({
      title: 'Preguntas frecuentes | Armando Ovalle Wedding Studio',
      description: 'Tiempos de entrega, contrato, apartado de fecha, eventos fuera de Aguascalientes y más.',
      path: '/faq',
      // Datos estructurados FAQPage: pueden mostrarse directamente en Google.
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: list.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
    });
  }
}
