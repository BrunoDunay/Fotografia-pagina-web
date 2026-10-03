import { sequelize } from '../config/database.js';
import { Client, Event, Payment, Reservation, Service, Package } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { generatePublicCode } from '../utils/public-code.js';
import { toNumber } from './serializers.js';
import { normalizeTicketStyle } from '../config/ticket-designs.js';

/** Iniciales para el monograma: "Camila & Sebastián" → "C|S"; "Ana López" → "AL". */
export function buildMonogram(title) {
  const parts = title.split(/\s*(?:&|\by\b)\s*/i).filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .slice(0, 2)
      .map((p) => p.trim()[0]?.toUpperCase() ?? '')
      .join('|');
  }
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export async function uniquePublicCode(transaction) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePublicCode();
    const exists = await Reservation.count({ where: { publicCode: code }, transaction });
    if (!exists) return code;
  }
  throw new AppError(500, 'No se pudo generar el código de la reservación. Intenta de nuevo.', 'CODE_GENERATION');
}

/**
 * Flujo rápido "Hoy contraté una boda para el 24 de octubre":
 * crea/usa el cliente, el evento, el pago inicial y la reservación en una sola transacción.
 */
export async function createEventWithBooking(data) {
  return sequelize.transaction(async (transaction) => {
    let clientId = data.clientId;
    if (!clientId) {
      const client = await Client.create(data.newClient, { transaction });
      clientId = client.id;
    } else if (!(await Client.count({ where: { id: clientId }, transaction }))) {
      throw notFound('El cliente');
    }

    if (data.serviceId && !(await Service.count({ where: { id: data.serviceId }, transaction }))) {
      throw notFound('El tipo de evento');
    }
    if (data.packageId && !(await Package.count({ where: { id: data.packageId }, transaction }))) {
      throw notFound('El paquete');
    }

    const event = await Event.create(
      {
        clientId,
        serviceId: data.serviceId ?? null,
        packageId: data.packageId ?? null,
        title: data.title,
        eventDate: data.eventDate,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        venue: data.venue ?? null,
        city: data.city ?? null,
        totalPrice: data.totalPrice ?? 0,
        status: data.status ?? 'confirmed',
        blocksAvailability: data.blocksAvailability ?? true,
        notes: data.notes ?? null,
      },
      { transaction },
    );

    if (data.initialPayment) {
      await Payment.create({ ...data.initialPayment, eventId: event.id }, { transaction });
    }

    const displayTitle = data.reservation?.displayTitle || data.title;
    await Reservation.create(
      {
        eventId: event.id,
        publicCode: await uniquePublicCode(transaction),
        displayTitle,
        monogram: data.reservation?.monogram || buildMonogram(displayTitle),
        message: data.reservation?.message ?? null,
        ...normalizeTicketStyle(data.reservation?.ticketDesign, data.reservation?.ticketPalette),
      },
      { transaction },
    );

    return event.id;
  });
}

/** Totales calculados (no se guardan): pagado, saldo y estado. */
export function paymentSummary(totalPrice, payments) {
  const total = toNumber(totalPrice) ?? 0;
  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = Math.round((total - paid) * 100) / 100;
  const status = paid <= 0 ? 'pending' : balance > 0 ? 'partial' : 'paid';
  return { total, paid, balance, status };
}
