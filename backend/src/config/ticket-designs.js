/**
 * Diseños del ticket digital y sus variaciones de color.
 * La apariencia vive en el frontend (frontend/src/app/core/ticket-designs.ts);
 * aquí solo se valida que la combinación diseño + color exista.
 */
export const TICKET_DESIGNS = {
  envelope: ['mocha', 'navy', 'burgundy', 'olive'],
  editorial: ['burgundy', 'black', 'olive', 'navy'],
  ticket: ['steel', 'ink', 'burgundy', 'forest'],
  boarding: ['navy', 'sand', 'terracotta'],
  beach: ['sunset', 'day', 'dusk'],
  bloom: ['rose', 'lilac', 'champagne', 'sky'],
  calendar: ['red', 'black', 'rose', 'mocha'],
  moon: ['sage', 'sand', 'sky', 'rose'],
  botanic: ['sand', 'sage', 'stone'],
  grad: ['navy', 'black', 'burgundy', 'forest'],
};

export const TICKET_DESIGN_KEYS = Object.keys(TICKET_DESIGNS);
export const DEFAULT_TICKET_DESIGN = 'envelope';

/** Devuelve una combinación válida: si el color no pertenece al diseño, usa el primero del diseño. */
export function normalizeTicketStyle(design, palette) {
  const safeDesign = TICKET_DESIGNS[design] ? design : DEFAULT_TICKET_DESIGN;
  const palettes = TICKET_DESIGNS[safeDesign];
  return { ticketDesign: safeDesign, ticketPalette: palettes.includes(palette) ? palette : palettes[0] };
}
