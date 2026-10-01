import { ChangeDetectionStrategy, Component, RESPONSE_INIT, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsStore } from '../../core/services/settings.store';
import { SITE_URL } from '../../core/config/api.config';
import { ServicePage } from '../../core/types/catalog.model';
import { Photo } from '../../components/photo/photo';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';
import { Reveal } from '../../components/reveal/reveal.directive';
import { SectionTitle } from '../../components/section-title/section-title';
import { PackageBrochure } from '../../components/packages/package-brochure';
import { MasonryGallery } from '../../components/gallery/masonry-gallery';
import { VideoEmbed } from '../../components/video-embed/video-embed';
import { FaqList } from '../../components/faq-list/faq-list';
import { CtaBand } from '../../components/cta-band/cta-band';
import { SkeletonText } from '../../components/skeletons';
import { NotFound } from '../not-found/not-found';

type LoadState = { status: 'loading' } | { status: 'ready'; service: ServicePage } | { status: 'missing' };

/**
 * Página individual de servicio (/events/:slug).
 * Hero (ref. Página_de_servicios_individual/Hero) → información → video → paquetes → galería → CTA → FAQ.
 */
@Component({
  selector: 'app-event-detail',
  imports: [
    RouterLink,
    Photo,
    Btn,
    Icon,
    Reveal,
    SectionTitle,
    PackageBrochure,
    MasonryGallery,
    VideoEmbed,
    FaqList,
    CtaBand,
    SkeletonText,
    NotFound,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail {
  /** Viene del parámetro de ruta :slug (withComponentInputBinding). */
  readonly slug = input.required<string>();

  private readonly api = inject(PublicApiService);
  private readonly seo = inject(SeoService);
  private readonly siteUrl = inject(SITE_URL);
  private readonly response = inject(RESPONSE_INIT, { optional: true });
  protected readonly settings = inject(SettingsStore);

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        this.api.service(slug).pipe(
          map((service): LoadState => ({ status: 'ready', service })),
          catchError(() => of<LoadState>({ status: 'missing' })),
          tap((s) => s.status === 'missing' && this.response && (this.response.status = 404)),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState },
  );

  protected readonly service = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.service : null;
  });

  /** Título del Hero: si contiene " y " / " & ", la conjunción va en itálica como en la referencia. */
  protected readonly heroTitleParts = computed(() => {
    const title = this.service()?.heroTitle || this.service()?.name || '';
    const match = title.match(/^(.*?)\s+(y|&)\s+(.*)$/i);
    return match ? { first: match[1], joiner: match[2], second: match[3] } : { first: title, joiner: null, second: null };
  });

  protected readonly descriptionParagraphs = computed(() =>
    (this.service()?.description ?? '').split(/\n{2,}/).filter((p) => p.trim()),
  );

  constructor() {
    effect(() => {
      const service = this.service();
      if (!service) return;
      const title = service.seoTitle || `Fotografía de ${service.name.toLowerCase()} | Armando Ovalle Wedding Studio`;
      const description =
        service.seoDescription || service.shortDescription || `Fotografía de ${service.name.toLowerCase()} en Aguascalientes y todo México.`;
      this.seo.setPage({
        title,
        description,
        image: service.hero?.url ?? service.cover?.url ?? null,
        path: `/events/${service.slug}`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `Fotografía de ${service.name}`,
          serviceType: service.name,
          description,
          url: `${this.siteUrl}/events/${service.slug}`,
          provider: { '@type': 'ProfessionalService', name: 'Armando Ovalle Wedding Studio' },
          areaServed: 'MX',
        },
      });
    });
  }
}
