const { pool } = require('../src/config/db');

async function migrate() {
  try {
    await pool.query('BEGIN');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.cotizaciones_viaje (
        id_cotizacion SERIAL PRIMARY KEY,
        id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
        tipo_servicio VARCHAR(50) NOT NULL,
        descripcion TEXT NULL,
        proveedor VARCHAR(150) NULL,
        monto_estimado NUMERIC(12,2) NULL,
        moneda VARCHAR(10) DEFAULT 'MXN',
        estado_cotizacion VARCHAR(50) DEFAULT 'pendiente',
        fecha_envio TIMESTAMP NULL,
        fecha_respuesta TIMESTAMP NULL,
        observaciones TEXT NULL,
        creado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW(),
        activo BOOLEAN DEFAULT true
      )
    `);

    await pool.query(`
      ALTER TABLE public.cotizaciones_viaje
      ADD COLUMN IF NOT EXISTS id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
      ADD COLUMN IF NOT EXISTS tipo_servicio VARCHAR(50) NOT NULL,
      ADD COLUMN IF NOT EXISTS descripcion TEXT NULL,
      ADD COLUMN IF NOT EXISTS proveedor VARCHAR(150) NULL,
      ADD COLUMN IF NOT EXISTS monto_estimado NUMERIC(12,2) NULL,
      ADD COLUMN IF NOT EXISTS moneda VARCHAR(10) DEFAULT 'MXN',
      ADD COLUMN IF NOT EXISTS estado_cotizacion VARCHAR(50) DEFAULT 'pendiente',
      ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS fecha_respuesta TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS observaciones TEXT NULL,
      ADD COLUMN IF NOT EXISTS creado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
      ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.itinerarios_viaje (
        id_itinerario SERIAL PRIMARY KEY,
        id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
        fecha_salida TIMESTAMP NULL,
        fecha_regreso TIMESTAMP NULL,
        origen VARCHAR(150) NULL,
        destino VARCHAR(150) NULL,
        aerolinea VARCHAR(150) NULL,
        numero_vuelo VARCHAR(100) NULL,
        hotel VARCHAR(150) NULL,
        direccion_hotel TEXT NULL,
        transporte_incluido BOOLEAN DEFAULT false,
        detalles TEXT NULL,
        estado_itinerario VARCHAR(50) DEFAULT 'pendiente',
        creado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
        creado_en TIMESTAMP DEFAULT NOW(),
        actualizado_en TIMESTAMP DEFAULT NOW(),
        activo BOOLEAN DEFAULT true
      )
    `);

    await pool.query(`
      ALTER TABLE public.itinerarios_viaje
      ADD COLUMN IF NOT EXISTS id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
      ADD COLUMN IF NOT EXISTS fecha_salida TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS fecha_regreso TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS origen VARCHAR(150) NULL,
      ADD COLUMN IF NOT EXISTS destino VARCHAR(150) NULL,
      ADD COLUMN IF NOT EXISTS aerolinea VARCHAR(150) NULL,
      ADD COLUMN IF NOT EXISTS numero_vuelo VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS hotel VARCHAR(150) NULL,
      ADD COLUMN IF NOT EXISTS direccion_hotel TEXT NULL,
      ADD COLUMN IF NOT EXISTS transporte_incluido BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS detalles TEXT NULL,
      ADD COLUMN IF NOT EXISTS estado_itinerario VARCHAR(50) DEFAULT 'pendiente',
      ADD COLUMN IF NOT EXISTS creado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
      ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true
    `);

    await pool.query(`
      UPDATE public.cotizaciones_viaje
      SET moneda = COALESCE(moneda, 'MXN'),
          estado_cotizacion = COALESCE(estado_cotizacion, 'pendiente'),
          activo = COALESCE(activo, true),
          creado_en = COALESCE(creado_en, NOW()),
          actualizado_en = COALESCE(actualizado_en, NOW())
    `);

    await pool.query(`
      UPDATE public.itinerarios_viaje
      SET transporte_incluido = COALESCE(transporte_incluido, false),
          estado_itinerario = COALESCE(estado_itinerario, 'pendiente'),
          activo = COALESCE(activo, true),
          creado_en = COALESCE(creado_en, NOW()),
          actualizado_en = COALESCE(actualizado_en, NOW())
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS ix_cotizaciones_viaje_solicitud
      ON public.cotizaciones_viaje(id_solicitud, activo)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS ix_cotizaciones_viaje_estado
      ON public.cotizaciones_viaje(estado_cotizacion, activo)
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_itinerario_viaje_activo_solicitud
      ON public.itinerarios_viaje(id_solicitud)
      WHERE activo = true
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS ix_itinerarios_viaje_estado
      ON public.itinerarios_viaje(estado_itinerario, activo)
    `);

    await pool.query('COMMIT');
    console.log('Migracion Viajes fase 1 completada');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error en migracion Viajes fase 1:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
