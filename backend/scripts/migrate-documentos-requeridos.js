const { pool } = require('../src/config/db');

const SQL = `
ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS clave_documento_requerido text NULL,
  ADD COLUMN IF NOT EXISTS reemplaza_a_id_documento integer NULL,
  ADD COLUMN IF NOT EXISTS actualizado_en timestamp NULL;

CREATE INDEX IF NOT EXISTS idx_documentos_solicitud_clave_requerida
  ON public.documentos(id_solicitud, clave_documento_requerido);

CREATE INDEX IF NOT EXISTS idx_documentos_reemplaza_a
  ON public.documentos(reemplaza_a_id_documento);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_documentos_reemplaza_documento'
      AND conrelid = 'public.documentos'::regclass
  ) THEN
    ALTER TABLE public.documentos
      ADD CONSTRAINT fk_documentos_reemplaza_documento
      FOREIGN KEY (reemplaza_a_id_documento)
      REFERENCES public.documentos(id_documento);
  END IF;
END $$;
`;

async function ensureTipoDocumento(tipo) {
  const existing = await pool.query(
    `SELECT id
     FROM public.catalogo_tipos_documento
     WHERE lower(tipo) = lower($1)
     LIMIT 1`,
    [tipo]
  );

  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await pool.query(
    `INSERT INTO public.catalogo_tipos_documento (id, tipo)
     SELECT COALESCE(MAX(id), 0) + 1, $1
     FROM public.catalogo_tipos_documento
     RETURNING id`,
    [tipo]
  );

  return inserted.rows[0].id;
}

async function main() {
  try {
    console.log('Applying documentos requeridos migration...');
    await pool.query(SQL);
    const perfilGenerado = await ensureTipoDocumento('Perfil generado');
    const documentoRequerido = await ensureTipoDocumento('Documento requerido');
    const documentoAdicional = await ensureTipoDocumento('Documento adicional');

    console.log('Tipos documento:', {
      perfil_generado: perfilGenerado,
      documento_requerido: documentoRequerido,
      documento_adicional: documentoAdicional,
    });

    const { rows } = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'documentos'
       ORDER BY ordinal_position`
    );
    console.table(rows);
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
