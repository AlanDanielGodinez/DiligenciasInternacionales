BEGIN;

ALTER TABLE public.casos_legales
  ADD COLUMN IF NOT EXISTS tipos_legales TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS fecha_envio_solicitud DATE NULL,
  ADD COLUMN IF NOT EXISTS primer_mensaje_seguimiento BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS segundo_mensaje_seguimiento BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_casos_legales_tipos_documentados' AND conrelid = 'public.casos_legales'::regclass) THEN
    ALTER TABLE public.casos_legales ADD CONSTRAINT ck_casos_legales_tipos_documentados CHECK (
      tipos_legales <@ ARRAY['FOIA','PETICIÓN FAMILIAR (I-130)','VISA K-1','AJUSTE DE ESTATUS (I-485)','ASILO','REN GREEN CARD','PERMISO DE TRABAJO','CIUDADANÍA (N-400)','PETICIONES MIGRATORIAS','PERMISOS HUMANITARIOS','VISA DE TRABAJO CANADIENSE','TRADUCCIONES','APOSTILLA','VISA EMPLEADO DOMÉSTICO (B1)','DOBLE NACIONALIDAD','PERDÓN MIGRATORIO','SEGUIMIENTO','VISA U','VISA H2B','OTROS']::TEXT[]
    );
  END IF;
END $$;

COMMENT ON COLUMN public.casos_legales.tipos_legales IS 'EnumList documentado en AppSheet Legal; permite selección múltiple.';
COMMENT ON COLUMN public.casos_legales.fecha_envio_solicitud IS 'Fecha AppSheet usada como base de los recordatorios de seguimiento.';

COMMIT;
