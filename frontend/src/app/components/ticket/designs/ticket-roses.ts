import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { lanceLeaf, rose } from '../ticket-art';
import { TicketCalendar } from '../ticket-calendar';
import { TicketMark } from '../ticket-mark';
import { TicketStatus } from '../ticket-status';
import { DEFAULT_TICKET_NOTE, TicketView, fitSize } from '../ticket-view';

/** Rosa en tonos suaves: pétalos claros afuera y más intensos hacia el centro. */
function softRose(cx: number, cy: number, radius: number, seed: number) {
  return rose(cx, cy, radius, seed).map((petal) => ({
    d: petal.d,
    fill: `color-mix(in srgb, var(--t-main) ${Math.round(100 - petal.depth * 55)}%, var(--t-dark))`,
  }));
}

/**
 * Flores (ref. XV años/Flores rosas): tarjeta de esquinas redondeadas sobre un fondo suave, rosas en la
 * esquina superior, nombre en serif, texto en itálica y un recuadro con la fecha en grande.
 */
@Component({
  selector: 'app-ticket-roses',
  imports: [TicketCalendar, TicketMark, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <svg class="flowers" viewBox="0 0 70 60" aria-hidden="true">
        <path d="M34 20C24 22 14 18 6 8M30 30C22 36 14 44 12 56" fill="none" stroke="#b8b3a6" stroke-width="0.3" />
        @for (leaf of leaves; track $index) {
          <path [attr.d]="leaf" fill="#bdb9aa" opacity="0.6" />
        }
        @for (flower of flowers; track $index) {
          @for (petal of flower; track $index) {
            <path [attr.d]="petal.d" stroke="rgb(255 255 255 / 0.5)" stroke-width="0.14" [style.fill]="petal.fill" />
          }
        }
      </svg>

      <p class="eyebrow">Con mucha ilusión</p>
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
      <p class="date">{{ v().date.day }} de {{ v().date.month }}, {{ v().date.year }}</p>

      <div class="divider" aria-hidden="true"><i></i><app-ticket-mark [kind]="v().mark" /><i></i></div>

      <p class="text">{{ v().message ?? defaultNote }}</p>

      <div class="box">
        <p class="box__weekday">{{ v().date.weekday }}</p>
        <p class="box__date">
          <span>{{ month() }}</span>
          <b>{{ v().date.day }}</b>
          <span>{{ v().date.year }}</span>
        </p>
        @if (v().time; as time) {
          <p class="box__time">{{ time }}</p>
        }
        @if (v().place; as place) {
          <p class="box__time">{{ place }}</p>
        }
      </div>

      <app-ticket-calendar [v]="v()" />
      <app-ticket-status [v]="v()" />
      <img class="logo" [src]="v().darkPaper ? '/brand/logo-light.webp' : '/brand/logo-dark.webp'" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </article>
  `,
  styles: `
    :host {
      --cal-accent: var(--t-dark);
      --cal-on: var(--t-paper);
      --cal-scale: 0.78;
      --status-scale: 0.68;
      --status-font: var(--font-serif);

      display: block;
      height: 100%;
      padding: 4cqw;
      /* Fondo sedoso alrededor de la tarjeta. */
      background: linear-gradient(135deg, color-mix(in srgb, var(--t-main) 55%, var(--t-paper)), var(--t-paper) 45%, color-mix(in srgb, var(--t-main) 75%, var(--t-paper)));
      color: var(--t-ink);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 19cqw 7cqw 4cqw;
      border: 0.25cqw solid color-mix(in srgb, var(--t-accent) 40%, var(--t-paper));
      border-radius: 5cqw;
      background: linear-gradient(170deg, color-mix(in srgb, var(--t-paper) 88%, white), var(--t-paper));
      box-shadow: 0 1.5cqw 5cqw color-mix(in srgb, var(--t-dark) 30%, transparent);
      overflow: hidden;
      isolation: isolate;
    }
    .flowers { position: absolute; top: -6cqw; right: -8cqw; z-index: -1; width: 62cqw; height: 53cqw; filter: blur(0.12cqw) drop-shadow(0 0.8cqw 1.4cqw color-mix(in srgb, var(--t-dark) 30%, transparent)); }
    .eyebrow { font-size: 2.2cqw; letter-spacing: 0.3em; text-transform: uppercase; color: var(--t-accent); }
    .names { font-family: var(--font-serif); font-weight: 500; line-height: 1.1; overflow-wrap: anywhere; }
    .date { font-size: 2.8cqw; letter-spacing: 0.26em; text-transform: uppercase; }
    .divider { display: flex; align-items: center; gap: 2cqw; font-size: 2.6cqw; color: var(--t-accent); }
    .divider i { width: 13cqw; height: 0.2cqw; background: currentColor; opacity: 0.6; }
    .text {
      display: -webkit-box;
      max-width: 62cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.2cqw;
      font-style: italic;
      line-height: 1.4;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
    .box { display: grid; gap: 0.8cqw; width: 100%; padding: 2.6cqw 3cqw; border: 0.25cqw solid color-mix(in srgb, var(--t-accent) 45%, transparent); border-radius: 2.4cqw; }
    .box__weekday, .box__time { font-size: 2.3cqw; letter-spacing: 0.3em; text-transform: uppercase; }
    .box__date { display: flex; align-items: center; justify-content: center; gap: 3cqw; font-size: 2.8cqw; letter-spacing: 0.24em; text-transform: uppercase; }
    .box__date b { font-family: var(--font-serif); font-size: 11cqw; font-weight: 400; letter-spacing: 0; line-height: 0.9; }
    .logo { width: 20cqw; height: auto; opacity: 0.75; }
  `,
})
export class TicketRoses {
  readonly v = input.required<TicketView>();
  protected readonly defaultNote = DEFAULT_TICKET_NOTE;

  protected readonly flowers = [softRose(26, 30, 8.500, 4), softRose(40, 12, 9.500, 6), softRose(52, 28, 15, 2)];
  protected readonly leaves = [lanceLeaf(34, 20, 200, 16, 4.500), lanceLeaf(22, 18, 215, 12, 3.600), lanceLeaf(30, 32, 125, 15, 4), lanceLeaf(20, 44, 110, 11, 3.200), lanceLeaf(44, 40, 80, 12, 3.800)];

  protected readonly month = computed(() => this.v().date.month.slice(0, 3));
  protected readonly nameSize = computed(() => fitSize(this.v().title, 9.4, 5.2, 15));
}
