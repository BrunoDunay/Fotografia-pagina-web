import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Media, isApiError } from '../../../core/types/common.model';
import { VideoPlayer } from '../../../components/video-player/video-player';

const MAX_MB = 100;
const ACCEPT = 'video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.m4v,.webm';
const EXTENSIONS = /\.(mp4|mov|m4v|webm)$/i;

/**
 * Campo de video único. Sube el archivo directo al almacenamiento (con barra de avance)
 * y lo expone como `[(value)]`. Sin video, la página pública no muestra la sección.
 */
@Component({
  selector: 'app-video-picker',
  imports: [VideoPlayer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="field__label">{{ label() }}</span>
    <div class="box">
      @if (value(); as video) {
        <app-video-player [media]="video" title="Vista previa" />
      } @else if (progress() === null) {
        <p class="empty">Sin video. La página del servicio no muestra esta sección.</p>
      }
      @if (progress() !== null) {
        <div class="busy">
          <span>{{ progress()! < 100 ? 'Subiendo… ' + progress() + '%' : 'Procesando el video…' }}</span>
          <div class="bar" role="progressbar" [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100">
            <span [style.width.%]="progress()"></span>
          </div>
        </div>
      }
    </div>
    <div class="actions">
      <label class="upload" [class.is-disabled]="progress() !== null">
        <input type="file" [accept]="accept" (change)="onFile($event)" [disabled]="progress() !== null" />
        {{ value() ? 'Cambiar video' : 'Subir video' }}
      </label>
      @if (value() && progress() === null) {
        <button type="button" class="remove" (click)="value.set(null)">Quitar</button>
      }
    </div>
    <p class="p-help">
      MP4 o MOV, hasta {{ maxMb }} MB (es el tope del almacenamiento). Para que quepa un video más largo, expórtalo en
      1080p (Full HD) a unos 8 Mbps: así entran cerca de 1 minuto y 40 segundos, sin diferencia visible en la página.
      No cierres esta página mientras se sube.
    </p>
  `,
  styles: `
    :host { display: grid; gap: var(--space-2); align-content: start; }
    .box { position: relative; max-width: 640px; min-height: 9rem; border: var(--hairline); background: var(--color-surface-alt); }
    .empty { display: grid; place-items: center; min-height: 9rem; padding: var(--space-4); font-size: var(--text-sm); color: var(--color-text-muted); text-align: center; }
    .busy { position: absolute; inset: 0; display: grid; place-content: center; gap: var(--space-3); padding: var(--space-5); background: rgba(255, 255, 255, 0.88); font-size: var(--text-sm); text-align: center; }
    .bar { width: min(70vw, 320px); height: 4px; background: var(--color-border-strong); }
    .bar span { display: block; height: 100%; background: var(--color-primary); transition: width var(--duration-fast); }
    .actions { display: flex; gap: var(--space-4); font-size: var(--text-sm); }
    .upload { color: var(--color-primary); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
    .upload.is-disabled { opacity: 0.5; cursor: default; }
    .upload input { position: absolute; width: 1px; height: 1px; opacity: 0; }
    .upload:focus-within { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .remove { padding: 0; border: 0; background: none; color: var(--color-danger); }
  `,
})
export class VideoPicker {
  readonly label = input('Video');
  readonly value = model<Media | null>(null);

  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  /** null = sin subida en curso; 0-100 = avance. */
  protected readonly progress = signal<number | null>(null);
  protected readonly accept = ACCEPT;
  protected readonly maxMb = MAX_MB;

  protected onFile(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/') && !EXTENSIONS.test(file.name)) {
      this.toast.error('Ese archivo no es un video. Usa MP4 o MOV.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      this.toast.error(`El video pesa ${Math.round(file.size / 1024 / 1024)} MB y el máximo es ${MAX_MB} MB. Expórtalo en 1080p a unos 8 Mbps y vuelve a subirlo.`);
      return;
    }
    this.progress.set(0);
    this.api.uploadVideo(file).subscribe({
      next: (step) => {
        if (typeof step === 'number') this.progress.set(step);
        else this.value.set(step);
      },
      error: (error: unknown) => {
        this.progress.set(null);
        // Los errores de nuestra API ya los avisa el interceptor; aquí solo los del almacenamiento.
        if (!isApiError(error)) this.toast.error(error instanceof Error ? error.message : 'No se pudo subir el video.');
      },
      complete: () => this.progress.set(null),
    });
  }
}
