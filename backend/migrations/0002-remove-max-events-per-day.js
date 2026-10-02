/**
 * La disponibilidad ya no depende de un máximo de eventos por día:
 * un día solo se ocupa por decisión del fotógrafo (evento que "ocupa la fecha" o bloqueo manual).
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`UPDATE site_settings SET value = value - 'maxEventsPerDay' WHERE key = 'availability';`);
}

export async function down({ context: sequelize }) {
  await sequelize.query(
    `UPDATE site_settings SET value = value || '{"maxEventsPerDay": 1}'::jsonb WHERE key = 'availability';`,
  );
}
