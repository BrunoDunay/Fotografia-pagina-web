import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { seeded, tornEdge } from '../ticket-art';
import { TicketStatus } from '../ticket-status';
import { DEFAULT_TICKET_NOTE, TicketView, fitSize } from '../ticket-view';

interface Floret {
  x: number;
  y: number;
  size: number;
  rotate: number;
  fill: string;
}

/** Racimo de hortensias: muchas florecitas de cuatro pétalos formando una bola. */
function hydrangea(cx: number, cy: number, radius: number, seed: number): Floret[] {
  const random = seeded(seed);
  const tones = ['#ffffff', '#f6f7ee', '#eef1e0', '#e3ead0', '#fbfbf5'];
  const florets: Floret[] = [];
  for (let i = 0; i < 46; i++) {
    const a = random() * Math.PI * 2;
    const d = Math.sqrt(random()) * radius;
    florets.push({
      x: Math.round((cx + Math.cos(a) * d) * 10) / 10,
      y: Math.round((cy + Math.sin(a) * d * 0.86) * 10) / 10,
      size: 0.75 + random() * 0.5,
      rotate: Math.round(random() * 90),
      fill: tones[Math.floor(random() * tones.length)],
    });
  }
  // Las de abajo primero, para que las de arriba las cubran un poco.
  return florets.sort((a, b) => a.y - b.y);
}

/**
 * Jardín (ref. Bodas/Boda al aire libre): fotografía arriba con los nombres manuscritos como marca
 * de agua sobre un gran "&", borde de papel rasgado, hortensias blancas y bloque verde con la fecha.
 */
@Component({
  selector: 'app-ticket-garden',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="photo">
      @if (v().photo; as photo) {
        <img class="photo__img" [src]="photo" alt="" crossorigin="anonymous" />
      }
      <div class="photo__shade"></div>
      <div class="names" [style.font-size]="nameSize()">
        @if (v().names.length === 2) {
          <span class="amp" aria-hidden="true">&amp;</span>
        }
        <h1>
          @for (name of v().names; track $index) {
            <span>{{ name }}</span>
          }
        </h1>
      </div>
    </section>

    <!-- Borde de papel rasgado -->
    <svg class="tear" viewBox="0 0 100 9" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="tear" style="fill: #fbfaf6" />
    </svg>

    <!-- Hortensias -->
    <svg class="flowers" viewBox="0 0 60 60" aria-hidden="true">
      <path d="M30 34C22 44 14 50 6 54c2-10 10-18 24-20zM32 36c4 10 12 16 22 18-2-10-8-16-22-18z" style="fill: #4f6a3a" />
      @for (f of florets; track $index) {
        <g [attr.transform]="'translate(' + f.x + ' ' + f.y + ') rotate(' + f.rotate + ') scale(' + f.size + ')'">
          <ellipse cx="0" cy="-2.3" rx="2.3" ry="2.6" [attr.fill]="f.fill" stroke="#c9d2b4" stroke-width="0.18" />
          <ellipse cx="2.3" cy="0" rx="2.6" ry="2.3" [attr.fill]="f.fill" stroke="#c9d2b4" stroke-width="0.18" />
          <ellipse cx="0" cy="2.3" rx="2.3" ry="2.6" [attr.fill]="f.fill" stroke="#c9d2b4" stroke-width="0.18" />
          <ellipse cx="-2.3" cy="0" rx="2.6" ry="2.3" [attr.fill]="f.fill" stroke="#c9d2b4" stroke-width="0.18" />
          <circle r="0.7" fill="#dfe6c4" />
        </g>
      }
    </svg>

    <section class="block">
      <p class="heading">¡Reserva la fecha!</p>
      <p class="text">{{ v().message ?? defaultNote }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
      <span class="line" aria-hidden="true"></span>
      <p class="date">{{ v().shortDate }}</p>
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </section>
  `,
  styles: `
    :host {
      --status-scale: 0.74;

      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--t-main);
      color: var(--t-paper);
      text-align: center;
      overflow: hidden;
    }
    p, h1 { margin: 0; }
    .photo {
      position: relative;
      flex: none;
      height: 80cqw;
      background: linear-gradient(170deg, color-mix(in srgb, var(--t-main) 55%, #9aa58a), var(--t-dark));
      overflow: hidden;
      isolation: isolate;
    }
    .photo__img { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; }
    .photo__shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, transparent 35%, rgb(0 0 0 / 0.45)); }
    .names { position: absolute; left: 4cqw; right: 3cqw; bottom: 10cqw; display: grid; align-items: center; text-align: left; }
    .amp { grid-area: 1 / 1; font-family: var(--font-serif); font-size: 3.6em; line-height: 0.7; color: #fff; opacity: 0.2; }
    h1 {
      grid-area: 1 / 1;
      display: grid;
      padding-left: 0.7em;
      font-family: var(--font-script);
      font-size: 1em;
      font-weight: 400;
      line-height: 1.05;
      /* Semitransparente, como marca de agua sobre la fotografía. */
      color: rgb(255 255 255 / 0.55);
    }
    h1 span:nth-child(2) { padding-left: 0.6em; }
    .tear { position: relative; z-index: 1; flex: none; display: block; width: 100%; height: 9cqw; margin: -5cqw 0 -3cqw; filter: drop-shadow(0 0.6cqw 0.8cqw rgb(0 0 0 / 0.25)); }
    .flowers { position: absolute; top: 57cqw; right: -9cqw; z-index: 2; width: 44cqw; height: 44cqw; filter: drop-shadow(0 1cqw 1.4cqw rgb(0 0 0 / 0.3)); }
    .block { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; min-height: 0; padding: 21cqw 9cqw 5cqw; }
    .heading { font-family: var(--font-script); font-size: 8.4cqw; line-height: 1.1; }
    .text {
      display: -webkit-box;
      max-width: 66cqw;
      overflow: hidden;
      font-size: 3cqw;
      font-weight: 300;
      line-height: 1.5;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
    .where { font-size: 2.2cqw; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.8; }
    .line { width: 0.2cqw; height: 6cqw; background: currentColor; opacity: 0.8; }
    .date { font-family: var(--font-script); font-size: 7cqw; line-height: 1; }
    .logo { width: 22cqw; height: auto; opacity: 0.85; }
  `,
})
export class TicketGarden {
  readonly v = input.required<TicketView>();
  protected readonly defaultNote = DEFAULT_TICKET_NOTE;
  protected readonly tear = tornEdge(9, 23);
  protected readonly florets = [...hydrangea(24, 24, 15, 5), ...hydrangea(40, 36, 13, 9)];
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 15.5, 8, 9));
}
