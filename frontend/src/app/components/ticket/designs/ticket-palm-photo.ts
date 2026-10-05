import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Palmera real (ref. Bodas en la playa/Diseño palmeras): la misma composición que "Palmeras",
 * pero con una palmera fotografiada (public/tickets/palm.webp) en lugar de hojas vectoriales.
 */
@Component({
  selector: 'app-ticket-palm-photo',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="art" aria-hidden="true">
      <img class="tree" src="/tickets/palm.webp" alt="" />
      <img class="fronds" src="/tickets/palm.webp" alt="" />
    </div>

    <header class="crest">
      <img src="/tickets/palm.webp" alt="" aria-hidden="true" />
      <p class="mono">
        @for (letter of v().monogram.slice(0, 2); track $index) {
          @if (!$first) {
            <i></i>
          }
          <span>{{ letter }}</span>
        }
      </p>
    </header>

    <p class="lead">reserva la fecha para celebrar a</p>

    <h1 class="names" [style.font-size]="nameSize()">
      @for (name of v().names; track $index) {
        @if (!$first) {
          <i>y</i>
        }
        <span>{{ name }}</span>
      }
    </h1>

    <div class="details">
      <p>{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}, {{ v().date.year }}</p>
      @if (v().time; as time) {
        <p>{{ time }}</p>
      }
      @if (v().place; as place) {
        <p class="gap">{{ place }}</p>
      }
    </div>

    <app-ticket-status [v]="v()" />
    <p class="closing">te esperamos</p>
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --status-scale: 0.78;
      --status-font: var(--font-serif);

      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 33cqw 12cqw 7cqw;
      background: radial-gradient(120% 80% at 50% 30%, color-mix(in srgb, var(--t-paper) 55%, white), var(--t-paper));
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    /* Palmera arriba a la derecha: reflejada para que el tronco salga por el borde derecho. */
    .art { position: absolute; inset: 0; z-index: -1; overflow: hidden; }
    .art img { position: absolute; height: auto; }
    .tree { top: -13cqw; right: -29cqw; width: 60cqw; scale: -1 1; rotate: -26deg; }
    /* La copa asoma por la esquina inferior izquierda. */
    .fronds { left: -50cqw; bottom: -98cqw; width: 88cqw; rotate: 18deg; }
    .crest { display: grid; justify-items: center; gap: 0.6cqw; }
    .crest img { width: auto; height: 11cqw; }
    .mono { display: flex; align-items: center; gap: 1.6cqw; font-family: var(--font-serif); font-size: 4.2cqw; letter-spacing: 0.1em; color: var(--t-accent); }
    .mono i { width: 0.2cqw; height: 3.4cqw; background: currentColor; }
    .lead { font-family: var(--font-serif); font-size: 3.2cqw; letter-spacing: 0.04em; opacity: 0.85; }
    .names { display: grid; justify-items: center; gap: 0.6cqw; font-family: var(--font-serif); font-weight: 400; letter-spacing: 0.2em; line-height: 1.15; text-transform: uppercase; overflow-wrap: anywhere; }
    .names i { font-family: var(--font-script); font-size: 0.8em; font-style: normal; letter-spacing: 0; line-height: 1.2; text-transform: none; }
    .details { display: grid; gap: 0.8cqw; font-family: var(--font-serif); font-size: 3cqw; letter-spacing: 0.2em; line-height: 1.5; text-transform: uppercase; }
    .details .gap { margin-top: 2.4cqw; }
    .closing { font-family: var(--font-script); font-size: 4.6cqw; line-height: 1; opacity: 0.85; }
    .logo { width: 22cqw; height: auto; opacity: 0.75; }
  `,
})
export class TicketPalmPhoto {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 7.6, 4.2, 8));
}
