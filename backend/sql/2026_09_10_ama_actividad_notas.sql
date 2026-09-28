-- Aditiva: no actualiza expedientes ni notas históricos.
BEGIN;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS fecha_asignacion_asesor TIMESTAMPTZ;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS ama_asignacion_asesor_pendiente BOOLEAN NOT NULL DEFAULT false;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public'
    AND table_name='solicitudes' AND column_name='fecha_asignacion_asesor' AND data_type='timestamp with time zone') THEN
    RAISE EXCEPTION 'Revisar tipo y zona de fecha_asignacion_asesor existente antes de instalar AMA';
  END IF;
END;
$$;
ALTER TABLE public.notas_solicitud ADD COLUMN IF NOT EXISTS autor_nombre_historico TEXT;
ALTER TABLE public.notas_solicitud ADD COLUMN IF NOT EXISTS area_historica TEXT;
-- Captura solamente la primera asignación futura en AMA. Una reasignación no renueva el plazo.
CREATE OR REPLACE FUNCTION public.capturar_asignacion_asesor_ama() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='INSERT' AND NEW.id_area_actual=4 AND NEW.fecha_asignacion_asesor IS NULL THEN
    NEW.ama_asignacion_asesor_pendiente := true;
    IF NEW.id_empleado_responsable IS NOT NULL THEN
      NEW.fecha_asignacion_asesor := CURRENT_TIMESTAMP;
      NEW.ama_asignacion_asesor_pendiente := false;
    END IF;
  ELSIF NEW.id_area_actual=4 AND NEW.id_empleado_responsable IS NOT NULL
     AND NEW.fecha_asignacion_asesor IS NULL AND OLD.ama_asignacion_asesor_pendiente THEN
    NEW.fecha_asignacion_asesor := CURRENT_TIMESTAMP;
    NEW.ama_asignacion_asesor_pendiente := false;
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER capturar_asignacion_asesor_ama
BEFORE INSERT OR UPDATE OF id_empleado_responsable ON public.solicitudes
FOR EACH ROW EXECUTE FUNCTION public.capturar_asignacion_asesor_ama();
COMMIT;
