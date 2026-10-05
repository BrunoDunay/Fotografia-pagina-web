import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { AllSettings } from '../../../core/types/settings.model';
import { SkeletonText } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ContentHome } from './content-home';
import { ContentAbout } from './content-about';
import { ContentContact } from './content-contact';
import { ContentBrand } from './content-brand';

type Tab = 'home' | 'about' | 'contact' | 'brand';

/** Contenido editable del sitio: Home, Sobre mí, contacto/WhatsApp, marca y SEO. */
@Component({
  selector: 'app-content',
  imports: [SkeletonText, PageHeader, ContentHome, ContentAbout, ContentContact, ContentBrand],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Contenido del sitio" subtitle="Textos e imágenes que ven tus clientes. Los cambios se publican al guardar." />

    <div class="p-tabs" role="tablist">
      @for (t of tabs; track t.value) {
        <button type="button" role="tab" class="p-tab" [class.is-active]="tab() === t.value" [attr.aria-selected]="tab() === t.value" (click)="tab.set(t.value)">
          {{ t.label }}
        </button>
      }
    </div>

    @if (settings(); as s) {
      <!-- Todas montadas (solo se ocultan) para no perder cambios al cambiar de pestaña. -->
      <app-content-home [initial]="s.home" [hidden]="tab() !== 'home'" />
      <app-content-about [initial]="s.about" [hidden]="tab() !== 'about'" />
      <app-content-contact [initial]="s.contact" [initialMessage]="s.whatsapp.message" [hidden]="tab() !== 'contact'" />
      <app-content-brand [brand]="s.brand" [seo]="s.seo" [hidden]="tab() !== 'brand'" />
    } @else if (settings() === null) {
      <p class="p-alert p-alert--danger">No se pudo cargar el contenido. Recarga la página.</p>
    } @else {
      <app-skeleton-text [lines]="8" lineHeight="1.4rem" />
    }
  `,
  styles: `:host { display: grid; gap: var(--space-5); }`,
})
export class Content {
  protected readonly tabs: { value: Tab; label: string }[] = [
    { value: 'home', label: 'Página de inicio' },
    { value: 'about', label: 'Sobre mí' },
    { value: 'contact', label: 'Contacto y WhatsApp' },
    { value: 'brand', label: 'Marca, Google y redes' },
  ];
  protected readonly tab = signal<Tab>('home');
  protected readonly settings = toSignal(inject(ContentApiService).settings().pipe(catchError(() => of(null as AllSettings | null))));
}
