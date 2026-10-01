import { Op } from 'sequelize';
import { Client, Event, Payment } from '../models/index.js';
import { notFound } from '../utils/app-error.js';
import { paymentSummary } from '../services/event-booking.service.js';
import { toNumber } from '../services/serializers.js';

const toPayment = (p) => ({ ...p.toJSON(), amount: toNumber(p.amount) });

async function eventSummary(eventId) {
  const event = await Event.findByPk(eventId, { include: [{ model: Payment, as: 'payments', attributes: ['amount'] }] });
  return paymentSummary(event.totalPrice, event.payments);
}

/**
 * ?eventId=… → pagos de un evento.
 * ?status=pending (por defecto) → eventos no cancelados con saldo pendiente.
 */
export async function list(req, res) {
  const { eventId } = req.valid.query;

  if (eventId) {
    const payments = await Payment.findAll({ where: { eventId }, order: [['paidAt', 'ASC']] });
    return res.json({ items: payments.map(toPayment), summary: await eventSummary(eventId) });
  }

  const events = await Event.findAll({
    where: { status: { [Op.ne]: 'cancelled' } },
    include: [
      { model: Client, as: 'client', attributes: ['id', 'name', 'phone'] },
      { model: Payment, as: 'payments', attributes: ['amount', 'paidAt'] },
    ],
    order: [['eventDate', 'ASC']],
  });

  const pending = events
    .map((e) => ({
      eventId: e.id,
      title: e.title,
      eventDate: e.eventDate,
      client: e.client,
      lastPaymentAt: e.payments.map((p) => p.paidAt).sort().at(-1) ?? null,
      ...paymentSummary(e.totalPrice, e.payments),
    }))
    .filter((e) => e.balance > 0);

  res.json({
    items: pending,
    totals: {
      events: pending.length,
      balance: Math.round(pending.reduce((sum, e) => sum + e.balance, 0) * 100) / 100,
    },
  });
}

export async function create(req, res) {
  const { eventId } = req.valid.body;
  if (!(await Event.count({ where: { id: eventId } }))) throw notFound('El evento');
  const payment = await Payment.create(req.valid.body);
  res.status(201).json({ payment: toPayment(payment), summary: await eventSummary(eventId) });
}

export async function update(req, res) {
  const payment = await Payment.findByPk(req.valid.params.id);
  if (!payment) throw notFound('El pago');
  await payment.update(req.valid.body);
  res.json({ payment: toPayment(payment), summary: await eventSummary(payment.eventId) });
}

export async function remove(req, res) {
  const payment = await Payment.findByPk(req.valid.params.id);
  if (!payment) throw notFound('El pago');
  await payment.destroy();
  res.json({ summary: await eventSummary(payment.eventId) });
}
