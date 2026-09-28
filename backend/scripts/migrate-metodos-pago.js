const { pool } = require('../src/config/db');

const seedMetodos = [
  ['Efectivo', 'Pago recibido en efectivo'],
  ['Transferencia bancaria', 'Pago por transferencia bancaria'],
  ['Tarjeta', 'Pago con tarjeta'],
  ['Depósito', 'Pago por depósito bancario'],
  ['Zelle', 'Pago por Zelle'],
  ['Otro', 'Otro método de pago'],
];

async function seedMetodo(nombreMetodo, descripcion) {
  await pool.query(
    `INSERT INTO public.metodos_pago (nombre_metodo, descripcion, activo, creado_en, actualizado_en)
     SELECT $1::varchar, $2::text, true, NOW(), NOW()
     WHERE NOT EXISTS (
       SELECT 1
       FROM public.metodos_pago
       WHERE lower(nombre_metodo) = lower($1::varchar)
     )`,
    [nombreMetodo, descripcion]
  );
}

async function migrate() {
  try {
    await pool.query('BEGIN');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.metodos_pago (
        id_metodo_pago SERIAL PRIMARY KEY,
        nombre_metodo VARCHAR(100) NOT NULL,
        descripcion TEXT NULL,
        activo BOOLEAN DEFAULT true,
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      ALTER TABLE public.metodos_pago
      ADD COLUMN IF NOT EXISTS nombre_metodo VARCHAR(100),
      ADD COLUMN IF NOT EXISTS descripcion TEXT NULL,
      ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW()
    `);

    await pool.query(`
      UPDATE public.metodos_pago
      SET activo = COALESCE(activo, true),
          creado_en = COALESCE(creado_en, NOW()),
          actualizado_en = COALESCE(actualizado_en, NOW())
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_metodos_pago_nombre_lower
      ON public.metodos_pago (lower(nombre_metodo))
    `);

    for (const [nombreMetodo, descripcion] of seedMetodos) {
      await seedMetodo(nombreMetodo, descripcion);
    }

    await pool.query('COMMIT');
    console.log('Migración de métodos de pago aplicada correctamente.');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error ejecutando migración de métodos de pago:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
