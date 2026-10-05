import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  AfterViewInit,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Media } from '../../core/types/common.model';
import { cloudinaryUrl } from '../../core/utils/cloudinary-url';
import { Icon } from '../icon/icon';

/**
 * Visor a pantalla completa: contador "15 / 48", anterior/siguiente, flechas del teclado,
 * ESC para cerrar, deslizar en móvil y precarga de la imagen siguiente.
 */
@Component({
  selector: 'app-lightbox',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'Visor de fotografías',
    '(document:keydown)': 'onKey($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'onPointerUp($event)',
  },
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>

    <p class="counter" aria-live="polite">{{ index() + 1 }} / {{ total() }}</p>
    <button #closeBtn type="button" class="btn close" (click)="closed.emit()" aria-label="Cerrar (Esc)">
      <app-icon name="close" [size]="26" />
    </button>

    <button type="button" class="btn nav prev" (click)="go(-1)" [disabled]="index() === 0" aria-label="Fotografía anterior">
      <app-icon name="chevronLeft" [size]="32" />
    </button>

    @if (current(); as item) {
      @let large = full(item);
      <figure class="stage">
        <img [src]="large" [alt]="item.alt ?? ''" />
      </figure>
    }

    <button type="button" class="btn nav next" (click)="go(1)" [disabled]="index() >= total() - 1" aria-label="Fotografía siguiente">
      <app-icon name="chevronRight" [size]="32" />
    </button>

  `,
  styles: `
    :host { position: fixed; inset: 0; z-index: var(--z-modal); height: 100dvh; animation: fade 0.25s ease-out; touch-action: pan-y; }
    @keyframes fade { from { opacity: 0; } }
    .backdrop { position: absolute; inset: 0; background: rgba(20, 16, 14, 0.94); }
    /* La celda mide exactamente el espacio libre (minmax(0, 1fr)): así el alto máximo de la foto es el de la pantalla y nunca se corta. */
    .stage { position: absolute; inset: 0; margin: 0; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; padding: 4.5rem 5rem; pointer-events: none; }
    .stage img { width: auto; height: auto; max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4); animation: photo-swap 0.45s var(--ease-out); }
    @keyframes photo-swap { from { opacity: 0; transform: scale(0.985); } }
    .btn { position: absolute; z-index: 1; display: grid; place-items: center; padding: var(--space-3); border: 0; background: none; color: var(--color-text-inverse); opacity: 0.75; transition: opacity var(--duration-fast); }
    .btn:hover:not(:disabled) { opacity: 1; }
    .btn:disabled { opacity: 0.2; cursor: default; }
    .close { top: var(--space-4); right: var(--space-4); }
    .nav { top: 50%; transform: translateY(-50%); }
    .prev { left: var(--space-3); }
    .next { right: var(--space-3); }
    .counter { position: absolute; z-index: 1; top: var(--space-5); left: 50%; transform: translateX(-50%); color: var(--color-text-inverse); font-size: var(--text-sm); letter-spacing: var(--tracking-wider); }
    @media (max-width: 700px) {
      .stage { padding: 4rem 0.5rem 4.5rem; }
      .nav { top: auto; bottom: var(--space-4); transform: none; }
    }
  `,
})
export class Lightbox implements AfterViewInit {
  readonly items = input.required<Media[]>();
  readonly index = input.required<number>();
  /** Total real de la galería (puede haber páginas aún no cargadas). */
  readonly total = input.required<number>();

  readonly indexChange = output<number>();
  readonly closed = output<void>();

  private readonly closeBtn = viewChild.required<ElementRef<HTMLButtonElement>>('closeBtn');
  private pointerStartX: number | null = null;

  protected readonly current = computed(() => this.items()[this.index()]);
  protected readonly nextItem = computed(() => this.items()[this.index() + 1]);

  private readonly document = inject(DOCUMENT);

  constructor() {
    const previousFocus = this.document.activeElement as HTMLElement | null;
    // Precarga la siguiente foto para que el cambio sea instantáneo.
    // (Con JS: Angular no permite enlazar URLs a <link>, error NG0904.)
    effect(() => {
      const next = this.nextItem();
      if (next) new Image().src = this.full(next);
    });
    // Al cerrar: devolver el scroll y el foco a la miniatura que abrió el visor.
    inject(DestroyRef).onDestroy(() => {
      this.document.body.style.overflow = '';
      previousFocus?.focus?.();
    });
  }

  /** Al abrir (solo ocurre en el navegador): bloquear el scroll de la página y llevar el foco al visor. */
  ngAfterViewInit(): void {
    this.document.body.style.overflow = 'hidden';
    this.closeBtn().nativeElement.focus();
  }

  protected full(item: Media): string {
    return cloudinaryUrl(item.url, { width: 2000 });
  }

  protected go(step: number): void {
    const next = this.index() + step;
    if (next >= 0 && next < this.total()) this.indexChange.emit(next);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closed.emit();
    else if (event.key === 'ArrowRight') this.go(1);
    else if (event.key === 'ArrowLeft') this.go(-1);
    else if (event.key === 'Tab') {
      // Mantener el foco dentro del visor.
      event.preventDefault();
      this.closeBtn().nativeElement.focus();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null) return;
    const delta = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    if (Math.abs(delta) > 50) this.go(delta < 0 ? 1 : -1);
  }
}
