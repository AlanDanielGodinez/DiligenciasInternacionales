BEGIN;

CREATE TABLE IF NOT EXISTS public.citas_individual_operacion (
  id_cita BIGSERIAL PRIMARY KEY,
  id_solicitud BIGINT NOT NULL REFERENCES public.solicitudes(id_solicitud),
  tipo TEXT NOT NULL CHECK (tipo IN ('CAS','CONSULADO','PASAPORTE')),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  lugar TEXT,
  id_empleado_responsable BIGINT REFERENCES public.empleados(id_empleado),
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_individual_solicitud ON public.citas_individual_operacion(id_solicitud, activo);
CREATE INDEX IF NOT EXISTS idx_citas_individual_fecha ON public.citas_individual_operacion(fecha, tipo) WHERE activo = TRUE;

CREATE TABLE IF NOT EXISTS public.ds_individual_actividades (
  id_actividad BIGSERIAL PRIMARY KEY,
  id_solicitud BIGINT NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_empleado BIGINT REFERENCES public.empleados(id_empleado),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  actividad TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ds_individual_solicitud ON public.ds_individual_actividades(id_solicitud, fecha DESC, id_actividad DESC);

COMMIT;
