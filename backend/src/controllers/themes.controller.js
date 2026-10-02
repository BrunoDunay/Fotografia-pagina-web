import { MediaAsset, SeasonalTheme } from '../models/index.js';
import { AppError, notFound } from '../utils/app-error.js';
import { todayInStudioTz } from '../utils/dates-mx.js';
import { resolveActiveTheme } from '../services/theme-resolver.js';
import { getSection, saveSection } from '../services/settings.service.js';
import { toMedia } from '../services/serializers.js';

const withHero = { include: [{ model: MediaAsset, as: 'heroMedia' }] };

/** Público: el tema que debe verse hoy (o null). */
export async function getActive(_req, res) {
  const [themes, settings] = await Promise.all([SeasonalTheme.findAll(withHero), getSection('theme')]);
  const theme = resolveActiveTheme(themes, settings, todayInStudioTz());

  // Sin caché: un cambio de tema en el panel debe verse al refrescar el sitio.
  res.set('Cache-Control', 'no-cache');
  res.json(
    theme && {
      key: theme.key,
      name: theme.name,
      decoration: theme.decoration,
      tokenOverrides: theme.tokenOverrides,
      heroImage: toMedia(theme.heroMedia),
      navbarBadge: theme.navbarBadge,
    },
  );
}

export async function list(_req, res) {
  const [themes, settings] = await Promise.all([
    SeasonalTheme.findAll({ ...withHero, order: [['startMonth', 'ASC'], ['startDay', 'ASC']] }),
    getSection('theme'),
  ]);
  const active = resolveActiveTheme(themes, settings, todayInStudioTz());
  res.json({
    mode: settings?.mode ?? 'off',
    manualThemeId: settings?.manualThemeId ?? null,
    activeThemeId: active?.id ?? null,
    themes: themes.map((t) => ({ ...t.toJSON(), heroImage: toMedia(t.heroMedia), heroMedia: undefined })),
  });
}

export async function create(req, res) {
  res.status(201).json(await SeasonalTheme.create(req.valid.body));
}

export async function update(req, res) {
  const theme = await SeasonalTheme.findByPk(req.valid.params.id);
  if (!theme) throw notFound('El tema');
  res.json(await theme.update(req.valid.body));
}

export async function remove(req, res) {
  const theme = await SeasonalTheme.findByPk(req.valid.params.id);
  if (!theme) throw notFound('El tema');
  const settings = await getSection('theme');
  if (settings?.mode === 'manual' && settings.manualThemeId === theme.id) {
    await saveSection('theme', { mode: 'off', manualThemeId: null });
  }
  await theme.destroy();
  res.status(204).end();
}

export async function setMode(req, res) {
  const { mode, manualThemeId } = req.valid.body;
  if (mode === 'manual') {
    if (!manualThemeId) throw new AppError(400, 'Selecciona el tema que quieres activar.', 'VALIDATION_ERROR', { manualThemeId: 'Obligatorio en modo manual' });
    if (!(await SeasonalTheme.count({ where: { id: manualThemeId } }))) throw notFound('El tema');
  }
  res.json(await saveSection('theme', { mode, manualThemeId: mode === 'manual' ? manualThemeId : null }));
}
