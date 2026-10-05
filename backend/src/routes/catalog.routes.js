import { Router } from 'express';
import * as settings from '../controllers/settings.controller.js';
import * as services from '../controllers/services.controller.js';
import * as packages from '../controllers/packages.controller.js';
import * as galleries from '../controllers/galleries.controller.js';
import * as media from '../controllers/media.controller.js';
import * as faqs from '../controllers/faqs.controller.js';
import * as themes from '../controllers/themes.controller.js';
import * as legal from '../controllers/legal.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { validate } from '../middlewares/validate.js';
import { uploadManyImages, uploadSingleImage } from '../middlewares/upload.js';
import { idParams, pagination, reorderBody } from '../validators/common.schemas.js';
import * as s from '../validators/catalog.schemas.js';

// Nota: las rutas estáticas (/admin, /reorder) van antes que las dinámicas (/:slug).

export const settingsRoutes = Router()
  .get('/public', settings.getPublic)
  .get('/', requireAuth, settings.getAll)
  .put('/:section', requireAuth, settings.updateSection);

export const servicesRoutes = Router()
  .get('/', services.listPublic)
  .get('/admin', requireAuth, services.listAdmin)
  .get('/admin/:id', requireAuth, validate({ params: idParams }), services.getAdmin)
  .put('/reorder', requireAuth, validate({ body: reorderBody }), services.reorder)
  .get('/:slug', validate({ params: s.slugParams }), services.getBySlug)
  .post('/', requireAuth, validate({ body: s.serviceCreateBody }), services.create)
  .put('/:id', requireAuth, validate({ params: idParams, body: s.serviceUpdateBody }), services.update)
  .patch('/:id/visibility', requireAuth, validate({ params: idParams, body: s.visibilityBody }), services.setVisibility)
  .delete('/:id', requireAuth, validate({ params: idParams }), services.remove);

export const packagesRoutes = Router()
  .get('/', validate({ query: s.byServiceQuery }), packages.listPublic)
  .get('/admin', requireAuth, packages.listAdmin)
  .put('/reorder', requireAuth, validate({ body: reorderBody }), packages.reorder)
  .post('/', requireAuth, validate({ body: s.packageCreateBody }), packages.create)
  .put('/:id', requireAuth, validate({ params: idParams, body: s.packageUpdateBody }), packages.update)
  .patch('/:id/active', requireAuth, validate({ params: idParams, body: s.activeBody }), packages.setActive)
  .delete('/:id', requireAuth, validate({ params: idParams }), packages.remove);

export const galleriesRoutes = Router()
  .get('/admin/:id', requireAuth, validate({ params: idParams }), galleries.getAdmin)
  .get('/:serviceSlug/images', validate({ query: pagination }), galleries.listPublicImages)
  .patch('/:id', requireAuth, validate({ params: idParams, body: s.gallerySettingsBody }), galleries.updateSettings)
  .post('/:id/images', requireAuth, uploadManyImages, validate({ params: idParams }), galleries.uploadImages)
  .put('/:id/order', requireAuth, validate({ params: idParams, body: reorderBody }), galleries.reorderImages)
  .put('/:id/cover', requireAuth, validate({ params: idParams, body: s.setCoverBody }), galleries.setCover)
  .delete('/:id/images/:imageId', requireAuth, validate({ params: s.galleryImageParams }), galleries.removeImage);

export const mediaRoutes = Router()
  .use(requireAuth)
  .post('/', uploadSingleImage, validate({ body: s.mediaUploadBody }), media.upload)
  .patch('/:id', validate({ params: idParams, body: s.mediaAltBody }), media.updateAlt)
  .delete('/:id', validate({ params: idParams }), media.remove);

export const faqsRoutes = Router()
  .get('/', validate({ query: s.byServiceQuery }), faqs.listPublic)
  .get('/admin', requireAuth, faqs.listAdmin)
  .put('/reorder', requireAuth, validate({ body: reorderBody }), faqs.reorder)
  .post('/', requireAuth, validate({ body: s.faqCreateBody }), faqs.create)
  .put('/:id', requireAuth, validate({ params: idParams, body: s.faqUpdateBody }), faqs.update)
  .delete('/:id', requireAuth, validate({ params: idParams }), faqs.remove);

export const themesRoutes = Router()
  .get('/active', themes.getActive)
  .get('/', requireAuth, themes.list)
  .put('/mode', requireAuth, validate({ body: s.themeModeBody }), themes.setMode)
  .put('/:id', requireAuth, validate({ params: idParams, body: s.themeUpdateBody }), themes.update);

export const legalRoutes = Router()
  .get('/', requireAuth, legal.list)
  .get('/:type', validate({ params: s.legalParams }), legal.getOne)
  .get('/:type/pdf', validate({ params: s.legalParams }), legal.downloadPdf)
  .put('/:type', requireAuth, validate({ params: s.legalParams, body: s.legalUpdateBody }), legal.update);
