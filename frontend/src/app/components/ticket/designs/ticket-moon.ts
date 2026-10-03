import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketMark } from '../ticket-mark';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Luna y nubes (refs. Baby shower/diseño 3D Luna y diseño de tela): capas de papel recortado, luna, nubes y globos. */
@Component({
  selector: 'app-ticket-moon',
  imports: [TicketStatus, TicketMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Capas de papel (arriba) -->
    <svg class="layers layers--top" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <path style="fill: var(--t-accent); filter: var(--shadow)" d="M0 0h100v22c-14 12-28 2-42 8S24 40 0 28z" />
      <path style="fill: var(--t-main); filter: var(--shadow)" d="M0 0h100v12c-18 12-30 0-48 6S18 30 0 18z" />
      <path style="fill: var(--t-dark); filter: var(--shadow)" d="M0 0h100v5C80 16 66 2 46 8S14 18 0 9z" />
    </svg>

    <!-- Globos -->
    <svg class="balloons" viewBox="0 0 40 60" aria-hidden="true">
      <path style="fill: none; stroke: var(--t-ink); stroke-width: 0.5; opacity: 0.6" d="M13 26c2 10 6 18 9 32M27 22c-1 12-3 22-5 36" />
      <path style="fill: var(--t-dark)" d="M13 4c5.500 0 9 4.200 9 9.500S17.500 26 13 26 4 18.800 4 13.500 7.500 4 13 4z" />
      <path style="fill: color-mix(in srgb, var(--t-accent) 70%, var(--t-main))" d="M27 2c5 0 8.500 4 8.500 9S31.500 22 27 22s-8.500-6-8.500-11S22 2 27 2z" />
    </svg>

    <article class="card">
      <p class="eyebrow">Celebremos juntos</p>
      <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>
      <app-ticket-mark class="heart" [kind]="v().mark" />
      <div class="date">
        <span>{{ v().date.weekday }}</span>
        <b>{{ v().date.day }}<small>{{ v().date.month }}</small></b>
        <span>{{ v().date.year }}</span>
      </div>
      @if (v().time || v().place) {
        <p class="detail">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
    </article>

    <!-- Luna, estrella y nubes -->
    <svg class="scene" viewBox="0 0 100 44" aria-hidden="true">
      <path style="fill: var(--t-accent)" d="M4 44c0-7 6-12 13-11 2-6 8-9 14-7 3-6 12-7 16-1 6-2 12 2 12 8 6 0 10 5 9 11z" />
      <path style="fill: var(--t-main)" d="M62 4a19 19 0 1 0 18 26A15 15 0 0 1 62 4z" />
      <path style="fill: var(--t-dark)" d="M84 6l1.600 4 4.200.400-3.200 2.800 1 4.200L84 15.200l-3.600 2.200 1-4.200-3.200-2.800 4.200-.400z" />
      <path style="fill: var(--t-dark); opacity: 0.7" d="M40 8l1 2.600 2.800.200-2.200 1.800.800 2.800L40 13.800l-2.400 1.600.800-2.800-2.200-1.800 2.800-.200z" />
      <path style="fill: color-mix(in srgb, var(--t-paper) 40%, white)" d="M40 44c0-6 5-10 11-9 2-5 8-7 12-4 4-4 11-2 12 4 6 0 10 4 9 9z" />
      <path style="fill: color-mix(in srgb, var(--t-accent) 50%, white)" d="M70 44c0-5 4-8 9-7 2-4 8-5 11-1 5-1 9 3 8 8z" />
    </svg>

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />

    <svg class="layers layers--bottom" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <path style="fill: var(--t-accent); filter: var(--shadow)" d="M0 0h100v22c-14 12-28 2-42 8S24 40 0 28z" />
      <path style="fill: var(--t-main); filter: var(--shadow)" d="M0 0h100v12c-18 12-30 0-48 6S18 30 0 18z" />
    </svg>
  `,
  styles: `
    :host {
      --status-scale: 0.8;
      --shadow: drop-shadow(0 1cqw 1.2cqw color-mix(in srgb, var(--t-ink) 30%, transparent));

      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 30cqw 9cqw 12cqw;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    .layers { position: absolute; left: 0; z-index: -1; width: 100%; height: 34cqw; }
    .layers--top { top: 0; }
    .layers--bottom { bottom: 0; height: 22cqw; rotate: 180deg; }
    /* Los colores de las figuras SVG van en línea (style="…"): al guardar el ticket como imagen no se copian los que llegan por clases. */
    .balloons { position: absolute; top: 3cqw; right: 5cqw; width: 20cqw; height: 30cqw; filter: var(--shadow); }
    .card {
      display: grid;
      justify-items: center;
      gap: 2.4cqw;
      width: 100%;
      padding: 6cqw 5cqw;
      border-radius: 2.4cqw;
      background: color-mix(in srgb, var(--t-paper) 55%, white);
      box-shadow: 0 2cqw 5cqw color-mix(in srgb, var(--t-ink) 22%, transparent);
    }
    .eyebrow { font-size: 2.4cqw; font-weight: 500; letter-spacing: 0.36em; text-transform: uppercase; color: var(--t-dark); }
    .names { font-family: var(--font-sans); font-weight: 500; letter-spacing: 0.14em; line-height: 1.2; text-transform: uppercase; color: color-mix(in srgb, var(--t-dark) 70%, var(--t-ink)); overflow-wrap: anywhere; }
    .heart { font-size: 3.4cqw; color: var(--t-dark); }
    .date { display: flex; align-items: center; gap: 3cqw; font-size: 2.5cqw; letter-spacing: 0.14em; text-transform: capitalize; }
    .date b { display: grid; justify-items: center; padding: 0 3.4cqw; border-inline: 0.3cqw solid var(--t-main); font-family: var(--font-serif); font-size: 9cqw; font-weight: 500; line-height: 0.95; }
    .date small { font-family: var(--font-sans); font-size: 2.3cqw; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; }
    .detail { font-size: 2.3cqw; letter-spacing: 0.1em; opacity: 0.85; }
    .scene { width: 78cqw; height: 34cqw; margin-block: -2cqw; filter: var(--shadow); }
    .logo { width: 24cqw; height: auto; opacity: 0.8; }
  `,
})
export class TicketMoon {
  readonly v = input.required<TicketView>();
  protected readonly nameSize = computed(() => fitSize(this.v().title, 7.4, 4, 14));
}
