import multer from 'multer';
import { AppError } from '../utils/app-error.js';

export const MAX_FILE_SIZE_MB = 15;
export const MAX_FILES_PER_REQUEST = 20;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: MAX_FILES_PER_REQUEST },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new AppError(415, `"${file.originalname}" no es un formato permitido. Usa JPG, PNG, WEBP o HEIC.`, 'UNSUPPORTED_FORMAT'));
    }
    cb(null, true);
  },
});

export const uploadSingleImage = uploader.single('image');
export const uploadManyImages = uploader.array('images', MAX_FILES_PER_REQUEST);
/** Imagen del ticket (PNG/JPG generado en el panel) que acompaña al correo de confirmación. */
export const uploadTicketImage = uploader.single('ticket');

/** Verifica la firma binaria real del archivo (no basta con confiar en el mimetype). */
export function hasImageSignature(buffer) {
  if (!buffer || buffer.length < 12) return false;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  const heic = buffer.toString('ascii', 4, 8) === 'ftyp' && /^(heic|heix|hevc|heim|heis|mif1|msf1)$/.test(buffer.toString('ascii', 8, 12));
  return jpeg || png || webp || heic;
}

export function assertImageFiles(files) {
  for (const file of files) {
    if (!hasImageSignature(file.buffer)) {
      throw new AppError(415, `"${file.originalname}" no parece ser una imagen válida.`, 'INVALID_IMAGE');
    }
  }
}
