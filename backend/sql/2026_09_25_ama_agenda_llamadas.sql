BEGIN;

CREATE TABLE IF NOT EXISTS public.ama_llamadas_agendadas (
  id_llamada BIGSERIAL PRIMARY KEY,
  id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_empleado_responsable INTEGER NOT NULL REFERENCES public.empleados(id_empleado),
  id_grupo_ama BIGINT NULL REFERENCES public.grupos_ama(id_grupo_ama),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'LLAMADA',
  notas TEXT NULL,
  estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','REALIZADA','CANCELADA')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_ama_llamadas_fecha ON public.ama_llamadas_agendadas(fecha, hora);
CREATE INDEX IF NOT EXISTS ix_ama_llamadas_responsable ON public.ama_llamadas_agendadas(id_empleado_responsable, fecha);
CREATE INDEX IF NOT EXISTS ix_ama_llamadas_grupo ON public.ama_llamadas_agendadas(id_grupo_ama, fecha);
CREATE INDEX IF NOT EXISTS ix_ama_llamadas_solicitud ON public.ama_llamadas_agendadas(id_solicitud, fecha);

COMMIT;
