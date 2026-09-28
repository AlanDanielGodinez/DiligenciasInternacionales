BEGIN;

ALTER TABLE public.procesos_solicitud DROP CONSTRAINT IF EXISTS ck_proceso_tipo;
ALTER TABLE public.procesos_solicitud
  ADD CONSTRAINT ck_proceso_tipo CHECK (tipo_proceso IN ('NEGADOS','LEGAL')),
  ADD COLUMN IF NOT EXISTS id_proceso_padre INTEGER NULL REFERENCES public.procesos_solicitud(id_proceso),
  ADD COLUMN IF NOT EXISTS motivo_entrada TEXT NULL,
  ADD COLUMN IF NOT EXISTS resolucion TEXT NULL;

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
  ADD COLUMN IF NOT EXISTS id_proceso_legal INTEGER NULL REFERENCES public.procesos_solicitud(id_proceso),
  ADD COLUMN IF NOT EXISTS modalidad VARCHAR(30) NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_casos_legales_proceso_legal
  ON public.casos_legales(id_proceso_legal) WHERE id_proceso_legal IS NOT NULL;
ALTER TABLE public.casos_legales DROP CONSTRAINT IF EXISTS ck_caso_legal_modalidad;
ALTER TABLE public.casos_legales ADD CONSTRAINT ck_caso_legal_modalidad CHECK (
  modalidad IS NULL OR modalidad IN ('ANALISIS_INTERNO','TRAMITE_CONTRATADO')
);
COMMENT ON COLUMN public.casos_legales.estado_caso IS 'LEGACY: no usar como estado canonico; usar procesos_solicitud.estado_proceso';
COMMENT ON COLUMN public.casos_legales.id_responsable IS 'LEGACY: no usar como responsable canonico; usar procesos_solicitud.id_responsable_proceso';
COMMENT ON COLUMN public.casos_legales.id_proceso_origen IS 'LEGACY/trazabilidad; para procesos nuevos usar procesos_solicitud.id_proceso_padre';

DO $$ DECLARE c RECORD; nuevo_id INTEGER; BEGIN
  FOR c IN SELECT * FROM public.casos_legales WHERE id_proceso_legal IS NULL LOOP
    SELECT id_proceso INTO nuevo_id FROM public.procesos_solicitud
      WHERE id_solicitud=c.id_solicitud AND tipo_proceso='LEGAL' AND fecha_salida IS NULL LIMIT 1;
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

-- Corrige exclusivamente el estado transitorio legacy creado por Negados.
UPDATE public.procesos_solicitud p SET estado_proceso='PENDIENTE_CONTACTO',actualizado_en=NOW()
WHERE p.tipo_proceso='NEGADOS' AND p.estado_proceso='LEGAL'
  AND EXISTS (SELECT 1 FROM public.procesos_solicitud l WHERE l.id_proceso_padre=p.id_proceso AND l.tipo_proceso='LEGAL' AND l.fecha_salida IS NULL);

COMMIT;
