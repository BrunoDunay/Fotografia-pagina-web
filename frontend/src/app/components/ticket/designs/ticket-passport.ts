import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { lanceLeaf, rose } from '../ticket-art';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Pétalos de una rosa con el color de cada capa (claro afuera, intenso al centro). */
function paintedRose(cx: number, cy: number, radius: number, seed: number) {
  return rose(cx, cy, radius, seed).map((petal) => ({
    d: petal.d,
    fill: `color-mix(in srgb, var(--t-accent) ${Math.round(100 - petal.depth * 70)}%, var(--t-dark))`,
  }));
}

/**
 * Pasaporte (ref. Bodas en la playa/boda en otro sitio opción 2): retícula de mapa en las esquinas, rosa de los vientos
 * sobre un mapa tenue, nombres manuscritos, avión con ruta punteada y rosas en la esquina.
 */
@Component({
  selector: 'app-ticket-passport',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="art" viewBox="0 0 100 178" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <!-- Mapa del mundo, muy tenue -->
      <g fill="#f3ede3" transform="translate(-2 20) scale(1.04)">
        <path d="M6 10c7-4 16-5 23-2 2 3-1 7-5 9-2 4-5 7-8 9-2-3-6-7-8-10-2-2-3-4-2-6z" />
        <path d="M22 30c3-1 7 1 8 5 0 5-2 10-5 15-2-4-4-9-4-14 0-3 0-4 1-6z" />
        <path d="M44 9c4-2 9-2 12 0-1 4-5 6-9 7-2-2-3-4-3-7z" />
        <path d="M45 20c5-2 10-1 12 3 0 6-2 12-6 18-3-4-6-9-7-14 0-3 0-5 1-7z" />
        <path d="M58 7c10-4 22-3 31 2 1 5-2 9-8 12-5 2-11 4-16 3-4-4-7-9-7-17z" />
        <path d="M80 38c4-1 9 0 10 4-2 3-7 4-10 3-1-2-1-5 0-7z" />
      </g>

      <!-- Esquinas superiores: retícula de mapa (paralelos y meridianos) muy tenue -->
      @for (corner of [0, 100]; track corner) {
        <g [attr.transform]="'translate(' + corner + ' 0)' + (corner ? ' scale(-1 1)' : '')" fill="none" stroke-width="0.18" opacity="0.4" style="stroke: var(--t-main)">
          <path d="M0 12A12 12 0 0 0 12 0M0 18A18 18 0 0 0 18 0M0 24A24 24 0 0 0 24 0" />
          <path d="M0 30A30 30 0 0 0 30 0" stroke-dasharray="0.5 1" />
          <path d="M8.500 8.500L21.200 21.200M4.600 11.100L11.500 27.700M11.100 4.600L27.700 11.500" />
        </g>
      }

      <!-- Rosa de los vientos -->
      <g transform="translate(50 46)" style="color: var(--t-main)">
        <circle r="15.500" fill="none" stroke="currentColor" stroke-width="0.35" />
        <circle r="13" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="0.4 1.25" />
        @for (angle of [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]; track angle) {
          <path d="M0 -10L1.200 -1.200 0 0 -1.200 -1.200z" fill="currentColor" opacity="0.55" [attr.transform]="'rotate(' + angle + ')'" />
        }
        @for (angle of [45, 135, 225, 315]; track angle) {
          <path d="M0 -16L2.400 -2.400 0 0 -2.400 -2.400z" fill="currentColor" opacity="0.75" [attr.transform]="'rotate(' + angle + ')'" />
        }
        @for (angle of [0, 90, 180, 270]; track angle) {
          <g [attr.transform]="'rotate(' + angle + ')'">
            <path d="M0 -24L3.400 -3.400 0 0z" fill="currentColor" />
            <path d="M0 -24L-3.400 -3.400 0 0z" fill="currentColor" opacity="0.6" />
          </g>
        }
        <circle r="2.600" fill="#fff" stroke="currentColor" stroke-width="0.6" />
        <circle r="1" fill="currentColor" />
        <g fill="currentColor" font-size="4" text-anchor="middle" style="font-family: var(--font-serif)">
          <text y="-26.500">N</text><text y="30">S</text><text x="28" y="1.400">E</text><text x="-28" y="1.400">O</text>
        </g>
      </g>

      <!-- Avión y su ruta punteada -->
      <path d="M14 140C18 162 36 174 56 174" fill="none" stroke="#b9b0a4" stroke-width="0.3" stroke-dasharray="0.9 1.100" />
      <g transform="translate(13 134) rotate(-30) scale(0.5)" style="fill: var(--t-main)">
        <path d="M21 16v-2l-8-5V3.500a1.500 1.500 0 00-3 0V9l-8 5v2l8-2.500V19l-2 1.500V22l3.500-1 3.500 1v-1.500L13 19v-5.500z" transform="translate(-12 -12)" />
      </g>

      <!-- Rosas y hojas -->
      @for (leaf of leaves; track $index) {
        <path [attr.d]="leaf" fill="#7d9a6a" opacity="0.9" />
      }
            @for (flower of roses; track $index) {
        @for (petal of flower; track $index) {
          <path [attr.d]="petal.d" stroke="rgb(255 255 255 / 0.35)" stroke-width="0.15" [style.fill]="petal.fill" />
        }
      }
    </svg>

    <h1 class="names" [style.font-size]="nameSize()">
      @for (name of v().names; track $index) {
        <span>{{ name }}{{ $first && v().names.length === 2 ? ' y' : '' }}</span>
      }
    </h1>

    <div class="info">
      <p>{{ v().date.weekday }} {{ v().date.day }} de {{ v().date.month }} de {{ v().date.year }}</p>
      @if (v().time || v().place) {
        <p>{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
    </div>

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --status-scale: 0.62;
      --status-font: var(--font-serif);

      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      padding: 8cqw 9cqw 5cqw;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    .art { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }
    /* Los nombres van bajo la rosa de los vientos (que ocupa hasta ~78cqw). */
    .names { display: grid; justify-items: center; margin-top: 76cqw; font-family: var(--font-script); font-weight: 400; line-height: 1.02; overflow-wrap: anywhere; }
    .names span:nth-child(2) { margin-left: -0.4em; }
    .info { display: grid; gap: 1.2cqw; margin-top: 4cqw; font-family: var(--font-serif); font-size: 2.5cqw; letter-spacing: 0.24em; line-height: 1.5; text-transform: uppercase; }
    app-ticket-status { margin-top: 5cqw; }
    .logo { position: absolute; left: 9cqw; bottom: 5cqw; width: 22cqw; height: auto; opacity: 0.75; }
  `,
})
export class TicketPassport {
  readonly v = input.required<TicketView>();

  protected readonly roses = [paintedRose(90, 146, 8, 3), paintedRose(66, 168, 10, 8), paintedRose(86, 166, 13, 5)];
  protected readonly leaves = [
    lanceLeaf(80, 152, -125, 11, 3.800),
    lanceLeaf(76, 158, -165, 11, 3.600),
    lanceLeaf(94, 154, -75, 10, 3.600),
    lanceLeaf(58, 172, 165, 10, 3.200),
  ];

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 14.500, 8, 9));
}
