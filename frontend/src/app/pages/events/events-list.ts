import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SeoService } from '../../core/services/seo.service';
import { ServiceSummary } from '../../core/types/catalog.model';
import { SectionTitle } from '../../components/section-title/section-title';
import { ServiceCard } from '../../components/cards/service-card';
import { Reveal } from '../../components/reveal/reveal.directive';
import { CtaBand } from '../../components/cta-band/cta-band';
import { SkeletonCard } from '../../components/skeletons';

@Component({
  selector: 'app-events-list',
  imports: [SectionTitle, ServiceCard, Reveal, CtaBand, SkeletonCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container head">
      <app-section-title title="Servicios" eyebrow="Lo que fotografío" [level]="1" layout="center">
        <p class="intro">
          Bodas, celebraciones, sesiones y fotografía comercial. Elige un servicio para ver su galería, paquetes y detalles.
        </p>
      </app-section-title>
    </section>

    <section class="container grid-section">
      <div class="grid">
        @if (services(); as list) {
          @for (service of list; track service.id; let i = $index) {
            <app-service-card [service]="service" [showDescription]="true" appReveal [revealDelay]="(i % 4) * 80" />
          } @empty {
            <p class="text-muted">Pronto agregaremos los servicios disponibles.</p>
          }
        } @else {
          @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
            <app-skeleton-card />
          }
        }
      </div>
    </section>

    <app-cta-band />
  `,
  styles: `
    .head { padding-top: var(--space-6); }
    .intro { max-width: 56ch; color: var(--color-text-muted); }
    .grid-section { padding-bottom: var(--section-padding); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: var(--space-8) var(--space-5); }
    @media (max-width: 600px) { .grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-6) var(--space-3); } }
  `,
})
export class EventsList {
  protected readonly services = toSignal(inject(PublicApiService).services().pipe(catchError(() => of([] as ServiceSummary[]))));

  constructor() {
    inject(SeoService).setPage({
      title: 'Servicios de fotografía | Armando Ovalle Wedding Studio',
      description: 'Fotografía de bodas, XV años, graduaciones, baby showers, conciertos, sesiones y fotografía comercial en Aguascalientes.',
      path: '/events',
    });
  }
}
