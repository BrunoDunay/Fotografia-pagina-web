import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketMark } from '../ticket-mark';
import { TicketStatus } from '../ticket-status';
import { DEFAULT_TICKET_NOTE, TicketView, fitSize } from '../ticket-view';

/** Marco tipo placa: rectángulo con las esquinas recortadas hacia adentro. */
function plaque(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 0 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 0 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 0 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 0 ${x + r} ${y}z`;
}

/**
 * Palomas (ref. Bodas/Diseño sencillo elegante): cartel oscuro con marco de placa, dos palomas a línea
 * y los nombres manuscritos; puntilla de encaje, papel crema con capitular y la fecha entre los días vecinos.
 */
@Component({
  selector: 'app-ticket-doves',
  imports: [TicketMark, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="poster">
      <svg class="frame" viewBox="0 0 100 96" preserveAspectRatio="none" aria-hidden="true">
        <path [attr.d]="outer" fill="none" stroke-width="0.45" style="stroke: var(--t-accent)" />
        <path [attr.d]="inner" fill="none" stroke-width="0.2" style="stroke: var(--t-accent)" />
      </svg>

      <!-- Dos palomas con un corazón, dibujadas a línea -->
      <svg class="doves" viewBox="0 0 60 34" aria-hidden="true">
        <g fill="none" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--t-accent)">
          @for (side of [1, -1]; track side) {
            <g [attr.transform]="side === 1 ? 'translate(2 3)' : 'translate(58 0) scale(-1 1)'">
              <path d="M2 17C6 12 12 10 16.500 12c1.800-2.200 5-2.400 6.400-.2l2.300.9-2.200 1c0 4.400-4.200 8.300-10 8.300-4.400 0-8-1.400-11-5z" />
              <path d="M10.500 12.800C8.500 6.500 11 2.500 16.500.500c.8 4.800-.2 9-3.400 12.200" />
              <path d="M7.500 14.200C4.500 9.500 5 6 8.500 3.500c1.200 3.400 1.400 6.400.6 9.400" />
              <path d="M2 17l-3.800-1.600M2.600 18.200l-4 .9M3.800 19.400l-3.200 2.800" />
              <circle cx="20.300" cy="12.700" r="0.35" stroke="none" style="fill: var(--t-accent)" />
            </g>
          }
          <path d="M30 31c-3.400-2.300-5.200-4.200-5.200-6.200a2.600 2.600 0 015.200-.9 2.600 2.600 0 015.200.9c0 2-1.800 3.900-5.200 6.200z" />
          <path d="M27 21.500C28.500 19 29 18 30 16.500 31 18 31.500 19 33 21.500" stroke-width="0.3" />
        </g>
      </svg>

      <h1 class="names" [style.font-size]="nameSize()">
        @for (name of v().names; track $index) {
          <span>{{ name }}</span>
        }
      </h1>

      <p class="motto">Hoy y para siempre…</p>
    </section>

    <!-- Puntilla de encaje: borde ondulado con calados -->
    <svg class="lace" viewBox="0 0 100 15" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="scallops" style="fill: var(--t-paper)" />
      @for (x of big; track x) {
        <g [attr.transform]="'translate(' + x + ' 8.200)'" style="fill: var(--t-main)">
          <circle r="1.150" /><circle cx="-2.400" cy="1.900" r="0.550" /><circle cx="2.400" cy="1.900" r="0.550" /><circle cy="-2.700" r="0.450" />
        </g>
      }
      @for (x of small; track x) {
        <circle [attr.cx]="x" cy="11.800" r="0.500" style="fill: var(--t-main)" />
      }
      <path d="M0 13.600H100" fill="none" stroke-width="0.25" stroke-dasharray="0.7 0.7" style="stroke: var(--t-main)" opacity="0.6" />
    </svg>

    <section class="paper">
      <p class="heading"><i>R</i>eserva la fecha</p>
      <p class="text">{{ v().message ?? defaultNote }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }

      <div class="when">
        <p class="when__label">{{ v().date.weekday }}</p>
        <div class="days">
          @for (day of days(); track $index) {
            @if (day.event) {
              <span class="day is-event">
                @if (v().mark === 'heart') {
                  <app-ticket-mark class="shape" kind="heart" />
                } @else {
                  <i class="shape shape--dot"></i>
                }
                <b>{{ day.n }}</b>
              </span>
            } @else {
              <span class="day">{{ day.n }}</span>
            }
          }
        </div>
        <p class="when__month">{{ v().date.month }} {{ v().date.year }}</p>
      </div>

      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </section>
  `,
  styles: `
    :host {
      --status-scale: 0.7;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      height: 100%;
      /* Papel oscuro con un moteado muy leve, como en la referencia. */
      background:
        radial-gradient(60cqw 40cqw at 20% 15%, rgb(255 255 255 / 0.05), transparent 70%),
        radial-gradient(50cqw 36cqw at 85% 60%, rgb(0 0 0 / 0.12), transparent 70%),
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
      gap: 4cqw;
      height: 78cqw;
      margin: 5cqw 7cqw 0;
      padding: 6cqw 7cqw;
    }
    .frame { position: absolute; inset: 0; width: 100%; height: 100%; }
    .doves { flex: none; width: 34cqw; height: 19cqw; }
    .names { display: grid; justify-items: center; font-family: var(--font-script); font-weight: 400; line-height: 1.02; overflow-wrap: anywhere; }
    .names span:first-child:not(:only-child) { margin-right: 0.9em; }
    .names span:nth-child(2) { margin-left: 0.9em; }
    .motto { font-family: var(--font-serif); font-size: 2.8cqw; letter-spacing: 0.2em; text-transform: uppercase; }
    .lace { flex: none; display: block; width: 100%; height: 15cqw; margin-bottom: -0.3cqw; }
    .paper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; min-height: 0; padding: 0 9cqw 3cqw; background: var(--t-paper); color: var(--t-ink); }
    .heading { font-family: var(--font-serif); font-size: 5.2cqw; letter-spacing: 0.08em; line-height: 1; text-transform: uppercase; }
    /* Capitular manuscrita, como la letra inicial de la referencia. */
    .heading i { margin-right: -0.06em; font-family: var(--font-script); font-size: 2.5em; font-style: normal; letter-spacing: 0; line-height: 0.6; text-transform: none; vertical-align: -0.12em; }
    .text {
      display: -webkit-box;
      max-width: 66cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.1cqw;
      line-height: 1.4;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
    .where { font-size: 2.1cqw; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8; }
    .when { display: grid; justify-items: center; gap: 1.6cqw; }
    .when__label, .when__month { font-family: var(--font-serif); font-size: 3.4cqw; letter-spacing: 0.16em; text-transform: uppercase; }
    .days { display: flex; align-items: center; gap: 2.2cqw; }
    .day {
      position: relative;
      display: grid;
      place-items: center;
      width: 8.4cqw;
      height: 8.4cqw;
      border-radius: 50%;
      background: color-mix(in srgb, var(--t-main) 12%, transparent);
      font-family: var(--font-serif);
      font-size: 3.4cqw;
      line-height: 1;
    }
    .day.is-event { width: 13cqw; height: 13cqw; background: none; color: var(--t-paper); }
    .day b { position: relative; margin-top: -0.12em; font-size: 4.6cqw; font-weight: 500; }
    .shape { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--t-main); }
    .shape--dot { inset: 1cqw; width: auto; height: auto; border-radius: 50%; background: var(--t-main); }
    .logo { width: 21cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketDoves {
  readonly v = input.required<TicketView>();
  protected readonly defaultNote = DEFAULT_TICKET_NOTE;

  protected readonly outer = plaque(1, 1, 98, 94, 6);
  protected readonly inner = plaque(3, 3, 94, 90, 6);

  /** Papel crema con el borde superior ondulado y los calados de la puntilla. */
  protected readonly scallops = `M0 15V6${Array.from({ length: 10 }, () => 'a5 5 0 0 1 10 0').join('')}V15z`;
  protected readonly big = Array.from({ length: 10 }, (_, i) => 5 + i * 10);
  protected readonly small = Array.from({ length: 11 }, (_, i) => i * 10);

  /** Los dos días anteriores y los dos siguientes al evento. */
  protected readonly days = computed(() => {
    const base = Date.parse(`${this.v().iso}T00:00:00Z`);
    return [-2, -1, 0, 1, 2].map((offset) => ({ n: new Date(base + offset * 86_400_000).getUTCDate(), event: offset === 0 }));
  });

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 13, 7, 9));
}
