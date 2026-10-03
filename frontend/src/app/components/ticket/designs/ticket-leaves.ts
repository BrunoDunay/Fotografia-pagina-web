import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { lanceLeaf } from '../ticket-art';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Ramita: un tallo con hojas lanceoladas a los lados. */
function sprig(x: number, y: number, angle: number, leaves: number, size: number): { stem: string; leaves: string[] } {
  const rad = (angle * Math.PI) / 180;
  const out: string[] = [];
  for (let i = 0; i < leaves; i++) {
    const t = (i + 0.6) / leaves;
    const px = x + Math.cos(rad) * size * 4 * t;
    const py = y + Math.sin(rad) * size * 4 * t;
    const side = i % 2 ? 1 : -1;
    out.push(lanceLeaf(px, py, angle + side * (38 - t * 12), size * (1.5 - t * 0.5), size * 0.36));
  }
  out.push(lanceLeaf(x + Math.cos(rad) * size * 3.800, y + Math.sin(rad) * size * 3.800, angle, size * 1.100, size * 0.3));
  return { stem: `M${x} ${y}L${Math.round((x + Math.cos(rad) * size * 4) * 10) / 10} ${Math.round((y + Math.sin(rad) * size * 4) * 10) / 10}`, leaves: out };
}

/**
 * Hojas (ref. Sesiones normales/Elegante plantas): papel blanco con ramas verdes y aros finos en dos esquinas,
 * nombres manuscritos al centro y una franja de color con la cuenta regresiva.
 */
@Component({
  selector: 'app-ticket-leaves',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="paper">
      <svg class="art" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="12" cy="30" r="13" fill="none" stroke-width="0.5" style="stroke: var(--t-accent)" />
        <circle cx="86" cy="112" r="13" fill="none" stroke-width="0.5" style="stroke: var(--t-accent)" />
        @for (s of sprigs; track $index) {
          <path [attr.d]="s.stem" fill="none" stroke-width="0.3" style="stroke: var(--t-dark)" />
          @for (leaf of s.leaves; track $index) {
            <path [attr.d]="leaf" [attr.opacity]="$index % 2 ? 0.62 : 0.86" style="fill: var(--t-dark)" />
          }
        }
      </svg>

      <p class="eyebrow">· Reserva la fecha ·</p>

      <h1 class="names" [style.font-size]="nameSize()">
        @for (name of v().names; track $index) {
          <span>{{ $first ? '' : '& ' }}{{ name }}</span>
        }
      </h1>

      <p class="date">{{ v().date.day }} de {{ v().date.month }} {{ v().date.year }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
      @if (v().message; as message) {
        <p class="text">{{ message }}</p>
      }

      <svg class="chevron" viewBox="0 0 20 10" aria-hidden="true"><path d="M2 2l8 6 8-6" fill="none" stroke-width="1.100" stroke-linecap="round" style="stroke: var(--t-dark)" /></svg>
    </section>

    <footer class="band">
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </footer>
  `,
  styles: `
    :host {
      --status-scale: 0.92;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .paper {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3cqw;
      min-height: 0;
      padding: 0 12cqw;
      /* Grano muy fino, como papel de acuarela. */
      background:
        radial-gradient(rgb(0 0 0 / 0.035) 0.12cqw, transparent 0.16cqw) 0 0 / 0.9cqw 0.9cqw,
        var(--t-paper);
      overflow: hidden;
      isolation: isolate;
    }
    .art { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }
    .eyebrow { font-family: var(--font-serif); font-size: 2.6cqw; letter-spacing: 0.3em; text-transform: uppercase; }
    .names { display: grid; font-family: var(--font-script); font-weight: 400; line-height: 1.05; overflow-wrap: anywhere; }
    .date { font-family: var(--font-serif); font-size: 3.4cqw; font-weight: 600; }
    .where { font-size: 2.2cqw; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.75; }
    .text {
      display: -webkit-box;
      max-width: 60cqw;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.1cqw;
      font-style: italic;
      line-height: 1.35;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .chevron { position: absolute; bottom: 5cqw; left: 50%; width: 8cqw; height: 4cqw; translate: -50% 0; }
    .band { flex: none; display: grid; justify-items: center; gap: 3cqw; padding: 5cqw 0 4.500cqw; background: var(--t-main); color: #fff; }
    .logo { width: 22cqw; height: auto; opacity: 0.9; }
  `,
})
export class TicketLeaves {
  readonly v = input.required<TicketView>();

  protected readonly sprigs = [
    // Esquina superior izquierda
    sprig(-2, 44, -42, 5, 7),
    sprig(-3, 36, -18, 4, 6),
    sprig(2, 52, -64, 4, 5.500),
    // Esquina inferior derecha
    sprig(102, 96, 138, 5, 7),
    sprig(103, 106, 162, 4, 6),
    sprig(98, 90, 116, 4, 5.500),
  ];

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 14, 7, 8));
}
