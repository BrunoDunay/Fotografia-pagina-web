import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { AdminGallery, ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { GalleryImage } from '../../../core/types/catalog.model';
import { Photo } from '../../../components/photo/photo';
import { Icon } from '../../../components/icon/icon';
import { ConfirmService } from '../shared/confirm.service';

const MAX_MB = 15;
const BATCH = 20;

/**
 * Galería de un servicio: subir varias fotos (con barra de progreso), ordenar arrastrando,
 * elegir portada y eliminar. Respeta el límite de fotos de la galería.
 */
@Component({
  selector: 'app-gallery-manager',
  imports: [CdkDropList, CdkDrag, Photo, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery-manager.html',
  styleUrl: './gallery-manager.css',
})
export class GalleryManager implements OnInit {
  readonly galleryId = input.required<string>();

  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly gallery = signal<AdminGallery | null>(null);
  protected readonly progress = signal<number | null>(null);
  protected readonly dragging = signal(false);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.gallery(this.galleryId()).subscribe((g) => this.gallery.set(g));
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.upload(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.upload(Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/')));
  }

  private upload(files: File[]): void {
    const g = this.gallery();
    if (!g || !files.length) return;

    const tooBig = files.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig.length) this.toast.error(`${tooBig.length} imagen(es) pesan más de ${MAX_MB} MB y no se subirán.`);
    let valid = files.filter((f) => f.size <= MAX_MB * 1024 * 1024);

    const available = g.maxImages - g.images.length;
    if (valid.length > available) {
      this.toast.error(`Solo caben ${available} foto(s) más en esta galería (máximo ${g.maxImages}).`);
      valid = valid.slice(0, available);
    }
    if (!valid.length) return;
    this.uploadBatches(valid, 0);
  }

  /** Sube en lotes de 20 (límite de la API por petición). */
  private uploadBatches(files: File[], start: number): void {
    const batch = files.slice(start, start + BATCH);
    if (!batch.length) {
      this.progress.set(null);
      this.load();
      return;
    }
    this.progress.set(Math.round((start / files.length) * 100));
    this.api.uploadGalleryImages(this.galleryId(), batch).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const batchShare = (event.loaded / event.total) * (batch.length / files.length) * 100;
          this.progress.set(Math.round((start / files.length) * 100 + batchShare));
        }
        if (event.type === HttpEventType.Response) {
          const failed = event.body?.failed ?? [];
          const ok = event.body?.uploaded.length ?? 0;
          if (ok) this.toast.success(`${ok} foto(s) subida(s).`);
          if (failed.length) this.toast.error(`No se pudieron subir: ${failed.map((f) => f.name).join(', ')}`);
          this.uploadBatches(files, start + BATCH);
        }
      },
      error: () => {
        this.progress.set(null);
        this.load();
      },
    });
  }

  protected setLimit(raw: string): void {
    const g = this.gallery();
    const maxImages = Math.round(Number(raw));
    if (!g || !maxImages || maxImages < 1 || maxImages > 500 || maxImages === g.maxImages) return;
    if (maxImages < g.images.length) {
      this.toast.error(`La galería ya tiene ${g.images.length} fotos; el límite no puede ser menor.`);
      return;
    }
    this.api.updateGallery(g.id, { maxImages }).subscribe(() => {
      this.gallery.set({ ...g, maxImages });
      this.toast.success(`Límite: ${maxImages} fotos.`);
    });
  }

  protected drop(event: CdkDragDrop<GalleryImage[]>): void {
    const g = this.gallery();
    if (!g || event.previousIndex === event.currentIndex) return;
    const images = [...g.images];
    moveItemInArray(images, event.previousIndex, event.currentIndex);
    this.gallery.set({ ...g, images });
    this.api.reorderGallery(g.id, images.map((i) => i.id)).subscribe();
  }

  protected setCover(image: GalleryImage): void {
    const g = this.gallery();
    if (!g) return;
    this.api.setGalleryCover(g.id, image.id).subscribe(() => {
      this.toast.success('Portada de la galería actualizada.');
      this.load();
    });
  }

  protected async remove(image: GalleryImage): Promise<void> {
    const g = this.gallery();
    if (!g) return;
    const ok = await this.confirm.ask({
      title: 'Eliminar fotografía',
      message: 'La foto se eliminará de la galería y del almacenamiento.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteGalleryImage(g.id, image.id).subscribe(() => {
      this.gallery.set({ ...g, images: g.images.filter((i) => i.id !== image.id) });
      this.toast.success('Foto eliminada.');
    });
  }
}
