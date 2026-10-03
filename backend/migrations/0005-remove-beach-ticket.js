/**
 * Se retiró el diseño de ticket "Playa al atardecer" (beach).
 * Las reservaciones que lo usaban pasan a "Palmeras", el otro diseño de playa.
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`UPDATE reservations SET ticket_design = 'palms', ticket_palette = 'olive' WHERE ticket_design = 'beach'`);
}

export async function down() {
  // No se puede saber qué reservaciones usaban el diseño retirado.
}
