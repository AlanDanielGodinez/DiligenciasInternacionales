ALTER TABLE public.contacto
  ADD COLUMN IF NOT EXISTS telefono_emergencia varchar;

ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS canal_contacto varchar;
