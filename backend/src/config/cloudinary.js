import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { imageSize } from 'image-size';
import { env } from './env.js';
import { AppError } from '../utils/app-error.js';
import { generatePublicCode } from '../utils/public-code.js';

if (env.cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Respaldo SOLO para desarrollo: sin credenciales de Cloudinary, las imágenes se guardan
 * en backend/uploads/ y se sirven en /uploads. En producción nunca se usa.
 */
export const localUploadsEnabled = !env.cloudinaryEnabled && !env.isProduction;
export const UPLOADS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const LOCAL_PREFIX = 'local:';

async function uploadLocal(buffer, folder) {
  const { width, height, type } = imageSize(buffer);
  const format = type === 'jpg' ? 'jpg' : type;
  const relative = path.posix.join(env.CLOUDINARY_FOLDER, folder, `${generatePublicCode().toLowerCase()}.${format}`);
  const target = path.join(UPLOADS_DIR, ...relative.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return {
    public_id: `${LOCAL_PREFIX}${relative}`,
    secure_url: `${env.API_PUBLIC_URL}/uploads/${relative}`,
    width,
    height,
    format,
    bytes: buffer.length,
  };
}

/**
 * Sube un buffer guardando un "master" optimizado
 * (máx. 2560px de ancho, calidad automática). Las variantes se generan al entregar.
 */
export function uploadImageBuffer(buffer, folder) {
  if (localUploadsEnabled) return uploadLocal(buffer, folder);
  if (!env.cloudinaryEnabled) {
    throw new AppError(503, 'El almacenamiento de imágenes no está configurado todavía.', 'STORAGE_DISABLED');
  }
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

export async function destroyImage(publicId, resourceType = 'image') {
  if (!publicId) return;
  if (publicId.startsWith(LOCAL_PREFIX)) {
    const relative = publicId.slice(LOCAL_PREFIX.length);
    await unlink(path.join(UPLOADS_DIR, ...relative.split('/'))).catch(() => {});
    return;
  }
  if (env.cloudinaryEnabled) await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: resourceType });
}

// ---------- Videos ----------
// Un video pesa demasiado para pasar por este servidor: el panel lo sube directo a Cloudinary con una
// firma de un solo uso y después lo registra aquí.

const videoFolder = () => `${env.CLOUDINARY_FOLDER}/videos`;

/**
 * Versiones que Cloudinary prepara al recibir el video: un MP4 (H.264) que reproduce cualquier navegador
 * y la imagen de portada. El sitio las pide con estas mismas transformaciones
 * (frontend/src/app/core/utils/cloudinary-url.ts): deben coincidir.
 */
const VIDEO_EAGER = 'vc_h264,q_auto/mp4|so_0,q_auto,w_1600,c_limit/jpg';

function assertVideoStorage() {
  if (!env.cloudinaryEnabled) {
    throw new AppError(503, 'Para subir videos hace falta configurar Cloudinary (CLOUDINARY_* en backend/.env).', 'STORAGE_DISABLED');
  }
}

/** Datos firmados que el panel envía, junto con el archivo, directamente a Cloudinary. */
export function signVideoUpload() {
  assertVideoStorage();
  const fields = {
    timestamp: Math.round(Date.now() / 1000),
    folder: videoFolder(),
    allowed_formats: 'mp4,mov,m4v,webm',
    eager: VIDEO_EAGER,
    eager_async: true,
  };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    fields: {
      ...fields,
      api_key: env.CLOUDINARY_API_KEY,
      signature: cloudinary.utils.api_sign_request(fields, env.CLOUDINARY_API_SECRET),
    },
  };
}

/** Consulta en Cloudinary un video recién subido: solo se registran los que están en nuestra carpeta. */
export async function findUploadedVideo(publicId) {
  assertVideoStorage();
  if (!publicId.startsWith(`${videoFolder()}/`)) return null;
  try {
    return await cloudinary.api.resource(publicId, { resource_type: 'video' });
  } catch (error) {
    if ((error?.error?.http_code ?? error?.http_code) === 404) return null;
    throw error;
  }
}
