import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { parseVideoUrl } from '../../core/utils/video-embed';
import { PLACEHOLDER_MEDIA } from '../../core/utils/placeholder';
import { Icon } from '../icon/icon';

/**
 * Video de YouTube/Vimeo con "fachada": muestra una miniatura y solo carga el iframe
 * al hacer clic (no penaliza la carga de la página ni distrae de las fotografías).
 */
@Component({
  selector: 'app-video-embed',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (video(); as v) {
      <div class="frame">
        @if (playing()) {
          <iframe
            [src]="safeUrl()"
            [title]="title()"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
            loading="lazy"
          ></iframe>
        } @else {
          <button type="button" class="facade" (click)="playing.set(true)" [attr.aria-label]="'Reproducir video: ' + title()">
            <img [src]="v.thumbnailUrl ?? placeholder" alt="" loading="lazy" />
            <span class="play"><app-icon name="play" [size]="28" /></span>
          </button>
        }
      </div>
    }
  `,
  styles: `
    .frame { position: relative; aspect-ratio: 16 / 9; background: var(--color-secondary); overflow: hidden; }
    iframe, .facade { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .facade { padding: 0; background: none; }
    .facade img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75); transition: filter var(--duration-slow), transform 1.2s var(--ease-out); }
    .facade:hover img { filter: brightness(0.6); transform: scale(1.02); }
    .play {
      position: absolute;
      top: 50%;
      left: 50%;
      display: grid;
      place-items: center;
      width: 84px;
      height: 84px;
      border: 1px solid rgba(250, 247, 243, 0.7);
      border-radius: 50%;
      color: var(--color-text-inverse);
      transform: translate(-50%, -50%);
      transition: transform var(--duration) var(--ease-out), background-color var(--duration);
    }
    .play app-icon { margin-left: 4px; }
    .facade:hover .play { transform: translate(-50%, -50%) scale(1.08); background: rgba(250, 247, 243, 0.12); }
  `,
})
export class VideoEmbed {
  readonly url = input<string | null>(null);
  readonly title = input('Video');

  private readonly sanitizer = inject(DomSanitizer);
  protected readonly playing = signal(false);
  protected readonly placeholder = PLACEHOLDER_MEDIA.url;
  protected readonly video = computed(() => parseVideoUrl(this.url()));
  // Seguro: la URL se construye a partir de una lista blanca (YouTube/Vimeo) en parseVideoUrl.
  protected readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const v = this.video();
    return v ? this.sanitizer.bypassSecurityTrustResourceUrl(v.embedUrl) : null;
  });
}
