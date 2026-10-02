/**
 * Decoraciones con más personalidad y temas de temporada alta:
 * - nuevas decoraciones: navideña, corazones, destellos de verano y Día de Muertos;
 * - Navidad y Verano usan sus decoraciones nuevas (solo si no se habían cambiado en el panel);
 * - temas nuevos: San Valentín (1–14 feb) y Día de Muertos (25 oct – 2 nov).
 *
 * `ALTER TYPE … ADD VALUE` no puede usarse en la misma transacción que lo agrega,
 * por eso cada sentencia va por separado (autocommit).
 */

const NEW_DECORATIONS = ['christmas', 'hearts', 'sunshine', 'dia_de_muertos'];

export async function up({ context: sequelize }) {
  for (const value of NEW_DECORATIONS) {
    await sequelize.query(`ALTER TYPE theme_decoration ADD VALUE IF NOT EXISTS '${value}'`);
  }

  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'christmas' WHERE key = 'christmas' AND decoration = 'snow'`);
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'sunshine' WHERE key = 'summer' AND decoration = 'none'`);

  await sequelize.query(`
    INSERT INTO seasonal_themes
      (key, name, start_month, start_day, end_month, end_day, auto_enabled, priority, decoration, token_overrides, navbar_badge)
    VALUES
      ('valentines', 'San Valentín', 2, 1, 2, 14, true, 50, 'hearts', '{}'::jsonb, NULL),
      ('dia-de-muertos', 'Día de Muertos', 10, 25, 11, 2, true, 50, 'dia_de_muertos', '{"--color-accent": "#E8912D"}'::jsonb, NULL)
    ON CONFLICT (key) DO NOTHING
  `);
}

export async function down({ context: sequelize }) {
  // Los valores de un ENUM no se pueden quitar en PostgreSQL; se revierten los datos.
  await sequelize.query(`DELETE FROM seasonal_themes WHERE key IN ('valentines', 'dia-de-muertos')`);
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'snow' WHERE decoration = 'christmas'`);
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'none' WHERE decoration IN ('sunshine', 'hearts', 'dia_de_muertos')`);
}
