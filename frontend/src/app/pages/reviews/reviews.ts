import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { ReviewsApiService } from '../../core/services/api/reviews-api.service';
import { SeoService } from '../../core/services/seo.service';
import { Review } from '../../core/types/review.model';
import { environment } from '../../../environments/environment';
import { Btn } from '../../components/buttons/btn';
import { Reveal } from '../../components/reveal/reveal.directive';
import { ReviewForm } from '../../components/reviews/review-form';
import { ReviewItem } from '../../components/reviews/review-item';
import { ReviewStars } from '../../components/reviews/review-stars';
import { ReviewsSoon } from '../../components/reviews/reviews-soon';
import { SkeletonText } from '../../components/skeletons';

const PAGE = 10;

/**
 * Reseñas: a la izquierda la tarjeta para escribir la tuya (fija al hacer scroll en escritorio),
 * a la derecha las publicadas, de la más reciente a la más antigua, con la respuesta del fotógrafo.
 * El enlace que se comparte por WhatsApp y el QR de la tarjeta para historias llegan a /reviews#escribir.
 */
@Component({
  selector: 'app-reviews-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Btn, Reveal, ReviewForm, ReviewItem, ReviewStars, ReviewsSoon, SkeletonText],
  template: `
    @if (enabled) {
      <header class="head container">
        <span class="eyebrow eyebrow--dash fade-up">Reseñas</span>
        <h1 class="title fade-up">Lo que dicen <em class="serif-italic">mis clientes</em></h1>
        @if (average(); as avg) {
          <p class="score fade-up">
            <app-review-stars [rating]="round(avg)" [size]="16" />
            <strong>{{ avg }}</strong> de 5 · {{ total() }} {{ total() === 1 ? 'reseña' : 'reseñas' }}
          </p>
        }
      </header>

      <section class="section layout container">
        <div id="escribir" class="compose" appReveal="left">
          <app-review-form />
        </div>

        <div class="feed" appReveal="right" [revealDelay]="120">
          @if (reviews(); as list) {
            @if (list.length) {
              <ul aria-label="Reseñas publicadas">
                @for (r of list; track r.id) {
                  <li><app-review-item [review]="r" /></li>
                }
              </ul>
              @if (hasMore()) {
                <div class="more">
                  <button appBtn variant="outline" type="button" [loading]="loading()" (click)="more()">Ver más reseñas</button>
                </div>
              }
            } @else {
              <div class="empty">
                <p class="script empty__script">Tu historia puede ser la primera</p>
                <p class="text-muted">Todavía no hay reseñas publicadas. Si ya trabajamos juntos, me encantaría leerte.</p>
              </div>
            }
          } @else {
            @for (i of [1, 2, 3]; track i) {
              <div class="ghost"><app-skeleton-text [lines]="3" /></div>
            }
          }
        </div>
      </section>
    } @else {
      <section class="section container"><app-reviews-soon /></section>
    }
  `,
  styles: `
    :host { display: block; padding-top: var(--navbar-height); }
    .head { display: grid; justify-items: center; gap: var(--space-3); padding-top: var(--space-6); text-align: center; }
    .title { font-size: var(--text-4xl); line-height: 1.05; }
    .title em { color: var(--color-primary); }
    .score { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-2); color: var(--color-text-muted); }
    .score strong { color: var(--color-text); font-weight: 500; }
    .layout { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: clamp(2rem, 6vw, 6rem); align-items: start; padding-top: var(--space-8); }
    .compose { position: sticky; top: calc(var(--navbar-height) + var(--space-8)); padding-top: var(--space-6); scroll-margin-top: calc(var(--navbar-height) + var(--space-5)); }
    ul { list-style: none; padding: 0; margin: 0; }
    li:first-child app-review-item { padding-top: 0; }
    .more { display: flex; justify-content: center; padding-top: var(--space-6); }
    .empty { display: grid; gap: var(--space-3); padding: var(--space-8) var(--space-5); text-align: center; border: 1px dashed var(--color-border-strong); }
    .empty__script { font-size: 2.2rem; color: var(--color-primary); }
    .ghost { padding: var(--space-5) 0; border-bottom: var(--hairline); }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .compose { position: relative; top: 0; max-width: 560px; width: 100%; margin-inline: auto; }
    }
  `,
})
export class ReviewsPage {
  protected readonly enabled = environment.reviewsEnabled;
  private readonly api = inject(ReviewsApiService);
  protected readonly reviews = signal<Review[] | null>(null);
  protected readonly average = signal<number | null>(null);
  protected readonly total = signal(0);
  protected readonly hasMore = signal(false);
  protected readonly loading = signal(false);
  private page = 1;

  constructor() {
    inject(SeoService).setPage({
      title: 'Reseñas | Armando Ovalle Wedding Studio',
      description: 'Lo que dicen las parejas y familias que fotografié. Si ya trabajamos juntos, déjame tu reseña.',
      path: '/reviews',
    });
    if (this.enabled) this.load();
    // Quien llega por el enlace de WhatsApp o el QR (/reviews#escribir) aterriza directo en el formulario,
    // ya con la página acomodada (el desplazamiento automático del router ocurre antes de que termine de pintarse).
    afterNextRender(() => {
      if (location.hash === '#escribir') setTimeout(() => document.getElementById('escribir')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.published(this.page, PAGE).subscribe({
      next: (res) => {
        this.reviews.update((list) => [...(this.page === 1 ? [] : (list ?? [])), ...res.items]);
        this.average.set(res.average);
        this.total.set(res.total);
        this.hasMore.set(res.hasMore);
        this.loading.set(false);
      },
      error: () => {
        this.reviews.update((list) => list ?? []);
        this.loading.set(false);
      },
    });
  }

  protected more(): void {
    this.page++;
    this.load();
  }

  protected round(n: number): number {
    return Math.round(n);
  }
}
