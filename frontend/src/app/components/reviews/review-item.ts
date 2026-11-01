import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SettingsStore } from '../../core/services/settings.store';
import { Review } from '../../core/types/review.model';
import { cloudinaryUrl } from '../../core/utils/cloudinary-url';
import { ReviewStars } from './review-stars';

/** "hace 3 días", "hace 2 meses"… como en los comentarios de Instagram. */
export function timeAgo(iso: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  const years = Math.floor(days / 365);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/**
 * Una reseña publicada, al estilo de un comentario: foto de perfil (o iniciales), nombre, evento, estrellas,
 * el texto y, si la hay, la respuesta del fotógrafo debajo.
 */
@Component({
  selector: 'app-review-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReviewStars],
  template: `
    @if (avatar(); as src) {
      <img class="avatar" [src]="src" alt="" width="52" height="52" loading="lazy" />
    } @else {
      <span class="avatar avatar--initials" aria-hidden="true">{{ initials(review().authorName) }}</span>
    }
    <div class="body">
      <p class="meta">
        <strong>{{ review().authorName }}</strong>
        <span class="event">{{ review().eventLabel }}</span>
      </p>
      <app-review-stars [rating]="review().rating" [size]="13" />
      <p class="comment">{{ review().comment }}</p>
      <p class="when">{{ ago() }}</p>

      @if (review().reply) {
        <div class="reply">
          <span class="avatar avatar--studio" aria-hidden="true"><img src="/icon-192.png" alt="" width="192" height="192" /></span>
          <div>
            <p class="meta">
              <strong>{{ studioHandle() }}</strong>
              <svg class="verified" viewBox="0 0 24 24" width="13" height="13" aria-label="Respuesta del fotógrafo">
                <path d="M12 2.5l2.4 1.7 2.9-.1.9 2.8 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-.9 2.8-2.9-.1L12 21.5l-2.4-1.7-2.9.1-.9-2.8-2.4-1.7.9-2.8-.9-2.8 2.4-1.7.9-2.8 2.9.1z" />
                <path class="tick" d="M8.5 12l2.3 2.3 4.7-4.6" />
              </svg>
            </p>
            <p class="comment">{{ review().reply }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: var(--space-4); padding: var(--space-5) 0; border-bottom: var(--hairline); }
    .avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 2px var(--color-background), 0 0 0 3px var(--color-accent); }
    .avatar--initials { display: grid; place-items: center; background: var(--color-accent-soft); color: var(--color-primary); font-family: var(--font-serif); font-size: 1.15rem; letter-spacing: 0.04em; }
    .body { display: grid; gap: var(--space-1); min-width: 0; }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 2px var(--space-3); line-height: 1.3; }
    .meta strong { font-weight: 500; }
    .event { font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); }
    .comment { margin-top: var(--space-1); white-space: pre-line; overflow-wrap: anywhere; color: var(--color-text); }
    .when { font-size: var(--text-xs); color: var(--color-text-muted); }
    .reply { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: var(--space-3); margin-top: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-surface-alt); border-left: 2px solid var(--color-accent); }
    .reply .avatar { width: 36px; height: 36px; box-shadow: none; }
    .avatar--studio { display: grid; place-items: center; background: var(--color-secondary); }
    .avatar--studio img { width: 64%; height: auto; }
    /* En el inicio las reseñas largas se cortan: la completa se lee en la página de Reseñas. */
    :host(.compact) .body > .comment { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    :host(.compact) .reply .comment { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .reply .comment { margin-top: 2px; font-size: var(--text-sm); }
    .verified { fill: var(--color-primary); }
    .verified .tick { fill: none; stroke: var(--color-text-inverse); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  `,
})
export class ReviewItem {
  readonly review = input.required<Review>();
  private readonly settings = inject(SettingsStore);
  protected readonly initials = initials;
  protected readonly avatar = computed(() => {
    const url = this.review().photo?.url;
    return url ? cloudinaryUrl(url, { width: 160, height: 160, crop: 'fill' }) : null;
  });
  protected readonly ago = computed(() => timeAgo(this.review().createdAt));
  protected readonly studioHandle = computed(() => this.settings.settings()?.contact.instagram.handle || 'armandoovalle.ws');
}
