import { Routes } from '@angular/router';
import { PanelLayout } from '../../layouts/panel-layout/panel-layout';

/** Rutas del panel (carga diferida; protegidas por authGuard en app.routes). */
export const PANEL_ROUTES: Routes = [
  {
    path: '',
    component: PanelLayout,
    children: [
      { path: '', title: 'Dashboard | Panel', loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard) },

      // ---- Agenda ----
      { path: 'agenda', title: 'Calendario | Panel', loadComponent: () => import('./agenda/agenda').then((m) => m.Agenda) },
      { path: 'events', title: 'Eventos | Panel', loadComponent: () => import('./events/events-admin-list').then((m) => m.EventsAdminList) },
      { path: 'events/new', title: 'Nuevo evento | Panel', loadComponent: () => import('./events/event-create').then((m) => m.EventCreate) },
      { path: 'events/:id', title: 'Evento | Panel', loadComponent: () => import('./events/event-detail-admin').then((m) => m.EventDetailAdmin) },
      { path: 'clients', title: 'Clientes | Panel', loadComponent: () => import('./clients/clients-list').then((m) => m.ClientsList) },
      { path: 'clients/:id', title: 'Cliente | Panel', loadComponent: () => import('./clients/client-detail').then((m) => m.ClientDetail) },
      { path: 'payments', title: 'Pagos | Panel', loadComponent: () => import('./payments/payments').then((m) => m.Payments) },
      { path: 'reservations', title: 'Reservaciones | Panel', loadComponent: () => import('./reservations/reservations').then((m) => m.Reservations) },

      // ---- Sitio ----
      { path: 'content', title: 'Contenido | Panel', loadComponent: () => import('./content/content').then((m) => m.Content) },
      { path: 'services', title: 'Servicios | Panel', loadComponent: () => import('./services/services-admin-list').then((m) => m.ServicesAdminList) },
      { path: 'services/new', title: 'Nuevo servicio | Panel', loadComponent: () => import('./services/service-edit').then((m) => m.ServiceEdit) },
      { path: 'services/:id', title: 'Servicio | Panel', loadComponent: () => import('./services/service-edit').then((m) => m.ServiceEdit) },
      { path: 'packages', title: 'Paquetes | Panel', loadComponent: () => import('./packages/packages-admin').then((m) => m.PackagesAdmin) },
      { path: 'faq', title: 'FAQ | Panel', loadComponent: () => import('./faq/faq-admin').then((m) => m.FaqAdmin) },
      { path: 'legal', title: 'Legales | Panel', loadComponent: () => import('./legal/legal-admin').then((m) => m.LegalAdmin) },
      { path: 'themes', title: 'Temas | Panel', loadComponent: () => import('./themes/themes-admin').then((m) => m.ThemesAdmin) },

      // ---- Cuenta ----
      { path: 'settings', title: 'Configuración | Panel', loadComponent: () => import('./settings/settings-admin').then((m) => m.SettingsAdmin) },

      { path: '**', redirectTo: '' },
    ],
  },
];
