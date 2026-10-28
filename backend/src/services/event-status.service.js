import { Op } from 'sequelize';
import { Event } from '../models/index.js';
import { todayInStudioTz } from '../utils/dates-mx.js';

const EVERY_HOUR = 60 * 60 * 1000;

/** Eventos confirmados cuya fecha ya pasó (el día del evento cuenta como vigente hasta la medianoche, hora de México). */
export function pastConfirmedWhere(today = todayInStudioTz()) {
  return { status: 'confirmed', eventDate: { [Op.lt]: today } };
}

/** Marca como realizados los eventos confirmados que ya ocurrieron. Devuelve cuántos cambiaron. */
export async function completePastEvents(today = todayInStudioTz()) {
  const [count] = await Event.update({ status: 'completed' }, { where: pastConfirmedWhere(today) });
  return count;
}

/** Al arrancar y luego cada hora: así nadie tiene que cambiar el estado a mano después del evento. */
export function scheduleEventCompletion() {
  const run = () =>
    completePastEvents()
      .then((count) => count && console.log(`Eventos marcados como realizados: ${count}`))
      .catch((error) => console.error('No se pudieron marcar los eventos realizados:', error.message));
  run();
  setInterval(run, EVERY_HOUR).unref();
}
