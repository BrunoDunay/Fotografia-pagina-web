import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PublicReservation } from '../../core/types/agenda.model';
import { ticketDesign, ticketPalette } from '../../core/ticket-designs';
import { countdownTo, dateParts, ticketStage, todayInMexico } from '../../core/utils/date-mx';
import { cloudinaryUrl } from '../../core/utils/cloudinary-url';
import { ticketMarkFor } from './ticket-mark';
import { TicketView } from './ticket-view';
import { TicketEnvelope } from './designs/ticket-envelope';
import { TicketEditorial } from './designs/ticket-editorial';
import { TicketStub } from './designs/ticket-stub';
import { TicketBoarding } from './designs/ticket-boarding';
import { TicketCalendarCard } from './designs/ticket-calendar-card';
import { TicketMoon } from './designs/ticket-moon';
import { TicketBotanic } from './designs/ticket-botanic';
import { TicketGrad } from './designs/ticket-grad';
import { TicketMono } from './designs/ticket-mono';
import { TicketPearls } from './designs/ticket-pearls';
import { TicketGarden } from './designs/ticket-garden';
import { TicketLace } from './designs/ticket-lace';
import { TicketPalms } from './designs/ticket-palms';
import { TicketPalmPhoto } from './designs/ticket-palm-photo';
import { TicketDoves } from './designs/ticket-doves';
import { TicketPassport } from './designs/ticket-passport';
import { TicketRoses } from './designs/ticket-roses';
import { TicketClouds } from './designs/ticket-clouds';
import { TicketGlass } from './designs/ticket-glass';
import { TicketLeaves } from './designs/ticket-leaves';
import { TicketCradle } from './designs/ticket-cradle';

/** Luminancia aproximada (0–255) de un #rrggbb. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
const isDark = (hex: string) => luminance(hex) < 128;

/** Datos mínimos para pintar un ticket (el ticket público o la vista previa del panel). */
export type TicketData = Pick<
  PublicReservation,
  'title' | 'monogram' | 'message' | 'design' | 'palette' | 'cover' | 'eventDate' | 'startTime' | 'endTime' | 'venue' | 'city' | 'eventType'
>;

/**
 * Ticket digital de reservación. Elige el diseño (sobre, boleto, palmeras…) y aplica su variación de color.
 *
 * Es una tira 9:16 dimensionada con unidades de contenedor (cqw): se ve igual en cualquier
 * pantalla y al capturarla como imagen (1080×1920) para historias de Instagram/WhatsApp.
 * Solo muestra datos públicos: nunca pagos, contacto, ni el servicio o paquete contratado.
 */
@Component({
  selector: 'app-reservation-ticket',
  imports: [
    TicketEnvelope,
    TicketEditorial,
    TicketStub,
    TicketBoarding,
    TicketCalendarCard,
    TicketMoon,
    TicketBotanic,
    TicketGrad,
    TicketMono,
    TicketPearls,
    TicketGarden,
    TicketLace,
    TicketPalms,
    TicketPalmPhoto,
    TicketDoves,
    TicketPassport,
    TicketRoses,
    TicketClouds,
    TicketGlass,
    TicketLeaves,
    TicketCradle,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--t-main]': 'colors().main',
    '[style.--t-dark]': 'colors().dark',
    '[style.--t-paper]': 'colors().paper',
    '[style.--t-ink]': 'colors().ink',
    '[style.--t-accent]': 'colors().accent',
  },
  template: `
    @switch (design()) {
      @case ('envelope') {
        <app-ticket-envelope [v]="view()" />
      }
      @case ('editorial') {
        <app-ticket-editorial [v]="view()" />
      }
      @case ('ticket') {
        <app-ticket-stub [v]="view()" />
      }
      @case ('boarding') {
        <app-ticket-boarding [v]="view()" />
      }
      @case ('calendar') {
        <app-ticket-calendar-card [v]="view()" />
      }
      @case ('moon') {
        <app-ticket-moon [v]="view()" />
      }
      @case ('botanic') {
        <app-ticket-botanic [v]="view()" />
      }
      @case ('grad') {
        <app-ticket-grad [v]="view()" />
      }
      @case ('mono') {
        <app-ticket-mono [v]="view()" />
      }
      @case ('pearls') {
        <app-ticket-pearls [v]="view()" />
      }
      @case ('garden') {
        <app-ticket-garden [v]="view()" />
      }
      @case ('lace') {
        <app-ticket-lace [v]="view()" />
      }
      @case ('doves') {
        <app-ticket-doves [v]="view()" />
      }
      @case ('palms') {
        <app-ticket-palms [v]="view()" />
      }
      @case ('palmtree') {
        <app-ticket-palm-photo [v]="view()" />
      }
      @case ('passport') {
        <app-ticket-passport [v]="view()" />
      }
      @case ('roses') {
        <app-ticket-roses [v]="view()" />
      }
      @case ('clouds') {
        <app-ticket-clouds [v]="view()" />
      }
      @case ('glass') {
        <app-ticket-glass [v]="view()" />
      }
      @case ('leaves') {
        <app-ticket-leaves [v]="view()" />
      }
      @case ('cradle') {
        <app-ticket-cradle [v]="view()" />
      }
    }
  `,
  styles: `
    :host {
      container-type: inline-size;
      display: block;
      width: 100%;
      aspect-ratio: 9 / 16;
      overflow: hidden;
      box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.45);
      font-family: var(--font-sans);
    }
  `,
})
export class ReservationTicket {
  readonly reservation = input.required<TicketData>();
  /** Instante actual (ms); lo actualiza la página cada segundo en el navegador. */
  readonly now = input.required<number>();

  protected readonly design = computed(() => ticketDesign(this.reservation().design).key);
  protected readonly colors = computed(() => ticketPalette(this.reservation().design, this.reservation().palette));

  protected readonly view = computed<TicketView>(() => {
    const r = this.reservation();
    const title = r.title?.trim() || 'Tu evento';

    // "Camila & Sebastián" → ["Camila", "Sebastián"]; un solo nombre → [nombre].
    const parts = title
      .split(/\s+(?:&|y)\s+/i)
      .map((part) => part.trim())
      .filter(Boolean);
    const names = parts.length >= 2 ? parts.slice(0, 2) : [title];

    const rawMonogram = r.monogram?.trim();
    // Siempre una letra por elemento: "C|S" → ["C","S"]; "VR" → ["V","R"]; sin monograma, las iniciales.
    const initials = (names.length >= 2 ? names : title.split(/\s+/)).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '');
    const monogram = !rawMonogram
      ? initials
      : rawMonogram.includes('|')
        ? rawMonogram.split('|').map((l) => l.trim())
        : [...rawMonogram.replace(/\s+/g, '')].slice(0, 3);

    const [year, month, day] = r.eventDate.split('-');
    const first = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7; // semanas de lunes a domingo
    const total = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
    const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);

    const time = !r.startTime ? null : r.endTime ? `${r.startTime.slice(0, 5)} – ${r.endTime.slice(0, 5)} hrs` : `${r.startTime.slice(0, 5)} hrs`;

    return {
      title,
      names,
      monogram,
      date: dateParts(r.eventDate),
      iso: r.eventDate,
      shortDate: `${day}.${month}.${year}`,
      digits: { day, month, year: year.slice(2) },
      // Estado según el día en México (no el del visitante).
      stage: ticketStage(r.eventDate, todayInMexico(new Date(this.now()))).stage,
      countdown: countdownTo(r.eventDate, r.startTime, this.now()),
      time,
      place: [r.venue, r.city].filter(Boolean).join(', ') || null,
      message: r.message?.trim() || null,
      mark: ticketMarkFor(r.eventType),
      photo: r.cover ? cloudinaryUrl(r.cover.url, { width: 1080 }) : null,
      darkPaper: isDark(this.colors().paper),
      lightMain: luminance(this.colors().main) > 215,
      calendar: { cells, day: Number(day) },
    };
  });
}
