import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { DEFAULT_TICKET_NOTE, TicketView, fitSize } from '../ticket-view';

/** Marco tipo placa: rectángulo con las esquinas recortadas hacia adentro. */
function plaque(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 0 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 0 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 0 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 0 ${x + r} ${y}z`;
}

interface LaceFlower {
  x: number;
  y: number;
  scale: number;
}

/**
 * Encaje (ref. Bodas/Cartel elegante): cartel oscuro con marco de placa, monograma entre el mes y el año,
 * nombres en manuscrita y mayúsculas, y una franja de encaje floral que da paso al papel crema.
 */
@Component({
  selector: 'app-ticket-lace',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="poster">
      <svg class="frame" viewBox="0 0 100 104" preserveAspectRatio="none" aria-hidden="true">
        <path [attr.d]="outer" fill="none" stroke-width="0.5" style="stroke: var(--t-accent)" />
        <path [attr.d]="inner" fill="none" stroke-width="0.25" style="stroke: var(--t-accent)" />
      </svg>

      <div class="crest">
        <span>{{ v().date.month }}</span>
        <b>{{ v().monogram.join('') }}</b>
        <span>{{ v().date.year }}</span>
      </div>

      <h1 class="names" [style.font-size]="nameSize()">
        @if (v().names.length === 2) {
          <i>{{ v().names[0] }}</i>
          <span>{{ v().names[1] }}</span>
        } @else {
          <span>{{ v().title }}</span>
        }
      </h1>

      <p class="text">{{ v().message ?? defaultNote }}</p>
      <p class="date">{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
    </section>

    <!-- Franja de encaje: flores caladas sobre el borde ondulado del papel -->
    <svg class="lace" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="scallops" style="fill: var(--t-paper)" />
      @for (f of flowers; track $index) {
        <g [attr.transform]="'translate(' + f.x + ' ' + f.y + ') scale(' + f.scale + ')'" fill="none" stroke-width="0.28" style="stroke: var(--t-paper)">
          <circle cx="0" cy="-2" r="1.5" /><circle cx="1.9" cy="-0.6" r="1.5" /><circle cx="1.2" cy="1.6" r="1.5" />
          <circle cx="-1.2" cy="1.6" r="1.5" /><circle cx="-1.9" cy="-0.6" r="1.5" /><circle r="0.7" />
          <path d="M-3.4 2.600c-1.600.6-2.600 1.800-3 3.400M3.400 2.600c1.600.6 2.600 1.800 3 3.400M0 3.200v3.400" />
        </g>
      }
      @for (x of dots; track x) {
        <circle [attr.cx]="x" cy="15.4" r="0.55" style="fill: var(--t-main)" />
      }
    </svg>

    <section class="paper">
      <p class="heading"><i>Reserva</i> la fecha</p>
      <app-ticket-calendar [v]="v()" />
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </section>
  `,
  styles: `
    :host {
      --cal-accent: var(--t-main);
      --cal-on: var(--t-paper);
      --cal-scale: 0.86;
      --status-scale: 0.72;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      height: 100%;
      /* Trama diagonal muy sutil, como papel con textura. */
      background:
        repeating-linear-gradient(45deg, rgb(255 255 255 / 0.035) 0 0.3cqw, transparent 0.3cqw 1.2cqw),
        linear-gradient(180deg, var(--t-main), var(--t-dark));
      color: var(--t-accent);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .poster {
      position: relative;
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3cqw;
      height: 92cqw;
      margin: 6cqw 7cqw 0;
      padding: 7cqw 8cqw;
    }
    .frame { position: absolute; inset: 0; width: 100%; height: 100%; }
    .crest { display: flex; align-items: center; gap: 3cqw; font-size: 2.3cqw; letter-spacing: 0.22em; text-transform: uppercase; }
    .crest b {
      display: grid;
      place-items: center;
      width: 11cqw;
      height: 11cqw;
      border: 0.25cqw solid currentColor;
      border-radius: 50%;
      font-family: var(--font-script);
      font-size: 5cqw;
      font-weight: 400;
      letter-spacing: 0;
      text-transform: none;
    }
    .names { display: grid; justify-items: center; font-weight: 400; line-height: 1; overflow-wrap: anywhere; }
    .names i { margin: 0 14cqw -0.25em 0; font-family: var(--font-script); font-size: 1.15em; font-style: normal; }
    .names span { font-family: var(--font-serif); letter-spacing: 0.14em; text-transform: uppercase; }
    .text {
      display: -webkit-box;
      max-width: 56cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3cqw;
      line-height: 1.4;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
    .date { font-size: 2.4cqw; letter-spacing: 0.26em; text-transform: uppercase; }
    .where { font-size: 2cqw; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8; }
    .lace { flex: none; display: block; width: 100%; height: 19cqw; margin-bottom: -0.3cqw; }
    .paper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; min-height: 0; padding: 0 9cqw 3cqw; background: var(--t-paper); color: var(--t-ink); }
    .heading { font-family: var(--font-serif); font-size: 4.2cqw; letter-spacing: 0.16em; text-transform: uppercase; }
    .heading i { font-family: var(--font-script); font-size: 1.7em; font-style: normal; letter-spacing: 0; text-transform: none; }
    .logo { width: 22cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketLace {
  readonly v = input.required<TicketView>();
  protected readonly defaultNote = DEFAULT_TICKET_NOTE;

  protected readonly outer = plaque(1, 1, 98, 102, 7);
  protected readonly inner = plaque(3.2, 3.2, 93.6, 97.600, 7);

  /** Papel crema con el borde superior ondulado (semicírculos hacia arriba). */
  protected readonly scallops = `M0 20V13${Array.from({ length: 10 }, () => 'a5 5 0 0 1 10 0').join('')}V20z`;
  protected readonly flowers: LaceFlower[] = Array.from({ length: 11 }, (_, i) => ({ x: i * 10, y: i % 2 ? 5.200 : 3.4, scale: i % 2 ? 0.8 : 1.05 }));
  protected readonly dots = Array.from({ length: 10 }, (_, i) => 5 + i * 10);

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 9.5, 5, 8));
}
