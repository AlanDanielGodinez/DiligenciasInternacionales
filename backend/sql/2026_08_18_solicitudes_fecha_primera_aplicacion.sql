BEGIN;
ALTER TABLE public.solicitudes
ADD COLUMN IF NOT EXISTS fecha_primera_aplicacion DATE NULL;
COMMENT ON COLUMN public.solicitudes.fecha_primera_aplicacion IS
'Fecha real de la primera aplicación o entrevista correspondiente a esta solicitud.';
COMMIT;
