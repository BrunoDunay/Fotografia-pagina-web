/**
 * Video por servicio: ya no es un enlace de YouTube/Vimeo, es un archivo que el fotógrafo sube
 * desde el panel (igual que las fotos). Se guarda como media_asset de tipo "video".
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`
    ALTER TABLE media_assets ADD COLUMN resource_type VARCHAR(10) NOT NULL DEFAULT 'image';
    ALTER TABLE services ADD COLUMN video_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;
    ALTER TABLE services DROP COLUMN video_url;
  `);
}

export async function down({ context: sequelize }) {
  await sequelize.query(`
    ALTER TABLE services ADD COLUMN video_url TEXT;
    ALTER TABLE services DROP COLUMN video_media_id;
    ALTER TABLE media_assets DROP COLUMN resource_type;
  `);
}
