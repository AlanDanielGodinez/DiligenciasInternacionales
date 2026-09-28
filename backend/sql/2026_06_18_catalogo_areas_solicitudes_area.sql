CREATE TABLE IF NOT EXISTS public.catalogo_areas (
  id_area integer PRIMARY KEY,
  clave varchar UNIQUE NOT NULL,
  nombre varchar NOT NULL,
  activo boolean DEFAULT true,
  creado_en timestamp DEFAULT now()
);

INSERT INTO public.catalogo_areas (id_area, clave, nombre, activo)
VALUES
  (1, 'INFORMES', 'Informes', true),
  (2, 'PAGOS', 'Finanzas / Pagos', true),
  (3, 'INDIVIDUALES', 'Individuales', true),
  (4, 'AMA', 'AMA', true),
  (5, 'LEGALES', 'Legales', true),
  (6, 'PROTOCOLO', 'Protocolo', true),
  (7, 'NEGADOS', 'Negados', true),
  (8, 'LOGISTICA', U&'Log\\00EDstica', true),
  (9, 'DS', 'DS', true),
  (10, 'PERFILES', 'Perfiles', true),
  (11, 'VUELOS', 'Vuelos', true),
  (12, 'ADMIN', U&'Administraci\\00F3n', true),
  (13, 'CONTABILIDAD', 'Contabilidad', true),
  (14, 'MARKETING', 'Marketing', true),
  (15, 'RECURSOS_HUMANOS', 'Recursos Humanos', true)
ON CONFLICT (id_area) DO UPDATE
SET clave = EXCLUDED.clave,
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo;

ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS id_area_actual integer NULL REFERENCES public.catalogo_areas(id_area),
  ADD COLUMN IF NOT EXISTS fecha_ultimo_movimiento timestamp NULL,
  ADD COLUMN IF NOT EXISTS fecha_proximo_contacto date NULL,
  ADD COLUMN IF NOT EXISTS resultado varchar NULL;
