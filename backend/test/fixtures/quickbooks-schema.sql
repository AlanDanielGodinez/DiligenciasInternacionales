-- TEST ONLY
-- NO PRODUCTION
-- QUICKBOOKS SANDBOX HARNESS
--
-- Minimal base schema required before applying:
--   backend/sql/2026_08_03_quickbooks_integration.sql
--   backend/sql/2026_09_29_quickbooks_cliente_mapping.sql
--
-- This fixture is derived from the QuickBooks repository queries and existing
-- versioned test types. It is not a canonical or production database schema.

BEGIN;

CREATE TABLE public.contacto (
  id_contacto integer PRIMARY KEY,
  nombre text
);

CREATE TABLE public.clientes (
  id_cliente integer PRIMARY KEY,
  id_contacto integer,
  nombre text,
  apellido_paterno text,
  apellido_materno text,
  telefono text,
  correo text
);

CREATE TABLE public.tipos_tramite (
  id_tipo_tramite integer PRIMARY KEY,
  nombre_tramite text
);

CREATE TABLE public.solicitudes (
  id_solicitud integer PRIMARY KEY,
  id_cliente integer,
  id_tipo_tramite integer
);

COMMIT;
