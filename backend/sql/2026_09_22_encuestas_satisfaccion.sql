BEGIN;

CREATE TABLE IF NOT EXISTS public.encuestas_satisfaccion (
  id_encuesta BIGSERIAL PRIMARY KEY,
  id_cliente INTEGER NOT NULL REFERENCES public.clientes(id_cliente),
  id_empleado INTEGER NULL REFERENCES public.empleados(id_empleado),
  id_solicitud INTEGER NULL REFERENCES public.solicitudes(id_solicitud),
  version_definicion INTEGER NOT NULL DEFAULT 1,
  satisfaccion_general SMALLINT NULL CHECK (satisfaccion_general BETWEEN 1 AND 5),
  claridad_informacion SMALLINT NULL CHECK (claridad_informacion BETWEEN 1 AND 5),
  calidad_atencion SMALLINT NULL CHECK (calidad_atencion BETWEEN 1 AND 5),
  tiempo_respuesta SMALLINT NULL CHECK (tiempo_respuesta BETWEEN 1 AND 5),
  utilidad_asesoria SMALLINT NULL CHECK (utilidad_asesoria BETWEEN 1 AND 5),
  fortalezas_servicio TEXT NULL,
  punto_mejora TEXT NULL,
  probabilidad_recomendacion SMALLINT NULL CHECK (probabilidad_recomendacion BETWEEN 0 AND 10),
  aprobado_negado VARCHAR(10) NULL CHECK (aprobado_negado IN ('Negado','Aprobado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS id_cliente INTEGER;
ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS id_empleado INTEGER;
ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS id_solicitud INTEGER;
ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS version_definicion INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS aprobado_negado VARCHAR(10);
ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.encuestas_satisfaccion ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS ix_encuestas_satisfaccion_cliente_fecha ON public.encuestas_satisfaccion(id_cliente, creado_en DESC);
CREATE INDEX IF NOT EXISTS ix_encuestas_satisfaccion_solicitud ON public.encuestas_satisfaccion(id_solicitud) WHERE id_solicitud IS NOT NULL;

COMMIT;
