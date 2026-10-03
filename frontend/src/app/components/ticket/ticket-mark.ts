import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Ícono que marca el día del evento, según el tipo de evento. */
export type TicketMarkKind = 'heart' | 'crown' | 'cap' | 'bottle' | 'star';

/** Tipo de evento (slug del servicio) → ícono. Lo que no es romántico, XV, graduación ni baby shower usa una estrella. */
export function ticketMarkFor(eventType: string | null | undefined): TicketMarkKind {
  switch (eventType) {
    case 'weddings':
    case 'beach-weddings':
    case 'proposals':
    case 'save-the-date':
      return 'heart';
    case 'quinceanos':
      return 'crown';
    case 'graduations':
      return 'cap';
    case 'baby-showers':
      return 'bottle';
    default:
      return 'star';
  }
}

const PATHS: Record<TicketMarkKind, string> = {
  heart: 'M12 20.5S3.5 15 3.5 9.2A4.4 4.4 0 0112 6.6a4.4 4.4 0 018.5 2.6C20.5 15 12 20.5 12 20.5z',
  // Corona de tres puntas con base
  crown: 'M3 8l4.2 4L12 5l4.8 7L21 8l-1.6 9.5H4.6zM4.8 19h14.4v2H4.8z',
  // Birrete con borla
  cap: 'M12 3L1 8.5l11 5.5 8-4v6.2h1.6V9.2L23 8.5zM5.5 12.6V16c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-3.4L12 15.800z',
  // Biberón
  bottle: 'M10 2h4v2.2h-4zM9 5h6a1 1 0 011 1v1.200H8V6a1 1 0 011-1zM8 8.400h8l.8 2.600V20a2 2 0 01-2 2H9.200a2 2 0 01-2-2v-9z',
  star: 'M12 2.5l2.9 6 6.600.9-4.800 4.600 1.200 6.500L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z',
};

/**
 * Ícono del día del evento (corazón, corona, birrete, biberón o estrella).
 * El color va como atributo para que también salga al guardar el ticket como imagen.
 */
@Component({
  selector: 'app-ticket-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 24 24"><path [attr.d]="path()" fill="currentColor" /></svg>`,
  styles: `
    :host { display: inline-block; width: 1em; height: 1em; line-height: 0; }
    svg { width: 100%; height: 100%; }
  `,
})
export class TicketMark {
  readonly kind = input.required<TicketMarkKind>();
  protected readonly path = computed(() => PATHS[this.kind()]);
}
