/** Fecha en que se envió al cliente el correo de confirmación del evento (null = aún no se envía). */

export async function up({ context: sequelize }) {
  await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ`);
}

export async function down({ context: sequelize }) {
  await sequelize.query(`ALTER TABLE events DROP COLUMN IF EXISTS confirmation_sent_at`);
}
