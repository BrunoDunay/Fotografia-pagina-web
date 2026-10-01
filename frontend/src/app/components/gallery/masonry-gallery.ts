import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { Media } from '../../core/types/common.model';
import { PLACEHOLDER_MEDIA } from '../../core/utils/placeholder';
import { Photo } from '../photo/photo';
import { SkeletonGallery } from '../skeletons';
import { Lightbox } from './lightbox';

interface Tile extends Media {
  ratio: string;
}

const PAGE_SIZE = 24;
// Proporciones para el masonry de las fotos provisionales (simulan fotos verticales y horizontales).
const PLACEHOLDER_RATIOS = ['3 / 4', '4 / 3', '2 / 3', '1', '4 / 5', '3 / 2', '3 / 4', '4 / 3', '2 / 3', '4 / 5', '1', '3 / 4'];

/**
 * Galería reutilizable para cualquier servicio (ref. Página_de_servicios_individual/Galería):
 * masonry de 3 columnas, paginada (carga más al acercarse al final), skeletons y lightbox.
 * Si el servicio aún no tiene fotos, muestra fotos provisionales para previsualizar el diseño.
 */
@Component({
  selector: 'app-masonry-gallery',
  imports: [Photo, SkeletonGallery, Lightbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './masonry-gallery.html',
  styleUrl: './masonry-gallery.css',
})
export class MasonryGallery implements OnInit {
  readonly serviceSlug = input.required<string>();
  readonly title = input('Galería');

  private readonly api = inject(PublicApiService);
  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');

  protected readonly tiles = signal<Tile[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly openIndex = signal<number | null>(null);
  private page = 0;
  private hasMore = true;
  private inFlight = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Scroll infinito: solo en el navegador.
    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && this.loadNext(), {
        rootMargin: '600px 0px',
      });
      observer.observe(this.sentinel().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  ngOnInit(): void {
    // La primera página también se renderiza en SSR (SEO y carga inicial rápida).
    this.loadNext();
  }

  protected loadNext(): void {
    if (this.inFlight || !this.hasMore) return;
    this.inFlight = true;
    this.loading.set(true);

    this.api.galleryImages(this.serviceSlug(), this.page + 1, PAGE_SIZE).subscribe({
      next: (res) => {
        this.page = res.page;
        this.hasMore = res.hasMore;
        if (res.total === 0) {
          this.usePlaceholders();
        } else {
          this.total.set(res.total);
          this.tiles.update((list) => [
            ...list,
            ...res.items.map((img) => ({ ...img, ratio: img.width && img.height ? `${img.width} / ${img.height}` : '3 / 4' })),
          ]);
        }
        this.finish();
      },
      error: () => {
        if (this.page === 0) this.usePlaceholders();
        this.hasMore = false;
        this.finish();
      },
    });
  }

  private finish(): void {
    this.inFlight = false;
    this.loading.set(false);
  }

  private usePlaceholders(): void {
    this.hasMore = false;
    this.total.set(PLACEHOLDER_RATIOS.length);
    this.tiles.set(PLACEHOLDER_RATIOS.map((ratio, i) => ({ ...PLACEHOLDER_MEDIA, id: `placeholder-${i}`, ratio })));
  }

  protected setIndex(index: number): void {
    this.openIndex.set(index);
    // Pedir la siguiente página cuando el visor se acerca al final de lo cargado.
    if (index >= this.tiles().length - 3) this.loadNext();
  }
}
