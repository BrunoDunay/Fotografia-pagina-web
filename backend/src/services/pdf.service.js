import PDFDocument from 'pdfkit';

const SIGNERS = ['Firma del cliente', 'Firma del fotógrafo'];
const COLORS = { text: '#2A2421', muted: '#7A6F68', accent: '#8C6B55', rule: '#E4DCD3' };

/**
 * Agrupa las secciones por apartado (`part`) conservando el orden; cada apartado numera desde 1.
 * Sin apartados, todo el documento es un solo grupo sin encabezado.
 */
export function groupSections(sections = []) {
  const groups = [];
  for (const section of sections) {
    const part = section.part?.trim() || null;
    let group = groups.at(-1);
    if (!group || group.part !== part) groups.push((group = { part, sections: [] }));
    group.sections.push({ ...section, display: group.sections.length + 1 });
  }
  return groups;
}

/** Genera el PDF de un documento legal a partir de sus secciones y lo escribe en la respuesta. */
export function streamLegalPdf(doc, studioName, res) {
  const pdf = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 }, info: { Title: doc.title } });
  pdf.pipe(res);

  pdf.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text(studioName.toUpperCase(), { characterSpacing: 2, align: 'center' });
  pdf.moveDown(0.8);
  pdf.font('Times-Roman').fontSize(24).fillColor(COLORS.text).text(doc.title, { align: 'center' });
  pdf.moveDown(0.3);
  pdf.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text(`Versión ${doc.version}`, { align: 'center' });

  if (doc.isProvisional) {
    pdf.moveDown(0.6).fillColor(COLORS.accent).text('Documento provisional — sujeto a cambios.', { align: 'center' });
  }

  const ruleY = pdf.y + 16;
  pdf.moveTo(200, ruleY).lineTo(pdf.page.width - 200, ruleY).strokeColor(COLORS.rule).stroke();
  pdf.y = ruleY + 20;

  if (doc.intro) {
    pdf.font('Helvetica').fontSize(10.5).fillColor(COLORS.text).text(doc.intro, { align: 'justify', lineGap: 3 });
    pdf.moveDown();
  }

  for (const group of groupSections(doc.sections)) {
    if (group.part) {
      pdf.moveDown(1.4);
      pdf.font('Times-Roman').fontSize(15).fillColor(COLORS.text).text(group.part.toUpperCase(), { align: 'center', characterSpacing: 3 });
      pdf.moveDown(0.2);
    }
    for (const section of group.sections) {
      pdf.moveDown(0.6);
      // El título no se queda solo al final de una hoja.
      if (pdf.y > pdf.page.height - pdf.page.margins.bottom - 60) pdf.addPage();
      pdf.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.accent).text(`${section.display}. ${section.title}`.toUpperCase(), { characterSpacing: 0.5 });
      pdf.moveDown(0.3);
      pdf.font('Helvetica').fontSize(10.5).fillColor(COLORS.text).text(section.body, { align: 'justify', lineGap: 3 });
    }
  }

  if (doc.type === 'contract') drawSignatures(pdf);

  pdf.end();
}

/** Líneas de firma al pie del contrato (las dos juntas, nunca partidas entre hojas). */
function drawSignatures(pdf) {
  const { left, right, bottom } = pdf.page.margins;
  if (pdf.y > pdf.page.height - bottom - 130) pdf.addPage();
  const y = pdf.y + 90;
  const gap = 40;
  const width = (pdf.page.width - left - right - gap) / 2;
  SIGNERS.forEach((label, index) => {
    const x = left + index * (width + gap);
    pdf.moveTo(x, y).lineTo(x + width, y).strokeColor(COLORS.text).stroke();
    pdf.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text(label.toUpperCase(), x, y + 8, { width, align: 'center', characterSpacing: 1.5 });
  });
}
