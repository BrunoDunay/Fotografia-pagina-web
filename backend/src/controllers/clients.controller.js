import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Client, Event, Payment, Service } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { paymentSummary } from '../services/event-booking.service.js';

export async function list(req, res) {
  const { q, page, limit } = req.valid.query;
  const where = q
    ? { [Op.or]: [{ name: { [Op.iLike]: `%${q}%` } }, { phone: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }] }
    : undefined;

  const { rows, count } = await Client.findAndCountAll({
    where,
    attributes: {
      include: [[sequelize.literal('(SELECT count(*) FROM events e WHERE e.client_id = "Client".id)::int'), 'eventsCount']],
    },
    order: [['name', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({ items: rows, total: count, page, limit, hasMore: page * limit < count });
}

export async function getOne(req, res) {
  const client = await Client.findByPk(req.valid.params.id, {
    include: [
      {
        model: Event,
        as: 'events',
        include: [
          { model: Service, as: 'service', attributes: ['id', 'name'] },
          { model: Payment, as: 'payments', attributes: ['amount'] },
        ],
      },
    ],
    order: [[{ model: Event, as: 'events' }, 'eventDate', 'DESC']],
  });
  if (!client) throw notFound('El cliente');

  const json = client.toJSON();
  res.json({
    ...json,
    events: client.events.map((e) => ({
      id: e.id,
      title: e.title,
      eventDate: e.eventDate,
      status: e.status,
      service: e.service,
      payment: paymentSummary(e.totalPrice, e.payments),
    })),
  });
}

export async function create(req, res) {
  res.status(201).json(await Client.create(req.valid.body));
}

export async function update(req, res) {
  const client = await Client.findByPk(req.valid.params.id);
  if (!client) throw notFound('El cliente');
  res.json(await client.update(req.valid.body));
}

/** Si el cliente tiene eventos, solo se borra con ?force=true (y se borran sus eventos). */
export async function remove(req, res) {
  const client = await Client.findByPk(req.valid.params.id);
  if (!client) throw notFound('El cliente');

  const eventsCount = await Event.count({ where: { clientId: client.id } });
  if (eventsCount > 0 && !req.valid.query.force) {
    throw new AppError(
      409,
      `Este cliente tiene ${eventsCount} evento(s). Confirma para eliminarlo junto con sus eventos y pagos.`,
      'CLIENT_HAS_EVENTS',
    );
  }

  await sequelize.transaction(async (transaction) => {
    await Event.destroy({ where: { clientId: client.id }, transaction });
    await client.destroy({ transaction });
  });
  res.status(204).end();
}
