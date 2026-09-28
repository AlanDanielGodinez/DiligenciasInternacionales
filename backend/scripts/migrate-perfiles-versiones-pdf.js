const { pool } = require('../src/config/db');

const SQL = `
ALTER TABLE public.perfiles_solicitud_versiones
  ADD COLUMN IF NOT EXISTS id_documento_pdf integer NULL,
  ADD COLUMN IF NOT EXISTS pdf_drive_file_id text NULL,
  ADD COLUMN IF NOT EXISTS pdf_generado_en timestamp NULL,
  ADD COLUMN IF NOT EXISTS pdf_nombre_archivo text NULL;

CREATE INDEX IF NOT EXISTS idx_perfiles_solicitud_versiones_documento_pdf
  ON public.perfiles_solicitud_versiones(id_documento_pdf);

CREATE INDEX IF NOT EXISTS idx_perfiles_solicitud_versiones_pdf_drive_file
  ON public.perfiles_solicitud_versiones(pdf_drive_file_id);

DO $$
BEGIN
  IF to_regclass('public.documentos') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'fk_perfiles_versiones_pdf_documento'
         AND conrelid = 'public.perfiles_solicitud_versiones'::regclass
     ) THEN
    ALTER TABLE public.perfiles_solicitud_versiones
      ADD CONSTRAINT fk_perfiles_versiones_pdf_documento
      FOREIGN KEY (id_documento_pdf)
      REFERENCES public.documentos(id_documento);
  END IF;
END $$;
`;

async function main() {
  try {
    console.log('Applying perfiles_solicitud_versiones PDF migration...');
    await pool.query(SQL);

    const { rows } = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'perfiles_solicitud_versiones'
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
