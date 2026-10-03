import { Op } from 'sequelize';
import { Client, Event, MediaAsset, Package, Reservation, Service } from '../models/index.js';
import { notFound } from '../utils/app-error.js';
import { todayInStudioTz } from '../utils/dates-mx.js';
import { uniquePublicCode } from '../services/event-booking.service.js';
import { toMedia } from '../services/serializers.js';
import { normalizeTicketStyle } from '../config/ticket-designs.js';

/**
 * Público: ticket digital. Lista blanca explícita de campos:
 * NUNCA incluye pagos, precio, paquete contratado, notas ni datos de contacto del cliente.
 */
export async function getPublic(req, res) {
  const reservation = await Reservation.findOne({
    where: { publicCode: req.params.code.toUpperCase(), isActive: true },
    include: [
      {
        model: Event,
        as: 'event',
        where: { status: { [Op.ne]: 'cancelled' } },
        attributes: ['eventDate', 'startTime', 'endTime', 'venue', 'city'],
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['slug'],
            include: [
              { model: MediaAsset, as: 'coverMedia' },
              { model: MediaAsset, as: 'heroMedia' },
            ],
          },
        ],
      },
      { model: MediaAsset, as: 'coverMedia' },
    ],
  });
  if (!reservation) throw notFound('La reservación');

  const { event } = reservation;
  res.set('X-Robots-Tag', 'noindex');
  res.json({
    code: reservation.publicCode,
    title: reservation.displayTitle,
    monogram: reservation.monogram,
    message: reservation.message,
    design: reservation.ticketDesign,
    palette: reservation.ticketPalette,
    // Foto del ticket: la que eligió el fotógrafo o, si no hay, la portada del tipo de evento.
    cover: toMedia(reservation.coverMedia) ?? toMedia(event.service?.coverMedia) ?? toMedia(event.service?.heroMedia),
    eventDate: event.eventDate,
    startTime: reservation.showTime ? event.startTime : null,
    endTime: reservation.showTime ? event.endTime : null,
    venue: reservation.showVenue ? event.venue : null,
    city: reservation.showVenue ? event.city : null,
    // Solo el tipo de evento (para el ícono del día): el ticket no muestra el servicio ni el paquete contratado.
    eventType: event.service?.slug ?? null,
    today: todayInStudioTz(),
  });
}

export async function list(_req, res) {
  const reservations = await Reservation.findAll({
    include: [
      {
        model: Event,
        as: 'event',
        attributes: ['id', 'title', 'eventDate', 'status'],
        include: [{ model: Client, as: 'client', attributes: ['id', 'name', 'phone'] }],
      },
    ],
    order: [[{ model: Event, as: 'event' }, 'eventDate', 'DESC']],
  });
  res.json(reservations);
}

async function findOr404(id) {
  const reservation = await Reservation.findByPk(id, { include: [{ model: MediaAsset, as: 'coverMedia' }] });
  if (!reservation) throw notFound('La reservación');
  return reservation;
}

export async function update(req, res) {
  const reservation = await findOr404(req.valid.params.id);
  const body = { ...req.valid.body };
  // El color debe pertenecer al diseño (cada diseño tiene sus propias variaciones).
  if (body.ticketDesign !== undefined || body.ticketPalette !== undefined) {
    Object.assign(body, normalizeTicketStyle(body.ticketDesign ?? reservation.ticketDesign, body.ticketPalette ?? reservation.ticketPalette));
  }
  await reservation.update(body);
  res.json(await findOr404(reservation.id));
}

/** Invalida el enlace anterior (por ejemplo, si se compartió por error). */
export async function regenerateCode(req, res) {
  const reservation = await findOr404(req.valid.params.id);
  await reservation.update({ publicCode: await uniquePublicCode() });
  res.json(reservation);
}
