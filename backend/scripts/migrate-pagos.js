const { pool } = require('../src/config/db');

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pagos (
        id_pago SERIAL PRIMARY KEY,
        id_solicitud INTEGER,
        id_cliente INTEGER,
        monto NUMERIC(12,2),
        moneda VARCHAR(10),
        metodo_pago TEXT,
        estado_pago VARCHAR(30),
        fecha_pago DATE,
        referencia VARCHAR,
        comprobante_url VARCHAR,
        observaciones TEXT,
        creado_en TIMESTAMP DEFAULT NOW(),
        source_id VARCHAR
      )
    `);

    await client.query(`
      ALTER TABLE public.pagos
        ADD COLUMN IF NOT EXISTS concepto TEXT,
        ADD COLUMN IF NOT EXISTS id_documento_comprobante INTEGER NULL,
        ADD COLUMN IF NOT EXISTS registrado_por INTEGER NULL,
        ADD COLUMN IF NOT EXISTS validado_por INTEGER NULL,
        ADD COLUMN IF NOT EXISTS fecha_validacion TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW()
    `);

    await client.query(`
      ALTER TABLE public.pagos
        DROP CONSTRAINT IF EXISTS pagos_metodo_pago_fkey,
        DROP CONSTRAINT IF EXISTS pagos_estado_pago_fkey
    `);

    await client.query(`
      ALTER TABLE public.pagos
        ALTER COLUMN metodo_pago TYPE TEXT USING metodo_pago::text,
        ALTER COLUMN estado_pago TYPE VARCHAR(30) USING estado_pago::text,
        ALTER COLUMN moneda SET DEFAULT 'MXN',
        ALTER COLUMN estado_pago SET DEFAULT 'registrado',
        ALTER COLUMN creado_en SET DEFAULT NOW(),
        ALTER COLUMN actualizado_en SET DEFAULT NOW()
    `);

    await client.query(`
      UPDATE public.pagos
      SET estado_pago = CASE
        WHEN estado_pago IS NULL OR btrim(estado_pago) = '' THEN 'registrado'
        WHEN estado_pago = '1' THEN 'registrado'
        WHEN estado_pago = '2' THEN 'validado'
        WHEN estado_pago = '3' THEN 'rechazado'
        ELSE lower(estado_pago)
      END,
      moneda = COALESCE(NULLIF(btrim(moneda), ''), 'MXN'),
      concepto = COALESCE(NULLIF(btrim(concepto), ''), 'Pago de expediente'),
      creado_en = COALESCE(creado_en, NOW()),
      actualizado_en = COALESCE(actualizado_en, NOW())
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'pagos_id_solicitud_fkey'
        ) THEN
          ALTER TABLE public.pagos
            ADD CONSTRAINT pagos_id_solicitud_fkey
            FOREIGN KEY (id_solicitud) REFERENCES public.solicitudes(id_solicitud);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'pagos_id_cliente_fkey'
        ) THEN
          ALTER TABLE public.pagos
            ADD CONSTRAINT pagos_id_cliente_fkey
            FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'pagos_id_documento_comprobante_fkey'
        ) THEN
          ALTER TABLE public.pagos
            ADD CONSTRAINT pagos_id_documento_comprobante_fkey
            FOREIGN KEY (id_documento_comprobante) REFERENCES public.documentos(id_documento);
        END IF;
      END $$;
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_pagos_id_solicitud ON public.pagos(id_solicitud)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_pagos_estado_pago ON public.pagos(estado_pago)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_pagos_id_documento_comprobante ON public.pagos(id_documento_comprobante)');

    await client.query('COMMIT');
    console.log('Migracion de pagos aplicada correctamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al migrar pagos:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
