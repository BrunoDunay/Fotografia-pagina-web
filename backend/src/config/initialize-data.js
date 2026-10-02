import bcrypt from 'bcrypt';
import { env } from './env.js';
import { sequelize } from './database.js';
import {
  Admin,
  Faq,
  Gallery,
  LegalDocument,
  Package,
  PackageFeature,
  SeasonalTheme,
  Service,
  ServicePackage,
  SiteSetting,
} from '../models/index.js';
import { BCRYPT_ROUNDS } from '../controllers/auth.controller.js';
import * as content from '../../seeders/initial-content.js';

/** Crea la cuenta administrativa inicial si todavía no existe ninguna. */
async function ensureAdmin() {
  if (await Admin.count()) return false;
  await Admin.create({
    email: env.ADMIN_EMAIL.toLowerCase(),
    name: env.ADMIN_NAME,
    passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, BCRYPT_ROUNDS),
  });
  return true;
}

/** Inserta solo las secciones de configuración que falten (nunca sobrescribe lo editado). */
async function seedSettings(transaction) {
  const existing = new Set((await SiteSetting.findAll({ attributes: ['key'], transaction })).map((s) => s.key));
  const missing = Object.entries(content.settings).filter(([key]) => !existing.has(key));
  await SiteSetting.bulkCreate(missing.map(([key, value]) => ({ key, value })), { transaction });
  return missing.length;
}

async function seedCatalog(transaction) {
  if (await Service.count({ transaction })) return false;

  const services = await Service.bulkCreate(
    content.services.map((s, index) => ({ ...s, sortOrder: index, heroTitle: s.name, isProvisional: true })),
    { transaction, returning: true },
  );
  await Gallery.bulkCreate(services.map((s) => ({ serviceId: s.id, title: s.name })), { transaction });

  let sortOrder = 0;
  for (const group of content.packageGroups) {
    const linked = services.filter((s) => group.serviceSlugs.includes(s.slug));
    for (const [index, { features, ...data }] of group.packages.entries()) {
      const pkg = await Package.create({ ...data, isPriceProvisional: false, sortOrder: sortOrder++ }, { transaction });
      await PackageFeature.bulkCreate(
        features.map((f, i) => ({ packageId: pkg.id, label: f.label, value: f.value ?? null, sortOrder: i })),
        { transaction },
      );
      await ServicePackage.bulkCreate(
        linked.map((s) => ({ serviceId: s.id, packageId: pkg.id, sortOrder: index })),
        { transaction },
      );
    }
  }
  return true;
}

async function seedTable(Model, rows, transaction, map = (r) => r) {
  if (await Model.count({ transaction })) return false;
  await Model.bulkCreate(rows.map(map), { transaction });
  return true;
}

/** Idempotente: se puede ejecutar en cada arranque sin duplicar ni pisar datos. */
export async function initializeData() {
  const adminCreated = await ensureAdmin();

  const seeded = await sequelize.transaction(async (transaction) => ({
    settings: await seedSettings(transaction),
    catalog: await seedCatalog(transaction),
    faqs: await seedTable(Faq, content.faqs, transaction, (f, i) => ({ ...f, sortOrder: i })),
    themes: await seedTable(SeasonalTheme, content.themes, transaction),
    legal: await seedTable(LegalDocument, content.legalDocuments, transaction),
  }));

  return { adminCreated, ...seeded };
}
