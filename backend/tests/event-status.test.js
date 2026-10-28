import { describe, expect, it } from 'vitest';
import { Op } from 'sequelize';
import { pastConfirmedWhere } from '../src/services/event-status.service.js';
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
