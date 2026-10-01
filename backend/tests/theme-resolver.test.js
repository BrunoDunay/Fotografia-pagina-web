import { describe, expect, it } from 'vitest';
import { isWithinRange, resolveActiveTheme } from '../src/services/theme-resolver.js';

const theme = (overrides) => ({
  id: overrides.key,
  isActive: true,
  autoEnabled: true,
  priority: 0,
  ...overrides,
});

const christmas = theme({ key: 'christmas', startMonth: 12, startDay: 1, endMonth: 12, endDay: 31, priority: 50 });
const winter = theme({ key: 'winter', startMonth: 12, startDay: 21, endMonth: 3, endDay: 19, priority: 10 });
const sanMarcos = theme({ key: 'san-marcos', startMonth: 4, startDay: 15, endMonth: 5, endDay: 10, priority: 50 });
const spring = theme({ key: 'spring', startMonth: 3, startDay: 20, endMonth: 6, endDay: 20, priority: 10 });
const all = [christmas, winter, sanMarcos, spring];

describe('isWithinRange', () => {
  it('incluye los extremos del rango', () => {
    expect(isWithinRange(christmas, 12, 1)).toBe(true);
    expect(isWithinRange(christmas, 12, 31)).toBe(true);
    expect(isWithinRange(christmas, 11, 30)).toBe(false);
  });

  it('soporta rangos que cruzan el año', () => {
    expect(isWithinRange(winter, 12, 25)).toBe(true);
    expect(isWithinRange(winter, 1, 15)).toBe(true);
    expect(isWithinRange(winter, 3, 20)).toBe(false);
    expect(isWithinRange(winter, 7, 1)).toBe(false);
  });
});

describe('resolveActiveTheme', () => {
  it('modo off: nunca hay tema', () => {
    expect(resolveActiveTheme(all, { mode: 'off' }, '2026-12-25')).toBeNull();
  });

  it('modo manual: usa el tema elegido aunque no sea su fecha', () => {
    expect(resolveActiveTheme(all, { mode: 'manual', manualThemeId: 'christmas' }, '2026-07-01')?.key).toBe('christmas');
  });

  it('modo manual: ignora temas desactivados', () => {
    const disabled = { ...christmas, isActive: false };
    expect(resolveActiveTheme([disabled], { mode: 'manual', manualThemeId: 'christmas' }, '2026-12-25')).toBeNull();
  });

  it('modo auto: la festividad gana a la estación por prioridad', () => {
    expect(resolveActiveTheme(all, { mode: 'auto' }, '2026-12-25')?.key).toBe('christmas');
    expect(resolveActiveTheme(all, { mode: 'auto' }, '2026-04-20')?.key).toBe('san-marcos');
  });

  it('modo auto: usa la estación cuando no hay festividad', () => {
    expect(resolveActiveTheme(all, { mode: 'auto' }, '2027-01-10')?.key).toBe('winter');
    expect(resolveActiveTheme(all, { mode: 'auto' }, '2026-06-01')?.key).toBe('spring');
  });

  it('modo auto: respeta temas con activación automática apagada', () => {
    const manualOnly = { ...christmas, autoEnabled: false };
    expect(resolveActiveTheme([manualOnly], { mode: 'auto' }, '2026-12-25')).toBeNull();
  });

  it('sin configuración se comporta como off', () => {
    expect(resolveActiveTheme(all, null, '2026-12-25')).toBeNull();
  });
});
