import { describe, expect, it } from 'vitest';
import { buildConfirmationEmail, confirmationCopyAddress, longDate } from '../src/services/confirmation-email.js';

const event = {
  title: 'Regina & Alejandro',
  eventDate: '2027-04-24',
  startTime: '16:30:00',
  endTime: '23:30:00',
  venue: 'Hacienda San Ignacio',
  city: 'Aguascalientes',
  client: { name: 'Alejandro Serna Robles', email: 'alejandro@example.com' },
  service: { name: 'Bodas' },
  package: {
    name: 'Luxe',
    features: [
      { label: 'Álbum', value: '30x30 cm', sortOrder: 2 },
      { label: 'Cobertura', value: '8 horas', sortOrder: 1 },
    ],
  },
  payments: [
    { amount: '7000.00', paidAt: '2026-08-22', concept: 'apartado', method: 'tarjeta' },
    { amount: '5000.00', paidAt: '2026-09-19', concept: 'abono', method: 'efectivo' },
  ],
};
const studio = { name: 'Armando Ovalle Wedding Studio', photographer: 'Jorge Armando Ovalle', phone: '449 999 5998', email: 'estudio@example.com', instagram: 'ovalle', siteUrl: 'https://ejemplo.mx' };
const payment = { total: 32000, paid: 12000, balance: 20000 };

describe('correo de confirmación del evento', () => {
  it('formatea la fecha larga en español', () => {
    expect(longDate('2027-04-24')).toBe('sábado, 24 de abril de 2027');
  });

  it('incluye los datos del evento, el paquete, los pagos y el saldo', () => {
    const { subject, html, text } = buildConfirmationEmail({ event, payment, ticketUrl: 'https://ejemplo.mx/reservation/ABC123', hasTicketImage: true, studio });

    expect(subject).toContain('Regina & Alejandro');
    for (const body of [html, text]) {
      expect(body).toContain('Alejandro, tu fecha quedó reservada.');
      expect(body).toContain('Bodas');
      expect(body).toContain('16:30 a 23:30 hrs');
      expect(body).toContain('Hacienda San Ignacio, Aguascalientes');
      expect(body).toContain('Luxe');
      expect(body).toContain('$32,000.00');
      expect(body).toContain('$7,000.00');
      expect(body).toContain('$20,000.00');
      expect(body).toContain('https://ejemplo.mx/reservation/ABC123');
    }
    // Las características del paquete salen en su orden.
    expect(text.indexOf('Cobertura')).toBeLessThan(text.indexOf('Álbum'));
    expect(html).toContain('cid:ticket');
  });

  it('escapa el HTML de los datos capturados y omite lo que no existe', () => {
    const { html, text } = buildConfirmationEmail({
      event: { ...event, title: '<script>alert(1)</script>', package: null, venue: null, city: null, startTime: null, payments: [] },
      payment: { total: 5000, paid: 5000, balance: 0 },
      ticketUrl: null,
      hasTicketImage: false,
      studio,
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Liquidado');
    expect(html).not.toContain('cid:ticket');
    expect(html).not.toContain('Tu paquete incluye');
    expect(text).not.toContain('Lugar:');
    expect(text).not.toContain('Horario:');
  });
});

describe('copia del correo para el fotógrafo', () => {
  it('va al correo de contacto del sitio', () => {
    expect(confirmationCopyAddress(' foto@example.com ', 'cliente@example.com', 'estudio@example.com')).toBe('foto@example.com');
  });

  it('no se manda si es el mismo correo del cliente o el de la cuenta que envía', () => {
    expect(confirmationCopyAddress('Foto@Example.com', 'foto@example.com', 'estudio@example.com')).toBeNull();
    expect(confirmationCopyAddress('estudio@example.com', 'cliente@example.com', 'Estudio@example.com')).toBeNull();
  });

  it('sin correo de contacto no hay copia', () => {
    expect(confirmationCopyAddress(null, 'cliente@example.com', 'estudio@example.com')).toBeNull();
    expect(confirmationCopyAddress('', 'cliente@example.com', undefined)).toBeNull();
  });
});
