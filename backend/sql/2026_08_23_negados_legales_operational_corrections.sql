BEGIN;

-- Los índices parciales son la identidad vigente. Esta función evita inferir
-- una restricción UNIQUE general que ya no debe existir.
CREATE OR REPLACE FUNCTION public.asegurar_proceso_negados()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE nuevo_proceso INTEGER;
BEGIN
  IF UPPER(COALESCE(NEW.resultado,'')) = 'NEGADO' THEN
    INSERT INTO public.procesos_solicitud
      (id_solicitud,tipo_proceso,id_area_origen,id_responsable_origen)
    VALUES
      (NEW.id_solicitud,'NEGADOS',NEW.id_area_actual,NEW.id_empleado_responsable)
    ON CONFLICT DO NOTHING
    RETURNING id_proceso INTO nuevo_proceso;

    IF nuevo_proceso IS NOT NULL THEN
      PERFORM pg_advisory_xact_lock(9021001);
      INSERT INTO public.seguimientos
        (id_seguimiento,id_solicitud,estado_anterior,estado_nuevo,descripcion,
         id_empleado_responsable,fecha_seguimiento,origen,creado_en)
      VALUES
        (COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos),0)+1,
         NEW.id_solicitud,NEW.estado_actual,NEW.estado_actual,
         'Entrada al proceso Negados',NEW.id_empleado_responsable,CURRENT_DATE,
         'negados_entrada',NOW());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
