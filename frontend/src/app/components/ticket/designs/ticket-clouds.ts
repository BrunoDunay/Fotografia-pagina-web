import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { seeded } from '../ticket-art';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Nubes (ref. XV años/Nubes rosas): cielo de nubes con brillos, monograma enorme de letras finas,
 * nombre manuscrito en blanco con la fecha separada por líneas, y un panel blanco de borde curvo.
 */
@Component({
  selector: 'app-ticket-clouds',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sky" [class.is-light]="v().lightMain">
      <svg class="sparkles" viewBox="0 0 100 110" preserveAspectRatio="none" aria-hidden="true">
        @for (s of sparkles; track $index) {
          <circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.r" fill="#fff" [attr.opacity]="s.o" />
        }
      </svg>

      <div class="mono" aria-hidden="true">
        <span>{{ v().monogram[0] }}</span>
        @if (v().monogram[1]; as second) {
          <span>{{ second }}</span>
          <i></i>
        }
      </div>

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

      <p class="date">
        <span>{{ v().digits.day }}</span><i></i><span>{{ v().digits.month }}</span><i></i><span>{{ v().date.year }}</span>
      </p>
    </section>

    <section class="panel">
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
      <app-ticket-calendar [v]="v()" />
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </section>
  `,
  styles: `
    :host {
      --cal-accent: var(--t-dark);
      --cal-on: #fff;
      --cal-scale: 0.86;
      --status-scale: 0.74;

      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
    }
    p, h1 { margin: 0; }
    .sky {
      position: relative;
      flex: none;
      height: 108cqw;
      /* Nubes: manchas blancas difusas sobre un cielo en degradado. */
      background:
        radial-gradient(46cqw 20cqw at 18% 88%, rgb(255 255 255 / 0.85), transparent 70%),
        radial-gradient(52cqw 24cqw at 78% 96%, rgb(255 255 255 / 0.8), transparent 70%),
        radial-gradient(40cqw 18cqw at 88% 58%, color-mix(in srgb, var(--t-accent) 85%, transparent), transparent 70%),
        radial-gradient(44cqw 20cqw at 8% 52%, color-mix(in srgb, var(--t-accent) 80%, transparent), transparent 70%),
        radial-gradient(60cqw 26cqw at 60% 26%, color-mix(in srgb, var(--t-accent) 60%, transparent), transparent 72%),
        linear-gradient(180deg, var(--t-dark), var(--t-main) 55%, color-mix(in srgb, var(--t-main) 60%, white));
      color: #fff;
      overflow: hidden;
      isolation: isolate;
    }
    /* Variación clara (casi blanca): el texto del cielo va en el color de tinta. */
    .sky.is-light { color: var(--t-ink); }
    .sky.is-light h1 { text-shadow: none; }
    .sky.is-light .mono i { background: var(--t-ink); }
    .sparkles { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }
    .mono { position: absolute; top: 5cqw; left: 6cqw; font-size: 56cqw; font-weight: 200; line-height: 0.82; }
    .mono span { display: block; }
    .mono span:nth-child(2) { margin: -0.42em 0 0 0.42em; }
    /* Trazo diagonal fino que cruza las dos letras. */
    .mono i { position: absolute; top: 4%; left: 58%; width: 0.25cqw; height: 104%; background: #fff; rotate: 21deg; transform-origin: top; }
    .names { position: absolute; right: 6cqw; bottom: 21cqw; display: grid; align-items: center; justify-items: end; max-width: 70cqw; }
    .amp { grid-area: 1 / 1; justify-self: start; margin-left: -0.5em; font-family: var(--font-serif); font-size: 2.6em; line-height: 0.7; opacity: 0.4; }
    h1 { grid-area: 1 / 1; display: grid; font-family: var(--font-script); font-size: 1em; font-weight: 400; line-height: 1.02; text-shadow: 0 0.3cqw 1.2cqw color-mix(in srgb, var(--t-dark) 60%, transparent); }
    h1 span:nth-child(2) { padding-left: 1.2em; }
    .date { position: absolute; inset: auto 0 11cqw; display: flex; align-items: center; justify-content: center; gap: 2.6cqw; font-size: 5cqw; font-weight: 300; letter-spacing: 0.08em; }
    .date i { width: 0.25cqw; height: 5cqw; background: currentColor; opacity: 0.8; }
    /* Panel blanco con el borde superior curvo, como en la referencia. */
    .panel {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      min-height: 0;
      margin-top: -7cqw;
      padding: 5cqw 9cqw 3cqw;
      border-radius: 50% 50% 0 0 / 9cqw 9cqw 0 0;
      background: var(--t-paper);
    }
    .where { font-size: 2.2cqw; letter-spacing: 0.2em; text-transform: uppercase; }
    .logo { width: 21cqw; height: auto; opacity: 0.75; }
  `,
})
export class TicketClouds {
  readonly v = input.required<TicketView>();

  protected readonly sparkles = (() => {
    const random = seeded(31);
    return Array.from({ length: 46 }, () => ({
      x: Math.round(random() * 1000) / 10,
      y: Math.round(random() * 800) / 10,
      r: Math.round((0.12 + random() * 0.34) * 100) / 100,
      o: Math.round((0.35 + random() * 0.6) * 100) / 100,
    }));
  })();

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 11, 6.4, 9));
}
