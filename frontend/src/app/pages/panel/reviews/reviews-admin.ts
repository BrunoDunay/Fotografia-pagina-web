import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SITE_URL } from '../../../core/config/api.config';
import { ReviewsApiService } from '../../../core/services/api/reviews-api.service';
import { SettingsStore } from '../../../core/services/settings.store';
import { ToastService } from '../../../core/services/toast.service';
import { AdminReview, ReviewStatus, ReviewUpdate } from '../../../core/types/review.model';
import { cloudinaryUrl } from '../../../core/utils/cloudinary-url';
import { environment } from '../../../../environments/environment';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { ReviewStars } from '../../../components/reviews/review-stars';
import { initials } from '../../../components/reviews/review-item';
import { ReviewStoryCard, STORY_PALETTES, StoryPalette } from '../../../components/reviews/review-story-card';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ConfirmService } from '../shared/confirm.service';

const TABS: { id: ReviewStatus; label: string; empty: string }[] = [
  { id: 'pending', label: 'Por revisar', empty: 'No hay reseñas nuevas por revisar.' },
  { id: 'published', label: 'Publicadas', empty: 'Todavía no has publicado ninguna reseña.' },
  { id: 'hidden', label: 'Ocultas', empty: 'No hay reseñas ocultas.' },
];

const DEFAULT_MESSAGE =
  '¡Hola! Fue un gusto fotografiar tu evento. Si tienes un minuto, me encantaría leer cómo lo viviste. Puedes dejarme tu reseña aquí:';

/**
 * Reseñas en el panel:
 * - "Por revisar": lo que llegó del sitio. La foto viene difuminada (por si alguien mandó algo indebido);
 *   se ve solo si el fotógrafo lo decide. Desde ahí se publica, se oculta o se elimina.
 * - "Publicadas" y "Ocultas": se pueden responder, ocultar, volver a publicar o borrar.
 * - El texto, las estrellas, el nombre y el evento NO se pueden modificar: así las reseñas siguen siendo
 *   creíbles. El fotógrafo solo decide si se publican, las responde o quita una foto inapropiada.
 * - "Pedir reseñas": el enlace directo al formulario (para WhatsApp) y la tarjeta con QR para historias.
 * En el sitio aparecen siempre por fecha, de la más reciente a la más antigua.
 */
@Component({
  selector: 'app-reviews-admin',
  imports: [FormsModule, Btn, Icon, ReviewStars, ReviewStoryCard, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Reseñas" subtitle="Nada se publica sin que lo revises. En el sitio se muestran de la más reciente a la más antigua.">
      @if (enabled) {
        <button appBtn variant="outline" type="button" (click)="shareOpen.set(!shareOpen())">
          <app-icon name="share" [size]="16" /> Pedir reseñas
        </button>
      }
    </app-page-header>

    @if (!enabled) {
      <section class="p-card soon">
        <span class="p-badge p-badge--accent">Próximamente</span>
        <h2>Las reseñas están en camino</h2>
        <p class="p-help">
          Muy pronto tus clientes podrán dejarte una reseña desde el sitio (con estrellas, comentario, su evento y una foto).
          Aquí podrás revisarlas antes de publicarlas, responderlas y compartir un enlace o un QR para pedirlas.
        </p>
      </section>
    } @else {
      @if (shareOpen()) {
        <section class="p-card share fade-up">
          <div class="share__text">
            <h2 class="p-card__title">Pedir reseñas</h2>
            <p class="p-help">Este enlace abre directo el formulario. Mándalo por WhatsApp a tus clientes o publica la tarjeta con el QR en tus historias.</p>

            <label class="field">
              <span class="field__label">Enlace al formulario</span>
              <span class="link-row">
                <input class="field__control" [value]="formUrl" readonly (focus)="$any($event.target).select()" />
                <button appBtn variant="outline" size="sm" type="button" (click)="copy()"><app-icon name="copy" [size]="15" /> Copiar</button>
              </span>
            </label>

            <label class="field">
              <span class="field__label">Mensaje para WhatsApp</span>
              <textarea class="field__control" rows="3" [(ngModel)]="message" maxlength="500"></textarea>
            </label>
            <a appBtn [href]="whatsappUrl()" target="_blank" rel="noopener"><app-icon name="whatsapp" [size]="18" /> Enviar por WhatsApp</a>

            <div class="palettes">
              <span class="field__label">Color de la tarjeta</span>
              <div class="p-row">
                @for (p of palettes; track p.id) {
                  <button type="button" class="swatch" [class.is-on]="palette() === p.id" (click)="palette.set(p.id)" [attr.aria-pressed]="palette() === p.id">
                    <span [style.background]="p.swatch"></span>{{ p.label }}
                  </button>
                }
              </div>
            </div>
            <button appBtn variant="outline" type="button" [loading]="exporting()" (click)="downloadCard()">
              <app-icon name="download" [size]="16" /> Descargar tarjeta para historias
            </button>
          </div>
          <div class="share__card">
            <app-review-story-card #card [url]="formUrl" [palette]="palette()" [handle]="handle()" />
          </div>
        </section>
      }

      <nav class="p-tabs" aria-label="Estado de las reseñas">
        @for (t of tabs; track t.id) {
          <button type="button" class="p-tab" [class.is-active]="tab() === t.id" (click)="tab.set(t.id)">
            {{ t.label }}
            @if (counts()[t.id]) {
              <span class="p-badge" [class.p-badge--warning]="t.id === 'pending'">{{ counts()[t.id] }}</span>
            }
          </button>
        }
      </nav>

      @if (items(); as list) {
        @if (visible().length) {
          <ul class="list">
            @for (r of visible(); track r.id) {
              <li class="p-card review fade-up">
                <div class="photo">
                  @if (r.photo) {
                    <!-- Solo las que están por revisar llegan difuminadas: las publicadas u ocultas ya se vieron. -->
                    <img [src]="thumb(r.photo.url)" alt="" [class.is-blurred]="r.status === 'pending' && !revealed().has(r.id)" />
                    @if (r.status === 'pending') {
                      @if (!revealed().has(r.id)) {
                        <button type="button" class="peek" (click)="reveal(r.id)"><app-icon name="eye" [size]="16" /> Ver foto</button>
                      } @else {
                        <button type="button" class="peek peek--hide" (click)="unreveal(r.id)" aria-label="Volver a difuminar"><app-icon name="eyeOff" [size]="14" /></button>
                      }
                    }
                  } @else {
                    <span class="initials" aria-hidden="true">{{ initials(r.authorName) }}</span>
                  }
                </div>

                  <div class="body">
                    <p class="meta">
                      <strong>{{ r.authorName }}</strong>
                      <span class="p-badge p-badge--accent">{{ r.eventLabel }}</span>
                      <span class="p-help">{{ date(r.createdAt) }}</span>
                    </p>
                    <app-review-stars [rating]="r.rating" [size]="15" />
                    <p class="comment">{{ r.comment }}</p>

                    @if (replying() === r.id) {
                      <div class="reply-box">
                        <textarea class="field__control" rows="3" maxlength="1000" [(ngModel)]="replyText" placeholder="Escribe tu respuesta…"></textarea>
                        <div class="p-row">
                          <span class="p-spacer"></span>
                          <button appBtn variant="ghost" size="sm" type="button" (click)="replying.set(null)">Cancelar</button>
                          <button appBtn size="sm" type="button" [loading]="busy() === r.id" (click)="saveReply(r)">Guardar respuesta</button>
                        </div>
                      </div>
                    } @else if (r.reply) {
                      <div class="reply">
                        <p class="p-help">Tu respuesta</p>
                        <p>{{ r.reply }}</p>
                      </div>
                    }

                    <div class="actions">
                      @if (r.status !== 'published') {
                        <button appBtn size="sm" type="button" [loading]="busy() === r.id" (click)="setStatus(r, 'published')"><app-icon name="check" [size]="15" /> Publicar</button>
                      }
                      @if (r.status === 'published') {
                        <button appBtn variant="outline" size="sm" type="button" (click)="setStatus(r, 'hidden')"><app-icon name="eyeOff" [size]="15" /> Ocultar</button>
                      }
                      <button appBtn variant="outline" size="sm" type="button" (click)="startReply(r)"><app-icon name="reply" [size]="15" /> {{ r.reply ? 'Editar respuesta' : 'Responder' }}</button>
                      @if (r.photo) {
                        <button appBtn variant="ghost" size="sm" type="button" (click)="removePhoto(r)">Quitar foto</button>
                      }
                      <span class="p-spacer"></span>
                      <button type="button" class="p-icon-btn p-icon-btn--danger" (click)="remove(r)" aria-label="Eliminar reseña" title="Eliminar"><app-icon name="close" [size]="14" /></button>
                    </div>
                  </div>
              </li>
            }
          </ul>
        } @else {
          <div class="p-empty p-card">
            <p>{{ emptyText() }}</p>
            @if (tab() === 'pending') {
              <button appBtn variant="outline" size="sm" type="button" (click)="shareOpen.set(true)">Pedir reseñas a mis clientes</button>
            }
          </div>
        }
      } @else {
        <app-skeleton-table [rows]="4" [columns]="2" />
      }
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .soon { display: grid; gap: var(--space-3); justify-items: start; max-width: 46rem; }
    .soon h2 { font-size: var(--text-2xl); }

    .share { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 300px); gap: var(--space-6); align-items: start; }
    .share__text { display: grid; gap: var(--space-4); align-content: start; }
    .share__text > a, .share__text > button { justify-self: start; }
    .link-row { display: flex; gap: var(--space-2); }
    .link-row input { flex: 1; min-width: 0; font-size: var(--text-sm); }
    .palettes { display: grid; gap: var(--space-2); }
    .swatch { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); border: var(--hairline); background: var(--color-surface); font: inherit; font-size: var(--text-sm); cursor: pointer; }
    .swatch span { width: 18px; height: 18px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15); }
    .swatch.is-on { border-color: var(--color-primary); box-shadow: inset 0 0 0 1px var(--color-primary); }
    .share__card app-review-story-card { box-shadow: var(--shadow-lg); }

    .p-tab .p-badge { margin-left: var(--space-2); }
    .list { display: grid; gap: var(--space-4); list-style: none; padding: 0; }
    .review { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: var(--space-5); }
    .photo { position: relative; width: 112px; height: 112px; border-radius: 50%; overflow: hidden; background: var(--color-surface-alt); }
    .photo img { width: 100%; height: 100%; object-fit: cover; transition: filter var(--duration-slow) var(--ease-out), transform var(--duration-slow) var(--ease-out); }
    .photo img.is-blurred { filter: blur(16px) saturate(0.6); transform: scale(1.25); }
    .peek { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 2px; border: 0; background: rgba(42, 36, 33, 0.35); color: #fff; font: inherit; font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; cursor: pointer; }
    .peek--hide { inset: auto 8px 8px auto; width: 28px; height: 28px; border-radius: 50%; background: rgba(42, 36, 33, 0.55); }
    .initials { display: grid; place-items: center; width: 100%; height: 100%; font-family: var(--font-serif); font-size: 2rem; color: var(--color-primary); }
    .body { display: grid; gap: var(--space-2); min-width: 0; }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); }
    .meta strong { font-weight: 500; font-size: var(--text-lg); }
    .comment { white-space: pre-line; overflow-wrap: anywhere; }
    .reply { padding: var(--space-3) var(--space-4); background: var(--color-surface-alt); border-left: 2px solid var(--color-accent); }
    .reply-box { display: grid; gap: var(--space-2); }
    .actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin-top: var(--space-2); }

    @media (max-width: 900px) { .share { grid-template-columns: 1fr; } .share__card { max-width: 300px; } }
    @media (max-width: 560px) {
      .review { grid-template-columns: 1fr; }
      .photo { width: 96px; height: 96px; }
    }
  `,
})
export class ReviewsAdmin {
  protected readonly enabled = environment.reviewsEnabled;
  private readonly api = inject(ReviewsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly settings = inject(SettingsStore);

  protected readonly tabs = TABS;
  protected readonly palettes = STORY_PALETTES;
  protected readonly initials = initials;
  protected readonly tab = signal<ReviewStatus>('pending');
  protected readonly items = signal<AdminReview[] | null>(null);
  protected readonly counts = signal<Record<ReviewStatus, number>>({ pending: 0, published: 0, hidden: 0 });
  protected readonly visible = computed(() => (this.items() ?? []).filter((r) => r.status === this.tab()));
  protected readonly emptyText = computed(() => TABS.find((t) => t.id === this.tab())!.empty);
  protected readonly revealed = signal(new Set<string>());
  protected readonly busy = signal<string | null>(null);
  protected readonly replying = signal<string | null>(null);
  protected replyText = '';

  // Compartir
  protected readonly shareOpen = signal(false);
  protected readonly formUrl = `${inject(SITE_URL)}/reviews#escribir`;
  protected message = DEFAULT_MESSAGE;
  protected readonly palette = signal<StoryPalette>('marfil');
  protected readonly exporting = signal(false);
  protected readonly handle = computed(() => this.settings.settings()?.contact.instagram.handle || 'armandoovalle.ws');
  private readonly card = viewChild('card', { read: ElementRef<HTMLElement> });

  constructor() {
    this.settings.load().subscribe();
    if (this.enabled) this.load();
  }

  private load(): void {
    this.api.adminList().subscribe((res) => {
      this.items.set(res.items);
      this.counts.set(res.counts);
    });
  }

  /** Aplica la reseña que devolvió el servidor y recalcula los contadores. */
  private apply(updated: AdminReview): void {
    this.items.update((list) => (list ?? []).map((r) => (r.id === updated.id ? updated : r)));
    this.recount();
  }

  private recount(): void {
    const counts = { pending: 0, published: 0, hidden: 0 };
    for (const r of this.items() ?? []) counts[r.status]++;
    this.counts.set(counts);
  }

  protected thumb(url: string): string {
    return cloudinaryUrl(url, { width: 320, height: 320, crop: 'fill' });
  }

  protected date(iso: string): string {
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' }).format(new Date(iso));
  }

  protected reveal(id: string): void {
    this.revealed.update((s) => new Set(s).add(id));
  }

  protected unreveal(id: string): void {
    this.revealed.update((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }

  private patch(r: AdminReview, body: ReviewUpdate, done: string): void {
    this.busy.set(r.id);
    this.api.update(r.id, body).subscribe({
      next: (updated) => {
        this.busy.set(null);
        this.apply(updated);
        this.replying.set(null);
        this.toast.success(done);
      },
      error: () => this.busy.set(null),
    });
  }

  protected setStatus(r: AdminReview, status: ReviewStatus): void {
    this.patch(r, { status }, status === 'published' ? 'Reseña publicada en el sitio.' : 'Reseña oculta: ya no se ve en el sitio.');
  }

  protected startReply(r: AdminReview): void {
    this.replyText = r.reply ?? '';
    this.replying.set(r.id);
  }

  protected saveReply(r: AdminReview): void {
    this.patch(r, { reply: this.replyText.trim() || null }, this.replyText.trim() ? 'Respuesta guardada.' : 'Respuesta eliminada.');
  }

  protected async removePhoto(r: AdminReview): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Quitar foto', message: `La reseña de ${r.authorName} se queda, solo sin su foto.`, confirmLabel: 'Quitar foto', danger: true });
    if (!ok) return;
    this.api.removePhoto(r.id).subscribe((updated) => {
      this.apply(updated);
      this.toast.success('Foto eliminada.');
    });
  }

  protected async remove(r: AdminReview): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Eliminar reseña', message: `La reseña de ${r.authorName} se borrará para siempre (con su foto).`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    this.api.remove(r.id).subscribe(() => {
      this.items.update((list) => (list ?? []).filter((x) => x.id !== r.id));
      this.recount();
      this.toast.success('Reseña eliminada.');
    });
  }

  // ---- Compartir ----

  protected whatsappUrl(): string {
    return `https://wa.me/?text=${encodeURIComponent(`${this.message.trim()} ${this.formUrl}`)}`;
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.formUrl);
      this.toast.success('Enlace copiado.');
    } catch {
      this.toast.error('No se pudo copiar. Selecciona el enlace y cópialo a mano.');
    }
  }

  /** PNG 1080 × 1920 de la tarjeta (mismo método que la imagen del ticket). */
  protected async downloadCard(): Promise<void> {
    const element = this.card()?.nativeElement;
    if (!element || this.exporting()) return;
    this.exporting.set(true);
    try {
      const { toBlob } = await import('html-to-image');
      await document.fonts.ready;
      const blob = await toBlob(element, { pixelRatio: 1, canvasWidth: 1080, canvasHeight: 1920, style: { boxShadow: 'none' } });
      if (!blob) throw new Error('empty');
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: `resenas-qr-${this.palette()}.png` }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.toast.success('Tarjeta descargada. Súbela a tus historias.');
    } catch {
      this.toast.error('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      this.exporting.set(false);
    }
  }
}
