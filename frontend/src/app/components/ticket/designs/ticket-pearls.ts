import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { alongCurve } from '../ticket-art';
import { TicketStatus } from '../ticket-status';
import { DEFAULT_TICKET_NOTE, TicketView, fitSize } from '../ticket-view';

const WEEKDAY = new Intl.DateTimeFormat('es-MX', { weekday: 'long', timeZone: 'UTC' });

/**
 * Perlas (ref. Bodas/Joyería): nombres en mayúsculas, paño de seda con hilos de perlas (sin fotografía),
 * sobre con una nota sujeta con clip y la fecha entre el día anterior y el siguiente, marcada con una perla.
 */
@Component({
  selector: 'app-ticket-pearls',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <radialGradient id="pearl-shine" cx="36%" cy="32%" r="70%">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.45" stop-color="#f3ece2" />
          <stop offset="1" stop-color="#bfb1a0" />
        </radialGradient>
      </defs>
    </svg>

    <header class="head">
      <h1 class="names" [style.font-size]="nameSize()">
        @for (name of v().names; track $index) {
          <span>{{ name }}</span>
        }
      </h1>
      <p class="script">¡Reserva la fecha!</p>
    </header>

    <!-- Paño de seda: pliegues suaves en el color del diseño -->
    <svg class="silk" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <rect width="100" height="36" style="fill: var(--t-main)" />
      <path d="M0 0H100V9C70 -2 34 14 0 4z" style="fill: color-mix(in srgb, var(--t-main) 55%, white)" />
      <path d="M0 9C30 20 64 4 100 16V22C66 9 32 26 0 15z" style="fill: color-mix(in srgb, var(--t-main) 72%, white)" />
      <path d="M0 19C34 31 66 13 100 26V30C66 18 34 35 0 24z" style="fill: color-mix(in srgb, var(--t-main) 60%, var(--t-dark))" />
      <path d="M0 29C34 39 68 24 100 33V36H0z" style="fill: var(--t-dark)" opacity="0.55" />
      <path d="M0 6C32 17 66 1 100 12M0 26C34 37 68 20 100 31" fill="none" stroke="#fff" stroke-width="0.2" opacity="0.5" />
    </svg>

    <!-- Hilos de perlas que caen sobre la seda -->
    <svg class="strand" viewBox="0 0 100 70" aria-hidden="true">
      @for (pearl of fineStrand; track $index) {
        <circle [attr.cx]="pearl[0]" [attr.cy]="pearl[1]" r="1.1" fill="url(#pearl-shine)" stroke="#a89a88" stroke-width="0.1" />
      }
      @for (pearl of strand; track $index) {
        <circle [attr.cx]="pearl[0]" [attr.cy]="pearl[1]" r="1.75" fill="url(#pearl-shine)" stroke="#a89a88" stroke-width="0.12" />
      }
    </svg>

    <section class="invite">
      <div class="envelope" aria-hidden="true">
        <span class="envelope__flap"></span>
        <span class="envelope__mono">{{ v().monogram.join('') }}</span>
      </div>
      <div class="note">
        <svg class="clip" viewBox="0 0 12 30" aria-hidden="true">
          <path d="M3 8v15a3 3 0 006 0V6a2.200 2.200 0 00-4.400 0v14" fill="none" stroke="#9a9a9a" stroke-width="0.9" stroke-linecap="round" />
        </svg>
        <p>{{ v().message ?? defaultNote }}</p>
        @if (v().time || v().place) {
          <small>{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</small>
        }
      </div>
    </section>

    <section class="when">
      <p class="month">{{ v().date.month }} {{ v().date.year }}</p>
      <div class="days">
        <span><small>{{ around().before.weekday }}</small>{{ around().before.day }}</span>
        <span class="is-day"><small>{{ v().date.weekday }}</small>{{ v().date.day }}</span>
        <span><small>{{ around().after.weekday }}</small>{{ around().after.day }}</span>
      </div>
      <!-- Perla colgante que marca el día -->
      <svg class="pendant" viewBox="0 0 10 22" aria-hidden="true">
        <path d="M5 0v9" stroke="#a89a88" stroke-width="0.4" />
        <circle cx="5" cy="3" r="0.9" fill="#a89a88" />
        <path d="M5 6.500l1.600 1.600L5 9.700 3.400 8.100z" fill="#cfc4b4" stroke="#a89a88" stroke-width="0.25" />
        <circle cx="5" cy="15" r="4.200" fill="url(#pearl-shine)" stroke="#a89a88" stroke-width="0.2" />
      </svg>
    </section>

    <footer class="foot">
      <app-ticket-status [v]="v()" />
      <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </footer>
  `,
  styles: `
    :host {
      --status-scale: 0.66;
      --status-font: var(--font-serif);

      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
      overflow: hidden;
    }
    p, h1 { margin: 0; }
    .head { flex: none; padding: 7cqw 8cqw 3cqw; background: linear-gradient(180deg, color-mix(in srgb, var(--t-paper) 60%, white), var(--t-paper)); }
    .names { display: grid; font-family: var(--font-serif); font-weight: 400; letter-spacing: 0.06em; line-height: 0.98; text-transform: uppercase; overflow-wrap: anywhere; }
    .script { margin-top: 1cqw; font-family: var(--font-script); font-size: 6.4cqw; line-height: 1.1; }
    .silk { flex: none; display: block; width: 100%; height: 36cqw; }
    .strand { position: absolute; top: 20cqw; left: 0; z-index: 1; width: 100%; height: 70cqw; pointer-events: none; filter: drop-shadow(0 0.5cqw 0.7cqw rgb(0 0 0 / 0.35)); }
    .invite { position: relative; flex: none; display: grid; place-items: center; height: 44cqw; background: var(--t-paper); }
    .envelope {
      grid-area: 1 / 1;
      position: relative;
      width: 76cqw;
      height: 32cqw;
      margin-top: 8cqw;
      background: color-mix(in srgb, var(--t-main) 42%, var(--t-paper));
      box-shadow: 0 1.4cqw 3cqw rgb(0 0 0 / 0.2);
      rotate: -3deg;
    }
    .envelope__flap { position: absolute; inset: 0; background: color-mix(in srgb, var(--t-main) 58%, var(--t-paper)); clip-path: polygon(0 100%, 50% 42%, 100% 100%); }
    .envelope__mono { position: absolute; inset: auto 0 2.6cqw; font-family: var(--font-script); font-size: 5cqw; color: color-mix(in srgb, var(--t-dark) 60%, transparent); }
    .note {
      grid-area: 1 / 1;
      position: relative;
      display: grid;
      align-content: center;
      gap: 1.4cqw;
      width: 58cqw;
      min-height: 25cqw;
      margin: -9cqw 0 0 6cqw;
      padding: 3.4cqw 4.6cqw;
      background: color-mix(in srgb, var(--t-paper) 35%, white);
      box-shadow: 0 1cqw 2.4cqw rgb(0 0 0 / 0.18);
      rotate: 1.500deg;
    }
    .note p {
      display: -webkit-box;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3cqw;
      line-height: 1.4;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
      line-clamp: 4;
    }
    .note small { font-size: 1.9cqw; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.75; }
    .clip { position: absolute; top: -3.4cqw; right: 3cqw; width: 4cqw; height: 10cqw; }
    .when { position: relative; flex: 1; display: grid; align-content: center; justify-items: center; gap: 1.600cqw; min-height: 0; padding: 0 9cqw; }
    .month { font-family: var(--font-serif); font-size: 5.6cqw; letter-spacing: 0.12em; text-transform: uppercase; }
    .days { display: grid; grid-template-columns: 1fr 1fr 1fr; width: 100%; border-block: 0.2cqw solid color-mix(in srgb, var(--t-ink) 30%, transparent); }
    .days span { display: grid; gap: 0.4cqw; padding: 1.600cqw 0; font-family: var(--font-serif); font-size: 5.4cqw; line-height: 1; opacity: 0.75; }
    .days span + span { border-left: 0.2cqw solid color-mix(in srgb, var(--t-ink) 30%, transparent); }
    .days small { font-size: 2.2cqw; text-transform: capitalize; }
    .days .is-day { font-size: 7.4cqw; font-weight: 600; opacity: 1; }
    .pendant { width: 5cqw; height: 11cqw; margin-top: -2cqw; }
    .foot { flex: none; display: grid; justify-items: center; gap: 1.600cqw; padding: 3cqw 0 3.400cqw; background: var(--t-main); color: #fbf8f4; }
    .logo { width: 20cqw; height: auto; opacity: 0.9; }
  `,
})
export class TicketPearls {
  readonly v = input.required<TicketView>();
  protected readonly defaultNote = DEFAULT_TICKET_NOTE;

  /** Perlas a lo largo de una curva que entra por la derecha y cae hacia la izquierda. */
  protected readonly strand = alongCurve([104, 4], [70, 62], [-4, 30], 30);
  /** Segundo hilo, más fino, que cruza en sentido contrario. */
  protected readonly fineStrand = alongCurve([-4, 14], [36, 50], [104, 32], 44);

  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 13, 6.5, 7));

  /** Día anterior y siguiente al evento (con su día de la semana). */
  protected readonly around = computed(() => {
    const base = Date.parse(`${this.v().iso}T00:00:00Z`);
    const at = (offset: number) => {
      const date = new Date(base + offset * 86_400_000);
      return { weekday: WEEKDAY.format(date), day: date.getUTCDate() };
    };
    return { before: at(-1), after: at(1) };
  });
}
