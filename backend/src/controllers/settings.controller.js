import { AppError } from '../utils/app-error.js';
import { settingsSchemas } from '../validators/settings.schemas.js';
import { getPublicSettings, getSections, saveSection } from '../services/settings.service.js';

export async function getPublic(_req, res) {
  res.json(await getPublicSettings());
}

export async function getAll(_req, res) {
  res.json(await getSections());
}

export async function updateSection(req, res) {
  const { section } = req.params;
  const schema = settingsSchemas[section];
  if (!schema) throw new AppError(404, `La sección "${section}" no existe.`, 'NOT_FOUND');
  const value = schema.parse(req.body ?? {});
  res.json(await saveSection(section, value));
}
