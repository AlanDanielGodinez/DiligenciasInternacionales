const { pool } = require('../src/config/db');

async function migrate() {
  try {
    await pool.query('BEGIN');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.grupo_ama_checklist (
        id_checklist SERIAL PRIMARY KEY,
        id_grupo_ama INTEGER NOT NULL REFERENCES public.grupos_ama(id_grupo_ama) ON DELETE CASCADE,
        clave_item VARCHAR(80) NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        descripcion TEXT NULL,
        completado BOOLEAN DEFAULT false,
        fecha_completado TIMESTAMP NULL,
        completado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
        orden INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      ALTER TABLE public.grupo_ama_checklist
      ADD COLUMN IF NOT EXISTS id_grupo_ama INTEGER NOT NULL REFERENCES public.grupos_ama(id_grupo_ama) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS clave_item VARCHAR(80) NOT NULL,
      ADD COLUMN IF NOT EXISTS titulo VARCHAR(150) NOT NULL,
      ADD COLUMN IF NOT EXISTS descripcion TEXT NULL,
      ADD COLUMN IF NOT EXISTS completado BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS fecha_completado TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS completado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
      ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW()
    `);

    await pool.query(`
      UPDATE public.grupo_ama_checklist
      SET completado = COALESCE(completado, false),
          activo = COALESCE(activo, true),
          creado_en = COALESCE(creado_en, NOW()),
          actualizado_en = COALESCE(actualizado_en, NOW())
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_grupo_ama_checklist_clave_activa
      ON public.grupo_ama_checklist(id_grupo_ama, clave_item)
      WHERE activo = true
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS ix_grupo_ama_checklist_grupo
      ON public.grupo_ama_checklist(id_grupo_ama, activo, orden)
    `);

    await pool.query('COMMIT');
    console.log('Migracion checklist grupos AMA completada');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error en migracion checklist grupos AMA:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
