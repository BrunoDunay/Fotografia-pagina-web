import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Graduación (refs. Graduaciones/Graduacion institucional y Carta a mano): año en dorado, birrete y borla. */
@Component({
  selector: 'app-ticket-grad',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="main">
      <div class="info">
        <!-- Birrete con borla -->
        <svg class="cap" viewBox="0 0 64 56" aria-hidden="true">
          <path d="M32 4L2 18l30 14 30-14z" />
          <path d="M14 26v12c0 5 8 9 18 9s18-4 18-9V26L32 34.500z" opacity="0.8" />
          <path style="fill: none; stroke: var(--t-accent); stroke-width: 1.6" d="M56 20.500v18" />
          <path d="M53.500 38h5l1.500 13h-8z" />
        </svg>

        <p class="eyebrow">Save the date</p>
        <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
        <span class="rule" aria-hidden="true"></span>
        <p class="date">{{ v().date.weekday }}</p>
        <p class="date date--big">{{ v().date.day }} de {{ v().date.month }}</p>
        @if (v().time; as time) {
          <p class="detail">{{ time }}</p>
        }
        @if (v().place; as place) {
          <p class="detail">{{ place }}</p>
        }
        @if (v().message; as message) {
          <p class="message">{{ message }}</p>
        }
      </div>

      <!-- Año en letras doradas, apilado como en un cartel -->
      <p class="year" aria-hidden="true">
        @for (digit of yearDigits(); track $index) {
          <b>{{ digit }}</b>
        }
      </p>
    </div>

    <footer class="foot">
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </footer>
  `,
  styles: `
    :host {
      --status-scale: 0.82;
      --status-font: var(--font-serif);
      --gold: linear-gradient(160deg, color-mix(in srgb, var(--t-accent) 55%, white), var(--t-accent) 45%, color-mix(in srgb, var(--t-accent) 60%, #5a3d10));

      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 9cqw 8cqw 6cqw;
      background: radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--t-main) 80%, white), var(--t-main) 50%, var(--t-dark));
      color: var(--t-paper);
    }
    p, h1 { margin: 0; }
    .main { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4cqw; min-height: 0; }
    .info { display: flex; flex-direction: column; align-items: flex-start; gap: 2.6cqw; padding-top: 2cqw; text-align: left; }
    .cap { width: 17cqw; height: 15cqw; fill: var(--t-accent); }
    .eyebrow { margin-top: 3cqw; font-size: 2.3cqw; letter-spacing: 0.4em; text-transform: uppercase; color: var(--t-accent); }
    .names { font-family: var(--font-serif); font-weight: 500; letter-spacing: 0.06em; line-height: 1.1; text-transform: uppercase; overflow-wrap: anywhere; }
    .rule { width: 12cqw; height: 0.35cqw; background: var(--t-accent); }
    .date { font-size: 2.6cqw; letter-spacing: 0.32em; text-transform: uppercase; }
    .date--big { font-family: var(--font-serif); font-size: 6cqw; letter-spacing: 0.02em; line-height: 1.1; text-transform: none; }
    .detail { font-size: 2.3cqw; letter-spacing: 0.18em; line-height: 1.5; text-transform: uppercase; opacity: 0.85; }
    .message {
      display: -webkit-box;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.3cqw;
      font-style: italic;
      line-height: 1.3;
      opacity: 0.9;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
    .year { display: grid; align-content: start; justify-items: center; }
    .year b {
      font-family: var(--font-serif);
      font-size: 33cqw;
      font-weight: 500;
      line-height: 0.78;
      background: var(--gold);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .foot { flex: none; display: grid; justify-items: center; gap: 4cqw; padding-top: 5cqw; border-top: 0.25cqw solid color-mix(in srgb, var(--t-accent) 60%, transparent); }
    .logo { width: 25cqw; height: auto; opacity: 0.9; }
  `,
})
export class TicketGrad {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 8, 4.4, 14));
  protected readonly yearDigits = computed(() => String(this.v().date.year).split(''));
}
