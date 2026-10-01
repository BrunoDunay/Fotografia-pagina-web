import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { getSection } from './settings.service.js';

/**
 * Devuelve SOLO las fechas ocupadas en el rango (sin ningún dato privado).
 * Un día está ocupado si tiene un bloqueo manual o si los eventos no cancelados
 * que bloquean disponibilidad alcanzan el máximo de eventos por día.
 */
export async function getBusyDates(from, to) {
  const availability = await getSection('availability');
  const maxEventsPerDay = availability?.maxEventsPerDay ?? 1;

  const rows = await sequelize.query(
    `
    SELECT to_char(d, 'YYYY-MM-DD') AS date FROM (
      SELECT event_date AS d
        FROM events
       WHERE event_date BETWEEN :from AND :to
         AND status <> 'cancelled'
         AND blocks_availability
       GROUP BY event_date
      HAVING count(*) >= :maxEventsPerDay
      UNION
      SELECT date AS d FROM availability_blocks WHERE date BETWEEN :from AND :to
    ) busy
    ORDER BY d
    `,
    { replacements: { from, to, maxEventsPerDay }, type: QueryTypes.SELECT },
  );

  return rows.map((r) => r.date);
}
