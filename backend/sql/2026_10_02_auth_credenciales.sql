-- Fase 0 / Semana 1: credenciales de empleados y bitácora de accesos.
-- Idempotente. Ejecutar primero en una copia de la base y después en producción.
-- No asigna contraseñas: use `npm run auth:set-password -- --email <correo> --generar`
-- para cada empleado activo (ver docs/seguridad/semana1-seguridad.md).

BEGIN;

ALTER TABLE public.empleados
  ADD COLUMN IF NOT EXISTS password_hash text NULL,
  ADD COLUMN IF NOT EXISTS password_actualizado_en timestamptz NULL,
  ADD COLUMN IF NOT EXISTS debe_cambiar_password boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ultimo_login_en timestamptz NULL;

COMMENT ON COLUMN public.empleados.password_hash IS
  'Hash scrypt (scrypt$N$r$p$salt$hash). NULL = el empleado no puede iniciar sesión.';
COMMENT ON COLUMN public.empleados.password_actualizado_en IS
  'Cambia en cada alta/cambio de contraseña e invalida las sesiones emitidas antes.';

-- Un correo = un empleado (el login busca por lower(correo)).
-- Si este índice falla, hay correos duplicados: resuélvalos antes de continuar con
--   SELECT lower(correo), count(*) FROM public.empleados GROUP BY 1 HAVING count(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS empleados_correo_lower_uidx
  ON public.empleados (lower(correo))
  WHERE correo IS NOT NULL AND btrim(correo) <> '';

CREATE TABLE IF NOT EXISTS public.auditoria_accesos (
  id_auditoria bigserial PRIMARY KEY,
  evento varchar(60) NOT NULL,
  id_empleado integer NULL,
  correo varchar(254) NULL,
  exito boolean NOT NULL DEFAULT true,
  recurso varchar(500) NULL,
  ip varchar(64) NULL,
  user_agent varchar(300) NULL,
  detalle jsonb NULL,
  creado_en timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auditoria_accesos_creado_en_idx ON public.auditoria_accesos (creado_en DESC);
CREATE INDEX IF NOT EXISTS auditoria_accesos_empleado_idx ON public.auditoria_accesos (id_empleado, creado_en DESC);
CREATE INDEX IF NOT EXISTS auditoria_accesos_evento_idx ON public.auditoria_accesos (evento, creado_en DESC);

COMMIT;
