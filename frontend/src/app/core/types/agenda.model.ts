import { Media } from './common.model';

export type EventStatus = 'tentative' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentConcept = 'apartado' | 'abono' | 'liquidacion' | 'otro';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
export type TicketPalette = 'mocha' | 'navy' | 'burgundy';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface PaymentSummary {
  total: number;
  paid: number;
  balance: number;
  status: PaymentStatus;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  eventsCount?: number;
}

export interface EventSummary {
  id: string;
  title: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  city: string | null;
  status: EventStatus;
  blocksAvailability: boolean;
  client: Pick<Client, 'id' | 'name' | 'phone'>;
  service: { id: string; name: string; slug: string } | null;
  package: { id: string; name: string } | null;
  reservation: { id: string; publicCode: string; isActive: boolean } | null;
  payment: PaymentSummary;
}

export interface Payment {
  id: string;
  eventId: string;
  amount: number;
  paidAt: string;
  concept: PaymentConcept;
  method: PaymentMethod;
  notes: string | null;
}

export interface Reservation {
  id: string;
  eventId: string;
  publicCode: string;
  displayTitle: string;
  monogram: string | null;
  message: string | null;
  ticketPalette: TicketPalette;
  coverMediaId: string | null;
  showTime: boolean;
  showVenue: boolean;
  isActive: boolean;
}

export interface EventDetail extends Omit<EventSummary, 'reservation' | 'client'> {
  totalPrice: number;
  notes: string | null;
  client: Client;
  payments: Payment[];
  reservation: Reservation | null;
}

/** Ticket público: nunca trae pagos ni datos de contacto. */
export interface PublicReservation {
  code: string;
  title: string;
  monogram: string | null;
  message: string | null;
  palette: TicketPalette;
  cover: Media | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  city: string | null;
  service: { name: string; slug: string } | null;
  package: { name: string } | null;
  today: string;
}

export interface AvailabilityResponse {
  from: string;
  to: string;
  today: string;
  days: { date: string; status: 'busy' }[];
}

export interface Dashboard {
  today: string;
  upcomingEvents: EventSummary[];
  eventsThisMonth: number;
  pendingPayments: { events: number; balance: number };
  provisional: { type: string; id: string; label: string }[];
}
