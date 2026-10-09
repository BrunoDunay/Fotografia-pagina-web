/**
 * Documentos legales definitivos: el contrato con la estructura del que firma el fotógrafo,
 * y los términos y el aviso de privacidad ya redactados. Solo sustituye los que siguen marcados
 * como provisionales: un documento que ya se dio por definitivo en el panel no se toca.
 */
import { legalDocuments } from '../seeders/legal-documents.js';

export async function up({ context: sequelize }) {
  for (const doc of legalDocuments) {
    await sequelize.query(
      `UPDATE legal_documents
          SET title = :title, version = :version, intro = :intro, sections = CAST(:sections AS JSONB),
              is_provisional = false, updated_at = NOW()
        WHERE type = :type AND is_provisional = true`,
      { replacements: { ...doc, sections: JSON.stringify(doc.sections) } },
    );
  }
}

/** El texto provisional anterior no se restaura: se vuelve a marcar como provisional para poder reaplicar. */
export async function down({ context: sequelize }) {
  await sequelize.query(`UPDATE legal_documents SET is_provisional = true`);
}
