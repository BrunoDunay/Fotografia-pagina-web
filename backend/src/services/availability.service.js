import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Devuelve SOLO las fechas ocupadas en el rango (sin ningún dato privado).
 * Un día está ocupado únicamente si el fotógrafo lo decidió: un bloqueo manual
 * o un evento no cancelado marcado como "ocupa la fecha".
 */
export async function getBusyDates(from, to) {
  const rows = await sequelize.query(
    `
    SELECT to_char(d, 'YYYY-MM-DD') AS date FROM (
      SELECT event_date AS d
        FROM events
       WHERE event_date BETWEEN :from AND :to
         AND status <> 'cancelled'
         AND blocks_availability
      UNION
      SELECT date AS d FROM availability_blocks WHERE date BETWEEN :from AND :to
    ) busy
    ORDER BY d
    `,
    { replacements: { from, to }, type: QueryTypes.SELECT },
  );

  return rows.map((r) => r.date);
}
