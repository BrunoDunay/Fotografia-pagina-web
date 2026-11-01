import { Op, fn, col } from 'sequelize';
import { MediaAsset, Review } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { assertImageFiles } from '../middlewares/upload.js';
import { toMedia } from '../services/serializers.js';
import { deleteMediaAsset, storeUpload } from './media.controller.js';

/** Si hay tantas reseñas sin revisar, el formulario deja de aceptar nuevas (evita que alguien llene la cola). */
export const MAX_PENDING_REVIEWS = 150;
/** Menos de esto llenando el formulario no es una persona. */
const MIN_FILL_MS = 4000;

export function toPublicReview(review) {
  return {
    id: review.id,
    authorName: review.authorName,
    eventLabel: review.eventLabel,
    rating: review.rating,
    comment: review.comment,
    photo: toMedia(review.photo),
    reply: review.reply,
    repliedAt: review.repliedAt,
    createdAt: review.createdAt,
  };
}

function toAdminReview(review) {
  return { ...toPublicReview(review), status: review.status, publishedAt: review.publishedAt, updatedAt: review.updatedAt };
}

const withPhoto = [{ model: MediaAsset, as: 'photo' }];

/** Público: reseñas publicadas, de la más reciente a la más antigua, con el promedio. */
export async function listPublic(req, res) {
  const { page, limit } = req.valid.query;
  const where = { status: 'published' };
  const [{ rows, count }, stats] = await Promise.all([
    Review.findAndCountAll({ where, include: withPhoto, order: [['createdAt', 'DESC']], limit, offset: (page - 1) * limit }),
    Review.findOne({ where, attributes: [[fn('AVG', col('rating')), 'average']], raw: true }),
  ]);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    items: rows.map(toPublicReview),
    total: count,
    page,
    limit,
    hasMore: page * limit < count,
    average: stats?.average ? Math.round(Number(stats.average) * 10) / 10 : null,
  });
}

/**
 * Público: recibe una reseña nueva. Nunca se publica sola: queda "pending" hasta que el fotógrafo la revisa.
 * A los bots (trampa llena o formulario enviado al instante) se les responde igual que a una persona,
 * pero no se guarda nada: así no aprenden a esquivar la trampa.
 */
export async function submit(req, res) {
  const { authorName, eventLabel, rating, comment, website, elapsedMs } = req.valid.body;
  const accepted = () => res.status(201).json({ status: 'pending' });

  if (website || elapsedMs < MIN_FILL_MS) return accepted();

  const pending = await Review.count({ where: { status: 'pending' } });
  if (pending >= MAX_PENDING_REVIEWS) {
    throw new AppError(503, 'Por ahora no podemos recibir más reseñas. Inténtalo de nuevo en unos días.', 'REVIEWS_QUEUE_FULL');
  }

  // La misma reseña enviada dos veces (doble clic, reintento) no se duplica.
  const duplicate = await Review.findOne({
    where: { comment, authorName, createdAt: { [Op.gte]: new Date(Date.now() - 24 * 3600 * 1000) } },
    attributes: ['id'],
  });
  if (duplicate) return accepted();

  let photo = null;
  if (req.file) {
    assertImageFiles([req.file]);
    photo = await storeUpload(req.file, 'reviews', `Foto de ${authorName}`);
  }

  await Review.create({ authorName, eventLabel, rating, comment, photoMediaId: photo?.id ?? null, status: 'pending' });
  accepted();
}

// ---------- Panel ----------

export async function listAdmin(req, res) {
  const { status } = req.valid.query;
  const [reviews, counts] = await Promise.all([
    Review.findAll({ where: status ? { status } : {}, include: withPhoto, order: [['createdAt', 'DESC']] }),
    Review.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
  ]);
  const byStatus = { pending: 0, published: 0, hidden: 0 };
  for (const row of counts) byStatus[row.status] = Number(row.count);
  res.json({ items: reviews.map(toAdminReview), counts: byStatus });
}

async function findOr404(id) {
  const review = await Review.findByPk(id, { include: withPhoto });
  if (!review) throw notFound('La reseña');
  return review;
}

export async function update(req, res) {
  const review = await findOr404(req.valid.params.id);
  const body = { ...req.valid.body };
  if (body.status === 'published' && review.status !== 'published') body.publishedAt = new Date();
  if (body.reply !== undefined && body.reply !== review.reply) body.repliedAt = body.reply ? new Date() : null;
  await review.update(body);
  res.json(toAdminReview(await findOr404(review.id)));
}

/** Quita solo la foto (por ejemplo, si no es apropiada) y deja la reseña. */
export async function removePhoto(req, res) {
  const review = await findOr404(req.valid.params.id);
  if (review.photo) {
    const asset = review.photo;
    await review.update({ photoMediaId: null });
    await deleteMediaAsset(asset);
  }
  res.json(toAdminReview(await findOr404(review.id)));
}

export async function remove(req, res) {
  const review = await findOr404(req.valid.params.id);
  const asset = review.photo;
  await review.destroy();
  if (asset) await deleteMediaAsset(asset);
  res.status(204).end();
}
