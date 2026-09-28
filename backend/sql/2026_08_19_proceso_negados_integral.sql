BEGIN;

CREATE TABLE IF NOT EXISTS public.procesos_solicitud (
  id_proceso SERIAL PRIMARY KEY,
  id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  tipo_proceso VARCHAR(30) NOT NULL,
  id_responsable_proceso INTEGER NULL REFERENCES public.empleados(id_empleado),
  id_area_origen INTEGER NULL REFERENCES public.catalogo_areas(id_area),
  id_responsable_origen INTEGER NULL REFERENCES public.empleados(id_empleado),
  estado_proceso VARCHAR(40) NOT NULL DEFAULT 'PENDIENTE_CONTACTO',
  fecha_entrada TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_ultimo_contacto TIMESTAMP NULL,
  fecha_proximo_contacto DATE NULL,
  respuesta_cliente VARCHAR(40) NULL,
  resultado_analisis VARCHAR(50) NULL,
  resultado_cierre VARCHAR(50) NULL,
  fecha_salida TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_proceso_tipo CHECK (tipo_proceso IN ('NEGADOS'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_proceso_solicitud_tipo ON public.procesos_solicitud(id_solicitud,tipo_proceso);
CREATE INDEX IF NOT EXISTS ix_procesos_negados_estado ON public.procesos_solicitud(tipo_proceso,estado_proceso,fecha_proximo_contacto);

CREATE TABLE IF NOT EXISTS public.actividades_solicitud (
  id_actividad SERIAL PRIMARY KEY,
  id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_proceso INTEGER NULL REFERENCES public.procesos_solicitud(id_proceso),
  id_empleado INTEGER NULL REFERENCES public.empleados(id_empleado),
  tipo VARCHAR(30) NOT NULL,
  resultado VARCHAR(40) NULL,
  descripcion TEXT NULL,
  fecha_actividad TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_proxima_gestion DATE NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_actividades_proceso_fecha ON public.actividades_solicitud(id_proceso,fecha_actividad DESC);

CREATE TABLE IF NOT EXISTS public.notas_solicitud (
  id_nota SERIAL PRIMARY KEY,
  id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_proceso INTEGER NULL REFERENCES public.procesos_solicitud(id_proceso),
  id_empleado INTEGER NULL REFERENCES public.empleados(id_empleado),
  contenido TEXT NOT NULL,
  contexto VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_notas_solicitud_proceso ON public.notas_solicitud(id_solicitud,id_proceso,creado_en DESC);

CREATE TABLE IF NOT EXISTS public.catalogo_preguntas_consulado (
  id_pregunta SERIAL PRIMARY KEY,
  clave VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(180) NOT NULL,
  orden INTEGER NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS public.solicitud_preguntas_consulado (
  id_solicitud_pregunta SERIAL PRIMARY KEY,
  id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_proceso INTEGER NULL REFERENCES public.procesos_solicitud(id_proceso),
  id_pregunta INTEGER NULL REFERENCES public.catalogo_preguntas_consulado(id_pregunta),
  pregunta_personalizada TEXT NULL,
  id_empleado INTEGER NULL REFERENCES public.empleados(id_empleado),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_pregunta_consulado_origen CHECK (id_pregunta IS NOT NULL OR pregunta_personalizada IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitud_pregunta_catalogo ON public.solicitud_preguntas_consulado(id_solicitud,id_pregunta) WHERE id_pregunta IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.solicitudes_relaciones (
  id_relacion SERIAL PRIMARY KEY,
  id_solicitud_origen INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_solicitud_destino INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  tipo_relacion VARCHAR(30) NOT NULL,
  creado_por INTEGER NULL REFERENCES public.empleados(id_empleado),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(id_solicitud_origen,id_solicitud_destino,tipo_relacion)
);

INSERT INTO public.catalogo_preguntas_consulado(clave,nombre,orden) VALUES
('MOTIVO_VIAJE','Motivo del viaje',1),('DESTINO','Destino',2),('DURACION','Duración',3),
('HOSPEDAJE','Hospedaje',4),('FECHA_PREVISTA','Fecha prevista',5),
('VIAJES_ANTERIORES_EUA','Viajes anteriores a Estados Unidos',6),('TRABAJO','Trabajo',7),
('ANTIGUEDAD_LABORAL','Antigüedad laboral',8),('FAMILIA_LOCAL','Familia local',9)
ON CONFLICT (clave) DO UPDATE SET nombre=EXCLUDED.nombre,orden=EXCLUDED.orden,activo=TRUE;

CREATE OR REPLACE FUNCTION public.asegurar_proceso_negados() RETURNS TRIGGER AS $$
BEGIN
  IF UPPER(COALESCE(NEW.resultado,'')) = 'NEGADO' THEN
    INSERT INTO public.procesos_solicitud(id_solicitud,tipo_proceso,id_area_origen,id_responsable_origen)
    VALUES(NEW.id_solicitud,'NEGADOS',NEW.id_area_actual,NEW.id_empleado_responsable)
    ON CONFLICT (id_solicitud,tipo_proceso) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_asegurar_proceso_negados ON public.solicitudes;
CREATE TRIGGER trg_asegurar_proceso_negados AFTER INSERT OR UPDATE OF resultado ON public.solicitudes
FOR EACH ROW EXECUTE FUNCTION public.asegurar_proceso_negados();

COMMIT;
