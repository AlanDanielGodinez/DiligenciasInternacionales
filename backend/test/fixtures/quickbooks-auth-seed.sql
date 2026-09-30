-- TEST ONLY
-- NO PRODUCTION
-- QUICKBOOKS SANDBOX AUTH HARNESS
-- Fictitious administrator used only by the isolated local OAuth test.

BEGIN;

INSERT INTO public.catalogo_areas (id_area, clave, nombre, activo)
VALUES (950001, 'CONFIGURACION', 'CONFIGURACION TEST QUICKBOOKS', true);

INSERT INTO public.empleados
  (id_empleado, nombre, apellidos, correo, area, rol, activo)
VALUES
  (940001, 'QB SANDBOX ADMIN', 'TEST FICTICIO',
   'qb-sandbox-admin@example.invalid', 'CONFIGURACION', 'ADMIN', true);

COMMIT;
