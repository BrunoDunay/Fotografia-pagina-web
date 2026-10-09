import { describe, expect, it } from 'vitest';
import { legalDocuments } from '../seeders/legal-documents.js';
import { groupSections } from '../src/services/pdf.service.js';
import { legalUpdateBody } from '../src/validators/catalog.schemas.js';

describe('documentos legales', () => {
  it.each(legalDocuments.map((d) => [d.type, d]))('%s: es definitivo y el panel lo puede volver a guardar tal cual', (_type, doc) => {
    expect(doc.isProvisional).toBe(false);
    expect(doc.sections.map((s) => s.number)).toEqual(doc.sections.map((_s, i) => i + 1));
    const { type: _omit, ...body } = doc;
    expect(legalUpdateBody.safeParse(body).success).toBe(true);
    expect([doc.intro, ...doc.sections.map((x) => x.body)].join(" ")).not.toMatch(/provisional|pendiente de sustituir/i);
  });

  it('el contrato se divide en carátula, declaraciones y 23 cláusulas, cada apartado numerado desde 1', () => {
    const groups = groupSections(legalDocuments.find((d) => d.type === 'contract').sections);
    expect(groups.map((g) => [g.part, g.sections.length])).toEqual([['Carátula', 6], ['Declaraciones', 3], ['Cláusulas', 23]]);
    expect(groups[2].sections[0]).toMatchObject({ display: 1, title: 'Objeto' });
    expect(groups[2].sections.at(-1)).toMatchObject({ display: 23, title: 'Acuerdo total' });
  });

  it('sin apartados, todo queda en un solo grupo sin encabezado', () => {
    const groups = groupSections(legalDocuments.find((d) => d.type === 'privacy').sections);
    expect(groups).toHaveLength(1);
    expect(groups[0].part).toBeNull();
  });
});
