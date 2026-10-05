export interface PanelNavItem {
  label: string;
  path: string;
  icon: string;
}

export interface PanelNavGroup {
  title: string;
  items: PanelNavItem[];
}

/** Menú lateral del panel, agrupado por tarea. Íconos: trazos SVG de 24×24. */
export const PANEL_NAV: PanelNavGroup[] = [
  {
    title: 'Agenda',
    items: [
      { label: 'Resumen', path: '/panel', icon: 'M3 12l9-8 9 8M5 10v10h14V10' },
      { label: 'Calendario', path: '/panel/agenda', icon: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4' },
      { label: 'Eventos', path: '/panel/events', icon: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3' },
      { label: 'Clientes', path: '/panel/clients', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0' },
      { label: 'Pagos', path: '/panel/payments', icon: 'M3 7h18v10H3zM3 11h18M7 15h3' },
      { label: 'Reservaciones', path: '/panel/reservations', icon: 'M4 7h16v4a2 2 0 000 4v4H4v-4a2 2 0 000-4zM10 7v12' },
    ],
  },
  {
    title: 'Sitio',
    items: [
      { label: 'Contenido', path: '/panel/content', icon: 'M4 5h16M4 10h16M4 15h10M4 20h7' },
      { label: 'Servicios', path: '/panel/services', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
      { label: 'Paquetes', path: '/panel/packages', icon: 'M3 8l9-5 9 5-9 5zM3 8v8l9 5 9-5V8' },
      { label: 'Preguntas frecuentes', path: '/panel/faq', icon: 'M9 9a3 3 0 116 0c0 2-3 2-3 4M12 17h.01M12 21a9 9 0 100-18 9 9 0 000 18z' },
      { label: 'Legales', path: '/panel/legal', icon: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7' },
      { label: 'Temas', path: '/panel/themes', icon: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6M12 16a4 4 0 100-8 4 4 0 000 8z' },
    ],
  },
  {
    title: 'Cuenta',
    items: [{ label: 'Configuración', path: '/panel/settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 1-2-2V4h-4v2L9 8 7 7l-2 4 2 1v0l-2 1 2 4 2-1 2 2v2h4v-2l2-2 2 1 2-4z' }],
  },
];
