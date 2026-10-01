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
