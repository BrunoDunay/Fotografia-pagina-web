import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SettingsStore } from '../../core/services/settings.store';
import { ThemeService } from '../../core/services/theme.service';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SeoService } from '../../core/services/seo.service';
import { SITE_URL } from '../../core/config/api.config';
import { ServiceSummary, Faq } from '../../core/types/catalog.model';
import { Photo } from '../../components/photo/photo';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';
import { Reveal } from '../../components/reveal/reveal.directive';
import { SectionTitle } from '../../components/section-title/section-title';
import { ServiceCard } from '../../components/cards/service-card';
import { PackageBrochure } from '../../components/packages/package-brochure';
import { FaqList } from '../../components/faq-list/faq-list';
import { ContactDetails } from '../../components/contact-details/contact-details';
import { CtaBand } from '../../components/cta-band/cta-band';
import { SkeletonCard, SkeletonText } from '../../components/skeletons';

/**
 * Home. Composición derivada de ideas/Home:
 * Hero (Harlow) → propuesta de valor → sobre mí (Lena) → servicios (Featured Work)
 * → paquetes (folleto) → banda de disponibilidad → FAQ → contacto.
 */
@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    Photo,
    Btn,
    Icon,
    Reveal,
    SectionTitle,
    ServiceCard,
    PackageBrochure,
    FaqList,
    ContactDetails,
    CtaBand,
    SkeletonCard,
    SkeletonText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly api = inject(PublicApiService);
  protected readonly settings = inject(SettingsStore);
  private readonly theme = inject(ThemeService);

  protected readonly home = computed(() => this.settings.settings()?.home ?? null);
  /** Un tema estacional puede sustituir la imagen del Hero. */
  protected readonly heroImage = computed(() => this.theme.active()?.heroImage ?? this.home()?.hero.image ?? null);

  protected readonly services = toSignal(this.api.services().pipe(catchError(() => of([] as ServiceSummary[]))));
  /** La Home muestra los paquetes de boda (servicio principal); cada servicio muestra los suyos en su página. */
  protected readonly weddings = toSignal(this.api.service('weddings').pipe(catchError(() => of(null))));
  protected readonly packages = computed(() => this.weddings()?.packages);
  protected readonly faqs = toSignal(this.api.faqs().pipe(catchError(() => of([] as Faq[]))));

  constructor() {
    const seo = inject(SeoService);
    const siteUrl = inject(SITE_URL);
    this.settings.load().subscribe((s) => {
      if (!s) return;
      seo.setPage({
        title: s.seo.defaultTitle,
        description: s.seo.defaultDescription,
        image: s.seo.ogImage?.url ?? s.home.hero.image?.url ?? null,
        path: '/',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: s.brand.studioName,
          founder: { '@type': 'Person', name: s.brand.photographerName },
          description: s.seo.defaultDescription,
          url: siteUrl,
          telephone: s.contact.phone,
          email: s.contact.email,
          areaServed: 'MX',
          address: { '@type': 'PostalAddress', addressLocality: 'Aguascalientes', addressCountry: 'MX' },
          sameAs: [s.contact.instagram.url, s.contact.facebook.url].filter(Boolean),
        },
      });
    });
  }
}
