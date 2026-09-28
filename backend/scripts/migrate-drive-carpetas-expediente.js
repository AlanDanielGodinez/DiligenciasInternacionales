const { pool } = require('../src/config/db');

const SQL = `
CREATE TABLE IF NOT EXISTS public.drive_carpetas_expediente (
  id_drive_carpeta SERIAL PRIMARY KEY,
  tipo_entidad VARCHAR(30) NOT NULL,
  id_contacto INTEGER NULL,
  id_cliente INTEGER NULL,
  id_solicitud INTEGER NULL,
  nombre_carpeta TEXT NOT NULL,
  drive_folder_id TEXT NOT NULL,
  drive_folder_url TEXT NULL,
  parent_drive_folder_id TEXT NULL,
  clave_subcarpeta VARCHAR(80) NULL,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drive_carpetas_expediente_contacto
  ON public.drive_carpetas_expediente(id_contacto);

CREATE INDEX IF NOT EXISTS idx_drive_carpetas_expediente_cliente
  ON public.drive_carpetas_expediente(id_cliente);

CREATE INDEX IF NOT EXISTS idx_drive_carpetas_expediente_solicitud
  ON public.drive_carpetas_expediente(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_drive_carpetas_expediente_drive_folder
  ON public.drive_carpetas_expediente(drive_folder_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_drive_carpetas_expediente_logical
  ON public.drive_carpetas_expediente (
    tipo_entidad,
    COALESCE(id_contacto, 0),
    COALESCE(id_cliente, 0),
    COALESCE(id_solicitud, 0),
    COALESCE(clave_subcarpeta, '')
  );
`;

async function migrate() {
  await pool.query(SQL);
  const { rows } = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'drive_carpetas_expediente'
    ORDER BY ordinal_position
  `);

  console.log(JSON.stringify({
    ok: true,
    table: 'public.drive_carpetas_expediente',
    columns: rows,
  }, null, 2));
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
