import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../../config/api.config';
import { Paginated } from '../../types/common.model';
import {
  Client,
  Dashboard,
  EventDetail,
  EventStatus,
  EventSummary,
  Payment,
  PaymentSummary,
  Reservation,
} from '../../types/agenda.model';

type Query = Record<string, string | number | boolean | undefined | null>;

function toParams(query: Query = {}): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
  }
  return params;
}

export interface PendingPaymentRow extends PaymentSummary {
  eventId: string;
  title: string;
  eventDate: string;
  client: Pick<Client, 'id' | 'name' | 'phone'>;
  lastPaymentAt: string | null;
}

/** Endpoints privados de agenda (requieren JWT; el authInterceptor lo agrega). */
@Injectable({ providedIn: 'root' })
export class AgendaApiService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);

  dashboard() {
    return this.http.get<Dashboard>(`${this.api}/dashboard`);
  }

  // ---- Eventos ----
  events(query: { from?: string; to?: string; status?: EventStatus; clientId?: string; q?: string } = {}) {
    return this.http.get<EventSummary[]>(`${this.api}/events`, { params: toParams(query) });
  }

  event(id: string) {
    return this.http.get<EventDetail>(`${this.api}/events/${id}`);
  }

  createEvent(body: unknown) {
    return this.http.post<EventDetail>(`${this.api}/events`, body);
  }

  /** Envía al cliente el correo de confirmación; `ticket` es la imagen del ticket digital (opcional). */
  sendConfirmation(id: string, ticket: Blob | null) {
    const form = new FormData();
    if (ticket) form.append('ticket', ticket, 'ticket-digital.jpg');
    return this.http.post<{ sentTo: string; confirmationSentAt: string }>(`${this.api}/events/${id}/send-confirmation`, form);
  }

  updateEvent(id: string, body: unknown) {
    return this.http.put<EventDetail>(`${this.api}/events/${id}`, body);
  }

  setEventStatus(id: string, status: EventStatus) {
    return this.http.patch<EventDetail>(`${this.api}/events/${id}/status`, { status });
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.api}/events/${id}`);
  }

  // ---- Clientes ----
  clients(query: { q?: string; page?: number; limit?: number } = {}) {
    return this.http.get<Paginated<Client>>(`${this.api}/clients`, { params: toParams(query) });
  }

  client(id: string) {
    return this.http.get<Client & { events: unknown[] }>(`${this.api}/clients/${id}`);
  }

  createClient(body: Partial<Client>) {
    return this.http.post<Client>(`${this.api}/clients`, body);
  }

  updateClient(id: string, body: Partial<Client>) {
    return this.http.put<Client>(`${this.api}/clients/${id}`, body);
  }

  deleteClient(id: string, force = false) {
    return this.http.delete<void>(`${this.api}/clients/${id}`, { params: toParams({ force: force || undefined }) });
  }

  // ---- Pagos ----
  pendingPayments() {
    return this.http.get<{ items: PendingPaymentRow[]; totals: { events: number; balance: number } }>(`${this.api}/payments`);
  }

  eventPayments(eventId: string) {
    return this.http.get<{ items: Payment[]; summary: PaymentSummary }>(`${this.api}/payments`, { params: { eventId } });
  }

  createPayment(body: Omit<Payment, 'id'>) {
    return this.http.post<{ payment: Payment; summary: PaymentSummary }>(`${this.api}/payments`, body);
  }

  updatePayment(id: string, body: Partial<Payment>) {
    return this.http.put<{ payment: Payment; summary: PaymentSummary }>(`${this.api}/payments/${id}`, body);
  }

  deletePayment(id: string) {
    return this.http.delete<{ summary: PaymentSummary }>(`${this.api}/payments/${id}`);
  }

  // ---- Reservaciones ----
  reservations() {
    return this.http.get<(Reservation & { event: EventSummary })[]>(`${this.api}/reservations`);
  }

  updateReservation(id: string, body: Partial<Reservation>) {
    return this.http.put<Reservation>(`${this.api}/reservations/${id}`, body);
  }

  regenerateReservationCode(id: string) {
    return this.http.post<Reservation>(`${this.api}/reservations/${id}/regenerate-code`, {});
  }

  // ---- Bloqueos de disponibilidad ----
  availabilityBlocks(from?: string, to?: string) {
    return this.http.get<{ id: string; date: string; privateReason: string | null }[]>(`${this.api}/availability/blocks`, {
      params: toParams({ from, to }),
    });
  }

  createAvailabilityBlock(date: string, privateReason?: string) {
    return this.http.post(`${this.api}/availability/blocks`, { date, privateReason });
  }

  deleteAvailabilityBlock(id: string) {
    return this.http.delete<void>(`${this.api}/availability/blocks/${id}`);
  }
}
