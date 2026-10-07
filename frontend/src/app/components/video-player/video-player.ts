import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Media } from '../../core/types/common.model';
import { cloudinaryVideo } from '../../core/utils/cloudinary-url';

/**
 * Video subido desde el panel. Respeta la proporción original (horizontal o vertical) sin recortar
 * y no descarga el archivo hasta que el visitante lo reproduce.
 */
@Component({
  selector: 'app-video-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--video-ratio]': 'ratio()' },
  template: `
    <!-- Con track por id, al cambiar de video se crea un reproductor nuevo (un <video> no relee sus <source>). -->
    @for (v of videos(); track v.id) {
      <video controls playsinline preload="metadata" [attr.poster]="v.poster || null" [attr.aria-label]="title()">
        <source [src]="v.mp4" type="video/mp4" />
        <!-- Recién subido, el MP4 optimizado puede no estar listo: el navegador pasa al archivo original. -->
        <source [src]="v.original" />
      </video>
    }
  `,
  styles: `
    :host { display: block; }
    video {
      display: block;
      /* Un video vertical se limita por alto: nunca más alto que la pantalla. */
      width: min(100%, calc(min(80svh, 760px) * var(--video-ratio, 1.7778)));
      aspect-ratio: var(--video-ratio, 1.7778);
      margin-inline: auto;
      background: var(--color-secondary);
    }
  `,
})
export class VideoPlayer {
  readonly media = input<Media | null | undefined>(null);
  readonly title = input('Video');

  protected readonly videos = computed(() => {
    const media = this.media();
    return media ? [{ id: media.id, ...cloudinaryVideo(media.url) }] : [];
  });
  protected readonly ratio = computed(() => {
    const media = this.media();
    return media?.width && media.height ? +(media.width / media.height).toFixed(4) : null;
  });
}
