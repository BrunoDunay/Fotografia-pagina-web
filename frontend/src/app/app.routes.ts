import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { PublicLayout } from './layouts/public-layout/public-layout';

/** `navOverlay: true` → la página abre con un Hero a sangre y el navbar va transparente encima. */
export const routes: Routes = [
  // ---- Panel privado (lazy; sin sesión ni siquiera se descarga) ----
  {
    path: 'panel',
    canMatch: [authGuard],
    loadChildren: () => import('./pages/panel/panel.routes').then((m) => m.PANEL_ROUTES),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },

  // ---- Ticket digital (layout propio, sin navbar) ----
  {
    path: 'reservation/:code',
    loadComponent: () => import('./pages/reservation/reservation').then((m) => m.ReservationPage),
  },

  // ---- Sitio público ----
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { navOverlay: true },
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'about',
        data: { navOverlay: true },
        loadComponent: () => import('./pages/about/about').then((m) => m.About),
      },
      {
        path: 'events',
        loadComponent: () => import('./pages/events/events-list').then((m) => m.EventsList),
      },
      {
        path: 'events/:slug',
        data: { navOverlay: true },
        loadComponent: () => import('./pages/events/event-detail').then((m) => m.EventDetail),
      },
      {
        path: 'availability',
        loadComponent: () => import('./pages/availability/availability').then((m) => m.Availability),
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq').then((m) => m.Faq),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
      },
      {
        path: 'contract',
        data: { type: 'contract' },
        loadComponent: () => import('./pages/legal/legal-document-page').then((m) => m.LegalDocumentPage),
      },
      {
        path: 'legal/terms',
        data: { type: 'terms' },
        loadComponent: () => import('./pages/legal/legal-document-page').then((m) => m.LegalDocumentPage),
      },
      {
        path: 'legal/privacy',
        data: { type: 'privacy' },
        loadComponent: () => import('./pages/legal/legal-document-page').then((m) => m.LegalDocumentPage),
      },
      { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
    ],
  },
];
