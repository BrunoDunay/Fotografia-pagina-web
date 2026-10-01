import { Op } from 'sequelize';
import { Client, Event, Package, Payment, Reservation, Service } from '../models/index.js';
import { notFound } from '../utils/app-error.js';
import { createEventWithBooking, paymentSummary } from '../services/event-booking.service.js';
import { toNumber } from '../services/serializers.js';

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
      { model: Service, as: 'service', attributes: ['id', 'name', 'slug'] },
      { model: Package, as: 'package', attributes: ['id', 'name', 'price'] },
      { model: Payment, as: 'payments' },
      { model: Reservation, as: 'reservation' },
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
    reservation: json.reservation,
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
