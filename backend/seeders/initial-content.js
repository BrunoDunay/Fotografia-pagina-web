/**
 * Contenido inicial del sitio.
 *
 * REAL       = proporcionado por el fotógrafo (promt_maestro.md).
 * PROVISIONAL = marcado con isProvisional / isPriceProvisional; debe sustituirse desde el panel.
 * Nada de esto vive en el frontend: todo se edita después en /panel.
 */

export const settings = {
  // REAL
  brand: {
    studioName: 'Armando Ovalle Wedding Studio',
    photographerName: 'Jorge Armando Ovalle',
    tagline: 'Fotografía de bodas y eventos',
    logoLight: null,
    logoDark: null,
  },

  home: {
    hero: {
      title: 'Armando Ovalle',
      subtitle: 'Wedding Studio',
      ctaLabel: 'Ver disponibilidad',
      ctaLink: '/availability',
      image: null,
    },
    // PROVISIONAL
    valueProposition: {
      title: 'Historias reales, contadas con calma',
      text: 'Fotografía de bodas y eventos que captura lo que sucede de verdad: las emociones, los detalles y las personas que hacen único tu día.',
      isProvisional: true,
    },
    aboutTeaser: {
      eyebrow: 'Sobre mí',
      title: 'Hola, soy Armando',
      subtitle: 'Fotógrafo de bodas y eventos',
      text: 'Más de 7 años de experiencia y más de 200 eventos cubiertos. Me gusta trabajar con discreción para que tú solo te preocupes por disfrutar.',
      ctaLabel: 'Conocer más',
      image: null,
    },
  },

  about: {
    name: 'Jorge Armando Ovalle',
    headline: 'Fotógrafo especializado en bodas y eventos',
    // PROVISIONAL: textos narrativos
    intro:
      'Soy fotógrafo con base en Aguascalientes, especializado en bodas y en todo tipo de eventos sociales, sesiones y fotografía comercial.',
    story:
      'Texto provisional: aquí irá la historia de cómo comenzó Armando en la fotografía y qué lo llevó a especializarse en bodas.',
    philosophy:
      'Texto provisional: aquí irá la filosofía de trabajo del estudio — cómo acompaña a sus clientes y qué busca transmitir en cada fotografía.',
    // REAL
    education: {
      degree: 'Diseño y Producción de Contenidos',
      institution: 'Universidad Cuauhtémoc de Aguascalientes',
    },
    stats: [
      { value: '7+', label: 'Años de experiencia' },
      { value: '200+', label: 'Eventos cubiertos' },
    ],
    specialties: ['Bodas', 'Bodas en la playa', 'XV años', 'Graduaciones', 'Sesiones', 'Conciertos y shows', 'Fotografía comercial'],
    travel: {
      national: 'Trabajo en Aguascalientes y en otros estados de México. Los eventos fuera de Aguascalientes pueden requerir una cotización diferente dependiendo de la ubicación y las condiciones del evento.',
      international: 'También es posible realizar cobertura fuera de México, con una cotización personalizada que considera ubicación, traslados y demás gastos relacionados.',
    },
    images: [],
    isProvisional: true,
  },

  // REAL
  contact: {
    photographerName: 'Jorge Armando Ovalle',
    studioName: 'Armando Ovalle Wedding Studio',
    phone: '+52 449 999 5998',
    whatsapp: '524499995998',
    email: 'Ovalle.photo00@gmail.com',
    instagram: { handle: 'armandoovalle.ws', url: 'https://www.instagram.com/armandoovalle.ws/' },
    facebook: { name: 'Armando Ovalle Wedding Studio', url: 'https://www.facebook.com/profile.php?id=100067234990368' },
  },

  whatsapp: {
    message: 'Hola, me interesa conocer más sobre los servicios de Armando Ovalle Wedding Studio.',
  },

  seo: {
    defaultTitle: 'Armando Ovalle Wedding Studio | Fotografía de bodas y eventos en Aguascalientes',
    defaultDescription:
      'Fotografía de bodas, XV años, graduaciones, sesiones y eventos en Aguascalientes y todo México. Más de 7 años de experiencia y más de 200 eventos cubiertos.',
    ogImage: null,
  },

  availability: {
    publicNote: 'Consulta la fecha de tu evento. Para apartarla, escríbeme por WhatsApp.',
  },

  theme: { mode: 'auto', manualThemeId: null },

  uploads: { maxImagesPerGallery: 60 },
};

/** REAL: lista de servicios del fotógrafo. PROVISIONAL: textos descriptivos. */
export const services = [
  { slug: 'weddings', name: 'Bodas', shortDescription: 'Tu boda contada de principio a fin, con naturalidad y detalle.' },
  { slug: 'beach-weddings', name: 'Bodas en la playa', shortDescription: 'Celebraciones frente al mar, con la luz y el paisaje como protagonistas.' },
  { slug: 'quinceanos', name: 'XV años', shortDescription: 'Una celebración única, desde la sesión previa hasta la fiesta.' },
  { slug: 'graduations', name: 'Graduaciones', shortDescription: 'El cierre de una etapa importante, para recordarlo siempre.' },
  { slug: 'baby-showers', name: 'Baby showers', shortDescription: 'La espera, la familia y los pequeños detalles.' },
  { slug: 'proposals', name: 'Pedidas de mano', shortDescription: 'El momento del sí, capturado sin que nadie lo note.' },
  { slug: 'save-the-date', name: 'Save the Date', shortDescription: 'Sesiones para anunciar su fecha con estilo.' },
  { slug: 'outdoor-sessions', name: 'Sesiones al aire libre', shortDescription: 'Retratos con luz natural en locaciones abiertas.' },
  { slug: 'individual-sessions', name: 'Sesiones individuales', shortDescription: 'Retratos personales, profesionales o de estilo.' },
  { slug: 'studio', name: 'Fotos de estudio', shortDescription: 'Retratos y producto con iluminación controlada.' },
  { slug: 'concerts', name: 'Conciertos', shortDescription: 'La energía del escenario y del público.' },
  { slug: 'shows', name: 'Shows', shortDescription: 'Cobertura de espectáculos y presentaciones en vivo.' },
  { slug: 'nightclubs', name: 'Party clubs / antros', shortDescription: 'El ambiente de la noche para tus redes y promoción.' },
  { slug: 'bars', name: 'Bares', shortDescription: 'Fotografía de ambiente, bebidas y eventos para bares.' },
  { slug: 'restaurants', name: 'Restaurantes', shortDescription: 'Platillos, espacios y experiencias gastronómicas.' },
  { slug: 'social-events', name: 'Otros eventos sociales', shortDescription: 'Cumpleaños, aniversarios y celebraciones especiales.' },
];

/** Paquetes REALES (folletos "Wedding" y "XV años 2026" del fotógrafo). Precios en MXN. */
const f = (...labels) => labels.map((label) => ({ label }));
const BOX = 'Caja de madera personalizada con USB';
const LINK = 'Link de descarga digital';

const weddingPackages = [
  {
    name: 'Classic',
    subtitle: 'Fotógrafo',
    price: 11500,
    features: f(
      'Getting ready',
      'First look',
      'Sesión formal',
      'Save the date',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 hrs)',
      '250 fotografías editadas',
      '1 impresión de 16 x 20',
      '30 impresiones de 6 x 8',
      LINK,
      BOX,
    ),
  },
  {
    name: 'Nova',
    subtitle: 'Fotógrafo y videógrafo',
    price: 15000,
    features: f(
      'Sesión formal',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 hrs)',
      '200 fotografías editadas',
      '1 impresión de 16 x 20',
      '30 impresiones de 6 x 8',
      'Tráiler de 2 a 3 minutos',
      LINK,
      BOX,
    ),
  },
  {
    name: 'Luxe',
    subtitle: 'Fotógrafo y videógrafo',
    price: 20000,
    features: f(
      'Sesión formal',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 hrs)',
      'Tomas de drone',
      'Invitación digital',
      '300 a 350 fotografías editadas',
      '1 impresión de 16 x 20',
      '50 impresiones de 6 x 8',
      'Tráiler de 2 a 3 min',
      'Película de 60 min',
      LINK,
      BOX,
    ),
  },
  {
    name: 'Aura',
    subtitle: 'Fotógrafo principal, fotógrafo secundario y videógrafo',
    price: 23000,
    features: f(
      'Getting ready',
      'Arreglo de maquillaje',
      'First look',
      'Sesión formal',
      'Save the date',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 hrs)',
      'Tomas de drone',
      '9 horas de cobertura total',
      'Invitación digital',
      '500 a 600 fotografías editadas',
      '1 impresión de 16 x 20 con marco',
      '70 impresiones de 6 x 8',
      'Tráiler de 2 a 3 min',
      'Película de 90 min',
      LINK,
      BOX,
    ),
  },
];

const xvPackages = [
  {
    name: 'Aura',
    subtitle: null,
    price: 21500,
    features: f(
      'Getting ready',
      'Sesión formal',
      'Sesión informal',
      'Ceremonia religiosa',
      'Recepción y fiesta (5 horas)',
      '500 a 600 fotografías digitales editadas',
      '1 fotografía impresa de 16 x 20 con marco',
      '70 fotografías impresas de 6 x 8',
      'Video teaser de 30 a 35 seg',
      'Tráiler de 2 a 3 min',
      'Película de 1 hora y 20 min',
      'Invitación digital',
    ),
  },
  {
    name: 'Luxe',
    subtitle: null,
    price: 18000,
    features: f(
      'Sesión formal',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 horas)',
      '300 a 350 fotografías digitales editadas',
      '1 fotografía impresa de 16 x 20',
      '50 fotografías impresas de 6 x 8',
      'Tráiler de 2 a 3 min',
      'Película de 60 min',
      `${BOX} y ${LINK.toLowerCase()}`,
    ),
  },
  {
    name: 'Reveuss',
    subtitle: null,
    price: 13000,
    features: f(
      'Getting ready',
      'Sesión formal',
      'Sesión informal',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 horas)',
      'Video tráiler de 2 min con tomas de dron',
      '200 fotografías digitales editadas',
      '1 fotografía impresa de 16 x 20',
      '30 fotografías impresas de 6 x 8',
      `${BOX} y ${LINK.toLowerCase()}`,
    ),
  },
  {
    name: 'Classic',
    subtitle: null,
    price: 10000,
    features: f(
      'Getting ready',
      'Sesión formal',
      'Sesión informal',
      'Ceremonia religiosa',
      'Recepción y fiesta (4 horas)',
      '200 fotografías digitales editadas',
      '1 fotografía impresa de 16 x 20',
      '30 fotografías impresas de 6 x 8',
      `${BOX} y ${LINK.toLowerCase()}`,
    ),
  },
];

/** Cada grupo de paquetes con los servicios donde se ofrece (por slug). */
export const packageGroups = [
  { serviceSlugs: ['weddings', 'beach-weddings'], packages: weddingPackages },
  { serviceSlugs: ['quinceanos'], packages: xvPackages },
];

/** REAL: respuestas proporcionadas por el fotógrafo. */
export const faqs = [
  {
    question: '¿Cuánto tardan en estar listas las fotografías?',
    answer:
      'Las fotografías suelen estar listas aproximadamente entre un mes y medio y tres meses después del evento, dependiendo del tipo y volumen de trabajo.',
  },
  {
    question: '¿Cuántas fotografías recibiré?',
    answer: 'La cantidad de fotografías varía dependiendo del tipo de evento y del paquete contratado.',
  },
  {
    question: '¿Trabajas fuera de Aguascalientes?',
    answer:
      'Sí. Los eventos fuera de Aguascalientes pueden requerir una cotización diferente dependiendo de la ubicación y las condiciones del evento.',
  },
  {
    question: '¿Trabajas fuera de México?',
    answer:
      'Sí. Es posible realizar cobertura fuera de México, pero requiere una cotización personalizada considerando ubicación, traslados y demás gastos relacionados.',
  },
  {
    question: '¿Cómo puedo apartar mi fecha?',
    answer: 'La fecha se aparta mediante la firma del contrato y el pago del apartado correspondiente.',
  },
  { question: '¿Se firma contrato?', answer: 'Sí. El servicio se formaliza mediante un contrato.' },
  {
    question: '¿Trabajas con un segundo fotógrafo?',
    answer:
      'Dependiendo del evento, puede participar un segundo fotógrafo o videógrafo. Cuando existen eventos simultáneos, puede enviarse personal adicional para cubrir uno de ellos; el fotógrafo principal procura supervisar el trabajo y mantener los estándares de calidad.',
  },
  {
    question: '¿Las fotografías se entregan editadas?',
    answer: 'Sí. Las fotografías entregadas pasan por un proceso de selección y edición.',
  },
];

/**
 * Temas estacionales. Desde el panel solo se cambian sus fechas y su foto de portada.
 * Solo las festividades se activan solas; las estaciones son para el modo manual.
 * La prioridad es fija: si dos festividades se enciman, gana la más puntual.
 */
export const themes = [
  { key: 'new-year', name: 'Año Nuevo', startMonth: 12, startDay: 27, endMonth: 1, endDay: 6, autoEnabled: true, priority: 90, decoration: 'fireworks', navbarBadge: null, tokenOverrides: { '--color-accent': '#E4C77A', '--color-primary': '#6E5A2E' } },
  { key: 'mothers-day', name: 'Día de la Madre', startMonth: 5, startDay: 1, endMonth: 5, endDay: 10, autoEnabled: true, priority: 85, decoration: 'mothers_day', navbarBadge: null, tokenOverrides: { '--color-accent': '#E8AFC0', '--color-primary': '#A2566B' } },
  { key: 'christmas', name: 'Navidad', startMonth: 12, startDay: 1, endMonth: 12, endDay: 31, autoEnabled: true, priority: 65, decoration: 'christmas', navbarBadge: null, tokenOverrides: { '--color-accent': '#C8A45A', '--color-primary': '#7A2E2E' } },
  { key: 'valentines', name: 'San Valentín', startMonth: 2, startDay: 1, endMonth: 2, endDay: 14, autoEnabled: true, priority: 80, decoration: 'hearts', navbarBadge: null, tokenOverrides: { '--color-accent': '#E3A3AE', '--color-primary': '#A04E5E' } },
  { key: 'dia-de-muertos', name: 'Día de Muertos', startMonth: 10, startDay: 25, endMonth: 11, endDay: 2, autoEnabled: true, priority: 75, decoration: 'dia_de_muertos', navbarBadge: null, tokenOverrides: { '--color-accent': '#E8912D', '--color-primary': '#8A4B1F' } },
  { key: 'independence', name: 'Día de la Independencia', startMonth: 9, startDay: 1, endMonth: 9, endDay: 16, autoEnabled: true, priority: 70, decoration: 'none', navbarBadge: null, tokenOverrides: { '--color-accent': '#C9A24D', '--color-primary': '#2F6B4A' } },
  { key: 'san-marcos', name: 'Feria de San Marcos', startMonth: 4, startDay: 15, endMonth: 5, endDay: 10, autoEnabled: true, priority: 60, decoration: 'fireworks_feria', navbarBadge: null, tokenOverrides: { '--color-accent': '#E0A63C', '--color-primary': '#9A5B2E' } },
  { key: 'spring', name: 'Primavera', startMonth: 3, startDay: 20, endMonth: 6, endDay: 20, autoEnabled: false, priority: 10, decoration: 'petals', navbarBadge: null, tokenOverrides: { '--color-accent': '#E6B8B0' } },
  { key: 'summer', name: 'Verano', startMonth: 6, startDay: 21, endMonth: 9, endDay: 21, autoEnabled: false, priority: 10, decoration: 'sunshine', navbarBadge: null, tokenOverrides: { '--color-accent': '#EBC36B' } },
  { key: 'autumn', name: 'Otoño', startMonth: 9, startDay: 22, endMonth: 12, endDay: 20, autoEnabled: false, priority: 10, decoration: 'leaves', navbarBadge: null, tokenOverrides: { '--color-accent': '#C9935A' } },
  { key: 'winter', name: 'Invierno', startMonth: 12, startDay: 21, endMonth: 3, endDay: 19, autoEnabled: false, priority: 10, decoration: 'snow', navbarBadge: null, tokenOverrides: { '--color-accent': '#BFD0DC' } },
];

/** Contrato, términos y aviso de privacidad: viven en su propio archivo. */
export { legalDocuments } from './legal-documents.js';
