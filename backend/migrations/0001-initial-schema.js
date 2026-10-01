/** Esquema inicial de Armando Ovalle Wedding Studio. */

export async function up({ context: sequelize }) {
  await sequelize.query(`
    CREATE TYPE event_status     AS ENUM ('tentative', 'confirmed', 'completed', 'cancelled');
    CREATE TYPE payment_concept  AS ENUM ('apartado', 'abono', 'liquidacion', 'otro');
    CREATE TYPE payment_method   AS ENUM ('efectivo', 'transferencia', 'tarjeta', 'otro');
    CREATE TYPE ticket_palette   AS ENUM ('mocha', 'navy', 'burgundy');
    CREATE TYPE theme_decoration AS ENUM ('none', 'snow', 'leaves', 'petals', 'papel_picado', 'confetti');
    CREATE TYPE legal_type       AS ENUM ('contract', 'terms', 'privacy');

    CREATE TABLE admins (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(100) NOT NULL,
      name          VARCHAR(120) NOT NULL,
      last_login_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE site_settings (
      key        VARCHAR(40) PRIMARY KEY,
      value      JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE media_assets (
      id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cloudinary_public_id VARCHAR(255) NOT NULL UNIQUE,
      secure_url           TEXT NOT NULL,
      width                INTEGER,
      height               INTEGER,
      format               VARCHAR(16),
      bytes                INTEGER,
      alt_text             VARCHAR(255),
      folder               VARCHAR(160),
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE services (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug              VARCHAR(80) NOT NULL UNIQUE,
      name              VARCHAR(120) NOT NULL,
      short_description VARCHAR(300),
      description       TEXT,
      hero_title        VARCHAR(160),
      hero_subtitle     VARCHAR(200),
      hero_description  TEXT,
      hero_media_id     UUID REFERENCES media_assets(id) ON DELETE SET NULL,
      cover_media_id    UUID REFERENCES media_assets(id) ON DELETE SET NULL,
      video_url         TEXT,
      seo_title         VARCHAR(160),
      seo_description   VARCHAR(300),
      sort_order        INTEGER NOT NULL DEFAULT 0,
      is_visible        BOOLEAN NOT NULL DEFAULT true,
      is_provisional    BOOLEAN NOT NULL DEFAULT true,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE packages (
      id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name                 VARCHAR(120) NOT NULL,
      subtitle             VARCHAR(200),
      price                NUMERIC(10, 2) CHECK (price IS NULL OR price >= 0),
      currency             CHAR(3) NOT NULL DEFAULT 'MXN',
      is_price_provisional BOOLEAN NOT NULL DEFAULT true,
      is_featured          BOOLEAN NOT NULL DEFAULT false,
      is_active            BOOLEAN NOT NULL DEFAULT true,
      sort_order           INTEGER NOT NULL DEFAULT 0,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE package_features (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
      label      VARCHAR(160) NOT NULL,
      value      VARCHAR(160),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX package_features_package_idx ON package_features(package_id);

    CREATE TABLE service_packages (
      service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (service_id, package_id)
    );

    CREATE TABLE galleries (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_id     UUID UNIQUE REFERENCES services(id) ON DELETE CASCADE,
      title          VARCHAR(160) NOT NULL,
      cover_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
      max_images     INTEGER NOT NULL DEFAULT 60 CHECK (max_images BETWEEN 1 AND 500),
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE gallery_images (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
      media_id   UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX gallery_images_gallery_order_idx ON gallery_images(gallery_id, sort_order);

    CREATE TABLE clients (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       VARCHAR(160) NOT NULL,
      phone      VARCHAR(40),
      email      VARCHAR(160),
      notes      TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX clients_name_idx ON clients(lower(name));

    CREATE TABLE events (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      service_id          UUID REFERENCES services(id) ON DELETE SET NULL,
      package_id          UUID REFERENCES packages(id) ON DELETE SET NULL,
      title               VARCHAR(160) NOT NULL,
      event_date          DATE NOT NULL,
      start_time          TIME,
      end_time            TIME,
      venue               VARCHAR(200),
      city                VARCHAR(120),
      total_price         NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
      status              event_status NOT NULL DEFAULT 'confirmed',
      blocks_availability BOOLEAN NOT NULL DEFAULT true,
      notes               TEXT,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX events_date_idx ON events(event_date);
    CREATE INDEX events_client_idx ON events(client_id);

    CREATE TABLE payments (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
      paid_at    DATE NOT NULL,
      concept    payment_concept NOT NULL DEFAULT 'abono',
      method     payment_method NOT NULL DEFAULT 'efectivo',
      notes      TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX payments_event_idx ON payments(event_id);

    CREATE TABLE reservations (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id       UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
      public_code    VARCHAR(16) NOT NULL UNIQUE,
      display_title  VARCHAR(160) NOT NULL,
      monogram       VARCHAR(12),
      message        TEXT,
      ticket_palette ticket_palette NOT NULL DEFAULT 'mocha',
      cover_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
      show_time      BOOLEAN NOT NULL DEFAULT true,
      show_venue     BOOLEAN NOT NULL DEFAULT false,
      is_active      BOOLEAN NOT NULL DEFAULT true,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE availability_blocks (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date           DATE NOT NULL UNIQUE,
      private_reason VARCHAR(200),
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE faqs (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question   VARCHAR(300) NOT NULL,
      answer     TEXT NOT NULL,
      service_id UUID REFERENCES services(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active  BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE seasonal_themes (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key             VARCHAR(60) NOT NULL UNIQUE,
      name            VARCHAR(120) NOT NULL,
      start_month     SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
      start_day       SMALLINT NOT NULL CHECK (start_day BETWEEN 1 AND 31),
      end_month       SMALLINT NOT NULL CHECK (end_month BETWEEN 1 AND 12),
      end_day         SMALLINT NOT NULL CHECK (end_day BETWEEN 1 AND 31),
      auto_enabled    BOOLEAN NOT NULL DEFAULT false,
      priority        INTEGER NOT NULL DEFAULT 0,
      decoration      theme_decoration NOT NULL DEFAULT 'none',
      token_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
      hero_media_id   UUID REFERENCES media_assets(id) ON DELETE SET NULL,
      navbar_badge    VARCHAR(60),
      is_active       BOOLEAN NOT NULL DEFAULT true,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE legal_documents (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type           legal_type NOT NULL UNIQUE,
      title          VARCHAR(160) NOT NULL,
      version        VARCHAR(40) NOT NULL DEFAULT '0.1',
      intro          TEXT,
      sections       JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_provisional BOOLEAN NOT NULL DEFAULT true,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function down({ context: sequelize }) {
  await sequelize.query(`
    DROP TABLE IF EXISTS legal_documents, seasonal_themes, faqs, availability_blocks, reservations, payments,
      events, clients, gallery_images, galleries, service_packages, package_features, packages, services,
      media_assets, site_settings, admins CASCADE;
    DROP TYPE IF EXISTS legal_type, theme_decoration, ticket_palette, payment_method, payment_concept, event_status;
  `);
}
