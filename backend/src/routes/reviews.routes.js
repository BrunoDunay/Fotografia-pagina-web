import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as reviews from '../controllers/reviews.controller.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { validate } from '../middlewares/validate.js';
import { uploadReviewPhoto } from '../middlewares/upload.js';
import { AppError } from '../utils/app-error.js';
import { idParams } from '../validators/common.schemas.js';
import * as s from '../validators/reviews.schemas.js';

const tooMany = (message) => (_req, res) => res.status(429).json({ error: { message, code: 'TOO_MANY_REVIEWS' } });

/** Una misma persona (IP): 5 intentos por hora (alcanza para corregir un error y enviar). */
const perVisitor = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooMany('Ya recibimos tus reseñas. Si quieres enviar otra, espera una hora.'),
});

/** Todo el sitio junto: si llegan demasiadas a la vez (un ataque desde muchas IP), el formulario se pausa. */
const siteWide = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  keyGenerator: () => 'all-visitors',
  standardHeaders: false,
  legacyHeaders: false,
  handler: tooMany('Estamos recibiendo muchas reseñas en este momento. Inténtalo de nuevo más tarde.'),
});

/** Mientras las reseñas no se aprueben para producción, todo el módulo queda apagado. */
const enabled = (_req, _res, next) =>
  next(env.reviewsEnabled ? undefined : new AppError(503, 'Las reseñas estarán disponibles muy pronto.', 'REVIEWS_DISABLED'));

// Los límites van ANTES de leer el archivo: a quien se pasa del límite no se le recibe ni un byte de la foto.
export const reviewsRoutes = Router()
  .use(enabled)
  .get('/', validate({ query: s.reviewListQuery }), reviews.listPublic)
  .post('/', perVisitor, siteWide, uploadReviewPhoto, validate({ body: s.reviewSubmitBody }), reviews.submit)
  .get('/admin', requireAuth, validate({ query: s.reviewAdminQuery }), reviews.listAdmin)
  .patch('/:id', requireAuth, validate({ params: idParams, body: s.reviewUpdateBody }), reviews.update)
  .delete('/:id/photo', requireAuth, validate({ params: idParams }), reviews.removePhoto)
  .delete('/:id', requireAuth, validate({ params: idParams }), reviews.remove);
