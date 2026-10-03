import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Calendario (refs. San Valentín/San Valentín fecha y fecha minimalista): "Save the date", fecha en grande y calendario. */
@Component({
  selector: 'app-ticket-calendar-card',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top">
      <p class="save">
        <span>Save</span>
        <small>the</small>
        <span>Date</span>
      </p>
      <p class="digits" aria-hidden="true">
        <b>{{ v().digits.day }}</b>
        <i></i>
        <b>{{ v().digits.month }}</b>
        <i></i>
        <b>{{ v().digits.year }}</b>
      </p>
    </header>

    <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
    <p class="detail">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>

    <div class="cal">
      <p class="cal__month">{{ v().date.month }} {{ v().date.year }}</p>
      <app-ticket-calendar [v]="v()" [showTitle]="false" />
    </div>

    @if (v().time || v().place) {
      <p class="detail">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
    }
    @if (v().message; as message) {
      <p class="message">{{ message }}</p>
    }

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --cal-accent: var(--t-accent);
      --cal-on: #fff;
      --cal-scale: 1.3;
      --status-scale: 0.8;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 9cqw 9cqw 6cqw;
      background: linear-gradient(170deg, #fff, var(--t-paper) 40%);
      color: var(--t-ink);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .top { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .save {
      display: grid;
      justify-items: start;
      font-family: var(--font-script);
      font-size: 15cqw;
      line-height: 0.82;
      color: var(--t-accent);
      rotate: -8deg;
    }
    .save small { margin: 0.6cqw 0 0.6cqw 9cqw; font-size: 0.42em; }
    .save span:last-child { margin-left: 5cqw; }
    .digits { display: grid; justify-items: center; gap: 1.2cqw; font-family: var(--font-serif); }
    .digits b { font-size: 15cqw; font-weight: 400; line-height: 0.84; }
    .digits i { width: 1.2cqw; height: 1.2cqw; border-radius: 50%; background: currentColor; }
    .names { font-family: var(--font-sans); font-weight: 300; letter-spacing: 0.3em; line-height: 1.35; text-transform: uppercase; overflow-wrap: anywhere; }
    .detail { font-size: 2.2cqw; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.8; }
    .cal { display: grid; justify-items: center; gap: 2cqw; }
    .cal__month { font-size: 3cqw; letter-spacing: 0.4em; text-transform: uppercase; }
    .message {
      display: -webkit-box;
      max-width: 66cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.3cqw;
      font-style: italic;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .logo { width: 25cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketCalendarCard {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 4, 2.6, 18));
}
