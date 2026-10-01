import { sequelize } from '../config/database.js';
import { Faq, Service } from '../models/index.js';
import { notFound } from '../utils/app-error.js';

/** Público: FAQ generales, o las de un servicio con ?service=slug. */
export async function listPublic(req, res) {
  const { service: slug } = req.valid.query;
  let serviceId = null;
  if (slug) {
    const service = await Service.findOne({ where: { slug, isVisible: true }, attributes: ['id'] });
    if (!service) throw notFound('El servicio');
    serviceId = service.id;
  }
  const faqs = await Faq.findAll({
    where: { isActive: true, serviceId },
    attributes: ['id', 'question', 'answer'],
    order: [['sortOrder', 'ASC']],
  });
  res.json(faqs);
}

export async function listAdmin(_req, res) {
  res.json(
    await Faq.findAll({
      include: [{ model: Service, as: 'service', attributes: ['id', 'name'] }],
      order: [['sortOrder', 'ASC']],
    }),
  );
}

export async function create(req, res) {
  const maxOrder = (await Faq.max('sortOrder')) ?? -1;
  res.status(201).json(await Faq.create({ ...req.valid.body, sortOrder: maxOrder + 1 }));
}

export async function update(req, res) {
  const faq = await Faq.findByPk(req.valid.params.id);
  if (!faq) throw notFound('La pregunta');
  res.json(await faq.update(req.valid.body));
}

export async function reorder(req, res) {
  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of req.valid.body.ids.entries()) {
      await Faq.update({ sortOrder: index }, { where: { id }, transaction });
    }
  });
  res.json({ message: 'Orden actualizado.' });
}

export async function remove(req, res) {
  const faq = await Faq.findByPk(req.valid.params.id);
  if (!faq) throw notFound('La pregunta');
  await faq.destroy();
  res.status(204).end();
}
