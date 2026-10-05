import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { palmFrondLines } from '../ticket-art';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

type Point = [number, number];
const frond = (from: Point, control: Point, to: Point, length: number, opacity: number) => ({
  d: palmFrondLines(from, control, to, { leaflets: 17, length, droop: 0.32 }),
  opacity,
});

const CORNER: Point = [-6, 184];

/**
 * Palmeras (ref. Bodas en la playa/Diseño palmeras): papel claro con hojas de palmera a línea fina
 * en la esquina inferior izquierda, monograma bajo una palmerita y los nombres en mayúsculas espaciadas.
 */
@Component({
  selector: 'app-ticket-palms',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="art" viewBox="0 0 100 178" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      @for (f of fronds; track $index) {
        <path [attr.d]="f.d" [attr.opacity]="f.opacity" fill="none" stroke-width="0.26" stroke-linecap="round" style="stroke: var(--t-dark)" />
      }
    </svg>

    <header class="crest">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 23c-.4-5-.2-8.500.6-11.500M12.600 11.500C10 8.200 6.500 7.800 3 9.500M12.600 11.500c-.6-3.800-2.800-6.300-6.200-7.300M12.600 11.500c.9-3.900 3.600-5.900 7-6M12.600 11.500c2.900-1.700 5.800-1.300 8.200 1M12.600 11.500c2.400 1.100 3.800 3.300 4.200 6.200" fill="none" stroke-width="0.6" stroke-linecap="round" style="stroke: var(--t-accent)" />
      </svg>
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
      padding: 20cqw 12cqw 7cqw;
      background: radial-gradient(120% 80% at 50% 30%, color-mix(in srgb, var(--t-paper) 55%, white), var(--t-paper));
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    .art { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }
    .crest { display: grid; justify-items: center; }
    .crest svg { width: 10cqw; height: 10cqw; }
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
export class TicketPalms {
  readonly v = input.required<TicketView>();

  protected readonly fronds = [
    // Hojas que entran por la esquina inferior izquierda
    frond(CORNER, [4, 166], [24, 158], 8, 0.85),
    frond(CORNER, [-4, 160], [10, 146], 8, 0.65),
    frond(CORNER, [12, 176], [32, 174], 7.500, 0.9),
    frond(CORNER, [-8, 160], [0, 140], 7.500, 0.55),
  ];

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 7.6, 4.2, 8));
}
