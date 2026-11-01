import { environment } from '../../../environments/environment';

export interface NavLink {
  label: string;
  path: string;
}

/** Enlaces principales del sitio público (navbar, menú móvil y footer). */
export const NAV_LINKS: NavLink[] = [
  { label: 'Sobre mí', path: '/about' },
  { label: 'Servicios', path: '/events' },
  { label: 'Disponibilidad', path: '/availability' },
  { label: 'Preguntas', path: '/faq' },
  // Reseñas: solo cuando el módulo está activo (en producción, hasta que se apruebe).
  ...(environment.reviewsEnabled ? [{ label: 'Reseñas', path: '/reviews' }] : []),
  { label: 'Contacto', path: '/contact' },
];
