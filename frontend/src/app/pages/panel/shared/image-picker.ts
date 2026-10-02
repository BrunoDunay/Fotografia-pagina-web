import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { ContentApiService, MediaFolder } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Media } from '../../../core/types/common.model';
import { Photo } from '../../../components/photo/photo';

const MAX_MB = 15;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

/**
 * Campo de imagen única (Hero, portada, foto de "Sobre mí"…).
 * Sube al instante y expone la imagen como `[(value)]`. Sin imagen se ve la foto provisional.
 */
@Component({
  selector: 'app-image-picker',
  imports: [Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="field__label">{{ label() }}</span>
    <div class="box" [class.is-empty]="!value()">
      <app-photo [media]="value()" [ratio]="ratio()" sizes="400px" [maxWidth]="800" />
      @if (!value()) {
        <span class="tag">Provisional</span>
      }
      @if (uploading()) {
        <span class="busy">Subiendo…</span>
      }
    </div>
    <div class="actions">
      <label class="upload">
        <input type="file" [accept]="accept" (change)="onFile($event)" [disabled]="uploading()" />
        {{ value() ? 'Cambiar imagen' : 'Subir imagen' }}
      </label>
      @if (value()) {
        <button type="button" class="remove" (click)="value.set(null)">Quitar</button>
      }
    </div>
    @if (hint()) {
      <p class="p-help">{{ hint() }}</p>
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-2); align-content: start; }
    .box { position: relative; max-width: 360px; border: var(--hairline); }
    .tag, .busy { position: absolute; left: var(--space-2); top: var(--space-2); padding: 0.1rem 0.5rem; font-size: 0.7rem; background: var(--color-surface); }
    .busy { inset: 0; display: grid; place-items: center; background: rgba(255, 255, 255, 0.75); font-size: var(--text-sm); }
    .actions { display: flex; gap: var(--space-4); font-size: var(--text-sm); }
    .upload { color: var(--color-primary); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
    .upload input { position: absolute; width: 1px; height: 1px; opacity: 0; }
    .upload:focus-within { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .remove { padding: 0; border: 0; background: none; color: var(--color-danger); }
  `,
})
export class ImagePicker {
  readonly label = input('Imagen');
  readonly folder = input<MediaFolder>('site');
  readonly ratio = input('16 / 9');
  readonly hint = input<string | null>(null);
  readonly value = model<Media | null>(null);

  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  protected readonly uploading = signal(false);
  protected readonly accept = ACCEPT;

  protected onFile(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      this.toast.error(`La imagen pesa más de ${MAX_MB} MB.`);
      return;
    }
    this.uploading.set(true);
    this.api.uploadMedia(file, this.folder()).subscribe({
      next: (media) => {
        this.value.set(media);
        this.uploading.set(false);
      },
      error: () => this.uploading.set(false),
    });
  }
}
