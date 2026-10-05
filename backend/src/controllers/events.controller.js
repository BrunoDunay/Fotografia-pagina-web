import { Op } from 'sequelize';
import { Client, Event, MediaAsset, Package, PackageFeature, Payment, Reservation, Service } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { env } from '../config/env.js';
import { hasImageSignature } from '../middlewares/upload.js';
import { buildConfirmationEmail } from '../services/confirmation-email.js';
import { sendMail } from '../services/mail.service.js';
import { getSections } from '../services/settings.service.js';
import { createEventWithBooking, paymentSummary } from '../services/event-booking.service.js';
import { toMedia, toNumber } from '../services/serializers.js';

const summaryIncludes = [
  { model: Client, as: 'client', attributes: ['id', 'name', 'phone'] },
  { model: Service, as: 'service', attributes: ['id', 'name', 'slug'] },
  { model: Package, as: 'package', attributes: ['id', 'name'] },
  { model: Payment, as: 'payments', attributes: ['amount'] },
  { model: Reservation, as: 'reservation', attributes: ['id', 'publicCode', 'isActive'] },
];

export function toEventSummary(event) {
  return {
    id: event.id,
    title: event.title,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    city: event.city,
    status: event.status,
    blocksAvailability: event.blocksAvailability,
    client: event.client,
    service: event.service,
    package: event.package,
    reservation: event.reservation ? { id: event.reservation.id, publicCode: event.reservation.publicCode, isActive: event.reservation.isActive } : null,
    payment: paymentSummary(event.totalPrice, event.payments ?? []),
  };
}

async function loadEventDetail(id) {
  const event = await Event.findByPk(id, {
    include: [
      { model: Client, as: 'client' },
      {
        model: Service,
        as: 'service',
        attributes: ['id', 'name', 'slug'],
        include: [
          { model: MediaAsset, as: 'coverMedia' },
          { model: MediaAsset, as: 'heroMedia' },
        ],
      },
      { model: Package, as: 'package', attributes: ['id', 'name', 'price'] },
      { model: Payment, as: 'payments' },
      { model: Reservation, as: 'reservation', include: [{ model: MediaAsset, as: 'coverMedia' }] },
    ],
    order: [[{ model: Payment, as: 'payments' }, 'paidAt', 'ASC']],
  });
  if (!event) throw notFound('El evento');

  const json = event.toJSON();
  return {
    ...toEventSummary(event),
    totalPrice: toNumber(json.totalPrice),
    notes: json.notes,
    client: json.client,
    package: json.package ? { ...json.package, price: toNumber(json.package.price) } : null,
    payments: json.payments.map((p) => ({ ...p, amount: toNumber(p.amount) })),
    // cover: foto propia del ticket · defaultCover: la del tipo de evento (se usa si no hay propia).
    reservation: json.reservation
      ? (({ coverMedia, ...reservation }) => ({
          ...reservation,
          cover: toMedia(event.reservation.coverMedia),
          defaultCover: toMedia(event.service?.coverMedia) ?? toMedia(event.service?.heroMedia),
        }))(json.reservation)
      : null,
    confirmationSentAt: json.confirmationSentAt ?? null,
    /** El servidor tiene configurado el correo saliente (SMTP_*). */
    mailEnabled: env.mailEnabled,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

export async function list(req, res) {
  const { from, to, status, clientId, q } = req.valid.query;
  const where = {};
  if (from && to) where.eventDate = { [Op.between]: [from, to] };
  else if (from) where.eventDate = { [Op.gte]: from };
  else if (to) where.eventDate = { [Op.lte]: to };
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (q) where[Op.or] = [{ title: { [Op.iLike]: `%${q}%` } }, { '$client.name$': { [Op.iLike]: `%${q}%` } }];

  const events = await Event.findAll({ where, include: summaryIncludes, order: [['eventDate', 'ASC'], ['startTime', 'ASC']] });
  res.json(events.map(toEventSummary));
}

export async function getOne(req, res) {
  res.json(await loadEventDetail(req.valid.params.id));
}

export async function create(req, res) {
  const id = await createEventWithBooking(req.valid.body);
  res.status(201).json(await loadEventDetail(id));
}

export async function update(req, res) {
  const event = await Event.findByPk(req.valid.params.id);
  if (!event) throw notFound('El evento');
  await event.update(req.valid.body);
  res.json(await loadEventDetail(event.id));
}

export async function setStatus(req, res) {
  const event = await Event.findByPk(req.valid.params.id);
  if (!event) throw notFound('El evento');
  await event.update({ status: req.valid.body.status });
  res.json(await loadEventDetail(event.id));
}

export async function remove(req, res) {
  const event = await Event.findByPk(req.valid.params.id);
  if (!event) throw notFound('El evento');
  await event.destroy();
  res.status(204).end();
}

/**
 * Envía al cliente el correo de confirmación: resumen de lo contratado (paquete, precio, pagos y saldo)
 * y el ticket digital. La imagen del ticket la genera el panel y llega como archivo "ticket" (opcional).
 */
export async function sendConfirmation(req, res) {
  const event = await Event.findByPk(req.valid.params.id, {
    include: [
      { model: Client, as: 'client' },
      { model: Service, as: 'service', attributes: ['id', 'name', 'slug'] },
      { model: Package, as: 'package', include: [{ model: PackageFeature, as: 'features' }] },
      { model: Payment, as: 'payments' },
      { model: Reservation, as: 'reservation' },
    ],
    order: [[{ model: Payment, as: 'payments' }, 'paidAt', 'ASC']],
  });
  if (!event) throw notFound('El evento');
  if (!event.client?.email) {
    throw new AppError(400, 'El cliente no tiene un correo registrado. Agrégalo en su ficha y vuelve a intentar.', 'CLIENT_WITHOUT_EMAIL');
  }
  const ticket = req.file;
  if (ticket && !hasImageSignature(ticket.buffer)) throw new AppError(415, 'La imagen del ticket no es válida.', 'INVALID_IMAGE');

  const { brand = {}, contact = {} } = await getSections(['brand', 'contact']);
  const json = event.toJSON();
  const reservation = json.reservation?.isActive ? json.reservation : null;
  const mail = buildConfirmationEmail({
    event: json,
    payment: paymentSummary(json.totalPrice, json.payments),
    ticketUrl: reservation ? `${env.PUBLIC_SITE_URL}/reservation/${reservation.publicCode}` : null,
    hasTicketImage: Boolean(ticket),
    studio: {
      name: brand.studioName ?? 'Armando Ovalle Wedding Studio',
      photographer: contact.photographerName ?? brand.photographerName ?? null,
      phone: contact.phone ?? null,
      email: contact.email ?? null,
      instagram: contact.instagram?.handle ?? null,
      siteUrl: env.PUBLIC_SITE_URL,
    },
  });

  await sendMail({
    to: { name: json.client.name, address: json.client.email },
    replyTo: contact.email,
    ...mail,
    attachments: ticket
      ? [{ filename: 'ticket-digital.' + (ticket.mimetype === 'image/jpeg' ? 'jpg' : 'png'), content: ticket.buffer, contentType: ticket.mimetype, cid: 'ticket' }]
      : [],
  });

  const confirmationSentAt = new Date();
  await event.update({ confirmationSentAt });
  res.json({ sentTo: json.client.email, confirmationSentAt });
}
