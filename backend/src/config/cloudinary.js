import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { AppError } from '../utils/app-error.js';

if (env.cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function ensureEnabled() {
  if (!env.cloudinaryEnabled) {
    throw new AppError(503, 'El almacenamiento de imágenes no está configurado todavía.', 'STORAGE_DISABLED');
  }
}

/**
 * Sube un buffer a Cloudinary guardando un "master" optimizado
 * (máx. 2560px de ancho, calidad automática). Las variantes se generan al entregar.
 */
export function uploadImageBuffer(buffer, folder) {
  ensureEnabled();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        resource_type: 'image',
        transformation: [{ width: 2560, height: 2560, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });
}

export async function destroyImage(publicId) {
  if (!env.cloudinaryEnabled || !publicId) return;
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}
