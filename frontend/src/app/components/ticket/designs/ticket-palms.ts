import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { palmFrond } from '../ticket-art';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

type Point = [number, number];
const frond = (from: Point, control: Point, to: Point, length: number, opacity: number) => ({
  ...palmFrond(from, control, to, { leaflets: 30, length, droop: 0.4 }),
  opacity,
});

const CROWN: Point = [80, 17];
const CORNER: Point = [-6, 184];

/**
 * Palmeras (ref. Bodas en la playa/Diseño palmeras): papel claro con una palmera arriba a la derecha
 * y hojas abajo a la izquierda, monograma bajo una palmerita y los nombres en mayúsculas espaciadas.
 */
@Component({
  selector: 'app-ticket-palms',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="art" viewBox="0 0 100 178" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <!-- Tronco -->
      <path d="M118 66C104 52 92 36 80 17" fill="none" stroke-width="3.4" stroke-linecap="round" style="stroke: var(--t-accent)" />
      <path d="M118 66C104 52 92 36 80 17" fill="none" stroke-width="3.4" stroke-dasharray="0.5 2.6" style="stroke: rgb(0 0 0 / 0.18)" />
      @for (f of fronds; track $index) {
        <path [attr.d]="f.leaflets" [attr.opacity]="f.opacity" style="fill: var(--t-dark)" />
        <path [attr.d]="f.rachis" fill="none" stroke-width="0.35" style="stroke: var(--t-dark)" />
      }
      <circle cx="82" cy="19" r="1.5" style="fill: var(--t-accent)" />
      <circle cx="79" cy="20.500" r="1.3" style="fill: var(--t-accent)" />
    </svg>

    <header class="crest">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 23c-.4-5-.2-8.500.6-11.500" fill="none" stroke-width="1.1" stroke-linecap="round" style="stroke: var(--t-accent)" />
        <path d="M12.600 11.500C10 8.500 6.500 8 3 9.500c3-3.500 7-3.500 9.600 2zM12.600 11.500c-.5-4-3-6.500-6.600-7.500 4.500-.5 7 2.500 6.600 7.500zM12.600 11.500c1-4 4-6 7.400-6-3-2.500-7-.5-7.400 6zM12.600 11.500c3-2 6-1.500 8.400 1-2-4-6-4.500-8.400-1zM12.600 11.500c2.500 1 4 3.500 4.400 6.500 1-4-1-6.500-4.400-6.500z" style="fill: var(--t-accent)" />
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
      padding: 33cqw 12cqw 7cqw;
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
    // Copa de la palmera (arriba a la derecha)
    frond(CROWN, [60, 2], [40, 20], 9, 0.85),
    frond(CROWN, [66, 22], [54, 44], 9, 0.7),
    frond(CROWN, [76, 34], [72, 54], 8.5, 0.9),
    frond(CROWN, [70, 0], [58, -6], 8, 0.6),
    frond(CROWN, [96, 20], [104, 42], 9, 0.75),
    frond(CROWN, [94, 2], [106, -4], 8, 0.65),
    // Hojas que entran por la esquina inferior izquierda
    frond(CORNER, [4, 166], [24, 158], 7, 0.8),
    frond(CORNER, [-4, 160], [10, 146], 7, 0.65),
    frond(CORNER, [12, 176], [32, 174], 6.500, 0.9),
    frond(CORNER, [-8, 160], [0, 140], 6.500, 0.55),
  ];

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 7.6, 4.2, 8));
}
