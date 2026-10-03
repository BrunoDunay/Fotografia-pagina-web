import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/**
 * Cuna (ref. Baby shower/diseño de tela): fondo liso con marco de línea fina, cuna tipo moisés con dos globos
 * (uno en forma de corazón), título manuscrito y la fecha en un círculo entre dos líneas.
 */
@Component({
  selector: 'app-ticket-cradle',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="frame" aria-hidden="true"></span>
    <svg class="art" viewBox="0 0 100 92" aria-hidden="true">
      <!-- Globos y sus hilos -->
      <path d="M52 30C51 40 53 48 55 54M70 33C66 40 62 47 58 54" fill="none" stroke-width="0.35" style="stroke: var(--t-dark)" />
      <path d="M52 30c-9-6-15-12-13-18 1.500-5 8-6 13-1 5-5 12-4 13 1 2 6-4 12-13 18z" style="fill: var(--t-dark)" />
      <path d="M52 30l-1.800 2.600h3.600z" style="fill: var(--t-dark)" />
      <ellipse cx="73" cy="20" rx="9" ry="12" transform="rotate(14 73 20)" style="fill: var(--t-accent)" />
      <path d="M70 32.500l-2 2.600 3.600.6z" style="fill: var(--t-accent)" />
      <path d="M76 12c2 1.500 3 4 3 6.500" fill="none" stroke="#fff" stroke-width="0.6" stroke-linecap="round" opacity="0.6" />

      <!-- Capota -->
      <path d="M25 58C22 44 28 32 40 30c5 4 8 12 8 22z" style="fill: var(--t-paper)" />
      <path d="M40 30c4 5 6.500 12 6.500 20" fill="none" stroke-width="0.5" style="stroke: color-mix(in srgb, var(--t-dark) 45%, transparent)" />
      <path d="M33 34c3 5 5 11 5 18" fill="none" stroke-width="0.3" style="stroke: color-mix(in srgb, var(--t-dark) 30%, transparent)" />
      <!-- Cuerpo de la cuna -->
      <path d="M24 55c0-2 2-3 5-3h44c3 0 5 1 5 3 0 9-8 15-27 15S24 64 24 55z" style="fill: var(--t-paper)" />
      <path d="M46 52h28c2 0 3 .6 3 1.600H46z" style="fill: color-mix(in srgb, var(--t-dark) 55%, var(--t-paper))" />
      <!-- Canasta tejida -->
      <path d="M28 64c5 4 13 6 23 6s18-2 23-6c-1 5-9 9-23 9s-22-4-23-9z" style="fill: var(--t-accent)" />
      <g fill="none" stroke-width="0.35" style="stroke: var(--t-dark)" opacity="0.7">
        <path d="M29 66c6 3 14 4.500 22 4.500S67 69 73 66M31 68.500c6 2.400 13 3.400 20 3.400s14-1 20-3.400" />
        <path d="M36 66.500l-1 5M42 68l-.6 5M48 68.800l-.2 4.600M54 68.800l.2 4.600M60 68l.6 5M66 66.500l1 5" />
      </g>
      <!-- Patas y balancín -->
      <g style="fill: var(--t-accent)">
        <path d="M37 72h3l1 12h-4zM46 73h3v11h-3zM54 73h3v11h-3zM62 72h3v12h-4z" />
        <path d="M26 82c8 5 42 5 50 0l1.600 2.400C68 91 34 91 24.400 84.400z" />
      </g>
      <path d="M26 82c8 5 42 5 50 0" fill="none" stroke-width="0.4" style="stroke: var(--t-dark)" opacity="0.6" />
    </svg>

    <h1 class="names" [style.font-size]="nameSize()">{{ v().title }}</h1>

    <div class="date">
      <span>{{ v().date.weekday }}</span>
      <i></i>
      <b>
        <strong>{{ v().date.day }}</strong>
        <small>{{ month() }}</small>
      </b>
      <i></i>
      <span>{{ v().time ?? v().date.year }}</span>
    </div>

    <div class="lines">
      @if (v().place; as place) {
        <p>{{ place }}</p>
      }
      @if (v().message; as message) {
        <p class="text">{{ message }}</p>
      }
    </div>

    <app-ticket-status [v]="v()" />
    <img class="logo" src="/brand/logo-dark.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
  `,
  styles: `
    :host {
      --status-scale: 0.76;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      position: relative;
      padding: 10cqw 10cqw 9cqw;
      /* Fondo liso con un halo de luz detrás de la cuna. */
      background:
        radial-gradient(62cqw 50cqw at 50% 42cqw, color-mix(in srgb, var(--t-paper) 85%, white), transparent 72%),
        linear-gradient(180deg, color-mix(in srgb, var(--t-main) 72%, white), var(--t-main));
      color: var(--t-ink);
      text-align: center;
      isolation: isolate;
    }
    p, h1 { margin: 0; }
    /* Marco de doble línea fina (elemento real: los pseudo-elementos no salen al exportar). */
    .frame {
      position: absolute;
      inset: 4cqw;
      z-index: -1;
      border: 0.22cqw solid color-mix(in srgb, var(--t-dark) 55%, transparent);
      outline: 0.12cqw solid color-mix(in srgb, var(--t-dark) 40%, transparent);
      outline-offset: -1.5cqw;
    }
    .art { flex: none; width: 76cqw; height: 70cqw; filter: drop-shadow(0 1cqw 1.600cqw rgb(0 0 0 / 0.12)); }
    .names { font-family: var(--font-script); font-weight: 400; line-height: 1.1; overflow-wrap: anywhere; }
    .date { display: flex; align-items: center; gap: 2.4cqw; font-family: var(--font-serif); font-size: 3.6cqw; text-transform: capitalize; }
    .date span { flex: 1; min-width: 20cqw; }
    .date span:first-child { text-align: right; }
    .date span:last-child { text-align: left; text-transform: none; }
    .date b {
      display: grid;
      place-content: center;
      justify-items: center;
      width: 19cqw;
      height: 19cqw;
      border-radius: 50%;
      background: var(--t-paper);
      font-weight: 400;
    }
    /* Líneas verticales a los lados del círculo (elementos reales: los pseudo-elementos no salen al exportar). */
    .date i { flex: none; width: 0.4cqw; height: 14cqw; background: var(--t-ink); }
    .date strong { font-family: var(--font-script); font-size: 9cqw; font-weight: 400; line-height: 0.9; }
    .date small { font-size: 3.4cqw; letter-spacing: 0.1em; text-transform: uppercase; }
    .lines { display: grid; gap: 1cqw; font-family: var(--font-serif); font-size: 3.1cqw; line-height: 1.4; }
    .text { display: -webkit-box; max-width: 68cqw; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; }
    .logo { width: 22cqw; height: auto; opacity: 0.75; }
  `,
})
export class TicketCradle {
  readonly v = input.required<TicketView>();
  protected readonly month = computed(() => this.v().date.month.slice(0, 3));
  protected readonly nameSize = computed(() => fitSize(this.v().title, 13, 7, 11));
}
