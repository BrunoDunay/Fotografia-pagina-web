import { describe, expect, it } from 'vitest';
import { nextAutoTheme } from '../src/services/theme-resolver.js';

const theme = (id, sm, sd, em, ed, priority, autoEnabled = true) => ({ id, startMonth: sm, startDay: sd, endMonth: em, endDay: ed, priority, autoEnabled, isActive: true });
const themes = [
  theme('muertos', 10, 25, 11, 2, 75),
  theme('christmas', 12, 1, 12, 31, 65),
  theme('new-year', 12, 27, 1, 6, 90),
  theme('autumn', 9, 22, 12, 20, 10, false),
];

describe('siguiente tema en modo automático', () => {
  it('sin tema activo, es la próxima festividad por fecha', () => {
    expect(nextAutoTheme(themes, '2026-10-05')).toMatchObject({ theme: { id: 'muertos' }, date: '2026-10-25' });
  });

  it('durante Navidad, el siguiente es Año Nuevo desde el 27 de diciembre (tiene más prioridad)', () => {
    expect(nextAutoTheme(themes, '2026-12-10')).toMatchObject({ theme: { id: 'new-year' }, date: '2026-12-27' });
  });

  it('cruza el año e ignora las estaciones (solo manuales)', () => {
    expect(nextAutoTheme(themes, '2026-12-30')).toMatchObject({ theme: { id: 'muertos' }, date: '2027-10-25' });
  });

  it('sin festividades automáticas no hay siguiente', () => {
    expect(nextAutoTheme([theme('autumn', 9, 22, 12, 20, 10, false)], '2026-10-05')).toBeNull();
  });
});
