import { Op } from 'sequelize';
import { AvailabilityBlock } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { daysBetween, todayInStudioTz } from '../utils/dates-mx.js';
import { getBusyDates } from '../services/availability.service.js';

const MAX_RANGE_DAYS = 400;

/** Público: solo fechas ocupadas. Todo lo demás se muestra como disponible. */
export async function getPublic(req, res) {
  const { from, to } = req.valid.query;
  if (daysBetween(from, to) < 0) throw new AppError(400, 'La fecha inicial debe ser anterior a la final.', 'BAD_RANGE');
  if (daysBetween(from, to) > MAX_RANGE_DAYS) throw new AppError(400, 'El rango consultado es demasiado grande.', 'BAD_RANGE');

  const busy = await getBusyDates(from, to);
  // Sin caché: un bloqueo o evento nuevo debe verse de inmediato en el calendario público.
  res.set('Cache-Control', 'no-cache');
  res.json({ from, to, today: todayInStudioTz(), days: busy.map((date) => ({ date, status: 'busy' })) });
}

export async function listBlocks(req, res) {
  const { from, to } = req.valid.query;
  const where = from && to ? { date: { [Op.between]: [from, to] } } : undefined;
  res.json(await AvailabilityBlock.findAll({ where, order: [['date', 'ASC']] }));
}

export async function createBlock(req, res) {
  res.status(201).json(await AvailabilityBlock.create(req.valid.body));
}

export async function removeBlock(req, res) {
  const block = await AvailabilityBlock.findByPk(req.valid.params.id);
  if (!block) throw notFound('El bloqueo');
  await block.destroy();
  res.status(204).end();
}
