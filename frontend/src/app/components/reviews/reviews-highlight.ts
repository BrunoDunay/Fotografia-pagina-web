import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ReviewsApiService } from '../../core/services/api/reviews-api.service';
import { ReviewPage } from '../../core/types/review.model';
import { environment } from '../../../environments/environment';
import { Btn } from '../buttons/btn';
import { Reveal } from '../reveal/reveal.directive';
import { ReviewItem } from './review-item';
import { ReviewStars } from './review-stars';
import { ReviewsSoon } from './reviews-soon';

/**
 * Sección de reseñas de la página de inicio: el promedio y solo las tres más recientes (con el texto recortado),
 * para que el inicio no crezca con cada reseña nueva. Todas se leen en su propia página, /reviews. Con el módulo apagado (producción, por ahora) muestra el aviso de "muy pronto".
 */
@Component({
  selector: 'app-reviews-highlight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Btn, Reveal, ReviewItem, ReviewStars, ReviewsSoon],
  template: `
    @if (enabled) {
      @if (page(); as p) {
        <div class="head" appReveal>
          <span class="eyebrow eyebrow--dash">Reseñas</span>
          <h2 class="title">Lo que dicen mis clientes</h2>
          @if (p.average) {
            <p class="score"><app-review-stars [rating]="round(p.average)" [size]="15" /> <strong>{{ p.average }}</strong> de 5 · {{ p.total }} {{ p.total === 1 ? 'reseña' : 'reseñas' }}</p>
          }
        </div>
        @if (p.items.length) {
          <ul class="grid">
            @for (r of p.items; track r.id; let i = $index) {
              <li class="card" appReveal [revealDelay]="i * 100"><app-review-item class="compact" [review]="r" /></li>
            }
          </ul>
        } @else {
          <p class="empty text-muted" appReveal>Pronto verás aquí lo que dicen las parejas y familias que fotografié.</p>
        }
        <div class="ctas" appReveal="fade">
          @if (p.total > 0) {
            <a appBtn variant="outline" routerLink="/reviews">Ver todas las reseñas{{ p.total > p.items.length ? ' (' + p.total + ')' : '' }}</a>
          }
          <a appBtn routerLink="/reviews" fragment="escribir">Dejar mi reseña</a>
        </div>
      }
    } @else {
      <app-reviews-soon appReveal />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-7); }
    .head { display: grid; justify-items: center; gap: var(--space-3); text-align: center; }
    .title { font-size: var(--text-3xl); }
    .score { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--space-2); color: var(--color-text-muted); }
    .score strong { color: var(--color-text); font-weight: 500; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--space-4); align-items: start; list-style: none; padding: 0; }
    .card { padding: var(--space-5); background: var(--color-surface); border: var(--hairline); transition: transform var(--duration-slow) var(--ease-out), box-shadow var(--duration-slow) var(--ease-out), border-color var(--duration) ease; }
    @media (hover: hover) { .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--color-accent); } }
    .card app-review-item { padding: 0; border: 0; }
    .empty { text-align: center; }
    .ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); }
  `,
})
export class ReviewsHighlight {
  protected readonly enabled = environment.reviewsEnabled;
  protected readonly page = toSignal(
    environment.reviewsEnabled
      ? inject(ReviewsApiService)
          .published(1, 3)
          .pipe(catchError(() => of({ items: [], total: 0, page: 1, limit: 3, hasMore: false, average: null } as ReviewPage)))
      : of(null),
  );

  protected round(n: number): number {
    return Math.round(n);
  }
}
