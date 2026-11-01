/**
 * Reseñas de clientes. Llegan desde el sitio como "pending" y solo se ven en público cuando
 * el fotógrafo las publica desde el panel. La foto (opcional) es la de perfil de quien comenta.
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`
    CREATE TABLE reviews (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_name    VARCHAR(60) NOT NULL,
      event_label    VARCHAR(80) NOT NULL,
      rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment        TEXT NOT NULL,
      photo_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
      status         VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'hidden')),
      reply          TEXT,
      replied_at     TIMESTAMPTZ,
      published_at   TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX reviews_status_created_idx ON reviews (status, created_at DESC);
  `);
}

export async function down({ context: sequelize }) {
  await sequelize.query('DROP TABLE IF EXISTS reviews;');
}
