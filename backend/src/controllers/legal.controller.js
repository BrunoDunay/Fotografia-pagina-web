import { LegalDocument } from '../models/index.js';
import { notFound } from '../utils/app-error.js';
import { slugify } from '../utils/slugify.js';
import { getSection } from '../services/settings.service.js';
import { streamLegalPdf } from '../services/pdf.service.js';

const toDocument = (d) => ({
  type: d.type,
  title: d.title,
  version: d.version,
  intro: d.intro,
  sections: d.sections,
  isProvisional: d.isProvisional,
  updatedAt: d.updatedAt,
});

async function findOr404(type) {
  const doc = await LegalDocument.findOne({ where: { type } });
  if (!doc) throw notFound('El documento');
  return doc;
}

export async function list(_req, res) {
  const docs = await LegalDocument.findAll({ order: [['type', 'ASC']] });
  res.json(docs.map(toDocument));
}

export async function getOne(req, res) {
  res.json(toDocument(await findOr404(req.valid.params.type)));
}

export async function downloadPdf(req, res) {
  const doc = await findOr404(req.valid.params.type);
  const brand = await getSection('brand');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${slugify(doc.title)}.pdf"`);
  streamLegalPdf(doc, brand?.studioName ?? 'Armando Ovalle Wedding Studio', res);
}

export async function update(req, res) {
  const doc = await findOr404(req.valid.params.type);
  await doc.update(req.valid.body);
  res.json(toDocument(doc));
}
