import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Pase de abordar (refs. Bodas en la playa/boleto de viaje, Boda en otro sitio): boleto de viaje con sello. */
@Component({
  selector: 'app-ticket-boarding',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="pass">
      <header class="pass__head">
        <span>Save the date</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg>
      </header>

      <h1 class="names" [style.font-size]="nameSize()">
        @for (name of v().names; track $index) {
          @if (!$first) {
            <i>y</i>
          }
          <span>{{ name }}</span>
        }
      </h1>

      <dl class="fields">
        <div><dt>Fecha</dt><dd>{{ v().shortDate }}</dd></div>
        <div><dt>Día</dt><dd class="cap">{{ v().date.weekday }}</dd></div>
        @if (v().place; as place) {
          <div class="wide"><dt>Destino</dt><dd>{{ place }}</dd></div>
        }
        @if (v().time; as time) {
          <div class="wide"><dt>Hora de abordaje</dt><dd>{{ time }}</dd></div>
        }
      </dl>

      <div class="stamp" aria-hidden="true">
        <span>{{ v().digits.day }}.{{ v().digits.month }}</span>
        <small>{{ v().date.year }}</small>
      </div>

      <footer class="pass__foot">
        <span class="barcode" aria-hidden="true"></span>
        <span class="motto">Abordando una gran historia</span>
      </footer>
    </article>

    <div class="route" aria-hidden="true"></div>

    <article class="mini">
      <app-ticket-calendar [v]="v()" />
    </article>

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --cal-accent: var(--t-accent);
      --cal-on: var(--t-paper);
      --cal-scale: 0.8;
      --status-scale: 0.8;
      --notch: radial-gradient(circle 2.6cqw at 0 68%, transparent 98%, #000) left / 51% 100% no-repeat,
        radial-gradient(circle 2.6cqw at 100% 68%, transparent 98%, #000) right / 51% 100% no-repeat;

      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 7cqw 7cqw 5cqw;
      background: linear-gradient(180deg, var(--t-main), var(--t-dark));
      color: #fbf8f4;
    }
    h1, dl, dd { margin: 0; }
    .pass {
      position: relative;
      width: 100%;
      padding: 5cqw 6cqw 4cqw;
      border-radius: 1.6cqw;
      background: var(--t-paper);
      color: var(--t-ink);
      mask: var(--notch);
    }
    .pass__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 2.4cqw;
      border-bottom: 0.25cqw solid color-mix(in srgb, var(--t-ink) 35%, transparent);
      font-size: 2.2cqw;
      letter-spacing: 0.42em;
      text-transform: uppercase;
    }
    .pass__head svg { width: 5cqw; height: 5cqw; fill: var(--t-accent); rotate: 90deg; }
    .names {
      display: grid;
      justify-items: center;
      padding: 4cqw 0 3.4cqw;
      font-family: var(--font-serif);
      font-weight: 500;
      letter-spacing: 0.12em;
      line-height: 1.05;
      text-align: center;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .names i { font-family: var(--font-script); font-size: 0.7em; font-style: normal; letter-spacing: 0; line-height: 1; text-transform: none; color: var(--t-accent); }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 0.25cqw solid color-mix(in srgb, var(--t-ink) 35%, transparent); }
    .fields div { padding: 1.5cqw 2cqw; border: 0.12cqw solid color-mix(in srgb, var(--t-ink) 35%, transparent); }
    .fields .wide { grid-column: 1 / -1; }
    dt { font-size: 1.6cqw; letter-spacing: 0.26em; text-transform: uppercase; opacity: 0.7; }
    dd { margin-top: 0.4cqw; font-family: var(--font-serif); font-size: 3.5cqw; line-height: 1.15; overflow-wrap: anywhere; }
    .cap { text-transform: capitalize; }
    .stamp {
      position: absolute;
      top: 13cqw;
      right: 4cqw;
      display: grid;
      place-content: center;
      width: 15cqw;
      height: 15cqw;
      border: 0.4cqw double var(--t-accent);
      border-radius: 50%;
      color: var(--t-accent);
      font-family: var(--font-serif);
      line-height: 1;
      text-align: center;
      rotate: 14deg;
      opacity: 0.85;
    }
    .stamp span { font-size: 3.6cqw; }
    .stamp small { margin-top: 0.4cqw; font-size: 2cqw; letter-spacing: 0.2em; }
    .pass__foot {
      display: flex;
      align-items: center;
      gap: 3cqw;
      margin-top: 4.6cqw;
      padding-top: 3cqw;
      border-top: 0.35cqw dashed color-mix(in srgb, var(--t-ink) 45%, transparent);
    }
    .barcode {
      flex: none;
      width: 24cqw;
      height: 6cqw;
      background: repeating-linear-gradient(90deg, var(--t-ink) 0 0.5cqw, transparent 0.5cqw 0.9cqw, var(--t-ink) 0.9cqw 1.1cqw, transparent 1.1cqw 1.9cqw, var(--t-ink) 1.9cqw 2.7cqw, transparent 2.7cqw 3.1cqw);
    }
    .motto { font-size: 1.9cqw; letter-spacing: 0.28em; line-height: 1.5; text-transform: uppercase; }
    /* Ruta punteada del avión entre los dos boletos. */
    .route {
      width: 62cqw;
      height: 5cqw;
      border-top: 0.35cqw dashed color-mix(in srgb, var(--t-accent) 70%, transparent);
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
    .mini { display: grid; place-items: center; padding: 3.4cqw 6cqw; border-radius: 1.6cqw; background: var(--t-paper); color: var(--t-ink); }
    .logo { width: 24cqw; height: auto; opacity: 0.9; }
  `,
})
export class TicketBoarding {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 8.4, 4.4, 10));
}
