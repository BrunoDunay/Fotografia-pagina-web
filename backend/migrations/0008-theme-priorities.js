/**
 * - Solo las festividades se activan solas por fecha; las estaciones quedan para el modo manual.
 * - Prioridad fija entre festividades (no se edita desde el panel): si dos fechas se enciman,
 *   gana la más puntual. Ej.: Año Nuevo sustituye a Navidad a partir del 27 de diciembre.
 * - Navidad ya no muestra el copo junto al logotipo: su adorno es la guirnalda bajo el logo.
 */

const PRIORITY = {
  'new-year': 90,
  'mothers-day': 85,
  valentines: 80,
  'dia-de-muertos': 75,
  independence: 70,
  christmas: 65,
  'san-marcos': 60,
};
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export async function up({ context: sequelize }) {
  for (const [key, priority] of Object.entries(PRIORITY)) {
    await sequelize.query(`UPDATE seasonal_themes SET priority = :priority, auto_enabled = true WHERE key = :key`, { replacements: { key, priority } });
  }
  await sequelize.query(`UPDATE seasonal_themes SET priority = 10, auto_enabled = false WHERE key IN (:keys)`, { replacements: { keys: SEASONS } });
  await sequelize.query(`UPDATE seasonal_themes SET navbar_badge = NULL WHERE key = 'christmas'`);
}

export async function down({ context: sequelize }) {
  await sequelize.query(`UPDATE seasonal_themes SET auto_enabled = true WHERE key IN (:keys)`, { replacements: { keys: SEASONS } });
  await sequelize.query(`UPDATE seasonal_themes SET navbar_badge = '❄' WHERE key = 'christmas'`);
}
