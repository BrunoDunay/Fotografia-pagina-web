import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Editorial (refs. Graduaciones/Minimalista elegante, Bodas/Blanco y negro): fondo sólido, arco con monograma. */
@Component({
  selector: 'app-ticket-editorial',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="eyebrow">Save the date</p>

    <div class="arch">
      <div class="arch__inner">
        <div class="mono" aria-hidden="true">
          @for (letter of v().monogram.slice(0, 2); track $index) {
            <span>{{ letter }}</span>
          }
        </div>
        <p class="arch__date">{{ v().shortDate }}</p>
      </div>
    </div>

    <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
    <span class="rule" aria-hidden="true"></span>
    <p class="detail">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>
    @if (v().time || v().place) {
      <p class="detail detail--soft">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
    }

    <app-ticket-calendar [v]="v()" />
    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --cal-accent: var(--t-accent);
      --cal-on: var(--t-main);
      --cal-scale: 0.92;
      --status-scale: 0.82;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 9cqw 8cqw 6cqw;
      background: radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--t-main) 82%, white), var(--t-main) 55%, var(--t-dark));
      color: var(--t-paper);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .eyebrow { font-size: 2.3cqw; letter-spacing: 0.42em; text-transform: uppercase; color: var(--t-accent); }
    .arch {
      width: 46cqw;
      height: 52cqw;
      padding: 1.2cqw;
      border: 0.25cqw solid color-mix(in srgb, var(--t-paper) 75%, transparent);
      border-radius: 23cqw 23cqw 0 0;
    }
    .arch__inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2cqw;
      height: 100%;
      border: 0.25cqw solid color-mix(in srgb, var(--t-paper) 75%, transparent);
      border-radius: 22cqw 22cqw 0 0;
    }
    .mono { position: relative; display: flex; font-family: var(--font-serif); font-size: 21cqw; line-height: 0.9; }
    .mono span:nth-child(2) { margin: 7cqw 0 0 -4cqw; }
    .arch__date { font-family: var(--font-serif); font-size: 4cqw; font-style: italic; letter-spacing: 0.12em; }
    .names {
      max-width: 100%;
      font-family: var(--font-serif);
      font-weight: 400;
      letter-spacing: 0.18em;
      line-height: 1.2;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .rule { width: 9cqw; height: 0.25cqw; background: var(--t-accent); }
    .detail { font-size: 2.7cqw; letter-spacing: 0.2em; text-transform: uppercase; }
    .detail--soft { font-size: 2.3cqw; letter-spacing: 0.14em; opacity: 0.8; }
    .logo { width: 26cqw; height: auto; opacity: 0.9; }
  `,
})
export class TicketEditorial {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 6, 3.6, 16));
}
