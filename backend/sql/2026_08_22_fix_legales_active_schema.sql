BEGIN;

-- Corrección idempotente para la base activa que no recibió 2026_08_21.
ALTER TABLE public.procesos_solicitud DROP CONSTRAINT IF EXISTS ck_proceso_tipo;
ALTER TABLE public.procesos_solicitud
  ADD CONSTRAINT ck_proceso_tipo CHECK (tipo_proceso IN ('NEGADOS','LEGAL'));
ALTER TABLE public.procesos_solicitud
  ADD COLUMN IF NOT EXISTS id_proceso_padre INTEGER NULL,
  ADD COLUMN IF NOT EXISTS motivo_entrada TEXT NULL,
  ADD COLUMN IF NOT EXISTS resolucion TEXT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='procesos_solicitud_id_proceso_padre_fkey' AND conrelid='public.procesos_solicitud'::regclass) THEN
    ALTER TABLE public.procesos_solicitud ADD CONSTRAINT procesos_solicitud_id_proceso_padre_fkey
      FOREIGN KEY(id_proceso_padre) REFERENCES public.procesos_solicitud(id_proceso);
  END IF;
END $$;

DROP INDEX IF EXISTS public.ux_proceso_solicitud_tipo;
CREATE UNIQUE INDEX IF NOT EXISTS ux_proceso_negados_solicitud
  ON public.procesos_solicitud(id_solicitud) WHERE tipo_proceso='NEGADOS';
CREATE UNIQUE INDEX IF NOT EXISTS ux_proceso_legal_abierto
  ON public.procesos_solicitud(id_solicitud)
  WHERE tipo_proceso='LEGAL' AND fecha_salida IS NULL;
CREATE INDEX IF NOT EXISTS ix_procesos_tipo_estado_gestion
  ON public.procesos_solicitud(tipo_proceso,estado_proceso,fecha_proximo_contacto);

ALTER TABLE public.procesos_solicitud DROP CONSTRAINT IF EXISTS ck_proceso_legal_estado;
ALTER TABLE public.procesos_solicitud ADD CONSTRAINT ck_proceso_legal_estado CHECK (
  tipo_proceso <> 'LEGAL' OR estado_proceso IN
  ('PENDIENTE_ASIGNACION','EN_ANALISIS','ESPERANDO_INFORMACION','ESPERANDO_CLIENTE','RESUELTO','CERRADO')
);
ALTER TABLE public.procesos_solicitud DROP CONSTRAINT IF EXISTS ck_proceso_cierre_consistente;
ALTER TABLE public.procesos_solicitud ADD CONSTRAINT ck_proceso_cierre_consistente CHECK (
  tipo_proceso <> 'LEGAL' OR
  (estado_proceso='CERRADO' AND fecha_salida IS NOT NULL) OR
  (estado_proceso<>'CERRADO' AND fecha_salida IS NULL)
);

ALTER TABLE public.casos_legales
  ADD COLUMN IF NOT EXISTS id_proceso_legal INTEGER NULL,
  ADD COLUMN IF NOT EXISTS modalidad VARCHAR(30) NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='casos_legales_id_proceso_legal_fkey' AND conrelid='public.casos_legales'::regclass) THEN
    ALTER TABLE public.casos_legales ADD CONSTRAINT casos_legales_id_proceso_legal_fkey
      FOREIGN KEY(id_proceso_legal) REFERENCES public.procesos_solicitud(id_proceso);
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS ux_casos_legales_proceso_legal
  ON public.casos_legales(id_proceso_legal) WHERE id_proceso_legal IS NOT NULL;

-- id_proceso_origen es trazabilidad, no identidad 1:1: puede repetirse en análisis históricos.
DROP INDEX IF EXISTS public.ux_casos_legales_negados_proceso;
CREATE INDEX IF NOT EXISTS ix_casos_legales_proceso_origen
  ON public.casos_legales(id_proceso_origen) WHERE id_proceso_origen IS NOT NULL;

ALTER TABLE public.casos_legales DROP CONSTRAINT IF EXISTS ck_caso_legal_modalidad;
ALTER TABLE public.casos_legales ADD CONSTRAINT ck_caso_legal_modalidad CHECK (
  modalidad IS NULL OR modalidad IN ('ANALISIS_INTERNO','TRAMITE_CONTRATADO')
);
COMMENT ON COLUMN public.casos_legales.estado_caso IS 'LEGACY: usar procesos_solicitud.estado_proceso como fuente canonica';
COMMENT ON COLUMN public.casos_legales.id_responsable IS 'LEGACY: usar procesos_solicitud.id_responsable_proceso como fuente canonica';
COMMENT ON COLUMN public.casos_legales.id_proceso_origen IS 'Compatibilidad/trazabilidad; la relación oficial es procesos_solicitud.id_proceso_padre';

-- Migra cada detalle histórico aún no asociado; reutiliza un Legal abierto compatible.
DO $$ DECLARE c RECORD; nuevo_id INTEGER; BEGIN
  FOR c IN SELECT * FROM public.casos_legales WHERE id_proceso_legal IS NULL AND id_solicitud IS NOT NULL LOOP
    nuevo_id := NULL;
    SELECT id_proceso INTO nuevo_id FROM public.procesos_solicitud
      WHERE id_solicitud=c.id_solicitud AND tipo_proceso='LEGAL' AND fecha_salida IS NULL
      ORDER BY id_proceso LIMIT 1;
    IF nuevo_id IS NULL THEN
      INSERT INTO public.procesos_solicitud
        (id_solicitud,tipo_proceso,id_proceso_padre,id_responsable_proceso,estado_proceso,fecha_entrada,motivo_entrada)
      VALUES (c.id_solicitud,'LEGAL',c.id_proceso_origen,c.id_responsable,'PENDIENTE_ASIGNACION',
        COALESCE(c.fecha_inicio::timestamp,c.creado_en,NOW()),COALESCE(c.descripcion,c.tipo_caso))
      RETURNING id_proceso INTO nuevo_id;
    END IF;
    UPDATE public.casos_legales SET id_proceso_legal=nuevo_id,
      modalidad=COALESCE(modalidad,'ANALISIS_INTERNO') WHERE id_caso_legal=c.id_caso_legal;
  END LOOP;
END $$;

-- Repara únicamente el estado transitorio creado por la implementación anterior de Negados.
UPDATE public.procesos_solicitud p SET estado_proceso='PENDIENTE_CONTACTO',actualizado_en=NOW()
WHERE p.tipo_proceso='NEGADOS' AND p.estado_proceso='LEGAL'
  AND EXISTS (SELECT 1 FROM public.procesos_solicitud l
    WHERE l.id_proceso_padre=p.id_proceso AND l.tipo_proceso='LEGAL' AND l.fecha_salida IS NULL);

COMMIT;
