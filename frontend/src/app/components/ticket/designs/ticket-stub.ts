import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Boleto (ref. Graduaciones/Boleto de graduación): talonario "Save the date" con el día en grande. */
@Component({
  selector: 'app-ticket-stub',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="stub">
      <header class="head">
        <p class="save">Save the</p>
        <p class="date-script">Date</p>
        <p class="eyebrow">Fecha reservada</p>
      </header>

      <div class="row row--date">
        <span class="cell star" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 1c.6 6.2 4.8 10.4 11 11-6.2.6-10.4 4.8-11 11-.6-6.2-4.8-10.4-11-11 6.2-.6 10.4-4.8 11-11z" /></svg>
        </span>
        <span class="cell day">{{ v().date.day }}</span>
        <span class="cell month">
          <b>{{ v().date.month }}</b>
          <b>{{ v().date.year }}</b>
        </span>
      </div>

      <div class="row row--info">
        <span class="cell weekday">{{ v().date.weekday }}</span>
        <span class="cell service">{{ v().service ?? 'Evento' }}</span>
      </div>

      <div class="body">
        <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
        @if (v().time || v().place) {
          <p class="detail">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
        }
        @if (v().package; as pkg) {
          <p class="detail">Paquete {{ pkg }}</p>
        }
        @if (v().message; as message) {
          <p class="message">{{ message }}</p>
        }
      </div>
    </article>

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --status-scale: 0.86;
      --line: color-mix(in srgb, var(--t-ink) 55%, transparent);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 9cqw 9cqw 6cqw;
      background: linear-gradient(160deg, var(--t-main), var(--t-dark));
      color: #fbf8f4;
    }
    p, h1 { margin: 0; }
    /* Boleto: bordes dentados arriba y abajo, y muescas a los lados. */
    .stub {
      width: 100%;
      padding: 7cqw 6cqw 8cqw;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
      mask:
        radial-gradient(circle 3.4cqw at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat,
        radial-gradient(circle 3.4cqw at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat;
      mask-composite: add;
    }
    .head { position: relative; padding-bottom: 5cqw; }
    .save {
      font-family: var(--font-serif);
      font-size: 15cqw;
      font-weight: 500;
      line-height: 0.9;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      white-space: nowrap;
      /* El texto se estrecha para parecer tipografía condensada de cartel. */
      width: 128%;
      margin-left: -14%;
      transform: scaleX(0.78);
    }
    .date-script {
      position: relative;
      margin-top: -4cqw;
      font-family: var(--font-script);
      font-size: 16cqw;
      line-height: 1;
      color: var(--t-accent);
    }
    .eyebrow { margin-top: 1cqw; font-size: 2.1cqw; letter-spacing: 0.6em; text-transform: uppercase; }
    .row { display: grid; border-top: 0.3cqw solid var(--line); }
    .row--date { grid-template-columns: 1fr 1.25fr 1fr; }
    .row--info { grid-template-columns: 1fr 1.6fr; border-bottom: 0.3cqw solid var(--line); }
    .cell { display: grid; place-items: center; padding: 2.4cqw 1cqw; }
    .cell + .cell { border-left: 0.3cqw solid var(--line); }
    .star svg { width: 7cqw; height: 7cqw; fill: var(--t-accent); }
    .day { font-family: var(--font-serif); font-size: 21cqw; font-weight: 500; line-height: 0.9; transform: scaleX(0.82); }
    .month { align-content: center; gap: 0.6cqw; }
    .month b {
      display: block;
      font-family: var(--font-serif);
      font-size: 5.6cqw;
      font-weight: 500;
      line-height: 1;
      text-transform: uppercase;
      transform: scaleX(0.8);
    }
    .weekday { font-size: 2.4cqw; letter-spacing: 0.3em; text-transform: uppercase; }
    .service { font-family: var(--font-script); font-size: 6cqw; line-height: 1.1; color: var(--t-accent); }
    .body { display: grid; gap: 1.6cqw; padding-top: 5cqw; }
    .names { font-family: var(--font-script); font-weight: 400; line-height: 1.15; overflow-wrap: anywhere; }
    .detail { font-size: 2.3cqw; letter-spacing: 0.2em; text-transform: uppercase; }
    .message {
      display: -webkit-box;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.2cqw;
      font-style: italic;
      line-height: 1.3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .logo { width: 26cqw; height: auto; opacity: 0.9; }
  `,
})
export class TicketStub {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 10.5, 5.6, 16));
}
