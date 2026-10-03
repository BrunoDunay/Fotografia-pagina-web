import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketCalendar } from '../ticket-calendar';
import { TicketStatus } from '../ticket-status';
import { TicketView, fitSize } from '../ticket-view';

/** Sobre clásico (refs. Bodas/Sobre azul, cremita y vino): sobre con los nombres, monograma y calendario. */
@Component({
  selector: 'app-ticket-envelope',
  imports: [TicketCalendar, TicketStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-envelope.html',
  styleUrl: './ticket-envelope.css',
})
export class TicketEnvelope {
  readonly v = input.required<TicketView>();

  /** Tamaño del script según el nombre más largo, para que no se desborde del sobre. */
  protected readonly nameSize = computed(() => fitSize([...this.v().names].sort((a, b) => b.length - a.length)[0], 9.5, 5.4, 12));
}
