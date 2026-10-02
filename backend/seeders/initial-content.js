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
    // PROVISIONAL: falta la URL exacta de la página de Facebook.
    facebook: { name: 'Armando Ovalle Wedding Studio', url: null },
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

/** Temas estacionales sugeridos (editables). Las festividades tienen más prioridad que las estaciones. */
export const themes = [
  { key: 'christmas', name: 'Navidad', startMonth: 12, startDay: 1, endMonth: 12, endDay: 31, autoEnabled: true, priority: 50, decoration: 'snow', navbarBadge: '❄' },
  { key: 'independence', name: 'Día de la Independencia', startMonth: 9, startDay: 1, endMonth: 9, endDay: 16, autoEnabled: true, priority: 50, decoration: 'papel_picado', navbarBadge: null },
  { key: 'san-marcos', name: 'Feria de San Marcos', startMonth: 4, startDay: 15, endMonth: 5, endDay: 10, autoEnabled: true, priority: 50, decoration: 'confetti', navbarBadge: null },
  { key: 'spring', name: 'Primavera', startMonth: 3, startDay: 20, endMonth: 6, endDay: 20, autoEnabled: false, priority: 10, decoration: 'petals', navbarBadge: null },
  { key: 'summer', name: 'Verano', startMonth: 6, startDay: 21, endMonth: 9, endDay: 21, autoEnabled: false, priority: 10, decoration: 'none', navbarBadge: null },
  { key: 'autumn', name: 'Otoño', startMonth: 9, startDay: 22, endMonth: 12, endDay: 20, autoEnabled: false, priority: 10, decoration: 'leaves', navbarBadge: null, tokenOverrides: { '--color-accent': '#C9935A' } },
  { key: 'winter', name: 'Invierno', startMonth: 12, startDay: 21, endMonth: 3, endDay: 19, autoEnabled: false, priority: 10, decoration: 'snow', navbarBadge: null },
];

const PENDING = '[Texto provisional — pendiente de sustituir por la versión revisada del contrato real.]';

/** PROVISIONAL: estructura de los documentos legales. No constituye asesoría legal. */
export const legalDocuments = [
  {
    type: 'contract',
    title: 'Contrato de prestación de servicios fotográficos',
    version: '0.1',
    intro:
      'Este documento es una versión provisional que muestra la estructura del contrato. El contrato definitivo se firma con cada cliente y prevalece sobre este texto.',
    sections: [
      { number: 1, title: 'Partes', body: `Armando Ovalle Wedding Studio, representado por Jorge Armando Ovalle ("el Fotógrafo"), y la persona que contrata el servicio ("el Cliente"). ${PENDING}` },
      { number: 2, title: 'Objeto del contrato', body: `Cobertura fotográfica del evento indicado por el Cliente, de acuerdo con el paquete contratado. ${PENDING}` },
      { number: 3, title: 'Fecha, horario y lugar', body: `La fecha, el horario y la ubicación del evento se especifican al momento de la contratación. ${PENDING}` },
      { number: 4, title: 'Precio y forma de pago', body: `La fecha se aparta mediante la firma de este contrato y el pago del apartado correspondiente. El saldo restante se cubre en los plazos acordados. ${PENDING}` },
      { number: 5, title: 'Entrega del material', body: 'Las fotografías suelen entregarse aproximadamente entre un mes y medio y tres meses después del evento, dependiendo del tipo y volumen de trabajo. Las fotografías entregadas pasan por un proceso de selección y edición.' },
      { number: 6, title: 'Cambios de fecha y cancelaciones', body: PENDING },
      { number: 7, title: 'Eventos fuera de Aguascalientes', body: 'Los eventos fuera de Aguascalientes o de México pueden requerir una cotización diferente que considere traslados, hospedaje y demás gastos relacionados.' },
      { number: 8, title: 'Derechos de autor y uso de las imágenes', body: PENDING },
      { number: 9, title: 'Responsabilidades', body: PENDING },
      { number: 10, title: 'Aceptación', body: `Ambas partes manifiestan su conformidad con el contenido del presente contrato. ${PENDING}` },
    ],
  },
  {
    type: 'terms',
    title: 'Términos y condiciones',
    version: '0.1',
    intro: 'Versión provisional. Estos términos regulan el uso del sitio web de Armando Ovalle Wedding Studio.',
    sections: [
      { number: 1, title: 'Uso del sitio', body: 'El sitio tiene fines informativos sobre los servicios del estudio. La información de paquetes y precios puede cambiar sin previo aviso.' },
      { number: 2, title: 'Propiedad de las imágenes', body: 'Todas las fotografías publicadas son propiedad de Armando Ovalle Wedding Studio. No está permitido su uso sin autorización.' },
      { number: 3, title: 'Disponibilidad', body: 'El calendario de disponibilidad es informativo. Una fecha solo se considera apartada tras la firma del contrato y el pago del apartado.' },
      { number: 4, title: 'Cambios a estos términos', body: PENDING },
    ],
  },
  {
    type: 'privacy',
    title: 'Aviso de privacidad',
    version: '0.1',
    intro: 'Versión provisional. Debe revisarse para cumplir con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
    sections: [
      { number: 1, title: 'Responsable', body: 'Jorge Armando Ovalle (Armando Ovalle Wedding Studio), con contacto en Ovalle.photo00@gmail.com.' },
      { number: 2, title: 'Datos que se recaban', body: 'Nombre, teléfono, correo electrónico y datos del evento proporcionados por el cliente al contratar.' },
      { number: 3, title: 'Finalidad', body: 'Los datos se usan únicamente para organizar y dar seguimiento a los servicios contratados.' },
      { number: 4, title: 'Derechos ARCO', body: PENDING },
    ],
  },
];
