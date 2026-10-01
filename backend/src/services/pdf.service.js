import PDFDocument from 'pdfkit';

const COLORS = { text: '#2A2421', muted: '#7A6F68', accent: '#8C6B55', rule: '#E4DCD3' };

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

  for (const section of doc.sections ?? []) {
    pdf.moveDown(0.6);
    pdf.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.accent).text(`${section.number}. ${section.title}`.toUpperCase(), { characterSpacing: 0.5 });
    pdf.moveDown(0.3);
    pdf.font('Helvetica').fontSize(10.5).fillColor(COLORS.text).text(section.body, { align: 'justify', lineGap: 3 });
  }

  pdf.end();
}
