import { Op } from 'sequelize';
import { Client, Event, Gallery, GalleryImage, LegalDocument, Package, Payment, Service } from '../models/index.js';
import { todayInStudioTz } from '../utils/dates-mx.js';
import { getSections } from '../services/settings.service.js';
import { toEventSummary } from './events.controller.js';

/** Resumen del panel: próximos eventos, saldos y contenido aún provisional. */
export async function getDashboard(_req, res) {
  const today = todayInStudioTz();
  const [year, month] = today.split('-');
  const monthStart = `${year}-${month}-01`;
  const monthEnd = new Date(Date.UTC(Number(year), Number(month), 0)).toISOString().slice(0, 10);

  const [upcoming, monthEvents, openEvents, unpricedPackages, provisionalServices, provisionalLegal, settings, galleries] =
    await Promise.all([
      Event.findAll({
        where: { eventDate: { [Op.gte]: today }, status: { [Op.ne]: 'cancelled' } },
        include: [
          { model: Client, as: 'client', attributes: ['id', 'name', 'phone'] },
          { model: Service, as: 'service', attributes: ['id', 'name', 'slug'] },
          { model: Payment, as: 'payments', attributes: ['amount'] },
        ],
        order: [['eventDate', 'ASC']],
        limit: 5,
      }),
      Event.count({ where: { eventDate: { [Op.between]: [monthStart, monthEnd] }, status: { [Op.ne]: 'cancelled' } } }),
      Event.findAll({
        where: { status: { [Op.ne]: 'cancelled' } },
        attributes: ['id', 'totalPrice'],
        include: [{ model: Payment, as: 'payments', attributes: ['amount'] }],
      }),
      // Solo los que no tienen precio capturado: ocultar el precio al público es una decisión, no un pendiente.
      Package.findAll({ where: { price: null, isActive: true }, attributes: ['id', 'name'] }),
      Service.findAll({ where: { isProvisional: true }, attributes: ['id', 'name'] }),
      LegalDocument.findAll({ where: { isProvisional: true }, attributes: ['type', 'title'] }),
      getSections(['home', 'about']),
      Gallery.findAll({
        attributes: ['id', 'title'],
        include: [{ model: Service, as: 'service', attributes: ['id', 'name'], where: { isVisible: true } }],
      }),
    ]);

  const imageCounts = await GalleryImage.count({ group: ['galleryId'] });
  const countByGallery = Object.fromEntries(imageCounts.map((r) => [r.galleryId, Number(r.count)]));

  let pendingBalance = 0;
  let pendingEvents = 0;
  for (const event of openEvents) {
    const balance = Number(event.totalPrice) - event.payments.reduce((s, p) => s + Number(p.amount), 0);
    if (balance > 0) {
      pendingBalance += balance;
      pendingEvents++;
    }
  }

  const provisional = [
    ...unpricedPackages.map((p) => ({ type: 'package', id: p.id, label: `Paquete "${p.name}" sin precio` })),
    ...provisionalServices.map((s) => ({ type: 'service', id: s.id, label: `Textos del servicio "${s.name}"` })),
    ...provisionalLegal.map((d) => ({ type: 'legal', id: d.type, label: `${d.title} (provisional)` })),
    ...galleries
      .filter((g) => !countByGallery[g.id])
      .map((g) => ({ type: 'gallery', id: g.service.id, label: `Galería de "${g.service.name}" sin fotografías` })),
  ];
  if (settings.home?.valueProposition?.isProvisional) {
    provisional.unshift({ type: 'content', id: 'home', label: 'Propuesta de valor de la Home' });
  }
  if (settings.about?.isProvisional) {
    provisional.unshift({ type: 'content', id: 'about', label: 'Textos de la página "Sobre mí"' });
  }

  res.json({
    today,
    upcomingEvents: upcoming.map(toEventSummary),
    eventsThisMonth: monthEvents,
    pendingPayments: { events: pendingEvents, balance: Math.round(pendingBalance * 100) / 100 },
    provisional,
  });
}
