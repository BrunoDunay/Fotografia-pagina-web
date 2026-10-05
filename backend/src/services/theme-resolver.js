/**
 * Decide qué tema estacional está activo.
 * Función pura: no toca la BD, para poder probarla fácilmente.
 */

const toOrdinal = (month, day) => month * 100 + day;

/** ¿La fecha (mes/día) cae dentro del rango del tema? Soporta rangos que cruzan el año (ej. 20 dic → 6 ene). */
export function isWithinRange(theme, month, day) {
  const start = toOrdinal(theme.startMonth, theme.startDay);
  const end = toOrdinal(theme.endMonth, theme.endDay);
  const current = toOrdinal(month, day);
  return start <= end ? current >= start && current <= end : current >= start || current <= end;
}

/**
 * Próximo cambio en modo automático: el primer día (a partir de mañana) en que el tema
 * que se mostraría es otro distinto al de hoy. Devuelve { theme, date } o null si no hay ninguno en un año.
 */
export function nextAutoTheme(themes, today) {
  const auto = { mode: 'auto' };
  const current = resolveActiveTheme(themes, auto, today);
  const start = Date.parse(`${today}T00:00:00Z`);
  for (let offset = 1; offset <= 366; offset++) {
    const date = new Date(start + offset * 86_400_000).toISOString().slice(0, 10);
    const theme = resolveActiveTheme(themes, auto, date);
    if (theme && theme.id !== current?.id) return { theme, date };
  }
  return null;
}

/**
 * @param {Array} themes  Temas disponibles.
 * @param {{mode: 'off'|'manual'|'auto', manualThemeId?: string|null}} settings
 * @param {string} today  Fecha YYYY-MM-DD en la zona horaria del estudio.
 */
export function resolveActiveTheme(themes, settings, today) {
  const mode = settings?.mode ?? 'off';
  const active = themes.filter((t) => t.isActive);

  if (mode === 'manual') {
    return active.find((t) => t.id === settings.manualThemeId) ?? null;
  }

  if (mode === 'auto') {
    const [, month, day] = today.split('-').map(Number);
    const candidates = active.filter((t) => t.autoEnabled && isWithinRange(t, month, day));
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0] ?? null;
  }

  return null;
}
