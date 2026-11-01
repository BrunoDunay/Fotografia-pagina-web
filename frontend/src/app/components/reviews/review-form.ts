import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { ReviewsApiService } from '../../core/services/api/reviews-api.service';
import { ApiError } from '../../core/types/common.model';
import { Btn } from '../buttons/btn';
import { Icon } from '../icon/icon';
import { STAR_PATH } from './review-stars';

const MAX_PHOTO_MB = 6;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const RATING_WORDS = ['', 'Mejorable', 'Regular', 'Buena', 'Muy buena', '¡Excelente!'];

/**
 * La foto se reduce en el navegador a 640 px antes de enviarla: pesa poco y, al volver a dibujarla,
 * se le quitan los datos ocultos del archivo (como la ubicación GPS del celular).
 * Si el navegador no puede abrirla (HEIC en algunos equipos), se envía tal cual y el servidor la revisa.
 */
async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    return blob ? new File([blob], 'foto.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

/**
 * Formulario para dejar una reseña (estrellas, comentario, evento y foto de perfil opcional).
 * Nada se publica solo: llega al panel y el fotógrafo decide.
 * Protecciones del lado del sitio: campo trampa invisible para bots, tiempo mínimo de llenado,
 * límites de largo y de peso. El servidor vuelve a validar todo y limita los envíos por persona.
 */
@Component({
  selector: 'app-review-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Btn, Icon],
  template: `
    <div class="card">
      <span class="seal" aria-hidden="true">AO</span>

      @if (sent()) {
        <div class="thanks" role="status">
          <p class="script thanks__script">¡Gracias!</p>
          <p class="thanks__title">Tu reseña ya me llegó</p>
          <p class="text-muted">La leo con calma y la publico en unos días. Me da muchísimo gusto saber de ti.</p>
          <button appBtn variant="outline" type="button" (click)="again()">Escribir otra</button>
        </div>
      } @else {
        <p class="eyebrow ask">Déjame tu reseña</p>
        <p class="lead serif-italic">¿Cómo te sentiste con tus fotos?</p>

        <form [formGroup]="form" (ngSubmit)="send()" novalidate>
          <div class="rate" role="radiogroup" aria-label="Calificación" (mouseleave)="hover.set(0)">
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="form.controls.rating.value === s"
                [attr.aria-label]="s + (s === 1 ? ' estrella' : ' estrellas')"
                [class.on]="s <= (hover() || form.controls.rating.value)"
                (mouseenter)="hover.set(s)"
                (click)="form.controls.rating.setValue(s)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="star" /></svg>
              </button>
            }
          </div>
          <p class="rate__word" aria-live="polite">{{ ratingWord() }}</p>

          <div class="field">
            <label class="visually-hidden" for="rv-comment">Tu reseña</label>
            <textarea
              id="rv-comment"
              class="comment"
              formControlName="comment"
              rows="4"
              maxlength="1000"
              placeholder="Cuéntame cómo viviste tu sesión o tu evento…"
              [attr.aria-invalid]="invalid('comment')"
            ></textarea>
            <span class="count">{{ form.controls.comment.value.length }}/1000</span>
            @if (invalid('comment')) {
              <span class="field__error">{{ error('comment', 'Escribe al menos 10 caracteres.') }}</span>
            }
          </div>

          <div class="row">
            <div class="field">
              <label class="field__label" for="rv-name">Tu nombre</label>
              <input id="rv-name" class="field__control" formControlName="authorName" maxlength="60" autocomplete="name" placeholder="Ana y Luis" [attr.aria-invalid]="invalid('authorName')" />
              @if (invalid('authorName')) {
                <span class="field__error">{{ error('authorName', 'Escribe tu nombre.') }}</span>
              }
            </div>
            <div class="field">
              <label class="field__label" for="rv-event">Tu evento</label>
              <select id="rv-event" class="field__control" formControlName="eventLabel" [attr.aria-invalid]="invalid('eventLabel')">
                <option value="" disabled>Elige uno</option>
                @for (e of events(); track e) {
                  <option [value]="e">{{ e }}</option>
                }
              </select>
              @if (invalid('eventLabel')) {
                <span class="field__error">{{ error('eventLabel', 'Elige tu evento.') }}</span>
              }
            </div>
          </div>

          <div class="photo">
            <label class="photo__pick">
              @if (preview(); as src) {
                <img [src]="src" alt="Tu foto" />
              } @else {
                <span class="photo__empty"><app-icon name="camera" [size]="22" /></span>
              }
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" (change)="pick($event)" class="visually-hidden" />
            </label>
            <div class="photo__text">
              <p><strong>Tu foto</strong>&nbsp;<span class="text-muted">(opcional)</span></p>
              <p class="text-muted small">Aparece como tu foto de perfil junto a la reseña.</p>
              @if (preview()) {
                <button type="button" class="link-draw small" (click)="clearPhoto()">Quitar foto</button>
              }
              @if (photoError()) {
                <span class="field__error">{{ photoError() }}</span>
              }
            </div>
          </div>

          <!-- Trampa para bots: invisible para las personas (y para lectores de pantalla). -->
          <div class="trap" aria-hidden="true">
            <label>No llenes este campo <input formControlName="website" tabindex="-1" autocomplete="off" /></label>
          </div>

          <p class="consent text-muted">
            Tu reseña se publica después de que la revise. Al enviarla aceptas que tu nombre, tu foto y tu comentario
            aparezcan en este sitio (<a class="link-draw" routerLink="/legal/privacy">aviso de privacidad</a>).
          </p>

          <button appBtn type="submit" [block]="true" [loading]="sending()" [disabled]="sending()">
            Enviar reseña
          </button>
          @if (serverError()) {
            <p class="field__error center" role="alert">{{ serverError() }}</p>
          }
        </form>
      }
    </div>
    <p class="script sign" aria-hidden="true">Gracias por confiar en mí</p>
  `,
  styles: `
    :host { display: block; }
    .card { position: relative; display: grid; gap: var(--space-4); padding: var(--space-8) clamp(1.25rem, 3vw, 2.5rem) var(--space-6); background: var(--color-surface); border: var(--hairline); box-shadow: var(--shadow-md); }
    /* Doble filete de papelería fina. */
    .card::before { content: ''; position: absolute; inset: 8px; border: 1px solid var(--color-accent-soft); pointer-events: none; }
    .seal { position: absolute; top: -32px; left: 50%; translate: -50% 0; display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--color-secondary); color: var(--color-accent); font-family: var(--font-serif); font-size: 1.25rem; letter-spacing: 0.08em; box-shadow: 0 0 0 4px var(--color-background), var(--shadow-md); }
    .ask { justify-self: center; }
    .lead { text-align: center; font-size: var(--text-2xl); line-height: 1.2; margin-top: calc(-1 * var(--space-2)); }
    form { position: relative; display: grid; gap: var(--space-4); }
    .rate { display: flex; justify-content: center; gap: var(--space-1); }
    .rate button { display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 0; background: none; cursor: pointer; transition: transform var(--duration-fast) var(--ease-out); }
    .rate button:active { transform: scale(0.88); }
    .rate svg { width: 30px; height: 30px; fill: var(--color-border); transition: fill var(--duration-fast); }
    .rate button.on svg { fill: var(--color-accent); stroke: var(--color-primary); stroke-width: 0.6; }
    .rate__word { min-height: 1.4em; margin-top: calc(-1 * var(--space-3)); text-align: center; font-family: var(--font-serif); font-style: italic; color: var(--color-primary); }
    .field { position: relative; }
    .comment { width: 100%; min-height: 128px; padding: var(--space-4); border: 1px solid var(--color-border); background: var(--color-background); font: inherit; color: inherit; line-height: 1.6; resize: vertical; transition: border-color var(--duration-fast); }
    .comment:focus { outline: none; border-color: var(--color-primary); }
    .count { position: absolute; right: var(--space-3); top: calc(128px - 1.8rem); font-size: var(--text-xs); color: var(--color-text-muted); pointer-events: none; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .photo { display: flex; align-items: center; gap: var(--space-4); }
    .photo__pick { position: relative; flex: none; width: 72px; height: 72px; border-radius: 50%; overflow: hidden; cursor: pointer; box-shadow: 0 0 0 1px var(--color-border-strong); transition: box-shadow var(--duration-fast); }
    .photo__pick:hover, .photo__pick:focus-within { box-shadow: 0 0 0 2px var(--color-primary); }
    .photo__pick img { width: 100%; height: 100%; object-fit: cover; }
    .photo__empty { display: grid; place-items: center; width: 100%; height: 100%; background: var(--color-surface-alt); color: var(--color-primary); }
    .photo__text { display: grid; gap: 2px; line-height: 1.4; }
    .small { font-size: var(--text-sm); }
    .photo__text button { justify-self: start; padding: 0; border: 0; background: none; color: var(--color-primary); cursor: pointer; }
    .trap { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
    .consent { font-size: var(--text-xs); line-height: 1.6; }
    .center { text-align: center; }
    .thanks { display: grid; justify-items: center; gap: var(--space-3); padding: var(--space-4) 0; text-align: center; animation: in 600ms var(--ease-out); }
    .thanks__script { font-size: 3rem; line-height: 1; color: var(--color-primary); }
    .thanks__title { font-family: var(--font-serif); font-size: var(--text-2xl); }
    .sign { margin-top: var(--space-5); text-align: center; font-size: 2rem; color: var(--color-primary); opacity: 0.8; }
    @keyframes in { from { opacity: 0; transform: translateY(8px); } }
    @media (max-width: 520px) { .row { grid-template-columns: 1fr; } }
  `,
})
export class ReviewForm {
  readonly sentReview = output<void>();
  private readonly api = inject(ReviewsApiService);
  protected readonly star = STAR_PATH;

  protected readonly events = toSignal(
    inject(PublicApiService)
      .services()
      .pipe(
        map((list) => [...list.map((s) => s.name), 'Otro evento']),
        catchError(() => of(['Boda', 'XV años', 'Otro evento'])),
      ),
    { initialValue: [] as string[] },
  );

  protected readonly form = inject(NonNullableFormBuilder).group({
    rating: [0, [Validators.min(1)]],
    comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    authorName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    eventLabel: ['', [Validators.required]],
    website: [''],
  });

  protected readonly hover = signal(0);
  private readonly rating = toSignal(this.form.controls.rating.valueChanges, { initialValue: 0 });
  protected readonly ratingWord = computed(() => RATING_WORDS[this.hover() || this.rating()] || 'Toca las estrellas');
  protected readonly preview = signal<string | null>(null);
  protected readonly photoError = signal<string | null>(null);
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly serverError = signal<string | null>(null);
  private readonly serverFields = signal<Record<string, string>>({});
  private photo: File | null = null;
  private openedAt = 0;
  private submitted = signal(false);

  constructor() {
    afterNextRender(() => (this.openedAt = performance.now()));
  }

  protected invalid(name: 'comment' | 'authorName' | 'eventLabel'): boolean {
    const c = this.form.controls[name];
    return (c.invalid && (c.touched || this.submitted())) || !!this.serverFields()[name];
  }

  protected error(name: string, fallback: string): string {
    return this.serverFields()[name] ?? fallback;
  }

  protected async pick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.photoError.set(null);
    if (!TYPES.includes(file.type) && !/\.(heic|heif)$/i.test(file.name)) {
      this.photoError.set('Elige una foto JPG, PNG, WEBP o HEIC.');
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024 * 4) {
      this.photoError.set('La foto es demasiado pesada.');
      return;
    }
    const small = await shrinkPhoto(file);
    if (small.size > MAX_PHOTO_MB * 1024 * 1024) {
      this.photoError.set(`La foto debe pesar menos de ${MAX_PHOTO_MB} MB.`);
      return;
    }
    this.photo = small;
    const old = this.preview();
    if (old) URL.revokeObjectURL(old);
    this.preview.set(URL.createObjectURL(small));
  }

  protected clearPhoto(): void {
    const old = this.preview();
    if (old) URL.revokeObjectURL(old);
    this.preview.set(null);
    this.photo = null;
  }

  protected send(): void {
    this.submitted.set(true);
    this.serverError.set(null);
    this.serverFields.set({});
    if (this.form.controls.rating.value < 1) {
      this.serverError.set('Elige de 1 a 5 estrellas.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.sending.set(true);
    this.api
      .submit({ ...v, photo: this.photo, elapsedMs: performance.now() - this.openedAt })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.sent.set(true);
          this.sentReview.emit();
        },
        error: (e: ApiError) => {
          this.sending.set(false);
          this.serverFields.set(e.fields ?? {});
          this.serverError.set(e.fields ? 'Revisa los campos marcados.' : e.message);
        },
      });
  }

  protected again(): void {
    this.form.reset({ rating: 0, comment: '', authorName: this.form.controls.authorName.value, eventLabel: '', website: '' });
    this.clearPhoto();
    this.submitted.set(false);
    this.sent.set(false);
    this.openedAt = performance.now();
  }
}
