/**
 * Catálogo de diseños del ticket digital y sus variaciones de color.
 * Las combinaciones válidas (diseño + color) deben coincidir con backend/src/config/ticket-designs.js.
 */
export type TicketDesign =
  | 'envelope'
  | 'editorial'
  | 'ticket'
  | 'boarding'
  | 'beach'
  | 'bloom'
  | 'calendar'
  | 'moon'
  | 'botanic'
  | 'grad';

/** Colores de una variación. Cada diseño decide cómo usa cada uno. */
export interface TicketPalette {
  key: string;
  label: string;
  /** Color principal (bloques, fondos de color). */
  main: string;
  /** Versión oscura del principal (degradados, fondo de la página del ticket). */
  dark: string;
  /** Papel / fondo claro. */
  paper: string;
  /** Texto sobre el papel. */
  ink: string;
  /** Acento (detalles, dorados, sol, corazón). */
  accent: string;
}

export interface TicketDesignDef {
  key: TicketDesign;
  label: string;
  /** Para qué tipo de evento está pensado (se muestra en el panel). */
  hint: string;
  /** Slugs de servicios para los que se sugiere este diseño. */
  services: string[];
  palettes: TicketPalette[];
}

const p = (key: string, label: string, main: string, dark: string, paper: string, ink: string, accent: string): TicketPalette => ({
  key,
  label,
  main,
  dark,
  paper,
  ink,
  accent,
});

export const TICKET_DESIGNS: TicketDesignDef[] = [
  {
    key: 'envelope',
    label: 'Sobre clásico',
    hint: 'Bodas',
    services: ['weddings'],
    palettes: [
      p('mocha', 'Moca', '#9a7863', '#6f5242', '#f6f2ec', '#2a2421', '#d9b994'),
      p('navy', 'Azul marino', '#4a5672', '#323b52', '#f6f2ec', '#2a2421', '#d9b994'),
      p('burgundy', 'Vino', '#5c1f2b', '#44151f', '#f6f2ec', '#2a2421', '#d9b994'),
      p('olive', 'Verde olivo', '#5a6148', '#3f4532', '#f6f2ec', '#2a2421', '#d9b994'),
    ],
  },
  {
    key: 'editorial',
    label: 'Editorial',
    hint: 'Bodas, graduaciones y eventos formales',
    services: ['social-events', 'proposals'],
    palettes: [
      p('burgundy', 'Vino', '#5a0f1c', '#3a0911', '#f4ece4', '#f4ece4', '#e6c9a8'),
      p('black', 'Negro', '#1c1a19', '#0d0c0c', '#f2ede6', '#f2ede6', '#d9c7a8'),
      p('olive', 'Verde olivo', '#3b4230', '#252a1e', '#f1eee2', '#f1eee2', '#d8cfa9'),
      p('navy', 'Azul noche', '#1f2a44', '#131a2d', '#eef0f4', '#eef0f4', '#cfd6e6'),
    ],
  },
  {
    key: 'ticket',
    label: 'Boleto',
    hint: 'Graduaciones, save the date y cualquier evento',
    services: ['concerts', 'shows', 'nightclubs', 'bars', 'restaurants'],
    palettes: [
      p('steel', 'Azul acero', '#34455c', '#243142', '#f1ebe6', '#2b3a4f', '#7d93ad'),
      p('ink', 'Tinta', '#1b1a19', '#0e0d0d', '#f3eee7', '#1b1a19', '#8a8078'),
      p('burgundy', 'Vino', '#5a1622', '#3c0e16', '#f6efe9', '#5a1622', '#b98a8f'),
      p('forest', 'Verde bosque', '#2f4034', '#1f2b23', '#f2efe6', '#2f4034', '#8fa391'),
    ],
  },
  {
    key: 'boarding',
    label: 'Pase de abordar',
    hint: 'Bodas destino y viajes',
    services: [],
    palettes: [
      p('navy', 'Azul marino', '#101d33', '#0a1322', '#f1ece3', '#101d33', '#b99b6b'),
      p('sand', 'Arena', '#a8937a', '#86725a', '#fbf8f2', '#4a3f33', '#a8742c'),
      p('terracotta', 'Terracota', '#a4543d', '#7f3d2b', '#faf3ec', '#7a3526', '#c98a6b'),
    ],
  },
  {
    key: 'beach',
    label: 'Playa',
    hint: 'Bodas en la playa',
    services: ['beach-weddings'],
    palettes: [
      // main = cielo arriba · dark = horizonte · paper = arena · accent = sol
      p('sunset', 'Atardecer', '#f3b06f', '#d9695a', '#f6e3c8', '#5b2f22', '#fff1c9'),
      p('day', 'De día', '#bfe6ef', '#58b7c6', '#f7ecd6', '#17505c', '#fffbe6'),
      p('dusk', 'Anochecer', '#3a3470', '#c4688a', '#33295a', '#fdf3ee', '#ffd9b8'),
    ],
  },
  {
    key: 'bloom',
    label: 'Floral',
    hint: 'XV años y bodas románticas',
    services: ['quinceanos'],
    palettes: [
      p('rose', 'Rosa', '#e9b4c0', '#c97f93', '#fdf3f4', '#6d3a47', '#f6d5db'),
      p('lilac', 'Lila', '#c9b6e4', '#9a80c4', '#f7f3fc', '#4c3a6b', '#e3d8f3'),
      p('champagne', 'Champagne', '#e2cfae', '#b99b6b', '#fbf7ef', '#5c4a2c', '#f0e4cb'),
      p('sky', 'Celeste', '#b9d4ee', '#7ea6cf', '#f3f8fd', '#2f4c6b', '#d7e6f5'),
    ],
  },
  {
    key: 'calendar',
    label: 'Calendario',
    hint: 'San Valentín, save the date y sesiones de pareja',
    services: ['save-the-date'],
    palettes: [
      p('red', 'Rojo', '#c8102e', '#8f0b20', '#f7f4ef', '#1f1c1a', '#c8102e'),
      p('black', 'Negro', '#1f1c1a', '#0f0e0d', '#f4f1ec', '#1f1c1a', '#1f1c1a'),
      p('rose', 'Rosa', '#d9778d', '#b85a70', '#fbf5f4', '#3a2a2e', '#d9778d'),
      p('mocha', 'Moca', '#8c6b55', '#6f5242', '#f7f3ee', '#2a2421', '#8c6b55'),
    ],
  },
  {
    key: 'moon',
    label: 'Luna y nubes',
    hint: 'Baby shower',
    services: ['baby-showers'],
    palettes: [
      p('sage', 'Salvia', '#a5ad8c', '#7f8868', '#f5efe3', '#4f5640', '#e3d3b8'),
      p('sand', 'Arena', '#d8c2a3', '#b99d79', '#faf4ea', '#6b563c', '#efe0c8'),
      p('sky', 'Azul bebé', '#a9c4dc', '#7d9dba', '#f4f8fb', '#3c5670', '#dbe7f2'),
      p('rose', 'Rosa bebé', '#e6bfc4', '#c9959c', '#fcf4f4', '#7a4a52', '#f3dcdf'),
    ],
  },
  {
    key: 'botanic',
    label: 'Botánico',
    hint: 'Sesiones individuales, al aire libre y en estudio',
    services: ['outdoor-sessions', 'individual-sessions', 'studio'],
    palettes: [
      p('sand', 'Arena', '#b9a888', '#8f7f62', '#e9dfcd', '#4a4034', '#cfc1a4'),
      p('sage', 'Salvia', '#a3ad8f', '#788466', '#e3e6d8', '#3f4a36', '#c3cbb2'),
      p('stone', 'Piedra', '#a9a59d', '#7c7870', '#e6e4e0', '#3b3936', '#c9c5bd'),
    ],
  },
  {
    key: 'grad',
    label: 'Graduación',
    hint: 'Graduaciones',
    services: ['graduations'],
    palettes: [
      p('navy', 'Azul marino', '#141d3a', '#0b1124', '#f4efe4', '#f4efe4', '#d4b26a'),
      p('black', 'Negro', '#151413', '#090909', '#f4efe4', '#f4efe4', '#d4b26a'),
      p('burgundy', 'Vino', '#4a0f1b', '#2e0810', '#f6ede4', '#f6ede4', '#dcbb78'),
      p('forest', 'Verde', '#1f3328', '#122019', '#f1efe4', '#f1efe4', '#d4b26a'),
    ],
  },
];

export const DEFAULT_TICKET_DESIGN: TicketDesign = 'envelope';

export function ticketDesign(key: string | null | undefined): TicketDesignDef {
  return TICKET_DESIGNS.find((d) => d.key === key) ?? TICKET_DESIGNS[0];
}

/** Variación de color del diseño; si no existe en ese diseño, la primera. */
export function ticketPalette(design: string | null | undefined, palette: string | null | undefined): TicketPalette {
  const def = ticketDesign(design);
  return def.palettes.find((x) => x.key === palette) ?? def.palettes[0];
}

/** Diseño sugerido según el tipo de evento (slug del servicio). */
export function suggestedTicketDesign(serviceSlug: string | null | undefined): TicketDesign {
  return TICKET_DESIGNS.find((d) => serviceSlug && d.services.includes(serviceSlug))?.key ?? DEFAULT_TICKET_DESIGN;
}
