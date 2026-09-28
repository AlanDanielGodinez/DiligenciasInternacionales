const { pool } = require('../config/db');
const { ULTIMO_PAGO_ORDER } = require('./pagosResumen.sql');

// DATE and legacy TIMESTAMP represent business wall time, not browser time.
// Existing writers use NOW() into TIMESTAMP; use their database session zone by default.
const TIME_ZONE = null;
const ACTIVITY_SQL = `
WITH bases AS (
 SELECT s.id_solicitud, LEAST(
   s.fecha_asignacion_asesor AT TIME ZONE $2,
   (SELECT MIN(h.fecha_seguimiento::timestamp) FROM public.seguimientos h
    WHERE h.id_solicitud=s.id_solicitud AND h.origen='asesor_asignado'
      AND h.id_empleado_responsable IS NOT NULL)
 ) AS fecha_base FROM public.solicitudes s WHERE s.id_solicitud=ANY($1::int[])
), versiones AS (
 SELECT p.id_solicitud,v.creado_en,v.version,
   ROW_NUMBER() OVER w AS numero,
   v.respuestas_json IS DISTINCT FROM LAG(v.respuestas_json) OVER w
   OR v.repetibles_snapshot_json IS DISTINCT FROM LAG(v.repetibles_snapshot_json) OVER w
   OR v.estado_snapshot IS DISTINCT FROM LAG(v.estado_snapshot) OVER w AS cambio
 FROM public.perfiles_solicitud p JOIN public.perfiles_solicitud_versiones v USING(id_perfil)
 WHERE p.id_solicitud=ANY($1::int[])
 WINDOW w AS (PARTITION BY v.id_perfil ORDER BY v.version,v.id_version)
), eventos AS (
 SELECT id_solicitud,fecha_base AS fecha,'Asignación de asesor'::text AS tipo FROM bases
 UNION ALL
 SELECT id_solicitud,creado_en,CASE WHEN numero=1 THEN 'Creación de perfil' ELSE 'Actualización de perfil' END
 FROM versiones WHERE numero=1 OR cambio
 UNION ALL
 SELECT id_solicitud,fecha_subida,'Carga de documento' FROM public.documentos
 WHERE id_solicitud=ANY($1::int[]) AND origen_documento='documento_requerido'
 UNION ALL
 SELECT id_solicitud,CASE WHEN source_id IS NULL THEN creado_en ELSE fecha_pago::timestamp END,
   'Registro de pago' FROM public.pagos WHERE id_solicitud=ANY($1::int[])
   AND LOWER(COALESCE(estado_pago,''))<>'rechazado'
 UNION ALL
 SELECT id_solicitud,fecha_validacion,'Validación de pago' FROM public.pagos
 WHERE id_solicitud=ANY($1::int[])
   AND LOWER(COALESCE(estado_pago,''))='validado'
   AND fecha_validacion IS NOT NULL
 UNION ALL
 SELECT id_solicitud,fecha_actividad,'Contacto: '||tipo FROM public.actividades_solicitud
 WHERE id_solicitud=ANY($1::int[]) AND tipo IN ('LLAMADA','WHATSAPP','CORREO','REUNION','INTENTO_CONTACTO','RESPUESTA_CLIENTE','ANALISIS')
 UNION ALL
 SELECT id_solicitud,fecha_seguimiento::timestamp,
   CASE WHEN origen='seguimiento_operativo' THEN 'Seguimiento operativo' ELSE 'Cambio de estado' END
 FROM public.seguimientos WHERE id_solicitud=ANY($1::int[])
 AND (origen='seguimiento_operativo' OR
   (origen IN ('cambio_estado','edicion_expediente','aprobado','negado','pago_rechazado',
     'enviado_a_finanzas','enviado_a_ama','enviado_a_individuales','enviado_a_legal',
     'enviado_a_logistica','enviado_a_protocolos','enviado_a_negados','enviado_post_pago')
    AND estado_anterior IS NOT NULL AND estado_nuevo IS NOT NULL AND estado_anterior<>estado_nuevo))
), ultimos AS (
 SELECT b.*,e.fecha,e.tipo FROM bases b LEFT JOIN LATERAL (
   SELECT fecha,tipo FROM eventos WHERE id_solicitud=b.id_solicitud
    AND fecha IS NOT NULL AND fecha <= CURRENT_TIMESTAMP AT TIME ZONE $2
   ORDER BY fecha DESC,tipo LIMIT 1
 ) e ON true
)
SELECT u.id_solicitud,u.fecha_base::text AS fecha_base,
 u.fecha::text AS ultima_actividad_valida,u.tipo AS tipo_ultima_actividad,
 (u.fecha + INTERVAL '6 months')::text AS fecha_limite,
 COALESCE(u.fecha_base IS NOT NULL AND u.fecha_base <= CURRENT_TIMESTAMP AT TIME ZONE $2
   AND u.fecha + INTERVAL '6 months' > CURRENT_TIMESTAMP AT TIME ZONE $2,false) AS elegible_por_actividad,
 CASE WHEN u.fecha_base IS NULL THEN 'SIN_FECHA_BASE'
   WHEN u.fecha_base > CURRENT_TIMESTAMP AT TIME ZONE $2 THEN 'FECHA_BASE_FUTURA'
   WHEN u.fecha + INTERVAL '6 months' <= CURRENT_TIMESTAMP AT TIME ZONE $2 THEN 'SIN_ACTIVIDAD_6_MESES'
   ELSE NULL END AS motivo_bloqueo,
 FLOOR(EXTRACT(EPOCH FROM ((CURRENT_TIMESTAMP AT TIME ZONE $2)-u.fecha))/86400)::int AS dias_sin_movimiento,
 $2::text AS zona_horaria,p.estado_pago AS ultimo_pago_estado,p.id_pago AS ultimo_pago_id
FROM ultimos u LEFT JOIN LATERAL (
 SELECT p.id_pago,p.estado_pago FROM public.pagos p WHERE p.id_solicitud=u.id_solicitud
 ORDER BY ${ULTIMO_PAGO_ORDER} LIMIT 1
) p ON true`.replaceAll('$2', "COALESCE($2::text,current_setting('TimeZone'))");

async function getActividad(ids, query = pool.query.bind(pool)) {
  if (!ids.length) return [];
  return (await query(ACTIVITY_SQL, [ids, TIME_ZONE])).rows;
}
async function enrichActividad(rows, query = pool.query.bind(pool)) {
  const states = new Map((await getActividad(rows.map(r=>r.id_solicitud),query)).map(r=>[Number(r.id_solicitud),r]));
  return rows.map(row=>({...row,...states.get(Number(row.id_solicitud))}));
}
async function assertElegible(id, query) {
  const [state] = await getActividad([id],query);
  if (!state?.elegible_por_actividad) {
    const error = new Error(`Solicitud ${id}: No disponible para asignación a grupo. ${state?.motivo_bloqueo || 'SIN_FECHA_BASE'}. El expediente debe actualizarse antes de asignarlo a un grupo.`);
    error.status=409;
    error.details=state;
    throw error;
  }
  return state;
}
module.exports={getActividad,enrichActividad,assertElegible,ACTIVITY_SQL};
