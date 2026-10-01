import { z } from 'zod';
import { isIsoDate } from '../utils/dates-mx.js';

export const uuid = z.uuid('Identificador inválido');
export const idParams = z.object({ id: uuid });

export const isoDate = z.string().refine(isIsoDate, 'Fecha inválida (formato AAAA-MM-DD)');
export const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Hora inválida (formato HH:MM)')
  .nullable()
  .optional();

export const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v));

export const requiredText = (max, label = 'Este campo') =>
  z.string().trim().min(1, `${label} es obligatorio`).max(max, `Máximo ${max} caracteres`);

export const money = z.coerce.number().min(0, 'El monto no puede ser negativo').max(99_999_999, 'Monto demasiado grande');

export const optionalUrl = z
  .union([z.url('URL inválida'), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v ? v : null));

/** Imagen referenciada dentro de JSON (snapshot del media_asset). */
export const mediaRef = z
  .object({
    id: uuid,
    url: z.url(),
    publicId: z.string().optional(),
    width: z.number().int().nullable().optional(),
    height: z.number().int().nullable().optional(),
    alt: z.string().max(255).nullable().optional(),
  })
  .nullable()
  .optional();

export const reorderBody = z.object({
  ids: z.array(uuid).min(1, 'Envía al menos un elemento'),
});

export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});
