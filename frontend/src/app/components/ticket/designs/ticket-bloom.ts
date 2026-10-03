import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Floral (refs. XV años/Flores rosas y Nubes rosas, Bodas/Flores blancas): nubes suaves, flores y monograma fino. */
@Component({
  selector: 'app-ticket-bloom',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Ramo de flores (se usa en dos esquinas) -->
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <g id="bloom-flower">
          <g style="fill: var(--t-main)">
            <ellipse cx="0" cy="-7" rx="5" ry="7.5" />
            <ellipse cx="0" cy="-7" rx="5" ry="7.5" transform="rotate(72)" />
            <ellipse cx="0" cy="-7" rx="5" ry="7.5" transform="rotate(144)" />
            <ellipse cx="0" cy="-7" rx="5" ry="7.5" transform="rotate(216)" />
            <ellipse cx="0" cy="-7" rx="5" ry="7.5" transform="rotate(288)" />
          </g>
          <g style="fill: color-mix(in srgb, var(--t-main) 55%, white)">
            <ellipse cx="0" cy="-3.6" rx="3" ry="4.4" transform="rotate(36)" />
            <ellipse cx="0" cy="-3.6" rx="3" ry="4.4" transform="rotate(108)" />
            <ellipse cx="0" cy="-3.6" rx="3" ry="4.4" transform="rotate(180)" />
            <ellipse cx="0" cy="-3.6" rx="3" ry="4.4" transform="rotate(252)" />
            <ellipse cx="0" cy="-3.6" rx="3" ry="4.4" transform="rotate(324)" />
          </g>
          <circle style="fill: var(--t-dark)" r="2.2" />
        </g>
      </defs>
    </svg>
    @for (corner of ['start', 'end']; track corner) {
      <svg class="bouquet" [class]="'bouquet bouquet--' + corner" viewBox="0 0 100 80" aria-hidden="true">
        <path style="fill: color-mix(in srgb, var(--t-dark) 45%, #8a9a7a); opacity: 0.75" d="M50 44C36 40 24 46 16 58c14 2 26-2 34-14zM52 40c2-14 12-22 26-24-2 14-12 22-26 24zM40 34C30 24 18 22 6 28c8 10 22 14 34 6z" />
        <use href="#bloom-flower" transform="translate(34 32) scale(1.5)" />
        <use href="#bloom-flower" transform="translate(62 44) scale(1.15) rotate(20)" />
        <use href="#bloom-flower" transform="translate(54 18) scale(0.8) rotate(-15)" />
        <use href="#bloom-flower" transform="translate(16 46) scale(0.62) rotate(40)" />
      </svg>
    }

    <p class="eyebrow">{{ v().service ?? 'Fecha reservada' }}</p>

    <div class="mono" aria-hidden="true">
      @for (letter of v().monogram.slice(0, 2); track $index) {
        <span>{{ letter }}</span>
      }
    </div>

    <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>

    <div class="date">
      <span>{{ v().date.weekday }}</span>
      <b>{{ v().date.day }}</b>
      <span>{{ v().date.month }} {{ v().date.year }}</span>
    </div>
    @if (v().time || v().place) {
      <p class="detail">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
    }
    @if (v().package; as pkg) {
      <p class="detail">Paquete {{ pkg }}</p>
    }

    <div class="card">
      <app-ticket-calendar [v]="v()" />
    </div>

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --cal-accent: var(--t-dark);
      --cal-on: #fff;
      --cal-scale: 0.8;
      --status-scale: 0.76;
      --status-font: var(--font-serif);

      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 13cqw 9cqw 5cqw;
      /* Nubes: manchas suaves de color sobre el papel. */
      background:
        radial-gradient(60cqw 34cqw at 12% 8%, color-mix(in srgb, var(--t-main) 70%, transparent), transparent 70%),
        radial-gradient(54cqw 30cqw at 92% 22%, color-mix(in srgb, var(--t-accent) 90%, transparent), transparent 70%),
        radial-gradient(70cqw 40cqw at 80% 96%, color-mix(in srgb, var(--t-main) 60%, transparent), transparent 70%),
        radial-gradient(60cqw 36cqw at 6% 78%, color-mix(in srgb, var(--t-accent) 90%, transparent), transparent 70%),
        var(--t-paper);
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    .bouquet { position: absolute; z-index: -1; width: 46cqw; height: 37cqw; }
    .bouquet--start { top: -6cqw; right: -9cqw; }
    .bouquet--end { bottom: -6cqw; left: -9cqw; rotate: 180deg; }
    /* Los colores de las figuras SVG van en línea (style="…"): al guardar el ticket como imagen no se copian los que llegan por clases. */
    .eyebrow { font-size: 2.3cqw; letter-spacing: 0.44em; text-transform: uppercase; color: var(--t-dark); }
    .mono { display: flex; font-family: var(--font-serif); font-size: 25cqw; font-weight: 400; line-height: 0.8; color: color-mix(in srgb, var(--t-dark) 80%, var(--t-ink)); }
    .mono span:nth-child(2) { margin: 7cqw 0 0 -5cqw; opacity: 0.75; }
    .names { margin-top: -3cqw; font-family: var(--font-script); font-weight: 400; line-height: 1.15; overflow-wrap: anywhere; }
    .date { display: flex; align-items: center; gap: 3cqw; font-size: 2.4cqw; letter-spacing: 0.24em; text-transform: uppercase; }
    .date b { padding: 0 3cqw; border-inline: 0.25cqw solid var(--t-dark); font-family: var(--font-serif); font-size: 9cqw; font-weight: 400; letter-spacing: 0; line-height: 1; }
    .detail { font-size: 2.2cqw; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.85; }
    .card { padding: 2.6cqw 5cqw; border-radius: 3cqw; background: rgb(255 255 255 / 0.62); box-shadow: 0 1.5cqw 4cqw color-mix(in srgb, var(--t-dark) 22%, transparent); }
    .logo { width: 25cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketBloom {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 10, 5.4, 16));
}
