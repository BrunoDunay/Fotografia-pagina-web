import { MediaAsset } from '../models/index.js';
import { destroyImage, findUploadedVideo, signVideoUpload, uploadImageBuffer } from '../config/cloudinary.js';
import { AppError, notFound } from '../utils/app-error.js';
import { assertImageFiles } from '../middlewares/upload.js';
import { toMedia } from '../services/serializers.js';

/** Sube un buffer a Cloudinary y lo registra en media_assets. */
export async function storeUpload(file, folder, altText = null) {
  const result = await uploadImageBuffer(file.buffer, folder);
  return MediaAsset.create({
    cloudinaryPublicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    altText,
    folder,
  });
}

export async function deleteMediaAsset(asset) {
  await destroyImage(asset.cloudinaryPublicId, asset.resourceType);
  await asset.destroy();
}

/** Paso 1 de la subida de un video: firma para enviarlo directo a Cloudinary. */
export function videoSignature(_req, res) {
  res.json(signVideoUpload());
}

/** Paso 2: el panel avisa que el video ya está en Cloudinary; se verifica allá y se registra. */
export async function registerVideo(req, res) {
  const { publicId } = req.valid.body;
  const existing = await MediaAsset.findOne({ where: { cloudinaryPublicId: publicId } });
  if (existing) return res.json(toMedia(existing));

  const video = await findUploadedVideo(publicId);
  if (!video) throw new AppError(400, 'No se encontró el video que se acaba de subir. Intenta subirlo de nuevo.', 'VIDEO_NOT_FOUND');
  const asset = await MediaAsset.create({
    cloudinaryPublicId: video.public_id,
    secureUrl: video.secure_url,
    width: video.width,
    height: video.height,
    format: video.format,
    bytes: video.bytes,
    folder: 'videos',
    resourceType: 'video',
  });
  res.status(201).json(toMedia(asset));
}

/** Subida suelta: Hero, portadas, foto de "Sobre mí", logo, etc. */
export async function upload(req, res) {
  if (!req.file) throw new AppError(400, 'Selecciona una imagen para subir.', 'NO_FILE');
  assertImageFiles([req.file]);
  const { folder, alt } = req.valid.body;
  const asset = await storeUpload(req.file, folder, alt ?? null);
  res.status(201).json(toMedia(asset));
}

export async function updateAlt(req, res) {
  const asset = await MediaAsset.findByPk(req.valid.params.id);
  if (!asset) throw notFound('La imagen');
  await asset.update({ altText: req.valid.body.alt });
  res.json(toMedia(asset));
}

export async function remove(req, res) {
  const asset = await MediaAsset.findByPk(req.valid.params.id);
  if (!asset) throw notFound('La imagen');
  await deleteMediaAsset(asset);
  res.status(204).end();
}
