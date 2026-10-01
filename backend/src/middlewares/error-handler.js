import { ZodError } from 'zod';
import multer from 'multer';
import { BaseError, UniqueConstraintError, ForeignKeyConstraintError, ValidationError } from 'sequelize';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { MAX_FILE_SIZE_MB, MAX_FILES_PER_REQUEST } from './upload.js';

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `Cada imagen debe pesar como máximo ${MAX_FILE_SIZE_MB} MB.`,
  LIMIT_FILE_COUNT: `Puedes subir hasta ${MAX_FILES_PER_REQUEST} imágenes a la vez.`,
  LIMIT_UNEXPECTED_FILE: 'El archivo se envió en un campo no esperado.',
};

/** Traduce cualquier error a una respuesta clara en español, sin exponer detalles internos. */
function toAppError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) fields[issue.path.join('.') || '_'] = issue.message;
    return new AppError(400, 'Hay datos inválidos. Revisa los campos marcados.', 'VALIDATION_ERROR', fields);
  }

  if (err instanceof multer.MulterError) {
    return new AppError(413, MULTER_MESSAGES[err.code] ?? 'No se pudo procesar el archivo enviado.', 'UPLOAD_ERROR');
  }

  if (err instanceof UniqueConstraintError) {
    return new AppError(409, 'Ya existe un registro con esos datos (por ejemplo, el mismo slug o fecha).', 'DUPLICATE');
  }

  if (err instanceof ForeignKeyConstraintError) {
    return new AppError(409, 'No se puede completar: el registro está relacionado con otros datos.', 'RELATION_CONFLICT');
  }

  if (err instanceof ValidationError) {
    return new AppError(400, 'No se pudo guardar: hay campos obligatorios vacíos o con formato incorrecto.', 'VALIDATION_ERROR');
  }

  if (err instanceof BaseError) {
    return new AppError(500, 'No se pudo completar la operación en la base de datos.', 'DATABASE_ERROR');
  }

  if (err?.type === 'entity.parse.failed') {
    return new AppError(400, 'El cuerpo de la petición no es JSON válido.', 'BAD_JSON');
  }

  if (err?.type === 'entity.too.large') {
    return new AppError(413, 'La información enviada es demasiado grande.', 'PAYLOAD_TOO_LARGE');
  }

  return new AppError(500, 'Ocurrió un error inesperado. Intenta de nuevo en unos momentos.', 'INTERNAL_ERROR');
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const appError = toAppError(err);

  if (appError.status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  const body = { error: { message: appError.message, code: appError.code } };
  if (appError.fields) body.error.fields = appError.fields;
  if (!env.isProduction && appError.status >= 500 && err !== appError) body.error.detail = err?.message;

  res.status(appError.status).json(body);
}

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `La ruta ${req.method} ${req.originalUrl} no existe.`, 'ROUTE_NOT_FOUND'));
}
