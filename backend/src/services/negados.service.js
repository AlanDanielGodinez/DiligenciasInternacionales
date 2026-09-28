const { pool } = require('../config/db');
const { positiveInteger, optionalPositiveInteger, optionalDate, trimString } = require('./solicitudes.service');
const badRequest = (m) => { const e = new Error(m); e.status = 400; return e; };
const ACTIVITY_TYPES = new Set(['LLAMADA','WHATSAPP','CORREO','REUNION','INTENTO_CONTACTO','RESPUESTA_CLIENTE','ANALISIS','OTRA']);
const ACTIVITY_RESULTS = new Set(['CONTACTADO','SIN_RESPUESTA','ASISTIRA','NO_ASISTIRA','LO_PENSARA','INTERESADO_REAPLICAR','NO_INTERESADO']);
const ANALYSIS_RESULTS = new Set(['NO_LISTO','DAR_SEGUIMIENTO','POSIBLE_REAPLICACION','REQUIERE_ANALISIS_LEGAL','NO_VIABLE','CLIENTE_NO_DESEA_CONTINUAR']);
const CLOSE_RESULTS = new Set(['REAPLICACION','CLIENTE_NO_CONTINUA','NO_VIABLE','SIN_RESPUESTA','DERIVADO_LEGAL','RESUELTO_OTRA_VIA','RESULTADO_CORREGIDO']);

async function ensureProcess(idSolicitud, query = pool.query.bind(pool)) {
  const id = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(`INSERT INTO public.procesos_solicitud(id_solicitud,tipo_proceso,id_area_origen,id_responsable_origen)
    SELECT id_solicitud,'NEGADOS',id_area_actual,id_empleado_responsable FROM public.solicitudes
    WHERE id_solicitud=$1 AND UPPER(COALESCE(resultado,''))='NEGADO'
    ON CONFLICT DO NOTHING RETURNING *`, [id]);
  if (rows[0]) return rows[0];
  const existing = await query("SELECT * FROM public.procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='NEGADOS' LIMIT 1", [id]);
  if (!existing.rows[0]) throw badRequest('La solicitud no tiene resultado NEGADO'); return existing.rows[0];
}

async function addImportantHistory(query, idSolicitud, description, origin, idEmployee = null) {
  const current = await query('SELECT estado_actual FROM public.solicitudes WHERE id_solicitud=$1', [idSolicitud]);
  if (!current.rows[0]) throw badRequest('Solicitud no encontrada');
  await query('SELECT pg_advisory_xact_lock(9021001)');
  await query(`INSERT INTO public.seguimientos(id_seguimiento,id_solicitud,estado_anterior,estado_nuevo,descripcion,id_empleado_responsable,fecha_seguimiento,origen,creado_en)
    VALUES(COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos),0)+1,$1,$2,$2,$3,$4,CURRENT_DATE,$5,NOW())`,
  [idSolicitud,current.rows[0].estado_actual,description,idEmployee,origin]);
}

const BASE = `WITH base AS (SELECT s.id_solicitud,s.id_cliente,s.id_tipo_tramite,s.id_area_actual,s.id_empleado_responsable,
  s.fecha_primera_aplicacion,s.fecha_proximo_contacto AS solicitud_proximo_contacto,s.resultado,
  c.nombre AS cliente_nombre,c.apellido_paterno,c.apellido_materno,c.telefono AS cliente_telefono,
  co.telefono AS contacto_telefono,tt.nombre_tramite,ca.nombre AS area_nombre,
  e.nombre AS asesor_nombre,e.apellidos AS asesor_apellidos,p.id_proceso,p.id_responsable_proceso,
  pe.nombre AS responsable_negados_nombre,pe.apellidos AS responsable_negados_apellidos,
  COALESCE(p.estado_proceso,'PENDIENTE_CONTACTO') AS estado_proceso,p.fecha_entrada,p.fecha_ultimo_contacto,
  p.fecha_proximo_contacto,p.respuesta_cliente,p.resultado_analisis,p.resultado_cierre,p.fecha_salida,
  CASE WHEN EXISTS(SELECT 1 FROM public.grupo_ama_solicitudes gas WHERE gas.id_solicitud=s.id_solicitud AND gas.activo=true)
    OR UPPER(COALESCE(tt.nombre_tramite,'')) LIKE '%AMA%' OR UPPER(COALESCE(ca.nombre,'')) LIKE '%AMA%' THEN 'AMA' ELSE 'INDIVIDUALES' END AS origen,
  (SELECT COUNT(*)::int FROM public.actividades_solicitud a WHERE a.id_solicitud=s.id_solicitud) AS actividades_count,
  (SELECT COUNT(*)::int FROM public.actividades_solicitud a WHERE a.id_solicitud=s.id_solicitud AND a.tipo='LLAMADA') AS llamadas_count,
  EXISTS(SELECT 1 FROM public.encuestas_satisfaccion es WHERE es.id_cliente=s.id_cliente) AS encuesta_completada,
  EXISTS(SELECT 1 FROM public.solicitud_preguntas_consulado sp WHERE sp.id_solicitud=s.id_solicitud) AS preguntas_registradas,
  EXISTS(SELECT 1 FROM public.procesos_solicitud lp WHERE lp.id_solicitud=s.id_solicitud AND lp.tipo_proceso='LEGAL' AND lp.fecha_salida IS NULL) AS tiene_legal
  FROM public.solicitudes s JOIN public.clientes c ON c.id_cliente=s.id_cliente LEFT JOIN public.contacto co ON co.id_contacto=c.id_contacto
  LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite=s.id_tipo_tramite LEFT JOIN public.catalogo_areas ca ON ca.id_area=s.id_area_actual
  LEFT JOIN public.empleados e ON e.id_empleado=s.id_empleado_responsable LEFT JOIN public.procesos_solicitud p ON p.id_solicitud=s.id_solicitud AND p.tipo_proceso='NEGADOS'
  LEFT JOIN public.empleados pe ON pe.id_empleado=p.id_responsable_proceso WHERE UPPER(COALESCE(s.resultado,''))='NEGADO'),
  enriched AS (SELECT *,CASE WHEN fecha_salida IS NOT NULL THEN 'CERRADO' WHEN tiene_legal THEN 'LEGAL'
    WHEN respuesta_cliente IN ('NO_ASISTIRA','NO_INTERESADO') THEN 'NO_CONTINUA' WHEN respuesta_cliente IN ('ASISTIRA','INTERESADO_REAPLICAR') THEN 'REACTIVO'
    WHEN actividades_count>0 THEN 'PENDIENTE_RESPUESTA' ELSE 'PENDIENTE_CONTACTO' END AS cola FROM base)`;

function filters(query, values) {
  const where=[]; const add=(sql,v)=>{values.push(v);where.push(sql.replace('?',`$${values.length}`));};
  if(query.q){values.push(`%${query.q.trim()}%`);const p=`$${values.length}`;where.push(`(id_solicitud::text ILIKE ${p} OR cliente_nombre ILIKE ${p} OR apellido_paterno ILIKE ${p} OR apellido_materno ILIKE ${p} OR cliente_telefono ILIKE ${p} OR contacto_telefono ILIKE ${p})`);}
  if(query.origen)add('origen=?',query.origen);
  if(query.cola==='LLAMADA_PENDIENTE')where.push("origen='AMA' AND llamadas_count=0");
  else if(query.cola==='LLAMADA_REALIZADA')where.push('llamadas_count>0');
  else if(query.cola)add('cola=?',query.cola);
  if(query.responsable)add('id_responsable_proceso=?',positiveInteger(query.responsable,'responsable'));
  if(query.encuesta)add('encuesta_completada=?',query.encuesta==='completada'); if(query.preguntas)add('preguntas_registradas=?',query.preguntas==='registradas');
  if(query.legal)add('tiene_legal=?',query.legal==='legal');
  if(query.reaplicacion==='sin_fecha')where.push('fecha_primera_aplicacion IS NULL');
  if(query.reaplicacion==='antes_10')where.push("fecha_primera_aplicacion IS NOT NULL AND fecha_primera_aplicacion > CURRENT_DATE-INTERVAL '10 months'");
  if(query.reaplicacion==='10_12')where.push("fecha_primera_aplicacion <= CURRENT_DATE-INTERVAL '10 months' AND fecha_primera_aplicacion > CURRENT_DATE-INTERVAL '12 months'");
  if(query.reaplicacion==='12_mas')where.push("fecha_primera_aplicacion <= CURRENT_DATE-INTERVAL '12 months'");
  return where;
}

async function list(query={}) {
  const page=Math.max(1,Number(query.page)||1),limit=Math.min(100,Math.max(1,Number(query.limit)||25)); const values=[]; const where=filters(query,values);
  const condition=where.length?`WHERE ${where.join(' AND ')}`:''; values.push(limit,(page-1)*limit);
  const {rows}=await pool.query(`${BASE} SELECT *,COUNT(*) OVER()::int AS total FROM enriched ${condition} ORDER BY COALESCE(fecha_proximo_contacto,CURRENT_DATE+INTERVAL '100 years'),id_solicitud DESC LIMIT $${values.length-1} OFFSET $${values.length}`,values);
  const countResult=await pool.query(`${BASE} SELECT COUNT(*)::int todos,COUNT(*) FILTER(WHERE fecha_salida IS NULL)::int activos,
    COUNT(*) FILTER(WHERE cola='PENDIENTE_CONTACTO')::int pendientes_contacto,COUNT(*) FILTER(WHERE cola='PENDIENTE_RESPUESTA')::int pendientes_respuesta,
    COUNT(*) FILTER(WHERE cola='REACTIVO')::int reactivos,COUNT(*) FILTER(WHERE cola='NO_CONTINUA')::int no_continuan,
    COUNT(*) FILTER(WHERE origen='AMA' AND llamadas_count=0)::int llamadas_pendientes,COUNT(*) FILTER(WHERE llamadas_count>0)::int llamadas_realizadas,
    COUNT(*) FILTER(WHERE cola='LEGAL')::int legal,COUNT(*) FILTER(WHERE cola='CERRADO')::int cerrados,
    COUNT(*) FILTER(WHERE fecha_primera_aplicacion<=CURRENT_DATE-INTERVAL '12 months')::int posible_reaplicacion FROM enriched`);
  const responsibleResult=await pool.query(`SELECT id_empleado,nombre,apellidos FROM public.empleados WHERE activo=true ORDER BY nombre,apellidos`);
  const total=rows[0]?.total||0; return {data:rows.map(({total:_,...r})=>r),pagination:{page,limit,total,total_pages:Math.ceil(total/limit)},metrics:countResult.rows[0],filter_counts:countResult.rows[0],filter_options:{responsables:responsibleResult.rows}};
}

async function detail(idSolicitud) {
  const process=await ensureProcess(idSolicitud); const [activities,notes,questions,catalog,relations,legal,legalAnalysis]=await Promise.all([
    pool.query(`SELECT a.*,e.nombre AS empleado_nombre,e.apellidos AS empleado_apellidos FROM public.actividades_solicitud a LEFT JOIN public.empleados e ON e.id_empleado=a.id_empleado WHERE a.id_proceso=$1 ORDER BY a.fecha_actividad DESC`,[process.id_proceso]),
    pool.query(`SELECT n.*,e.nombre AS empleado_nombre,e.apellidos AS empleado_apellidos,e.area AS empleado_area FROM public.notas_solicitud n LEFT JOIN public.empleados e ON e.id_empleado=n.id_empleado WHERE n.id_proceso=$1 ORDER BY n.creado_en DESC`,[process.id_proceso]),
    pool.query(`SELECT sp.*,cp.clave,COALESCE(cp.nombre,sp.pregunta_personalizada) AS nombre FROM public.solicitud_preguntas_consulado sp LEFT JOIN public.catalogo_preguntas_consulado cp ON cp.id_pregunta=sp.id_pregunta WHERE sp.id_proceso=$1 ORDER BY cp.orden,sp.id_solicitud_pregunta`,[process.id_proceso]),
    pool.query(`SELECT * FROM public.catalogo_preguntas_consulado WHERE activo=true ORDER BY orden`),
    pool.query(`SELECT * FROM public.solicitudes_relaciones WHERE id_solicitud_origen=$1 OR id_solicitud_destino=$1 ORDER BY creado_en DESC`,[process.id_solicitud]),
    pool.query(`SELECT * FROM public.casos_legales WHERE id_solicitud=$1 ORDER BY fecha_inicio DESC NULLS LAST LIMIT 1`,[process.id_solicitud]),
    pool.query(`SELECT lp.id_proceso,lp.id_proceso_padre,lp.estado_proceso,lp.resultado_analisis,lp.resolucion,
      lp.fecha_entrada,lp.fecha_salida,e.nombre responsable_nombre,e.apellidos responsable_apellidos
      FROM public.procesos_solicitud lp LEFT JOIN public.empleados e ON e.id_empleado=lp.id_responsable_proceso
      WHERE lp.id_proceso_padre=$1 AND lp.tipo_proceso='LEGAL'
      ORDER BY lp.fecha_entrada DESC,lp.id_proceso DESC LIMIT 1`,[process.id_proceso])]);
  const responsible=process.id_responsable_proceso
    ? (await pool.query('SELECT nombre,apellidos FROM public.empleados WHERE id_empleado=$1',[process.id_responsable_proceso])).rows[0]
    : null;
  return {process:{...process,responsable_nombre:responsible?.nombre||null,responsable_apellidos:responsible?.apellidos||null},activities:activities.rows,notes:notes.rows,questions:questions.rows,catalog:catalog.rows,relations:relations.rows,legal:legal.rows[0]||null,legal_analysis:legalAnalysis.rows[0]||null};
}

async function updateProcess(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud); const allowed={id_responsable_proceso:v=>optionalPositiveInteger(v,'id_responsable_proceso'),fecha_proximo_contacto:v=>optionalDate(v,'fecha_proximo_contacto'),resultado_analisis:v=>{if(v&&!ANALYSIS_RESULTS.has(v))throw badRequest('resultado_analisis invalid');return v||null;}};const set=[],vals=[];for(const[k,fn]of Object.entries(allowed))if(Object.hasOwn(payload,k)){vals.push(fn(payload[k]));set.push(`${k}=$${vals.length}`)}if(!set.length)throw badRequest('No valid fields');const employee=optionalPositiveInteger(payload.id_empleado,'id_empleado');const client=await pool.connect();try{await client.query('BEGIN');vals.push(p.id_proceso);await client.query(`UPDATE public.procesos_solicitud SET ${set.join(',')},actualizado_en=NOW() WHERE id_proceso=$${vals.length}`,vals);if(Object.hasOwn(payload,'id_responsable_proceso')&&Number(payload.id_responsable_proceso)!==Number(p.id_responsable_proceso))await addImportantHistory(client.query.bind(client),p.id_solicitud,'Responsable de Negados asignado o actualizado','negados_responsable',employee);if(Object.hasOwn(payload,'resultado_analisis')&&payload.resultado_analisis!==p.resultado_analisis)await addImportantHistory(client.query.bind(client),p.id_solicitud,`Evaluación Negados: ${payload.resultado_analisis||'sin resultado'}`,'negados_analisis',employee);await client.query('COMMIT')}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}return detail(idSolicitud); }
async function addActivity(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud);const type=String(payload.tipo||'').toUpperCase(),result=payload.resultado?String(payload.resultado).toUpperCase():null;if(!ACTIVITY_TYPES.has(type))throw badRequest('tipo invalid');if(result&&!ACTIVITY_RESULTS.has(result))throw badRequest('resultado invalid');const employee=optionalPositiveInteger(payload.id_empleado,'id_empleado');const next=optionalDate(payload.fecha_proxima_gestion,'fecha_proxima_gestion');const client=await pool.connect();try{await client.query('BEGIN');await client.query(`INSERT INTO public.actividades_solicitud(id_solicitud,id_proceso,id_empleado,tipo,resultado,descripcion,fecha_proxima_gestion)VALUES($1,$2,$3,$4,$5,$6,$7)`,[p.id_solicitud,p.id_proceso,employee,type,result,trimString(payload.descripcion),next]);await client.query(`UPDATE public.procesos_solicitud SET fecha_ultimo_contacto=CASE WHEN $1 IN ('LLAMADA','WHATSAPP','CORREO','REUNION','INTENTO_CONTACTO') THEN NOW() ELSE fecha_ultimo_contacto END,fecha_proximo_contacto=COALESCE($2,fecha_proximo_contacto),respuesta_cliente=COALESCE($3,respuesta_cliente),actualizado_en=NOW() WHERE id_proceso=$4`,[type,next,result,p.id_proceso]);await client.query('COMMIT')}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}return detail(idSolicitud); }
async function addNote(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud);const content=trimString(payload.contenido);if(!content)throw badRequest('contenido required');await pool.query(`INSERT INTO public.notas_solicitud(id_solicitud,id_proceso,id_empleado,contenido,contexto)VALUES($1,$2,$3,$4,'NEGADOS')`,[p.id_solicitud,p.id_proceso,optionalPositiveInteger(payload.id_empleado,'id_empleado'),content]);return detail(idSolicitud); }
async function setQuestions(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud);const ids=Array.isArray(payload.id_preguntas)?payload.id_preguntas.map(v=>positiveInteger(v,'id_pregunta')):[];const custom=Array.isArray(payload.otras)?payload.otras.map(trimString).filter(Boolean):[];const client=await pool.connect();try{await client.query('BEGIN');await client.query('DELETE FROM public.solicitud_preguntas_consulado WHERE id_proceso=$1',[p.id_proceso]);for(const id of ids)await client.query(`INSERT INTO public.solicitud_preguntas_consulado(id_solicitud,id_proceso,id_pregunta,id_empleado)VALUES($1,$2,$3,$4)`,[p.id_solicitud,p.id_proceso,id,optionalPositiveInteger(payload.id_empleado,'id_empleado')]);for(const text of custom)await client.query(`INSERT INTO public.solicitud_preguntas_consulado(id_solicitud,id_proceso,pregunta_personalizada,id_empleado)VALUES($1,$2,$3,$4)`,[p.id_solicitud,p.id_proceso,text,optionalPositiveInteger(payload.id_empleado,'id_empleado')]);await client.query('COMMIT');return detail(idSolicitud)}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()} }
async function sendLegal(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud);const employee=optionalPositiveInteger(payload.id_empleado,'id_empleado');const client=await pool.connect();try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock($1)',[710000000+p.id_solicitud]);let legal=(await client.query("SELECT * FROM public.procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='LEGAL' AND fecha_salida IS NULL LIMIT 1",[p.id_solicitud])).rows[0];if(!legal){legal=(await client.query(`INSERT INTO public.procesos_solicitud(id_solicitud,tipo_proceso,id_proceso_padre,estado_proceso,fecha_entrada,motivo_entrada) VALUES($1,'LEGAL',$2,'PENDIENTE_ASIGNACION',NOW(),$3) RETURNING *`,[p.id_solicitud,p.id_proceso,trimString(payload.motivo)||'Análisis derivado desde Negados'])).rows[0];await client.query(`INSERT INTO public.casos_legales(id_cliente,id_solicitud,tipo_caso,fecha_inicio,descripcion,observaciones,source_id,id_proceso_origen,id_proceso_legal,solicitado_por,modalidad) SELECT s.id_cliente,s.id_solicitud,'ANALISIS_NEGADOS',CURRENT_DATE,$2,$3,'NEGADOS:'||s.id_solicitud,$4,$5,$6,'ANALISIS_INTERNO' FROM public.solicitudes s WHERE s.id_solicitud=$1`,[p.id_solicitud,trimString(payload.motivo)||'Análisis derivado desde Negados',trimString(payload.notas),p.id_proceso,legal.id_proceso,employee]);await addImportantHistory(client.query.bind(client),p.id_solicitud,'Caso enviado a análisis Legal desde Negados','negados_legal',employee)}await client.query('COMMIT')}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}return detail(idSolicitud); }
async function close(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud),result=String(payload.resultado_cierre||'').toUpperCase();if(!CLOSE_RESULTS.has(result))throw badRequest('resultado_cierre invalid');const employee=optionalPositiveInteger(payload.id_empleado,'id_empleado');const client=await pool.connect();try{await client.query('BEGIN');await client.query(`UPDATE public.procesos_solicitud SET estado_proceso='CERRADO',resultado_cierre=$1,fecha_salida=COALESCE(fecha_salida,NOW()),actualizado_en=NOW() WHERE id_proceso=$2`,[result,p.id_proceso]);if(!p.fecha_salida)await addImportantHistory(client.query.bind(client),p.id_solicitud,`Proceso Negados cerrado: ${result}`,'negados_cierre',employee);await client.query('COMMIT')}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}return detail(idSolicitud); }
async function createReapplication(idSolicitud,payload={}) { const p=await ensureProcess(idSolicitud);const employee=optionalPositiveInteger(payload.id_empleado,'id_empleado');const client=await pool.connect();try{await client.query('BEGIN');const existing=await client.query(`SELECT sr.*,s.* FROM public.solicitudes_relaciones sr JOIN public.solicitudes s ON s.id_solicitud=sr.id_solicitud_destino WHERE sr.id_solicitud_origen=$1 AND sr.tipo_relacion='REAPLICACION' LIMIT 1`,[p.id_solicitud]);if(existing.rows[0]){await client.query('COMMIT');return existing.rows[0]}const original=(await client.query('SELECT * FROM public.solicitudes WHERE id_solicitud=$1 FOR UPDATE',[p.id_solicitud])).rows[0];const status=(await client.query(`SELECT id FROM public.catalogo_estatus WHERE UPPER(valor) LIKE '%PENDIENTE%ANTICIPO%' ORDER BY id LIMIT 1`)).rows[0];if(!status)throw badRequest('No existe estado inicial Pendiente de anticipo');const created=await client.query(`INSERT INTO public.solicitudes(id_cliente,id_tipo_tramite,estado_actual,fecha_inicio,origen_registro,observaciones,id_area_actual,creado_en,actualizado_en)VALUES($1,$2,$3,CURRENT_DATE,'REAPLICACION_NEGADOS',$4,$5,NOW(),NOW())RETURNING *`,[original.id_cliente,original.id_tipo_tramite,status.id,`Reaplicación originada desde solicitud #${original.id_solicitud}`,p.id_area_origen]);await client.query(`INSERT INTO public.solicitudes_relaciones(id_solicitud_origen,id_solicitud_destino,tipo_relacion,creado_por)VALUES($1,$2,'REAPLICACION',$3)`,[original.id_solicitud,created.rows[0].id_solicitud,employee]);await addImportantHistory(client.query.bind(client),created.rows[0].id_solicitud,`Solicitud creada por reaplicación de solicitud #${original.id_solicitud}`,'REAPLICACION_NEGADOS',employee);await client.query(`UPDATE public.procesos_solicitud SET estado_proceso='CERRADO',resultado_cierre='REAPLICACION',fecha_salida=NOW(),actualizado_en=NOW() WHERE id_proceso=$1`,[p.id_proceso]);await addImportantHistory(client.query.bind(client),p.id_solicitud,`Reaplicación creada como solicitud #${created.rows[0].id_solicitud}`,'negados_reaplicacion',employee);await client.query('COMMIT');return created.rows[0]}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()} }
module.exports={list,detail,ensureProcess,updateProcess,addActivity,addNote,setQuestions,sendLegal,close,createReapplication,__test:{BASE,filters,ACTIVITY_TYPES,ACTIVITY_RESULTS,ANALYSIS_RESULTS,CLOSE_RESULTS}};
