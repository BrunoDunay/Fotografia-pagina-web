import { MediaAsset } from '../models/index.js';
import { destroyImage, uploadImageBuffer } from '../config/cloudinary.js';
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
  await destroyImage(asset.cloudinaryPublicId);
  await asset.destroy();
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
