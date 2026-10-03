import { z } from 'zod';
import { isoDate, money, optionalText, pagination, requiredText, time, uuid } from './common.schemas.js';
import { EVENT_STATUSES } from '../models/event.model.js';
import { PAYMENT_CONCEPTS, PAYMENT_METHODS } from '../models/payment.model.js';
import { TICKET_DESIGN_KEYS } from '../config/ticket-designs.js';

const emptyToUndefined = (v) => (v === '' ? undefined : v);

// ---------- Clientes ----------
const clientFields = {
  name: requiredText(160, 'El nombre'),
  phone: optionalText(40),
  email: z
    .union([z.email('Email inválido'), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v ? v.toLowerCase() : null)),
  notes: optionalText(5000),
};
export const clientCreateBody = z.object(clientFields);
export const clientUpdateBody = z.object(clientFields).partial();
export const clientListQuery = pagination.extend({ q: z.string().trim().max(100).optional() });
export const forceQuery = z.object({ force: z.enum(['true', 'false']).optional().transform((v) => v === 'true') });

// ---------- Pagos ----------
const paymentFields = {
  amount: money.refine((v) => v > 0, 'El monto debe ser mayor a 0'),
  paidAt: isoDate,
  concept: z.enum(PAYMENT_CONCEPTS).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  notes: optionalText(1000),
};
export const initialPayment = z.object(paymentFields);
export const paymentCreateBody = z.object({ eventId: uuid, ...paymentFields });
export const paymentUpdateBody = z.object(paymentFields).partial();
export const paymentListQuery = z.object({
  eventId: z.preprocess(emptyToUndefined, uuid.optional()),
  status: z.enum(['pending']).optional(),
});

// ---------- Eventos ----------
const eventFields = {
  title: requiredText(160, 'El nombre del evento'),
  eventDate: isoDate,
  startTime: time,
  endTime: time,
  serviceId: uuid.nullable().optional(),
  packageId: uuid.nullable().optional(),
  venue: optionalText(200),
  city: optionalText(120),
  totalPrice: money.optional(),
  status: z.enum(EVENT_STATUSES).optional(),
  blocksAvailability: z.boolean().optional(),
  notes: optionalText(5000),
};

/** Flujo rápido: cliente existente (clientId) o nuevo (newClient), pago inicial opcional y datos del ticket. */
export const eventCreateBody = z
  .object({
    ...eventFields,
    clientId: uuid.optional(),
    newClient: z.object(clientFields).optional(),
    initialPayment: initialPayment.optional(),
    reservation: z
      .object({
        displayTitle: optionalText(160),
        monogram: optionalText(12),
        message: optionalText(1000),
        ticketDesign: z.enum(TICKET_DESIGN_KEYS).optional(),
        ticketPalette: z.string().trim().max(30).optional(),
      })
      .optional(),
  })
  .refine((d) => Boolean(d.clientId) !== Boolean(d.newClient), {
    path: ['clientId'],
    message: 'Selecciona un cliente existente o captura uno nuevo',
  });

export const eventUpdateBody = z.object({ ...eventFields, clientId: uuid }).partial();
export const eventStatusBody = z.object({ status: z.enum(EVENT_STATUSES) });
export const eventListQuery = z.object({
  from: z.preprocess(emptyToUndefined, isoDate.optional()),
  to: z.preprocess(emptyToUndefined, isoDate.optional()),
  status: z.preprocess(emptyToUndefined, z.enum(EVENT_STATUSES).optional()),
  clientId: z.preprocess(emptyToUndefined, uuid.optional()),
  q: z.string().trim().max(100).optional(),
});

// ---------- Reservaciones ----------
export const codeParams = z.object({ code: z.string().trim().min(6).max(16) });
export const reservationUpdateBody = z
  .object({
    displayTitle: requiredText(160, 'El título'),
    monogram: optionalText(12),
    message: optionalText(1000),
    ticketDesign: z.enum(TICKET_DESIGN_KEYS),
    ticketPalette: z.string().trim().max(30),
    coverMediaId: uuid.nullable(),
    showTime: z.boolean(),
    showVenue: z.boolean(),
    isActive: z.boolean(),
  })
  .partial();

// ---------- Disponibilidad ----------
export const rangeQuery = z.object({ from: isoDate, to: isoDate });
export const optionalRangeQuery = z.object({
  from: z.preprocess(emptyToUndefined, isoDate.optional()),
  to: z.preprocess(emptyToUndefined, isoDate.optional()),
});
export const blockCreateBody = z.object({ date: isoDate, privateReason: optionalText(200) });
