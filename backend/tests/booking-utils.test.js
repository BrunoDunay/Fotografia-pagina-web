import { describe, expect, it } from 'vitest';
import { buildMonogram, paymentSummary } from '../src/services/event-booking.service.js';
import { generatePublicCode } from '../src/utils/public-code.js';
import { daysBetween, todayInStudioTz } from '../src/utils/dates-mx.js';
import { hasImageSignature } from '../src/middlewares/upload.js';

describe('buildMonogram', () => {
  it('pareja con &', () => expect(buildMonogram('Camila & Sebastián')).toBe('C|S'));
  it('pareja con "y"', () => expect(buildMonogram('Ana y Luis')).toBe('A|L'));
  it('una persona', () => expect(buildMonogram('Valeria Gómez')).toBe('VG'));
});

describe('paymentSummary', () => {
  it('sin pagos queda pendiente', () => {
    expect(paymentSummary('20000.00', [])).toEqual({ total: 20000, paid: 0, balance: 20000, status: 'pending' });
  });
  it('pago parcial', () => {
    expect(paymentSummary('20000.00', [{ amount: '10000.00' }])).toMatchObject({ paid: 10000, balance: 10000, status: 'partial' });
  });
  it('liquidado', () => {
    expect(paymentSummary(20000, [{ amount: 15000 }, { amount: 5000 }])).toMatchObject({ balance: 0, status: 'paid' });
  });
  it('redondea centavos', () => {
    expect(paymentSummary(100.3, [{ amount: 0.1 }, { amount: 0.2 }]).balance).toBe(100);
  });
});

describe('generatePublicCode', () => {
  it('genera 10 caracteres sin ambiguos', () => {
    const code = generatePublicCode();
    expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{10}$/);
  });
});

describe('fechas en zona del estudio', () => {
  it('usa America/Mexico_City (no UTC)', () => {
    // 2026-10-02 03:00 UTC sigue siendo 1 de octubre en México (UTC-6).
    expect(todayInStudioTz(new Date('2026-10-02T03:00:00Z'), 'America/Mexico_City')).toBe('2026-10-01');
  });
  it('daysBetween', () => {
    expect(daysBetween('2026-10-01', '2026-10-24')).toBe(23);
    expect(daysBetween('2026-10-24', '2026-10-01')).toBe(-23);
  });
});

describe('hasImageSignature', () => {
  const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);
  it('acepta JPEG, PNG y WEBP', () => {
    expect(hasImageSignature(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(hasImageSignature(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
    expect(hasImageSignature(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))).toBe(true);
  });
  it('rechaza archivos que no son imagen', () => {
    expect(hasImageSignature(Buffer.from('%PDF-1.7 hola mundo'))).toBe(false);
    expect(hasImageSignature(Buffer.from('<script>alert(1)</script>'))).toBe(false);
  });
});

describe('normalizeTicketStyle', () => {
  it('acepta una combinación válida de diseño y color', async () => {
    const { normalizeTicketStyle } = await import('../src/config/ticket-designs.js');
    expect(normalizeTicketStyle('beach', 'dusk')).toEqual({ ticketDesign: 'beach', ticketPalette: 'dusk' });
  });

  it('si el color no pertenece al diseño, usa el primero de ese diseño', async () => {
    const { normalizeTicketStyle } = await import('../src/config/ticket-designs.js');
    expect(normalizeTicketStyle('grad', 'mocha')).toEqual({ ticketDesign: 'grad', ticketPalette: 'navy' });
  });

  it('sin diseño (o desconocido) usa el sobre clásico', async () => {
    const { normalizeTicketStyle } = await import('../src/config/ticket-designs.js');
    expect(normalizeTicketStyle(undefined, undefined)).toEqual({ ticketDesign: 'envelope', ticketPalette: 'mocha' });
    expect(normalizeTicketStyle('no-existe', 'navy')).toEqual({ ticketDesign: 'envelope', ticketPalette: 'navy' });
  });
});
