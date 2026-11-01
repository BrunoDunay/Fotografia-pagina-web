import { ChangeDetectionStrategy, Component } from '@angular/core';
import { STAR_PATH } from './review-stars';

/**
 * Mientras las reseñas no se activan en producción: tres "comentarios" en esqueleto con brillo
 * y el aviso de que vienen pronto. Deja ver que la sección existe sin mostrar nada a medias.
 */
@Component({
  selector: 'app-reviews-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <span class="eyebrow eyebrow--dash">Reseñas</span>
      <h2 class="title">Lo que dicen mis clientes</h2>
      <p class="soon"><span class="dot" aria-hidden="true"></span> Muy pronto podrás leer y dejar reseñas aquí</p>
    </div>
    <ul class="list" aria-hidden="true">
      @for (i of [1, 2, 3]; track i) {
        <li class="item" [style.--d]="i * 160 + 'ms'">
          <span class="skeleton avatar"></span>
          <div class="lines">
            <span class="skeleton line" style="width: 38%"></span>
            <span class="stars">
              @for (s of [1, 2, 3, 4, 5]; track s) {
                <svg viewBox="0 0 24 24"><path [attr.d]="star" /></svg>
              }
            </span>
            <span class="skeleton line"></span>
            <span class="skeleton line" [style.width]="i === 2 ? '72%' : '88%'"></span>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    :host { display: grid; gap: var(--space-7); }
    .head { display: grid; justify-items: center; gap: var(--space-3); text-align: center; }
    .title { font-size: var(--text-3xl); }
    .soon { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); border: var(--hairline); border-radius: var(--radius-pill); background: var(--color-surface); font-size: var(--text-sm); color: var(--color-text-muted); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); animation: pulse 1.8s ease-in-out infinite; }
    .list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-4); list-style: none; padding: 0; }
    .item { display: grid; grid-template-columns: 52px 1fr; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: var(--hairline); animation: float 4.5s ease-in-out infinite; animation-delay: var(--d); }
    .avatar { width: 52px; height: 52px; border-radius: 50%; }
    .lines { display: grid; gap: var(--space-2); align-content: start; }
    .line { display: block; height: 0.8em; }
    .stars { display: flex; gap: 2px; }
    .stars svg { width: 13px; height: 13px; fill: var(--color-accent-soft); }
    @keyframes pulse { 50% { opacity: 0.35; transform: scale(0.8); } }
    @keyframes float { 50% { transform: translateY(-4px); } }
    @media (prefers-reduced-motion: reduce) { .item, .dot { animation: none; } }
  `,
})
export class ReviewsSoon {
  protected readonly star = STAR_PATH;
}
