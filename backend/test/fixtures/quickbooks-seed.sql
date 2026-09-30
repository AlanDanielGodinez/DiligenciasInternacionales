-- TEST ONLY
-- NO PRODUCTION
-- QUICKBOOKS SANDBOX HARNESS
-- Fictitious records for validating one Customer mapping per cliente.

BEGIN;

INSERT INTO public.contacto (id_contacto, nombre)
VALUES (900001, 'CONTACTO TEST QUICKBOOKS');

INSERT INTO public.clientes
  (id_cliente, id_contacto, nombre, apellido_paterno, apellido_materno, telefono, correo)
VALUES
  (910001, 900001, 'CLIENTE TEST A', 'FICTICIO', NULL, '+1 555 010 0001', 'cliente-a@example.invalid'),
  (910002, 900001, 'CLIENTE TEST B', 'FICTICIO', NULL, '+1 555 010 0002', 'cliente-b@example.invalid');

INSERT INTO public.tipos_tramite (id_tipo_tramite, nombre_tramite)
VALUES (920001, 'TRAMITE TEST QUICKBOOKS');

INSERT INTO public.solicitudes (id_solicitud, id_cliente, id_tipo_tramite)
VALUES
  (930001, 910001, 920001),
  (930002, 910002, 920001);

COMMIT;
