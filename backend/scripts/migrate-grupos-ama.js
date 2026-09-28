const { pool } = require('../src/config/db');

async function migrate() {
  await pool.query('BEGIN');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.grupos_ama (
        id_grupo_ama SERIAL PRIMARY KEY,
        nombre_grupo VARCHAR(150) NOT NULL,
        id_tipo_tramite INTEGER NULL REFERENCES public.tipos_tramite(id_tipo_tramite),
        id_pais INTEGER NULL REFERENCES public.catalogo_paises(id_pais),
        fecha_tentativa_salida DATE NULL,
        fecha_confirmada_salida DATE NULL,
        estado_grupo VARCHAR(50) NOT NULL DEFAULT 'activo',
        cupo_estimado INTEGER NULL,
        id_empleado_responsable INTEGER NULL REFERENCES public.empleados(id_empleado),
        observaciones TEXT NULL,
        activo BOOLEAN NOT NULL DEFAULT true,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      ALTER TABLE public.grupos_ama
      ADD COLUMN IF NOT EXISTS nombre_grupo VARCHAR(150),
      ADD COLUMN IF NOT EXISTS id_tipo_tramite INTEGER NULL REFERENCES public.tipos_tramite(id_tipo_tramite),
      ADD COLUMN IF NOT EXISTS id_pais INTEGER NULL REFERENCES public.catalogo_paises(id_pais),
      ADD COLUMN IF NOT EXISTS fecha_tentativa_salida DATE NULL,
      ADD COLUMN IF NOT EXISTS fecha_confirmada_salida DATE NULL,
      ADD COLUMN IF NOT EXISTS estado_grupo VARCHAR(50) NOT NULL DEFAULT 'activo',
      ADD COLUMN IF NOT EXISTS cupo_estimado INTEGER NULL,
      ADD COLUMN IF NOT EXISTS id_empleado_responsable INTEGER NULL REFERENCES public.empleados(id_empleado),
      ADD COLUMN IF NOT EXISTS observaciones TEXT NULL,
      ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW()
    `);

    await pool.query(`
      ALTER TABLE public.grupos_ama
      DROP CONSTRAINT IF EXISTS grupos_ama_estado_grupo_fkey
    `);

    await pool.query(`
      ALTER TABLE public.grupos_ama
      ALTER COLUMN estado_grupo TYPE VARCHAR(50) USING estado_grupo::varchar,
      ALTER COLUMN estado_grupo SET DEFAULT 'activo'
    `);

    await pool.query(`
      UPDATE public.grupos_ama
      SET nombre_grupo = COALESCE(nombre_grupo, 'Grupo AMA #' || id_grupo_ama::text)
      WHERE nombre_grupo IS NULL
    `);

    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS public.grupos_ama_id_grupo_ama_seq
    `);

    await pool.query(`
      SELECT setval(
        'public.grupos_ama_id_grupo_ama_seq',
        GREATEST(COALESCE((SELECT MAX(id_grupo_ama) FROM public.grupos_ama), 0), 1),
        true
      )
    `);

    await pool.query(`
      ALTER TABLE public.grupos_ama
      ALTER COLUMN id_grupo_ama SET DEFAULT nextval('public.grupos_ama_id_grupo_ama_seq')
    `);

    await pool.query(`
      ALTER TABLE public.grupos_ama
      ALTER COLUMN nombre_grupo SET NOT NULL
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.grupo_ama_solicitudes (
        id_grupo_ama_solicitud SERIAL PRIMARY KEY,
        id_grupo_ama INTEGER NOT NULL REFERENCES public.grupos_ama(id_grupo_ama) ON DELETE CASCADE,
        id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
        id_cliente INTEGER NULL REFERENCES public.clientes(id_cliente),
        agregado_en TIMESTAMP DEFAULT NOW(),
        activo BOOLEAN NOT NULL DEFAULT true
      )
    `);

    await pool.query(`
      ALTER TABLE public.grupo_ama_solicitudes
      ADD COLUMN IF NOT EXISTS id_grupo_ama INTEGER,
      ADD COLUMN IF NOT EXISTS id_solicitud INTEGER,
      ADD COLUMN IF NOT EXISTS id_cliente INTEGER NULL REFERENCES public.clientes(id_cliente),
      ADD COLUMN IF NOT EXISTS agregado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true
    `);

    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS public.grupo_ama_solicitudes_id_grupo_ama_solicitud_seq
    `);

    await pool.query(`
      SELECT setval(
        'public.grupo_ama_solicitudes_id_grupo_ama_solicitud_seq',
        GREATEST(COALESCE((SELECT MAX(id_grupo_ama_solicitud) FROM public.grupo_ama_solicitudes), 0), 1),
        true
      )
    `);

    await pool.query(`
      ALTER TABLE public.grupo_ama_solicitudes
      ALTER COLUMN id_grupo_ama_solicitud SET DEFAULT nextval('public.grupo_ama_solicitudes_id_grupo_ama_solicitud_seq')
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_grupo_ama_solicitud_activa
      ON public.grupo_ama_solicitudes(id_grupo_ama, id_solicitud)
      WHERE activo = true
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitud_grupo_ama_activa
      ON public.grupo_ama_solicitudes(id_solicitud)
      WHERE activo = true
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS ix_grupos_ama_tipo_pais
      ON public.grupos_ama(id_tipo_tramite, id_pais)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS ix_grupo_ama_solicitudes_grupo
      ON public.grupo_ama_solicitudes(id_grupo_ama, activo)
    `);

    await pool.query('COMMIT');
    console.log('Migracion grupos AMA completada');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Error en migracion grupos AMA:', error);
  process.exit(1);
});
