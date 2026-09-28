-- Synthetic schema for the isolated local test cluster only.
CREATE TABLE empleados(id_empleado int PRIMARY KEY,nombre text,apellidos text,area text,activo boolean);
CREATE TABLE solicitudes(id_solicitud int PRIMARY KEY,id_cliente int,id_area_actual int,id_empleado_responsable int,
 estado_actual int,id_tipo_tramite int,fecha_inicio date,actualizado_en timestamp,fecha_ultimo_movimiento timestamp);
CREATE TABLE notas_solicitud(id_nota serial PRIMARY KEY,id_solicitud int REFERENCES solicitudes,id_empleado int,
 contenido text,contexto text,creado_en timestamp DEFAULT NOW());
CREATE TABLE seguimientos(id_seguimiento serial PRIMARY KEY,id_solicitud int,origen text,id_empleado_responsable int,
 fecha_seguimiento date,estado_anterior int,estado_nuevo int);
CREATE TABLE perfiles_solicitud(id_perfil int PRIMARY KEY,id_solicitud int);
CREATE TABLE perfiles_solicitud_versiones(id_version serial PRIMARY KEY,id_perfil int,version int,respuestas_json jsonb,
 repetibles_snapshot_json jsonb,estado_snapshot text,creado_en timestamp);
CREATE TABLE documentos(id_documento serial PRIMARY KEY,id_solicitud int,origen_documento text,fecha_subida timestamp);
CREATE TABLE pagos(id_pago serial PRIMARY KEY,id_solicitud int,estado_pago text,creado_en timestamp,fecha_validacion timestamp,source_id text,fecha_pago date);
CREATE TABLE actividades_solicitud(id_actividad serial PRIMARY KEY,id_solicitud int,tipo text,fecha_actividad timestamp);
CREATE TABLE tipos_tramite(id_tipo_tramite int PRIMARY KEY,nombre_tramite text);
CREATE TABLE perfil_plantillas(id_plantilla serial PRIMARY KEY,nombre text,clave text UNIQUE,version int,activo boolean,
 id_tipo_tramite int,id_pais int,estructura_json jsonb,creado_en timestamp,actualizado_en timestamp);
CREATE TABLE catalogo_paises(id_pais int PRIMARY KEY,nombre_pais text);
CREATE TABLE catalogo_estatus(id int PRIMARY KEY,valor text);
CREATE TABLE clientes(id_cliente int PRIMARY KEY,nombre text,apellido_paterno text,apellido_materno text,id_contacto int);
CREATE TABLE contacto(id_contacto int PRIMARY KEY,nombre text);
CREATE TABLE grupos_ama(id_grupo_ama int PRIMARY KEY,nombre_grupo text,id_tipo_tramite int,id_pais int,
 fecha_tentativa_salida date,fecha_confirmada_salida date,estado_grupo text,cupo_estimado int,id_empleado_responsable int,
 observaciones text,activo boolean DEFAULT true,creado_en timestamp DEFAULT NOW(),actualizado_en timestamp DEFAULT NOW());
CREATE TABLE grupo_ama_solicitudes(id_grupo_ama_solicitud serial PRIMARY KEY,id_grupo_ama int,id_solicitud int,id_cliente int,
 activo boolean DEFAULT true,agregado_en timestamp DEFAULT NOW());
CREATE TABLE grupo_ama_checklist(id_checklist serial PRIMARY KEY,id_grupo_ama int,activo boolean,completado boolean);
