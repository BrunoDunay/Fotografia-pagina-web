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
  { label: 'Contacto', path: '/contact' },
];
