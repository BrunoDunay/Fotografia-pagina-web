/**
 * Catálogo de diseños del ticket digital y sus variaciones de color.
 * Las combinaciones válidas (diseño + color) deben coincidir con backend/src/config/ticket-designs.js.
 */
export type TicketDesign =
  | 'envelope'
  | 'editorial'
  | 'mono'
  | 'pearls'
  | 'lace'
  | 'garden'
  | 'palms'
  | 'passport'
  | 'beach'
  | 'boarding'
  | 'roses'
  | 'clouds'
  | 'grad'
  | 'glass'
  | 'ticket'
  | 'moon'
  | 'cradle'
  | 'botanic'
  | 'leaves'
  | 'calendar';

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
  /** Acento (detalles, dorados, sol, flores). */
  accent: string;
}

export type TicketGroup = 'Bodas' | 'Playa y destino' | 'XV años' | 'Graduaciones' | 'Baby shower' | 'Sesiones y otros';

export interface TicketDesignDef {
  key: TicketDesign;
  label: string;
  group: TicketGroup;
  /** Usa la foto del ticket (la propia o la del tipo de evento). */
  photo?: boolean;
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
  // ---------------- Bodas ----------------
  {
    key: 'envelope',
    label: 'Sobre clásico',
    group: 'Bodas',
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
    group: 'Bodas',
    services: ['social-events', 'proposals'],
    palettes: [
      p('burgundy', 'Vino', '#5a0f1c', '#3a0911', '#f4ece4', '#f4ece4', '#e6c9a8'),
      p('black', 'Negro', '#1c1a19', '#0d0c0c', '#f2ede6', '#f2ede6', '#d9c7a8'),
      p('olive', 'Verde olivo', '#3b4230', '#252a1e', '#f1eee2', '#f1eee2', '#d8cfa9'),
      p('navy', 'Azul noche', '#1f2a44', '#131a2d', '#eef0f4', '#eef0f4', '#cfd6e6'),
    ],
  },
  {
    key: 'mono',
    label: 'Blanco y negro',
    group: 'Bodas',
    photo: true,
    services: [],
    palettes: [
      // main = barra inferior · dark = velo sobre la foto
      p('black', 'Negro', '#3a3938', '#141312', '#f5f1ea', '#1b1a19', '#ffffff'),
      p('espresso', 'Café', '#4a3b31', '#231913', '#f6efe6', '#2a2019', '#fff6ea'),
      p('navy', 'Azul noche', '#2c3650', '#10182a', '#f1f2f5', '#141c2e', '#ffffff'),
    ],
  },
  {
    key: 'pearls',
    label: 'Perlas',
    group: 'Bodas',
    photo: true,
    services: [],
    palettes: [
      // main = paneles · accent = brillo de las perlas
      p('taupe', 'Topo', '#a8998a', '#7d6f62', '#f1ece4', '#3a332d', '#fbf7f0'),
      p('silver', 'Plata', '#a3a5a8', '#74777b', '#f2f2f1', '#2f3133', '#ffffff'),
      p('blush', 'Rosa empolvado', '#c9a8a0', '#a07f77', '#f7efec', '#4a3632', '#fff6f3'),
    ],
  },
  {
    key: 'lace',
    label: 'Encaje',
    group: 'Bodas',
    services: [],
    palettes: [
      p('forest', 'Verde bosque', '#2f3a2c', '#1f271d', '#f3efe4', '#2f3a2c', '#f3efe4'),
      p('black', 'Negro', '#1d1c1b', '#0f0e0e', '#f3efe6', '#1d1c1b', '#f3efe6'),
      p('burgundy', 'Vino', '#4a1420', '#300b14', '#f6eee8', '#4a1420', '#f6eee8'),
      p('navy', 'Azul marino', '#1c2740', '#111a2e', '#eff1f5', '#1c2740', '#eff1f5'),
    ],
  },
  {
    key: 'garden',
    label: 'Jardín',
    group: 'Bodas',
    photo: true,
    services: [],
    palettes: [
      p('olive', 'Verde olivo', '#2c3320', '#1c2114', '#ffffff', '#ffffff', '#e9efd8'),
      p('black', 'Negro', '#161616', '#0a0a0a', '#ffffff', '#ffffff', '#ececec'),
      p('burgundy', 'Vino', '#431019', '#2a080f', '#ffffff', '#ffffff', '#f3dfe1'),
      p('navy', 'Azul marino', '#18223a', '#0e1526', '#ffffff', '#ffffff', '#dfe6f3'),
    ],
  },

  // ---------------- Playa y destino ----------------
  {
    key: 'palms',
    label: 'Palmeras',
    group: 'Playa y destino',
    services: ['beach-weddings'],
    palettes: [
      // main = texto · dark = hojas · accent = tronco
      p('olive', 'Verde olivo', '#7c7a45', '#5f6e3c', '#f7f4ee', '#7c7a45', '#8a5a3c'),
      p('terracotta', 'Terracota', '#a8623f', '#6f7c46', '#faf3ea', '#a8623f', '#7a5136'),
      p('teal', 'Verde mar', '#2f6f73', '#3f7f6a', '#f3f7f5', '#2f6f73', '#8a6a4c'),
    ],
  },
  {
    key: 'passport',
    label: 'Pasaporte',
    group: 'Playa y destino',
    services: [],
    palettes: [
      // main = brújula y avión · accent = flores
      p('terracotta', 'Terracota', '#9c4f3d', '#7a3526', '#ffffff', '#2a2523', '#d9715c'),
      p('navy', 'Azul marino', '#2c3e63', '#1b2947', '#ffffff', '#20283a', '#8ba3d0'),
      p('olive', 'Verde olivo', '#6b7045', '#4d5230', '#ffffff', '#2c2d22', '#d2a55c'),
    ],
  },
  {
    key: 'beach',
    label: 'Playa al atardecer',
    group: 'Playa y destino',
    services: [],
    palettes: [
      // main = cielo arriba · dark = horizonte · paper = arena · accent = sol
      p('sunset', 'Atardecer', '#f3b06f', '#d9695a', '#f6e3c8', '#5b2f22', '#fff1c9'),
      p('day', 'De día', '#bfe6ef', '#58b7c6', '#f7ecd6', '#17505c', '#fffbe6'),
      p('dusk', 'Anochecer', '#3a3470', '#c4688a', '#33295a', '#fdf3ee', '#ffd9b8'),
    ],
  },
  {
    key: 'boarding',
    label: 'Pase de abordar',
    group: 'Playa y destino',
    services: [],
    palettes: [
      p('navy', 'Azul marino', '#101d33', '#0a1322', '#f1ece3', '#101d33', '#b99b6b'),
      p('sand', 'Arena', '#a8937a', '#86725a', '#fbf8f2', '#4a3f33', '#a8742c'),
      p('terracotta', 'Terracota', '#a4543d', '#7f3d2b', '#faf3ec', '#7a3526', '#c98a6b'),
    ],
  },

  // ---------------- XV años ----------------
  {
    key: 'roses',
    label: 'Flores',
    group: 'XV años',
    services: ['quinceanos'],
    palettes: [
      // main = pétalos · dark = sombra de pétalos · accent = textos pequeños
      p('blush', 'Rosa', '#e9cdc8', '#c79c97', '#fbf4f0', '#3a2c2b', '#a9825f'),
      p('champagne', 'Champagne', '#ead9bb', '#c2a474', '#fbf7ee', '#3b3225', '#9a7b4f'),
      p('lilac', 'Lila', '#ddd0ea', '#ab94c6', '#f8f4fb', '#35293f', '#8a6aa6'),
    ],
  },
  {
    key: 'clouds',
    label: 'Nubes',
    group: 'XV años',
    services: [],
    palettes: [
      // main = cielo · dark = cielo profundo · ink = texto sobre blanco · accent = nubes
      p('pink', 'Rosa', '#e9a9c4', '#c77fa3', '#ffffff', '#b0567f', '#f8dbe7'),
      p('lilac', 'Lila', '#c7b3e6', '#9c84c9', '#ffffff', '#6f58a0', '#e8def7'),
      p('sky', 'Celeste', '#a9cbee', '#7aa5d6', '#ffffff', '#3f6ea3', '#dceaf9'),
      p('peach', 'Durazno', '#f5b9a0', '#e08f72', '#ffffff', '#b3603f', '#fde1d6'),
    ],
  },

  // ---------------- Graduaciones ----------------
  {
    key: 'grad',
    label: 'Graduación',
    group: 'Graduaciones',
    services: ['graduations'],
    palettes: [
      p('navy', 'Azul marino', '#141d3a', '#0b1124', '#f4efe4', '#f4efe4', '#d4b26a'),
      p('black', 'Negro', '#151413', '#090909', '#f4efe4', '#f4efe4', '#d4b26a'),
      p('burgundy', 'Vino', '#4a0f1b', '#2e0810', '#f6ede4', '#f6ede4', '#dcbb78'),
      p('forest', 'Verde', '#1f3328', '#122019', '#f1efe4', '#f1efe4', '#d4b26a'),
    ],
  },
  {
    key: 'glass',
    label: 'Brindis',
    group: 'Graduaciones',
    services: [],
    palettes: [
      // main = tarjeta · paper/accent = color de la copa y la pestaña
      p('slate', 'Azul pizarra', '#3a4658', '#28313f', '#b9d6ea', '#28313f', '#b9d6ea'),
      p('black', 'Negro y dorado', '#1f1f20', '#101011', '#e6cf9c', '#1f1f20', '#e6cf9c'),
      p('burgundy', 'Vino', '#4a1722', '#2f0d15', '#f0c9cf', '#3a1019', '#f0c9cf'),
      p('forest', 'Verde', '#22362b', '#15241b', '#bfe3cf', '#17281f', '#bfe3cf'),
    ],
  },
  {
    key: 'ticket',
    label: 'Boleto',
    group: 'Graduaciones',
    services: ['concerts', 'shows', 'nightclubs', 'bars', 'restaurants'],
    palettes: [
      p('steel', 'Azul acero', '#34455c', '#243142', '#f1ebe6', '#2b3a4f', '#7d93ad'),
      p('ink', 'Tinta', '#1b1a19', '#0e0d0d', '#f3eee7', '#1b1a19', '#8a8078'),
      p('burgundy', 'Vino', '#5a1622', '#3c0e16', '#f6efe9', '#5a1622', '#b98a8f'),
      p('forest', 'Verde bosque', '#2f4034', '#1f2b23', '#f2efe6', '#2f4034', '#8fa391'),
    ],
  },

  // ---------------- Baby shower ----------------
  {
    key: 'moon',
    label: 'Luna y nubes',
    group: 'Baby shower',
    services: ['baby-showers'],
    palettes: [
      p('sage', 'Salvia', '#a5ad8c', '#7f8868', '#f5efe3', '#4f5640', '#e3d3b8'),
      p('sand', 'Arena', '#d8c2a3', '#b99d79', '#faf4ea', '#6b563c', '#efe0c8'),
      p('sky', 'Azul bebé', '#a9c4dc', '#7d9dba', '#f4f8fb', '#3c5670', '#dbe7f2'),
      p('rose', 'Rosa bebé', '#e6bfc4', '#c9959c', '#fcf4f4', '#7a4a52', '#f3dcdf'),
    ],
  },
  {
    key: 'cradle',
    label: 'Cuna',
    group: 'Baby shower',
    services: [],
    palettes: [
      // main = fondo de tela · dark = café de la ilustración · paper = crema · accent = globo y madera
      p('greige', 'Lino', '#d9d0c7', '#7a5540', '#f3ede4', '#4a3a34', '#c9a27c'),
      p('sage', 'Salvia', '#d5d8cb', '#6f7a5c', '#f1f1e8', '#3f4636', '#b9a78a'),
      p('blue', 'Azul bebé', '#cfd8df', '#5f7890', '#eef2f5', '#34444f', '#b9a58c'),
      p('blush', 'Rosa bebé', '#e6d3ce', '#a8716a', '#f7ece9', '#573b38', '#d0a78f'),
    ],
  },

  // ---------------- Sesiones y otros ----------------
  {
    key: 'botanic',
    label: 'Botánico',
    group: 'Sesiones y otros',
    services: ['outdoor-sessions', 'individual-sessions', 'studio'],
    palettes: [
      p('sand', 'Arena', '#b9a888', '#8f7f62', '#e9dfcd', '#4a4034', '#cfc1a4'),
      p('sage', 'Salvia', '#a3ad8f', '#788466', '#e3e6d8', '#3f4a36', '#c3cbb2'),
      p('stone', 'Piedra', '#a9a59d', '#7c7870', '#e6e4e0', '#3b3936', '#c9c5bd'),
    ],
  },
  {
    key: 'leaves',
    label: 'Hojas',
    group: 'Sesiones y otros',
    services: [],
    palettes: [
      // main = franja inferior · dark = hojas · accent = aros
      p('sage', 'Salvia', '#a9b5a0', '#6f8173', '#fbfaf7', '#1f1e1c', '#e6d8c4'),
      p('blue', 'Azul grisáceo', '#a5b6c4', '#6a8196', '#fafbfc', '#1e2126', '#e2dccf'),
      p('terracotta', 'Terracota', '#cfa593', '#a8705c', '#fcf9f6', '#2a1f1b', '#ecdccb'),
      p('sand', 'Arena', '#c9b99b', '#8f8566', '#fbfaf6', '#27231b', '#e9dfcb'),
    ],
  },
  {
    key: 'calendar',
    label: 'Calendario',
    group: 'Sesiones y otros',
    services: ['save-the-date'],
    palettes: [
      p('red', 'Rojo', '#c8102e', '#8f0b20', '#f7f4ef', '#1f1c1a', '#c8102e'),
      p('black', 'Negro', '#1f1c1a', '#0f0e0d', '#f4f1ec', '#1f1c1a', '#1f1c1a'),
      p('rose', 'Rosa', '#d9778d', '#b85a70', '#fbf5f4', '#3a2a2e', '#d9778d'),
      p('mocha', 'Moca', '#8c6b55', '#6f5242', '#f7f3ee', '#2a2421', '#8c6b55'),
    ],
  },
];

export const TICKET_GROUPS: TicketGroup[] = ['Bodas', 'Playa y destino', 'XV años', 'Graduaciones', 'Baby shower', 'Sesiones y otros'];

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
