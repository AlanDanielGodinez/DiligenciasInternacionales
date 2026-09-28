BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.casos_legales_id_caso_legal_seq;
SELECT setval(
  'public.casos_legales_id_caso_legal_seq',
  GREATEST(COALESCE((SELECT MAX(id_caso_legal) FROM public.casos_legales), 0), 1),
  COALESCE((SELECT MAX(id_caso_legal) FROM public.casos_legales), 0) > 0
);
ALTER TABLE public.casos_legales
  ALTER COLUMN id_caso_legal SET DEFAULT nextval('public.casos_legales_id_caso_legal_seq');

ALTER TABLE public.casos_legales
  ADD COLUMN IF NOT EXISTS id_proceso_origen INTEGER NULL REFERENCES public.procesos_solicitud(id_proceso),
  ADD COLUMN IF NOT EXISTS solicitado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
  ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS ux_casos_legales_negados_proceso
  ON public.casos_legales(id_proceso_origen)
  WHERE id_proceso_origen IS NOT NULL;

SELECT pg_advisory_xact_lock(9021001);
INSERT INTO public.seguimientos(id_seguimiento,id_solicitud,estado_anterior,estado_nuevo,descripcion,id_empleado_responsable,fecha_seguimiento,origen,creado_en)
SELECT COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos),0)+ROW_NUMBER() OVER(ORDER BY p.id_proceso),
       p.id_solicitud,s.estado_actual,s.estado_actual,'Entrada al proceso Negados',p.id_responsable_origen,
       p.fecha_entrada::date,'negados_entrada',p.fecha_entrada
FROM public.procesos_solicitud p
JOIN public.solicitudes s ON s.id_solicitud=p.id_solicitud
WHERE p.tipo_proceso='NEGADOS'
  AND NOT EXISTS(SELECT 1 FROM public.seguimientos sg WHERE sg.id_solicitud=p.id_solicitud AND sg.origen='negados_entrada');

CREATE OR REPLACE FUNCTION public.asegurar_proceso_negados() RETURNS TRIGGER AS $$
DECLARE nuevo_proceso INTEGER;
BEGIN
  IF UPPER(COALESCE(NEW.resultado,'')) = 'NEGADO' THEN
    INSERT INTO public.procesos_solicitud(id_solicitud,tipo_proceso,id_area_origen,id_responsable_origen)
    VALUES(NEW.id_solicitud,'NEGADOS',NEW.id_area_actual,NEW.id_empleado_responsable)
    ON CONFLICT (id_solicitud,tipo_proceso) DO NOTHING
    RETURNING id_proceso INTO nuevo_proceso;
    IF nuevo_proceso IS NOT NULL THEN
      PERFORM pg_advisory_xact_lock(9021001);
      INSERT INTO public.seguimientos(id_seguimiento,id_solicitud,estado_anterior,estado_nuevo,descripcion,id_empleado_responsable,fecha_seguimiento,origen,creado_en)
      VALUES(COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos),0)+1,NEW.id_solicitud,NEW.estado_actual,NEW.estado_actual,
             'Entrada al proceso Negados',NEW.id_empleado_responsable,CURRENT_DATE,'negados_entrada',NOW());
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

COMMIT;
