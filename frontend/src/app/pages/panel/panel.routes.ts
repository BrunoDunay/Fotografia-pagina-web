import { Routes } from '@angular/router';
import { PanelLayout } from '../../layouts/panel-layout/panel-layout';

/** Rutas del panel (carga diferida completa; protegidas por authGuard en app.routes). */
export const PANEL_ROUTES: Routes = [
  {
    path: '',
    component: PanelLayout,
    children: [
      {
        path: '',
        title: 'Dashboard | Panel',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      // Fase 4: agenda, events, clients, payments, reservations, content, services, packages, faq, legal, themes, settings.
      {
        path: '**',
        title: 'Panel',
        loadComponent: () => import('./coming-soon/coming-soon').then((m) => m.PanelComingSoon),
      },
    ],
  },
];
