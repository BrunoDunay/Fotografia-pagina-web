import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Renderizado híbrido:
 * - Panel y login: solo en el navegador (contenido privado, sin SEO).
 * - Sitio público y ticket: SSR en cada petición (contenido dinámico + Open Graph).
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'panel/**', renderMode: RenderMode.Client },
  { path: 'panel', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
