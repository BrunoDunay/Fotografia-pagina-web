import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SeoService } from '../../core/services/seo.service';
import { LegalType } from '../../core/types/catalog.model';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';
import { SkeletonText } from '../../components/skeletons';

const PATHS: Record<LegalType, string> = { contract: '/contract', terms: '/legal/terms', privacy: '/legal/privacy' };

/**
 * Contrato, términos y aviso de privacidad como documento diseñado (no un PDF incrustado):
 * encabezado, índice, secciones numeradas y descarga en PDF generada desde el mismo contenido.
 */
@Component({
  selector: 'app-legal-document-page',
  imports: [Btn, Icon, SkeletonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './legal-document-page.html',
  styleUrl: './legal-document-page.css',
})
export class LegalDocumentPage {
  /** Viene de `data: { type }` en la ruta (withComponentInputBinding). */
  readonly type = input.required<LegalType>();

  private readonly api = inject(PublicApiService);
  private readonly seo = inject(SeoService);

  protected readonly doc = toSignal(
    toObservable(this.type).pipe(
      switchMap((type) =>
        this.api.legal(type).pipe(
          tap((d) =>
            this.seo.setPage({
              title: `${d.title} | Armando Ovalle Wedding Studio`,
              description: d.intro?.slice(0, 160) ?? d.title,
              path: PATHS[type],
            }),
          ),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  protected readonly pdfUrl = computed(() => this.api.legalPdfUrl(this.type()));
  protected readonly updated = computed(() => {
    const d = this.doc();
    return d ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(d.updatedAt)) : '';
  });
}
