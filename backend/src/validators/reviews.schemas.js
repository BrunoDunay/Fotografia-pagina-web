import { z } from 'zod';
import { REVIEW_STATUSES } from '../models/review.model.js';

/** Quita caracteres de control y espacios repetidos (el texto se muestra tal cual, Angular lo escapa). */
const clean = (value) =>
  value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const text = (min, max, label) =>
  z
    .string({ error: `${label} es obligatorio` })
    .transform(clean)
    .pipe(z.string().min(min, min > 1 ? `${label} debe tener al menos ${min} caracteres` : `${label} es obligatorio`).max(max, `Máximo ${max} caracteres`));

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|mx|info|xyz|ru|io|ly)\b)/gi;

/** Formulario público (llega como multipart: todo es texto). */
export const reviewSubmitBody = z.object({
  authorName: text(2, 60, 'Tu nombre'),
  eventLabel: text(2, 80, 'El evento'),
  rating: z.coerce.number({ error: 'Elige de 1 a 5 estrellas' }).int().min(1, 'Elige de 1 a 5 estrellas').max(5, 'Elige de 1 a 5 estrellas'),
  comment: text(10, 1000, 'Tu reseña').refine((v) => (v.match(LINK) ?? []).length === 0, 'Por seguridad, la reseña no puede llevar enlaces.'),
  /** Trampa para bots: el campo está oculto, una persona lo deja vacío. */
  website: z.string().max(200).optional().default(''),
  /** Milisegundos que el formulario estuvo abierto (un bot lo llena en un instante). */
  elapsedMs: z.coerce.number().int().min(0).max(86_400_000).optional().default(0),
});

export const reviewListQuery = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const reviewAdminQuery = z.object({
  status: z.enum(REVIEW_STATUSES).optional(),
});

const optionalReply = z
  .string()
  .transform(clean)
  .pipe(z.string().max(1000, 'Máximo 1000 caracteres'))
  .nullable()
  .optional()
  .transform((v) => (v === '' ? null : v));

/** Panel: corregir datos, responder, publicar u ocultar. */
export const reviewUpdateBody = z
  .object({
    authorName: text(2, 60, 'El nombre').optional(),
    eventLabel: text(2, 80, 'El evento').optional(),
    rating: z.number().int().min(1).max(5).optional(),
    comment: text(1, 1000, 'La reseña').optional(),
    reply: optionalReply,
    status: z.enum(REVIEW_STATUSES).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'No hay cambios que guardar');
