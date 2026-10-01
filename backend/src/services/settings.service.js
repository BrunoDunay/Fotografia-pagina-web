import { SiteSetting } from '../models/index.js';
import { PUBLIC_SETTINGS_SECTIONS } from '../validators/settings.schemas.js';

export async function getSection(key) {
  const row = await SiteSetting.findByPk(key);
  return row?.value ?? null;
}

export async function getSections(keys) {
  const rows = await SiteSetting.findAll({ where: keys ? { key: keys } : undefined });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const getPublicSettings = () => getSections(PUBLIC_SETTINGS_SECTIONS);

export async function saveSection(key, value) {
  await SiteSetting.upsert({ key, value });
  return value;
}
