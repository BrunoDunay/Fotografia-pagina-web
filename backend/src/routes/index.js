import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import {
  faqsRoutes,
  galleriesRoutes,
  legalRoutes,
  mediaRoutes,
  packagesRoutes,
  servicesRoutes,
  settingsRoutes,
  themesRoutes,
} from './catalog.routes.js';
import {
  availabilityRoutes,
  clientsRoutes,
  dashboardRoutes,
  eventsRoutes,
  paymentsRoutes,
  reservationsRoutes,
} from './agenda.routes.js';

export const apiRoutes = Router()
  .get('/health', (_req, res) => res.json({ status: 'ok' }))
  .use('/auth', authRoutes)
  .use('/settings', settingsRoutes)
  .use('/services', servicesRoutes)
  .use('/packages', packagesRoutes)
  .use('/galleries', galleriesRoutes)
  .use('/media', mediaRoutes)
  .use('/faqs', faqsRoutes)
  .use('/themes', themesRoutes)
  .use('/legal', legalRoutes)
  .use('/availability', availabilityRoutes)
  .use('/events', eventsRoutes)
  .use('/clients', clientsRoutes)
  .use('/payments', paymentsRoutes)
  .use('/reservations', reservationsRoutes)
  .use('/dashboard', dashboardRoutes);
