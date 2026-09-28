BEGIN;

-- AppSheet APLICANTES AMA.visa_recibida. Se mantiene en la solicitud canónica.
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS ama_visa_recibida BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS ama_visa_recibida_en TIMESTAMPTZ;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS ama_visa_recibida_por INTEGER REFERENCES public.empleados(id_empleado);

COMMIT;
