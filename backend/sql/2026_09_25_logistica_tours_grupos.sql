BEGIN;
CREATE TABLE IF NOT EXISTS public.tours_viaje (
 id_tour BIGSERIAL PRIMARY KEY, nombre_tour TEXT NOT NULL, fecha_hora_salida TIMESTAMP NOT NULL,
 fecha_hora_regreso TIMESTAMP NULL, capacidad INTEGER NULL CHECK(capacidad IS NULL OR capacidad>=0),
 costo_uno NUMERIC(12,2), costo_dos NUMERIC(12,2), costo_tres NUMERIC(12,2), costo_cuatro NUMERIC(12,2),
 descripcion TEXT, notas TEXT, lugar TEXT, gastos_fijos NUMERIC(12,2), activo BOOLEAN NOT NULL DEFAULT true,
 creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(), actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.grupos_viaje (
 id_grupo_viaje BIGSERIAL PRIMARY KEY, nombre TEXT NOT NULL, fecha_ida DATE, fecha_regreso DATE,
 notas TEXT, grupo_de_regreso BOOLEAN NOT NULL DEFAULT false, activo BOOLEAN NOT NULL DEFAULT true,
 creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(), actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.grupo_viaje_integrantes (
 id_grupo_viaje BIGINT NOT NULL REFERENCES public.grupos_viaje(id_grupo_viaje),
 id_solicitud INTEGER NOT NULL REFERENCES public.solicitudes(id_solicitud), activo BOOLEAN NOT NULL DEFAULT true,
 creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(id_grupo_viaje,id_solicitud)
);
CREATE INDEX IF NOT EXISTS ix_tours_viaje_salida ON public.tours_viaje(fecha_hora_salida);
CREATE INDEX IF NOT EXISTS ix_grupos_viaje_fechas ON public.grupos_viaje(fecha_ida,fecha_regreso);
CREATE INDEX IF NOT EXISTS ix_grupo_viaje_integrante_solicitud ON public.grupo_viaje_integrantes(id_solicitud);
COMMIT;
