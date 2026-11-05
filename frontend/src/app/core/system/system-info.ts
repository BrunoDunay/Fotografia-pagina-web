/**
 * Ficha técnica e historial del sistema ("Acerca del sistema" en el panel).
 *
 * Regla: cada vez que se entra a corregir o cambiar algo, se agrega aquí antes de publicar.
 * - Corrección o ajuste chico → sube el último número (1.5.0 → 1.5.1).
 * - Mejora o función nueva → sube el de en medio (1.5.1 → 1.6.0).
 * - Cambio que transforma el sistema (rediseño completo, nueva plataforma) → sube el primero (1.6.0 → 2.0.0).
 * La versión más nueva va primero, y `version` en package.json debe coincidir con ella.
 */

export type ChangeKind = 'nuevo' | 'mejora' | 'correccion';

export interface Release {
  version: string;
  /** AAAA-MM-DD */
  date: string;
  title: string;
  changes: { kind: ChangeKind; text: string }[];
}

export const SYSTEM = {
  name: 'Armando Ovalle',
  type: 'Sitio web y panel administrativo: galerías, servicios, reservaciones, agenda, pagos y reseñas',
  client: 'Jorge Armando Ovalle · fotografía de bodas y eventos',
  developer: 'Bruno Dunay',
  developerRole: 'Diseño y desarrollo',
  supportPhone: '449 396 5327',
  supportWhatsapp: 'https://wa.me/524493965327',
  developerCard: 'https://tarjeta-bruno-dunay.vercel.app',
  /** Inicio del desarrollo. */
  createdAt: '2026-10-01',
  /** Primer día en producción. */
  liveSince: '2026-10-06',
  stack: [
    { label: 'Sitio y panel', value: 'Angular 22 con render en servidor (SSR)' },
    { label: 'API', value: 'Node.js + Express 5' },
    { label: 'Base de datos', value: 'PostgreSQL' },
    { label: 'Fotos y videos', value: 'Cloudinary' },
    { label: 'Alojamiento del sitio', value: 'Netlify' },
    { label: 'Alojamiento de la API', value: 'Render' },
    { label: 'Código fuente', value: 'GitHub, con historial de cada cambio' },
  ],
} as const;

export const RELEASES: Release[] = [
  {
    version: '1.5.0',
    date: '2026-11-05',
    title: 'Acerca del sistema',
    changes: [{ kind: 'nuevo', text: 'Esta página: ficha técnica, estado de la conexión e historial de versiones del sistema.' }],
  },
  {
    version: '1.4.1',
    date: '2026-11-04',
    title: 'Ajustes de sesiones navideñas',
    changes: [
      { kind: 'correccion', text: 'Se crea la galería que faltaba de las sesiones navideñas.' },
      { kind: 'mejora', text: 'Título más corto en el encabezado de la página navideña.' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-11-04',
    title: 'Sesiones navideñas 2026',
    changes: [
      { kind: 'nuevo', text: 'Servicio "Sesiones navideñas 2026", primero en la lista, con paquete Christmas de $2,500 con precio visible.' },
    ],
  },
  {
    version: '1.3.1',
    date: '2026-11-01',
    title: 'Ajustes de la entrada',
    changes: [
      { kind: 'mejora', text: 'La entrada del sitio sale con un fundido corto en lugar de la cortina.' },
      { kind: 'mejora', text: 'Logo del menú: solo el destello al pasar el cursor.' },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-11-01',
    title: 'Reseñas de clientes',
    changes: [
      { kind: 'nuevo', text: 'Reseñas de clientes con moderación desde el panel y enlace para que los clientes escriban la suya.' },
      { kind: 'nuevo', text: 'Tarjeta con código QR para pedir reseñas.' },
      { kind: 'nuevo', text: 'Entrada del sitio con el logo AO animado y transición entre páginas.' },
      { kind: 'mejora', text: 'Logo animado al pasar el cursor, también con "reducir movimiento".' },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-10-27',
    title: 'Ajustes de eventos',
    changes: [
      { kind: 'correccion', text: 'Eventos: "Realizado" solo aparece en fechas que ya pasaron.' },
      { kind: 'correccion', text: 'Alta de evento: vuelve la opción "Realizado".' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-10-27',
    title: 'Logotipo nuevo',
    changes: [
      { kind: 'mejora', text: 'Monograma AO en todo el sitio y en el ícono de la pestaña.' },
      { kind: 'mejora', text: 'El nombre pasa a "Armando Ovalle", sin "Wedding Studio".' },
      { kind: 'mejora', text: 'Foto nueva en "Reserva tu fecha".' },
      { kind: 'nuevo', text: 'Los eventos se marcan como realizados solos cuando pasa su fecha.' },
    ],
  },
  {
    version: '1.1.1',
    date: '2026-10-09',
    title: 'Legales definitivos',
    changes: [
      { kind: 'mejora', text: 'Aviso de privacidad y términos definitivos.' },
      { kind: 'nuevo', text: 'Copia del correo de cada reservación para el fotógrafo.' },
      { kind: 'correccion', text: 'Los pendientes del panel ya no cuentan precios ocultos a propósito.' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-10-07',
    title: 'Videos desde el panel',
    changes: [
      { kind: 'nuevo', text: 'El video de cada servicio se sube desde el panel, sin enlaces de YouTube.' },
      { kind: 'correccion', text: 'La portada y las fotos de "Sobre mí" se ven completas, sin recortes.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-06',
    title: 'Puesta en producción',
    changes: [
      { kind: 'nuevo', text: 'El sistema se publica: sitio en Netlify y API en Render.' },
      { kind: 'mejora', text: 'Ícono del sitio con la W del logotipo.' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-10-05',
    title: 'Tickets, correos y temas de temporada',
    changes: [
      { kind: 'nuevo', text: 'Ticket digital de reservación con más de 20 diseños y variaciones de color.' },
      { kind: 'nuevo', text: 'Correo de confirmación de reservación.' },
      { kind: 'nuevo', text: 'Temas por festividad con adornos en el menú (Navidad, Día de Muertos, Independencia, San Marcos, Año Nuevo y más), con activación automática.' },
      { kind: 'mejora', text: 'Barra de desplazamiento propia y campos alineados.' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-02',
    title: 'Listo para producción',
    changes: [
      { kind: 'mejora', text: 'Rendimiento, SEO, accesibilidad y adaptación a cualquier pantalla.' },
      { kind: 'nuevo', text: 'Paquetes reales de bodas y XV años.' },
      { kind: 'mejora', text: 'Galería por columnas balanceadas y tira de fotos bajo los paquetes.' },
      { kind: 'correccion', text: 'Panel lateral del calendario, orden de paquetes y disponibilidad manual.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-10-01',
    title: 'Primera versión',
    changes: [
      { kind: 'nuevo', text: 'Sitio público con galerías, servicios, paquetes y reservaciones.' },
      { kind: 'nuevo', text: 'API con base de datos y panel administrativo completo.' },
    ],
  },
];
