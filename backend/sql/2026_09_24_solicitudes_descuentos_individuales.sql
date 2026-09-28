BEGIN;

ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS aplica_descuento BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS motivos_descuento TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_solicitudes_descuento_motivos' AND conrelid = 'public.solicitudes'::regclass) THEN
    ALTER TABLE public.solicitudes ADD CONSTRAINT ck_solicitudes_descuento_motivos CHECK (
      (aplica_descuento AND cardinality(motivos_descuento) >= 1)
      OR (NOT aplica_descuento AND cardinality(motivos_descuento) = 0)
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_solicitudes_descuento_catalogo' AND conrelid = 'public.solicitudes'::regclass) THEN
    ALTER TABLE public.solicitudes ADD CONSTRAINT ck_solicitudes_descuento_catalogo CHECK (
      motivos_descuento <@ ARRAY['DISCAPACIDAD', 'ADULTO_MAYOR']::TEXT[]
    );
  END IF;
END $$;

COMMIT;
