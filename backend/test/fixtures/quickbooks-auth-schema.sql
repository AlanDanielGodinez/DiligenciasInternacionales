-- TEST ONLY
-- NO PRODUCTION
-- QUICKBOOKS SANDBOX AUTH HARNESS
--
-- Minimal schema read by backend/src/services/auth.service.js.
-- This is not a production migration or a canonical authentication schema.

BEGIN;

CREATE TABLE public.catalogo_areas (
  id_area integer PRIMARY KEY,
  clave text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true
);

CREATE TABLE public.empleados (
  id_empleado integer PRIMARY KEY,
  nombre text NOT NULL,
  apellidos text,
  correo text NOT NULL UNIQUE,
  area text,
  rol text,
  activo boolean NOT NULL DEFAULT true
);

COMMIT;
