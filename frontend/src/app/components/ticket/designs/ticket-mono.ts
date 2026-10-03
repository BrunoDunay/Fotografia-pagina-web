import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '../ticket-status';
import { DEFAULT_TICKET_NOTE, TicketView, fitSize } from '../ticket-view';

/**
 * Blanco y negro (ref. Bodas/Blanco y negro elegante): foto en blanco y negro con la fecha
 * en números finos, carta en papel crema con firma manuscrita y barra de cuenta regresiva.
 */
@Component({
  selector: 'app-ticket-mono',
  imports: [TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      @if (v().photo; as photo) {
        <img class="hero__img" [src]="photo" alt="" crossorigin="anonymous" />
      }
      <div class="hero__veil"></div>
      <p class="top">Save the date</p>
      <p class="top">{{ v().title }}</p>
      <span class="line" aria-hidden="true"></span>
      <p class="big">{{ v().digits.day }}</p>
      <p class="big">{{ month() }}</p>
      <p class="big">{{ v().digits.year }}</p>
      <span class="line" aria-hidden="true"></span>
      <p class="sub">El gran día</p>
    </section>

    <section class="letter">
      <h2>Reserva la fecha</h2>
      <p class="text">{{ v().message ?? defaultNote }}</p>
      @if (v().time || v().place) {
        <p class="where">{{ v().time }}{{ v().time && v().place ? ' · ' : '' }}{{ v().place }}</p>
      }
      <p class="script date">{{ v().shortDate }}</p>
      <p class="script sign" [style.font-size]="signSize()">{{ v().title }}</p>
    </section>

    <footer class="bar">
      <app-ticket-status [v]="v()" [divided]="true" />
      <img class="logo" src="/brand/logo-light.webp" alt="Armando Ovalle Wedding Studio" width="600" height="146" />
    </footer>
  `,
  styles: `
    :host {
      --status-scale: 0.66;
      --status-font: var(--font-serif);

      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--t-paper);
      color: var(--t-ink);
      text-align: center;
    }
    p, h2 { margin: 0; }
    .hero {
      position: relative;
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6cqw;
      height: 88cqw;
      padding: 5cqw 8cqw;
      background: linear-gradient(160deg, color-mix(in srgb, var(--t-dark) 70%, #777), var(--t-dark));
      color: var(--t-accent);
      overflow: hidden;
      isolation: isolate;
    }
    .hero__img { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); }
    .hero__veil { position: absolute; inset: 0; z-index: -1; background: color-mix(in srgb, var(--t-dark) 52%, transparent); }
    .top { font-family: var(--font-serif); font-size: 2.5cqw; letter-spacing: 0.22em; line-height: 1.7; text-transform: uppercase; }
    .line { width: 0.2cqw; height: 9cqw; margin: 2cqw 0; background: currentColor; opacity: 0.85; }
    .big { font-size: 15.5cqw; font-weight: 200; letter-spacing: 0.02em; line-height: 0.98; text-transform: uppercase; }
    .sub { font-family: var(--font-serif); font-size: 2.4cqw; letter-spacing: 0.28em; text-transform: uppercase; }
    .letter { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.6cqw; min-height: 0; padding: 3cqw 10cqw; }
    h2 { font-family: var(--font-serif); font-size: 5.2cqw; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
    .text {
      display: -webkit-box;
      overflow: hidden;
      font-family: var(--font-serif);
      font-size: 3.3cqw;
      line-height: 1.5;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
      line-clamp: 4;
    }
    .where { font-size: 2.2cqw; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.75; }
    .script { align-self: flex-end; font-family: var(--font-script); line-height: 1.1; }
    .date { margin-right: 14cqw; font-size: 6.4cqw; }
    .sign { overflow-wrap: anywhere; }
    .bar { flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2cqw; height: 27cqw; background: var(--t-main); color: #f6f2ec; }
    .logo { width: 20cqw; height: auto; opacity: 0.85; }
  `,
})
export class TicketMono {
  readonly v = input.required<TicketView>();
  protected readonly defaultNote = DEFAULT_TICKET_NOTE;
  /** "octubre" → "OCT" */
  protected readonly month = computed(() => this.v().date.month.slice(0, 3));
  protected readonly signSize = computed(() => fitSize(this.v().title, 8.4, 5, 16));
}
