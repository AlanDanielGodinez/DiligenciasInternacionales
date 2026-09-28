BEGIN;

CREATE TABLE IF NOT EXISTS public.perfil_respuestas_repetibles (
  id_repetible bigserial PRIMARY KEY,
  id_perfil integer NOT NULL REFERENCES public.perfiles_solicitud(id_perfil) ON DELETE CASCADE,
  grupo_key varchar(120) NOT NULL,
  item_uuid uuid NOT NULL,
  orden integer NOT NULL DEFAULT 0 CHECK (orden >= 0),
  datos_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(datos_json) = 'object'),
  creado_por integer NULL REFERENCES public.empleados(id_empleado),
  actualizado_por integer NULL REFERENCES public.empleados(id_empleado),
  creado_en timestamp NOT NULL DEFAULT NOW(),
  actualizado_en timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (id_perfil, grupo_key, item_uuid)
);

CREATE INDEX IF NOT EXISTS idx_perfil_repetibles_perfil_grupo_orden
  ON public.perfil_respuestas_repetibles(id_perfil, grupo_key, orden, id_repetible);

ALTER TABLE public.perfiles_solicitud
  ADD COLUMN IF NOT EXISTS completitud_porcentaje integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completitud_json jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.perfiles_solicitud_versiones
  ADD COLUMN IF NOT EXISTS repetibles_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS completitud_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS estado_snapshot varchar NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'perfiles_solicitud_estado_v2_check'
  ) THEN
    ALTER TABLE public.perfiles_solicitud
      ADD CONSTRAINT perfiles_solicitud_estado_v2_check
      CHECK (estado IN ('borrador', 'completo', 'archivado')) NOT VALID;
  END IF;
END $$;

COMMIT;
