import { Router } from 'express';
import * as availability from '../controllers/availability.controller.js';
import * as events from '../controllers/events.controller.js';
import * as clients from '../controllers/clients.controller.js';
import * as payments from '../controllers/payments.controller.js';
import * as reservations from '../controllers/reservations.controller.js';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { validate } from '../middlewares/validate.js';
import { uploadTicketImage } from '../middlewares/upload.js';
import { idParams } from '../validators/common.schemas.js';
import * as s from '../validators/agenda.schemas.js';

export const availabilityRoutes = Router()
  .get('/', validate({ query: s.rangeQuery }), availability.getPublic)
  .get('/blocks', requireAuth, validate({ query: s.optionalRangeQuery }), availability.listBlocks)
  .post('/blocks', requireAuth, validate({ body: s.blockCreateBody }), availability.createBlock)
  .delete('/blocks/:id', requireAuth, validate({ params: idParams }), availability.removeBlock);

// Todo lo de agenda privada exige sesión.
export const eventsRoutes = Router()
  .use(requireAuth)
  .get('/', validate({ query: s.eventListQuery }), events.list)
  .get('/:id', validate({ params: idParams }), events.getOne)
  .post('/', validate({ body: s.eventCreateBody }), events.create)
  .put('/:id', validate({ params: idParams, body: s.eventUpdateBody }), events.update)
  .patch('/:id/status', validate({ params: idParams, body: s.eventStatusBody }), events.setStatus)
  .post('/:id/send-confirmation', uploadTicketImage, validate({ params: idParams }), events.sendConfirmation)
  .delete('/:id', validate({ params: idParams }), events.remove);

export const clientsRoutes = Router()
  .use(requireAuth)
  .get('/', validate({ query: s.clientListQuery }), clients.list)
  .get('/:id', validate({ params: idParams }), clients.getOne)
  .post('/', validate({ body: s.clientCreateBody }), clients.create)
  .put('/:id', validate({ params: idParams, body: s.clientUpdateBody }), clients.update)
  .delete('/:id', validate({ params: idParams, query: s.forceQuery }), clients.remove);

export const paymentsRoutes = Router()
  .use(requireAuth)
  .get('/', validate({ query: s.paymentListQuery }), payments.list)
  .post('/', validate({ body: s.paymentCreateBody }), payments.create)
  .put('/:id', validate({ params: idParams, body: s.paymentUpdateBody }), payments.update)
  .delete('/:id', validate({ params: idParams }), payments.remove);

export const reservationsRoutes = Router()
  .get('/', requireAuth, reservations.list)
  .get('/:code', validate({ params: s.codeParams }), reservations.getPublic)
  .put('/:id', requireAuth, validate({ params: idParams, body: s.reservationUpdateBody }), reservations.update)
  .post('/:id/regenerate-code', requireAuth, validate({ params: idParams }), reservations.regenerateCode);

export const dashboardRoutes = Router().get('/', requireAuth, getDashboard);
