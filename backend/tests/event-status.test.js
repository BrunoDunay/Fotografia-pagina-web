import { describe, expect, it } from 'vitest';
import { Op } from 'sequelize';
import { assertCanComplete, pastConfirmedWhere } from '../src/services/event-status.service.js';
import { todayInStudioTz } from '../src/utils/dates-mx.js';

describe('eventos realizados', () => {
  it('solo toca los confirmados con fecha anterior a hoy', () => {
    const where = pastConfirmedWhere('2026-10-28');
    expect(where.status).toBe('confirmed');
    expect(where.eventDate[Op.lt]).toBe('2026-10-28');
  });

  it('el día del evento se cuenta en hora de México, no en UTC', () => {
    // 28 oct 2026, 23:30 en México = 29 oct 05:30 UTC: todavía es el día 28 para el estudio.
    expect(todayInStudioTz(new Date('2026-10-29T05:30:00Z'), 'America/Mexico_City')).toBe('2026-10-28');
  });
});

describe('no se marca como realizado antes de tiempo', () => {
  it('rechaza "realizado" en un evento de hoy o futuro', () => {
    expect(() => assertCanComplete('completed', '2026-10-30', '2026-10-27')).toThrow(/hasta que pasa su fecha/);
    expect(() => assertCanComplete('completed', '2026-10-27', '2026-10-27')).toThrow();
  });
  it('lo permite si ya pasó, y no afecta a otros estados', () => {
    expect(() => assertCanComplete('completed', '2026-10-26', '2026-10-27')).not.toThrow();
    expect(() => assertCanComplete('confirmed', '2026-12-01', '2026-10-27')).not.toThrow();
  });
});
