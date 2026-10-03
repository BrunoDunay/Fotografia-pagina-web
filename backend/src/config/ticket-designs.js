/**
 * Diseños del ticket digital y sus variaciones de color.
 * La apariencia vive en el frontend (frontend/src/app/core/ticket-designs.ts);
 * aquí solo se valida que la combinación diseño + color exista.
 */
export const TICKET_DESIGNS = {
  // Bodas
  envelope: ['mocha', 'navy', 'burgundy', 'olive'],
  editorial: ['burgundy', 'black', 'olive', 'navy'],
  mono: ['black', 'espresso', 'navy'],
  pearls: ['taupe', 'silver', 'blush'],
  lace: ['forest', 'black', 'burgundy', 'navy'],
  garden: ['olive', 'black', 'burgundy', 'navy'],
  // Playa y destino
  palms: ['olive', 'terracotta', 'teal'],
  passport: ['terracotta', 'navy', 'olive'],
  boarding: ['navy', 'sand', 'terracotta'],
  // XV años
  roses: ['blush', 'champagne', 'lilac'],
  clouds: ['pink', 'lilac', 'sky', 'peach'],
  // Graduaciones
  grad: ['navy', 'black', 'burgundy', 'forest'],
  glass: ['slate', 'black', 'burgundy', 'forest'],
  ticket: ['steel', 'ink', 'burgundy', 'forest'],
  // Baby shower
  moon: ['sage', 'sand', 'sky', 'rose'],
  cradle: ['greige', 'sage', 'blue', 'blush'],
  // Sesiones y otros
  botanic: ['sand', 'sage', 'stone'],
  leaves: ['sage', 'blue', 'terracotta', 'sand'],
  calendar: ['red', 'black', 'rose', 'mocha'],
};

export const TICKET_DESIGN_KEYS = Object.keys(TICKET_DESIGNS);
export const DEFAULT_TICKET_DESIGN = 'envelope';

/** Devuelve una combinación válida: si el color no pertenece al diseño, usa el primero del diseño. */
export function normalizeTicketStyle(design, palette) {
  const safeDesign = TICKET_DESIGNS[design] ? design : DEFAULT_TICKET_DESIGN;
  const palettes = TICKET_DESIGNS[safeDesign];
  return { ticketDesign: safeDesign, ticketPalette: palettes.includes(palette) ? palette : palettes[0] };
}
