import { sequelize } from '../config/database.js';
import { Gallery, GalleryImage, MediaAsset, Service } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { assertImageFiles } from '../middlewares/upload.js';
import { toMedia } from '../services/serializers.js';
import { deleteMediaAsset, storeUpload } from './media.controller.js';

const UPLOAD_CONCURRENCY = 3;

function toGalleryImage(image) {
  const { id: mediaId, ...media } = toMedia(image.media) ?? {};
  return { ...media, id: image.id, mediaId: mediaId ?? image.mediaId, sortOrder: image.sortOrder };
}

async function findGalleryOr404(id) {
  const gallery = await Gallery.findByPk(id, {
    include: [
      { model: Service, as: 'service', attributes: ['id', 'slug', 'name'] },
      { model: MediaAsset, as: 'coverMedia' },
    ],
  });
  if (!gallery) throw notFound('La galería');
  return gallery;
}

/** Público: imágenes paginadas de la galería de un servicio. */
export async function listPublicImages(req, res) {
  const { page, limit } = req.valid.query;
  const gallery = await Gallery.findOne({
    include: [{ model: Service, as: 'service', where: { slug: req.params.serviceSlug, isVisible: true }, attributes: [] }],
  });
  if (!gallery) throw notFound('La galería');

  const { rows, count } = await GalleryImage.findAndCountAll({
    where: { galleryId: gallery.id },
    include: [{ model: MediaAsset, as: 'media' }],
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({ items: rows.map(toGalleryImage), total: count, page, limit, hasMore: page * limit < count });
}

/** Admin: detalle con todas las imágenes. */
export async function getAdmin(req, res) {
  const gallery = await findGalleryOr404(req.valid.params.id);
  const images = await GalleryImage.findAll({
    where: { galleryId: gallery.id },
    include: [{ model: MediaAsset, as: 'media' }],
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
  });
  res.json({
    id: gallery.id,
    title: gallery.title,
    service: gallery.service,
    cover: toMedia(gallery.coverMedia),
    maxImages: gallery.maxImages,
    images: images.map(toGalleryImage),
  });
}

export async function updateSettings(req, res) {
  const gallery = await findGalleryOr404(req.valid.params.id);
  await gallery.update(req.valid.body);
  res.json({ id: gallery.id, title: gallery.title, maxImages: gallery.maxImages });
}

/** Admin: sube varias imágenes respetando el límite de la galería. Reporta éxitos y fallos por archivo. */
export async function uploadImages(req, res) {
  const files = req.files ?? [];
  if (files.length === 0) throw new AppError(400, 'Selecciona al menos una imagen.', 'NO_FILE');
  assertImageFiles(files);

  const gallery = await findGalleryOr404(req.valid.params.id);
  const current = await GalleryImage.count({ where: { galleryId: gallery.id } });
  const available = gallery.maxImages - current;
  if (files.length > available) {
    throw new AppError(
      409,
      available <= 0
        ? `La galería ya tiene el máximo de ${gallery.maxImages} fotografías. Elimina alguna para subir nuevas.`
        : `Solo puedes agregar ${available} fotografía(s) más (máximo ${gallery.maxImages}).`,
      'GALLERY_LIMIT',
    );
  }

  const folder = `services/${gallery.service?.slug ?? gallery.id}/gallery`;
  let nextOrder = ((await GalleryImage.max('sortOrder', { where: { galleryId: gallery.id } })) ?? -1) + 1;
  const uploaded = [];
  const failed = [];

  for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
    const batch = files.slice(i, i + UPLOAD_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((file) => storeUpload(file, folder, gallery.title)));
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        const image = await GalleryImage.create({ galleryId: gallery.id, mediaId: result.value.id, sortOrder: nextOrder++ });
        image.media = result.value;
        uploaded.push(toGalleryImage(image));
      } else {
        console.error('Fallo al subir imagen:', result.reason);
        failed.push({ name: batch[index].originalname, message: 'No se pudo subir esta imagen.' });
      }
    }
  }

  if (!gallery.coverMediaId && uploaded[0]) await gallery.update({ coverMediaId: uploaded[0].mediaId });

  res.status(uploaded.length ? 201 : 502).json({ uploaded, failed });
}

export async function reorderImages(req, res) {
  const gallery = await findGalleryOr404(req.valid.params.id);
  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of req.valid.body.ids.entries()) {
      await GalleryImage.update({ sortOrder: index }, { where: { id, galleryId: gallery.id }, transaction });
    }
  });
  res.json({ message: 'Orden actualizado.' });
}

export async function setCover(req, res) {
  const gallery = await findGalleryOr404(req.valid.params.id);
  const image = await GalleryImage.findOne({ where: { id: req.valid.body.imageId, galleryId: gallery.id } });
  if (!image) throw notFound('La imagen');
  await gallery.update({ coverMediaId: image.mediaId });
  // La portada que ve el público (tarjeta del servicio en el inicio y en "Servicios") es la del servicio.
  if (gallery.serviceId) await Service.update({ coverMediaId: image.mediaId }, { where: { id: gallery.serviceId } });
  res.json({ message: 'Portada actualizada.' });
}

export async function removeImage(req, res) {
  const { id, imageId } = req.valid.params;
  const image = await GalleryImage.findOne({
    where: { id: imageId, galleryId: id },
    include: [{ model: MediaAsset, as: 'media' }],
  });
  if (!image) throw notFound('La imagen');
  await image.destroy();
  if (image.media) await deleteMediaAsset(image.media);
  res.status(204).end();
}
