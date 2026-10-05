import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../core/types/catalog.model';

/** Acordeón accesible con <details>/<summary> (funciona incluso sin JavaScript). */
@Component({
  selector: 'app-faq-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (faq of faqs(); track faq.id; let first = $first) {
      <details class="item" [attr.open]="openFirst() && first ? '' : null">
        <summary>
          <span class="q">{{ faq.question }}</span>
          <span class="sign" aria-hidden="true"></span>
        </summary>
        <p class="a">{{ faq.answer }}</p>
      </details>
    }
  `,
  styles: `
    :host { display: block; border-top: 1px solid var(--color-border-strong); }
    .item { border-bottom: 1px solid var(--color-border-strong); }
    summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-5);
      padding: var(--space-5) 0;
      cursor: pointer;
      list-style: none;
    }
    summary::-webkit-details-marker { display: none; }
    .q { font-family: var(--font-serif); font-size: var(--text-xl); line-height: 1.3; transition: color var(--duration), transform 0.5s var(--ease-out); }
    summary:hover .q { color: var(--color-primary); transform: translateX(6px); }
    .item[open] .a { animation: answer-in 0.5s var(--ease-out); }
    @keyframes answer-in { from { opacity: 0; transform: translateY(-6px); } }
    .sign { position: relative; flex: none; width: 14px; height: 14px; }
    .sign::before, .sign::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      background: currentColor;
      transition: transform var(--duration) var(--ease-out);
    }
    .sign::after { transform: rotate(90deg); }
    .item[open] .sign::after { transform: rotate(0deg); }
    .a { max-width: 70ch; padding-bottom: var(--space-5); color: var(--color-text-muted); }
  `,
})
export class FaqList {
  readonly faqs = input.required<Faq[]>();
  readonly openFirst = input(false);
}
