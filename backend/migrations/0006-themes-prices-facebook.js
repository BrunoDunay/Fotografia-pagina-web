/**
 * - Temas nuevos: Año Nuevo (fuegos artificiales) y Día de la Madre (arreglo floral bajo el logotipo).
 * - Los temas ya no se crean ni se configuran a detalle desde el panel: todos quedan habilitados,
 *   se activan por fecha y siempre cambian los colores de acento.
 * - Todos los precios de paquetes pasan a "no visibles" para el público.
 * - Enlace oficial de la página de Facebook.
 *
 * `ALTER TYPE … ADD VALUE` no puede usarse en la misma transacción que lo agrega,
 * por eso cada sentencia va por separado (autocommit).
 */

const NEW_DECORATIONS = ['fireworks', 'mothers_day'];

/** Colores de acento de cada tema (decorativo y de texto/botones). */
const COLORS = {
  valentines: { '--color-accent': '#E3A3AE', '--color-primary': '#A04E5E' },
  spring: { '--color-accent': '#E6B8B0' },
  'san-marcos': { '--color-accent': '#E0A63C', '--color-primary': '#9A5B2E' },
  'mothers-day': { '--color-accent': '#E8AFC0', '--color-primary': '#A2566B' },
  summer: { '--color-accent': '#EBC36B' },
  independence: { '--color-accent': '#C9A24D', '--color-primary': '#2F6B4A' },
  autumn: { '--color-accent': '#C9935A' },
  'dia-de-muertos': { '--color-accent': '#E8912D', '--color-primary': '#8A4B1F' },
  christmas: { '--color-accent': '#C8A45A', '--color-primary': '#7A2E2E' },
  'new-year': { '--color-accent': '#E4C77A', '--color-primary': '#6E5A2E' },
  winter: { '--color-accent': '#BFD0DC' },
};

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100067234990368';

export async function up({ context: sequelize }) {
  for (const value of NEW_DECORATIONS) {
    await sequelize.query(`ALTER TYPE theme_decoration ADD VALUE IF NOT EXISTS '${value}'`);
  }

  await sequelize.query(`
    INSERT INTO seasonal_themes
      (key, name, start_month, start_day, end_month, end_day, auto_enabled, priority, decoration, token_overrides, navbar_badge)
    VALUES
      ('new-year', 'Año Nuevo', 12, 27, 1, 6, true, 60, 'fireworks', '{}'::jsonb, NULL),
      ('mothers-day', 'Día de la Madre', 5, 1, 5, 10, true, 60, 'mothers_day', '{}'::jsonb, NULL)
    ON CONFLICT (key) DO NOTHING
  `);

  await sequelize.query(`UPDATE seasonal_themes SET auto_enabled = true, is_active = true`);
  for (const [key, colors] of Object.entries(COLORS)) {
    await sequelize.query(`UPDATE seasonal_themes SET token_overrides = :colors::jsonb WHERE key = :key`, {
      replacements: { key, colors: JSON.stringify(colors) },
    });
  }

  await sequelize.query(`UPDATE packages SET is_price_provisional = true`);

  await sequelize.query(`UPDATE site_settings SET value = jsonb_set(value, '{facebook,url}', to_jsonb(:url::text), true) WHERE key = 'contact'`, {
    replacements: { url: FACEBOOK_URL },
  });
}

export async function down({ context: sequelize }) {
  // Los valores de un ENUM no se pueden quitar en PostgreSQL; se revierten los datos que sí se pueden.
  await sequelize.query(`DELETE FROM seasonal_themes WHERE key IN ('new-year', 'mothers-day')`);
  await sequelize.query(`UPDATE seasonal_themes SET auto_enabled = false WHERE key IN ('spring', 'summer', 'autumn', 'winter')`);
  await sequelize.query(`UPDATE site_settings SET value = jsonb_set(value, '{facebook,url}', 'null'::jsonb, true) WHERE key = 'contact'`);
}
