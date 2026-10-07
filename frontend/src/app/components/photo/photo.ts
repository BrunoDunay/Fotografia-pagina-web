import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Media } from '../../core/types/common.model';
import { orPlaceholder } from '../../core/utils/placeholder';
import { RESPONSIVE_WIDTHS, cloudinarySrcset, cloudinaryUrl } from '../../core/utils/cloudinary-url';

/**
 * Imagen del sitio: optimizada (Cloudinary f_auto/q_auto + srcset), con lazy loading,
 * fondo de skeleton mientras carga y aparición suave. Sin imagen → foto provisional.
 *
 * - `ratio`: fija la proporción (evita saltos de layout). Sin ratio, la foto llena al contenedor.
 * - `priority`: para la imagen principal visible al cargar (Hero): carga inmediata.
 *
 * La aparición es solo CSS: la imagen nunca depende de JavaScript para hacerse visible
 * (funciona igual con SSR, antes de hidratar o sin JS).
 */
@Component({
  selector: 'app-photo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.aspect-ratio]': 'ratio()',
    '[class.fill]': '!ratio()',
  },
  template: `
    <img
      [src]="src()"
      [attr.srcset]="srcset() || null"
      [attr.sizes]="srcset() ? sizes() : null"
      [alt]="altText()"
      [attr.width]="image().width"
      [attr.height]="image().height"
      [attr.loading]="priority() ? 'eager' : 'lazy'"
      [attr.fetchpriority]="priority() ? 'high' : null"
      decoding="async"
      [style.object-position]="position()"
    />
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      overflow: hidden;
      background: var(--color-skeleton);
    }
    :host(.fill) { position: absolute; inset: 0; }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: photo-in 0.9s var(--ease-out) both;
    }
    @keyframes photo-in {
      from { opacity: 0; transform: scale(1.015); }
    }
  `,
})
export class Photo {
  readonly media = input<Media | null | undefined>(null);
  readonly alt = input<string | null>(null);
  readonly ratio = input<string | null>(null);
  readonly sizes = input('100vw');
  readonly priority = input(false);
  readonly position = input('center');
  /** Ancho máximo a pedir a Cloudinary para el src por defecto. */
  readonly maxWidth = input(1600);

  protected readonly image = computed(() => orPlaceholder(this.media()));
  protected readonly src = computed(() => cloudinaryUrl(this.image().url, { width: this.maxWidth() }));
  /** Sin anchos mayores al tope pedido ni a la foto original (Cloudinary no amplía: serían archivos repetidos). */
  protected readonly srcset = computed(() => {
    const limit = Math.min(this.maxWidth(), this.image().width || Infinity);
    const widths = RESPONSIVE_WIDTHS.filter((w) => w <= limit);
    return cloudinarySrcset(this.image().url, widths.length ? widths : [RESPONSIVE_WIDTHS[0]]);
  });
  protected readonly altText = computed(() => this.alt() ?? this.image().alt ?? '');
}
