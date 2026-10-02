import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
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

/** Alto relativo (alto / ancho) a partir de "ancho / alto". */
function relativeHeight(ratio: string): number {
  const [w, h = 1] = ratio.split('/').map(Number);
  return w > 0 ? h / w : 1;
}

const PAGE_SIZE = 24;
// Proporciones para el masonry de las fotos provisionales (simulan fotos verticales y horizontales).
const PLACEHOLDER_RATIOS = ['3 / 4', '4 / 3', '2 / 3', '1', '4 / 5', '3 / 2', '3 / 4', '4 / 3', '2 / 3', '4 / 5', '1', '3 / 4'];

/**
 * Galería reutilizable para cualquier servicio (ref. Página_de_servicios_individual/Galería):
 * masonry de 3 columnas, paginada (carga más al acercarse al final), skeletons y lightbox.
 * Cada foto va a la columna más corta: el orden elegido en el panel se lee de izquierda a derecha,
 * las columnas quedan parejas y cargar más fotos no reacomoda las anteriores.
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
  /** 3 columnas en escritorio (también en SSR), 2 en tablet y 1 en celular. */
  private readonly columnCount = signal(3);

  protected readonly columns = computed(() => {
    const count = this.columnCount();
    const columns = Array.from({ length: count }, () => ({ height: 0, items: [] as { tile: Tile; index: number }[] }));
    this.tiles().forEach((tile, index) => {
      const shortest = columns.reduce((a, b) => (b.height < a.height - 0.01 ? b : a));
      shortest.items.push({ tile, index });
      shortest.height += relativeHeight(tile.ratio);
    });
    return columns.map((c) => c.items);
  });
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

      const tablet = matchMedia('(max-width: 1000px)');
      const phone = matchMedia('(max-width: 600px)');
      const update = () => this.columnCount.set(phone.matches ? 1 : tablet.matches ? 2 : 3);
      update();
      tablet.addEventListener('change', update);
      phone.addEventListener('change', update);

      destroyRef.onDestroy(() => {
        observer.disconnect();
        tablet.removeEventListener('change', update);
        phone.removeEventListener('change', update);
      });
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
