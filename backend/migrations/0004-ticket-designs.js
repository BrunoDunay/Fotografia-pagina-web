/**
 * El ticket digital ahora tiene varios diseños, cada uno con sus propias variaciones de color:
 * - ticket_design: diseño elegido (por defecto, el sobre clásico que ya existía);
 * - ticket_palette deja de ser un ENUM fijo, porque cada diseño tiene colores distintos.
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS ticket_design VARCHAR(40) NOT NULL DEFAULT 'envelope'`);
  await sequelize.query(`ALTER TABLE reservations ALTER COLUMN ticket_palette DROP DEFAULT`);
  await sequelize.query(`ALTER TABLE reservations ALTER COLUMN ticket_palette TYPE VARCHAR(30) USING ticket_palette::text`);
  await sequelize.query(`ALTER TABLE reservations ALTER COLUMN ticket_palette SET DEFAULT 'mocha'`);
  await sequelize.query(`DROP TYPE IF EXISTS ticket_palette`);
}

export async function down({ context: sequelize }) {
  // Los colores que no existían antes vuelven al moca.
  await sequelize.query(`UPDATE reservations SET ticket_palette = 'mocha' WHERE ticket_palette NOT IN ('mocha', 'navy', 'burgundy')`);
  await sequelize.query(`CREATE TYPE ticket_palette AS ENUM ('mocha', 'navy', 'burgundy')`);
  await sequelize.query(`ALTER TABLE reservations ALTER COLUMN ticket_palette DROP DEFAULT`);
  await sequelize.query(`ALTER TABLE reservations ALTER COLUMN ticket_palette TYPE ticket_palette USING ticket_palette::ticket_palette`);
  await sequelize.query(`ALTER TABLE reservations ALTER COLUMN ticket_palette SET DEFAULT 'mocha'`);
  await sequelize.query(`ALTER TABLE reservations DROP COLUMN IF EXISTS ticket_design`);
}
