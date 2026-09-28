const app = require('../src/app');
const { pool } = require('../src/config/db');

const evidence = [];
const created = { contactos: [], clientes: [], solicitudes: [], pagos: [], procesos: [] };
const record = (name, status, detail) => evidence.push({ name, status, detail });

async function http(base, method, path, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data;
  try { data = await response.json(); } catch { data = await response.text(); }
  return { status: response.status, data };
}

async function row(sql, values = []) { return (await pool.query(sql, values)).rows[0] || null; }
async function rows(sql, values = []) { return (await pool.query(sql, values)).rows; }

async function main() {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const suffix = Date.now();
  try {
    const db = await row('SELECT current_database() db,inet_server_addr() host,inet_server_port() port');
    record('Base activa', 'PASS', db);

    const visa = await row("SELECT id_tipo_tramite,nombre_tramite FROM tipos_tramite WHERE activo=true AND LOWER(nombre_tramite) LIKE '%visa%individual%' ORDER BY id_tipo_tramite LIMIT 1");
    const legalType = await row("SELECT id_tipo_tramite,nombre_tramite FROM tipos_tramite WHERE activo=true AND LOWER(nombre_tramite)='asesoría legal' LIMIT 1");
    const employee = await row('SELECT id_empleado,nombre,apellidos FROM empleados WHERE activo=true ORDER BY id_empleado LIMIT 1');

    const contactResponse = await http(base, 'POST', '/contactos', { nombre: `DEMO_VALIDACION_FLUJO_2026_${suffix}`, telefono: `555${String(suffix).slice(-7)}`, correo: `demo.validacion.${suffix}@example.invalid`, source_id: `DEMO_VALIDACION_FLUJO_2026_${suffix}` });
    const contact = contactResponse.data; created.contactos.push(contact.id_contacto);
    const contactDb = await row('SELECT * FROM contacto WHERE id_contacto=$1', [contact.id_contacto]);
    record('POST contacto', contactResponse.status === 201 && contactDb?.source_id?.startsWith('DEMO_VALIDACION') ? 'PASS' : 'FAIL', { http: contactResponse.status, id_contacto: contact.id_contacto, db: contactDb });

    const clientResponse = await http(base, 'POST', `/contactos/${contact.id_contacto}/aplicantes`, { nombre: 'DEMO', apellido_paterno: 'VALIDACION', apellido_materno: 'FLUJO 2026', telefono: contact.telefono, id_pais: 1, source_id: `DEMO_VALIDACION_FLUJO_2026_CLIENTE_${suffix}` });
    const client = clientResponse.data; created.clientes.push(client.id_cliente);
    const clientDb = await row('SELECT * FROM clientes WHERE id_cliente=$1', [client.id_cliente]);
    record('POST aplicante', clientResponse.status === 201 && Number(clientDb?.id_contacto) === Number(contact.id_contacto) ? 'PASS' : 'FAIL', { http: clientResponse.status, id_cliente: client.id_cliente, id_contacto: clientDb?.id_contacto });

    async function createRequest(label, typeId = visa.id_tipo_tramite, originId = null) {
      const response = await http(base, 'POST', `/clientes/${client.id_cliente}/solicitudes`, { id_tipo_tramite: typeId, estado_actual: 102, fecha_inicio: new Date().toISOString().slice(0, 10), origen_registro: `DEMO_VALIDACION_FLUJO_2026_${label}`, observaciones: `DEMO_VALIDACION_FLUJO_2026 ${label}`, id_solicitud_origen: originId, creado_por: employee.id_empleado });
      const request = response.data; created.solicitudes.push(request.id_solicitud);
      return { response, request };
    }

    const normal = await createRequest('NORMAL');
    const normalId = normal.request.id_solicitud;
    const creationHistory = await rows('SELECT origen,descripcion FROM seguimientos WHERE id_solicitud=$1 ORDER BY creado_en', [normalId]);
    record('POST solicitud', normal.response.status === 201 && creationHistory.length === 1 ? 'PASS' : 'FAIL', { http: normal.response.status, id_solicitud: normalId, id_cliente: normal.request.id_cliente, estado: normal.request.estado_actual, seguimiento: creationHistory });

    const move = await http(base, 'PATCH', `/solicitudes/${normalId}/mover-area`, { area_destino: 'PAGOS', origen: 'DEMO_VALIDACION_ENVIADO_PAGOS', descripcion: 'DEMO enviado a PAGOS' });
    const movedDb = await row('SELECT s.id_area_actual,a.clave FROM solicitudes s LEFT JOIN catalogo_areas a ON a.id_area=s.id_area_actual WHERE s.id_solicitud=$1', [normalId]);
    record('Mover a PAGOS', move.status === 200 && movedDb?.clave === 'PAGOS' ? 'PASS' : 'FAIL', { http: move.status, db: movedDb });

    const paymentResponse = await http(base, 'POST', `/solicitudes/${normalId}/pagos`, { monto: 1, moneda: 'MXN', concepto: 'DEMO_VALIDACION_FLUJO_2026', metodo_pago: 'DEMO', registrado_por: employee.id_empleado });
    const payment = paymentResponse.data?.pago; created.pagos.push(payment?.id_pago);
    const paymentDb = await row('SELECT * FROM pagos WHERE id_pago=$1', [payment?.id_pago]);
    record('Registrar pago', paymentResponse.status === 201 && paymentDb?.estado_pago === 'registrado' ? 'PASS' : 'FAIL', { http: paymentResponse.status, id_pago: payment?.id_pago, estado: paymentDb?.estado_pago });

    const validate = await http(base, 'PATCH', `/pagos/${payment.id_pago}/validar`, { validado_por: employee.id_empleado, enviar_post_pago: true });
    const validated = await row('SELECT p.estado_pago,s.estado_actual,e.valor,a.clave area FROM pagos p JOIN solicitudes s USING(id_solicitud) LEFT JOIN catalogo_estatus e ON e.id=s.estado_actual LEFT JOIN catalogo_areas a ON a.id_area=s.id_area_actual WHERE p.id_pago=$1', [payment.id_pago]);
    record('Validar pago y post-pago', validate.status === 200 && validated?.estado_pago === 'validado' && validated?.area === 'INDIVIDUALES' ? 'PASS' : 'FAIL', { http: validate.status, db: validated, destino: validate.data?.destino_sugerido, envio: validate.data?.envio_post_pago?.destino });

    const beforeNegative = await rows("SELECT * FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='NEGADOS'", [normalId]);
    const negative = await http(base, 'PATCH', `/solicitudes/${normalId}`, { resultado: 'NEGADO', estado_actual: 303, origen: 'DEMO_VALIDACION_RESULTADO_NEGADO', descripcion: 'DEMO resultado negado' });
    const process = await row("SELECT * FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='NEGADOS'", [normalId]); created.procesos.push(process.id_proceso);
    const entryHistory = await rows("SELECT * FROM seguimientos WHERE id_solicitud=$1 AND origen='negados_entrada'", [normalId]);
    record('Entrada automática Negados', negative.status === 200 && beforeNegative.length === 0 && process && entryHistory.length === 1 ? 'PASS' : 'FAIL', { http: negative.status, proceso: process, eventos: entryHistory.length });

    const originalEntry = process.fecha_entrada;
    const repeatNegative = await http(base, 'PATCH', `/solicitudes/${normalId}`, { resultado: 'NEGADO' });
    const repeatProcesses = await rows("SELECT * FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='NEGADOS'", [normalId]);
    const repeatHistory = await rows("SELECT * FROM seguimientos WHERE id_solicitud=$1 AND origen='negados_entrada'", [normalId]);
    record('Idempotencia NEGADO', repeatNegative.status === 200 && repeatProcesses.length === 1 && repeatHistory.length === 1 && String(repeatProcesses[0].fecha_entrada) === String(originalEntry) ? 'PASS' : 'FAIL', { http: repeatNegative.status, procesos: repeatProcesses.length, eventos: repeatHistory.length, fecha_entrada: repeatProcesses[0]?.fecha_entrada });

    const manage = await http(base, 'PATCH', `/negados/${normalId}`, { id_responsable_proceso: employee.id_empleado, resultado_analisis: 'DAR_SEGUIMIENTO', id_empleado: employee.id_empleado });
    const solicitudSnapshot = await row('SELECT estado_actual,id_area_actual,id_empleado_responsable FROM solicitudes WHERE id_solicitud=$1', [normalId]);
    const activity = await http(base, 'POST', `/negados/${normalId}/actividades`, { tipo: 'WHATSAPP', resultado: 'CONTACTADO', descripcion: 'DEMO WhatsApp', fecha_proxima_gestion: new Date(Date.now() + 86400000).toISOString().slice(0, 10), id_empleado: employee.id_empleado });
    const activityDb = await row("SELECT a.*,p.fecha_ultimo_contacto,p.fecha_proximo_contacto FROM actividades_solicitud a JOIN procesos_solicitud p ON p.id_proceso=a.id_proceso WHERE a.id_solicitud=$1 AND a.tipo='WHATSAPP' ORDER BY a.id_actividad DESC LIMIT 1", [normalId]);
    const solicitudAfterActivity = await row('SELECT estado_actual,id_area_actual,id_empleado_responsable FROM solicitudes WHERE id_solicitud=$1', [normalId]);
    record('Actividad Negados', activity.status === 200 && activityDb?.fecha_ultimo_contacto && JSON.stringify(solicitudSnapshot) === JSON.stringify(solicitudAfterActivity) ? 'PASS' : 'FAIL', { http: activity.status, actividad: activityDb, solicitud_sin_cambios: JSON.stringify(solicitudSnapshot) === JSON.stringify(solicitudAfterActivity) });

    const detailForQuestions = await http(base, 'GET', `/negados/${normalId}`);
    const catalogId = detailForQuestions.data?.catalog?.[0]?.id_pregunta;
    const questions = await http(base, 'PUT', `/negados/${normalId}/preguntas-consulado`, { id_preguntas: catalogId ? [catalogId] : [], otras: ['DEMO pregunta personalizada'], id_empleado: employee.id_empleado });
    const questionDb = await rows('SELECT id_pregunta,pregunta_personalizada FROM solicitud_preguntas_consulado WHERE id_solicitud=$1', [normalId]);
    record('Preguntas Consulado', questions.status === 200 && questionDb.some((item) => item.pregunta_personalizada === 'DEMO pregunta personalizada') ? 'PASS' : 'FAIL', { http: questions.status, catalogo: detailForQuestions.data?.catalog?.length, filas: questionDb });

    const surveyGetBefore = await http(base, 'GET', `/solicitudes/${normalId}/encuesta-satisfaccion`);
    const surveyPost = await http(base, 'POST', `/solicitudes/${normalId}/encuesta-satisfaccion`, { satisfaccion_general: 5, claridad_informacion: 5, calidad_atencion: 5, tiempo_respuesta: 5, utilidad_asesoria: 5, probabilidad_recomendacion: 10, fortalezas_servicio: 'DEMO', punto_mejora: 'DEMO' });
    const surveyGetAfter = await http(base, 'GET', `/solicitudes/${normalId}/encuesta-satisfaccion`);
    const surveyDb = await row('SELECT * FROM encuestas_satisfaccion WHERE id_solicitud=$1', [normalId]);
    record('Encuesta GET/POST', surveyGetBefore.status === 200 && surveyPost.status === 201 && surveyGetAfter.status === 200 && surveyDb ? 'PASS' : 'FAIL', { get_antes: surveyGetBefore.status, post: surveyPost.status, get_despues: surveyGetAfter.status, id_encuesta: surveyDb?.id_encuesta });

    const notesBefore = await rows('SELECT * FROM seguimientos WHERE id_solicitud=$1', [normalId]);
    const note = await http(base, 'POST', `/negados/${normalId}/notas`, { contenido: 'DEMO nota Negados', id_empleado: employee.id_empleado });
    const noteDb = await row("SELECT * FROM notas_solicitud WHERE id_solicitud=$1 AND contexto='NEGADOS' ORDER BY id_nota DESC LIMIT 1", [normalId]);
    const notesAfter = await rows('SELECT * FROM seguimientos WHERE id_solicitud=$1', [normalId]);
    record('Nota Negados sin ruido', note.status === 200 && noteDb && notesAfter.length === notesBefore.length ? 'PASS' : 'FAIL', { http: note.status, id_nota: noteDb?.id_nota, seguimientos_antes: notesBefore.length, seguimientos_despues: notesAfter.length });

    await http(base, 'POST', `/negados/${normalId}/actividades`, { tipo: 'RESPUESTA_CLIENTE', resultado: 'ASISTIRA', descripcion: 'DEMO reactivo', id_empleado: employee.id_empleado });
    const queueTests = [
      ['todos', ''], ['pendiente_contacto', 'cola=PENDIENTE_CONTACTO'], ['pendiente_respuesta', 'cola=PENDIENTE_RESPUESTA'], ['reactivos', 'cola=REACTIVO'], ['no_continuan', 'cola=NO_CONTINUA'], ['llamada_pendiente', 'cola=LLAMADA_PENDIENTE'], ['llamada_realizada', 'cola=LLAMADA_REALIZADA'], ['legal', 'cola=LEGAL'], ['cerrados', 'cola=CERRADO'],
      ['origen', 'origen=INDIVIDUALES'], [`responsable`, `responsable=${employee.id_empleado}`], ['encuesta', 'encuesta=completada'], ['preguntas', 'preguntas=registradas'], ['reaplicacion', 'reaplicacion=sin_fecha'],
    ];
    for (const [label, query] of queueTests) {
      const response = await http(base, 'GET', `/negados?limit=100&${query}`);
      record(`Filtro Negados ${label}`, response.status === 200 ? 'PASS' : 'FAIL', { request: query, http: response.status, cantidad: response.data?.data?.length, ids: response.data?.data?.map((item) => item.id_solicitud) });
    }

    const beforeLegal = { solicitud: await row('SELECT id_area_actual,id_empleado_responsable FROM solicitudes WHERE id_solicitud=$1', [normalId]), negados: await row("SELECT id_proceso,estado_proceso,id_responsable_proceso,fecha_proximo_contacto FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='NEGADOS'", [normalId]) };
    const sendLegal = await http(base, 'POST', `/negados/${normalId}/legal`, { motivo: 'DEMO análisis Legal', notas: 'DEMO', id_empleado: employee.id_empleado });
    const legalProcess = await row("SELECT * FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='LEGAL' AND fecha_salida IS NULL", [normalId]); created.procesos.push(legalProcess.id_proceso);
    const legalCase = await row('SELECT * FROM casos_legales WHERE id_proceso_legal=$1', [legalProcess.id_proceso]);
    const afterLegal = { solicitud: await row('SELECT id_area_actual,id_empleado_responsable FROM solicitudes WHERE id_solicitud=$1', [normalId]), negados: await row('SELECT id_proceso,estado_proceso,id_responsable_proceso,fecha_proximo_contacto FROM procesos_solicitud WHERE id_proceso=$1', [process.id_proceso]) };
    record('Negados → Legal', sendLegal.status === 200 && Number(legalProcess.id_proceso_padre) === Number(process.id_proceso) && legalProcess.estado_proceso === 'PENDIENTE_ASIGNACION' && JSON.stringify(beforeLegal) === JSON.stringify(afterLegal) ? 'PASS' : 'FAIL', { http: sendLegal.status, legal: legalProcess, caso: legalCase, snapshot_conservado: JSON.stringify(beforeLegal) === JSON.stringify(afterLegal) });

    const sendAgain = await http(base, 'POST', `/negados/${normalId}/legal`, { motivo: 'DEMO repetido', id_empleado: employee.id_empleado });
    const openLegals = await rows("SELECT id_proceso FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='LEGAL' AND fecha_salida IS NULL", [normalId]);
    record('Idempotencia Negados → Legal', sendAgain.status === 200 && openLegals.length === 1 ? 'PASS' : 'FAIL', { http: sendAgain.status, abiertos: openLegals });

    const assign = await http(base, 'PATCH', `/legales/${legalProcess.id_proceso}`, { id_responsable_proceso: employee.id_empleado, estado_proceso: 'EN_ANALISIS', id_empleado: employee.id_empleado });
    const waiting = await http(base, 'PATCH', `/legales/${legalProcess.id_proceso}`, { estado_proceso: 'ESPERANDO_CLIENTE', id_empleado: employee.id_empleado });
    const resume = await http(base, 'PATCH', `/legales/${legalProcess.id_proceso}`, { estado_proceso: 'EN_ANALISIS', id_empleado: employee.id_empleado });
    const invalid = await http(base, 'PATCH', `/legales/${legalProcess.id_proceso}`, { estado_proceso: 'PENDIENTE_ASIGNACION', id_empleado: employee.id_empleado });
    record('Transiciones Legal', assign.status === 200 && waiting.status === 200 && resume.status === 200 && invalid.status === 400 ? 'PASS' : 'FAIL', { asignar: assign.status, esperar: waiting.status, reanudar: resume.status, invalida: invalid.status, error: invalid.data });

    const legalActivity = await http(base, 'POST', `/legales/${legalProcess.id_proceso}/actividades`, { tipo: 'LLAMADA', descripcion: 'DEMO llamada Legal', fecha_proxima_gestion: new Date(Date.now() + 172800000).toISOString().slice(0, 10), id_empleado: employee.id_empleado });
    const legalActivityDb = await row("SELECT * FROM actividades_solicitud WHERE id_proceso=$1 AND tipo='LLAMADA' ORDER BY id_actividad DESC LIMIT 1", [legalProcess.id_proceso]);
    const legalNote = await http(base, 'POST', `/legales/${legalProcess.id_proceso}/notas`, { contenido: 'DEMO nota Legal', id_empleado: employee.id_empleado });
    const legalNoteDb = await row("SELECT * FROM notas_solicitud WHERE id_proceso=$1 AND contexto='LEGAL' ORDER BY id_nota DESC LIMIT 1", [legalProcess.id_proceso]);
    record('Actividad y nota Legal', legalActivity.status === 200 && legalActivityDb && legalNote.status === 200 && legalNoteDb ? 'PASS' : 'FAIL', { actividad_http: legalActivity.status, actividad_proceso: legalActivityDb?.id_proceso, nota_http: legalNote.status, nota_contexto: legalNoteDb?.contexto });

    const missingResolution = await http(base, 'POST', `/legales/${legalProcess.id_proceso}/resolver`, { resultado: 'REGRESA_ORIGEN', id_empleado: employee.id_empleado });
    const resolve = await http(base, 'POST', `/legales/${legalProcess.id_proceso}/resolver`, { resultado: 'REGRESA_ORIGEN', resolucion: 'DEMO resolución devuelta a Negados', id_empleado: employee.id_empleado });
    const resolvedDb = await row('SELECT * FROM procesos_solicitud WHERE id_proceso=$1', [legalProcess.id_proceso]);
    record('Resolver Legal', missingResolution.status === 400 && resolve.status === 200 && resolvedDb?.estado_proceso === 'RESUELTO' ? 'PASS' : 'FAIL', { sin_resolucion: missingResolution.status, resolver: resolve.status, estado: resolvedDb?.estado_proceso, resultado: resolvedDb?.resultado_analisis, resolucion: resolvedDb?.resolucion });

    const beforeReturn = { solicitud: await row('SELECT id_area_actual,id_empleado_responsable FROM solicitudes WHERE id_solicitud=$1', [normalId]), negados: await row('SELECT id_responsable_proceso FROM procesos_solicitud WHERE id_proceso=$1', [process.id_proceso]) };
    const returned = await http(base, 'POST', `/legales/${legalProcess.id_proceso}/regresar-origen`, { id_empleado: employee.id_empleado });
    const afterReturn = { solicitud: await row('SELECT id_area_actual,id_empleado_responsable FROM solicitudes WHERE id_solicitud=$1', [normalId]), negados: await row('SELECT id_responsable_proceso FROM procesos_solicitud WHERE id_proceso=$1', [process.id_proceso]), legal: await row('SELECT estado_proceso,fecha_salida,resultado_cierre FROM procesos_solicitud WHERE id_proceso=$1', [legalProcess.id_proceso]) };
    const returnedQueue = await http(base, 'GET', `/negados?q=${normalId}`);
    const returnedDetail = await http(base, 'GET', `/negados/${normalId}`);
    record('Legal → Negados', returned.status === 200 && afterReturn.legal?.estado_proceso === 'CERRADO' && JSON.stringify(beforeReturn.solicitud) === JSON.stringify(afterReturn.solicitud) && beforeReturn.negados.id_responsable_proceso === afterReturn.negados.id_responsable_proceso ? 'PASS' : 'FAIL', { http: returned.status, after: afterReturn, cola: returnedQueue.data?.data?.[0]?.cola, resolucion_visible: returnedDetail.data?.legal_analysis });

    const legalViews = ['todos', 'nuevos', 'en_proceso', 'falta_cobro', 'foia', 'foia_especial_ama', 'negados_grupos', 'negados_individuales', 'terminados'];
    for (const view of legalViews) {
      const response = await http(base, 'GET', `/legales?vista=${view}&limit=100`);
      record(`Vista Legal ${view}`, response.status === 200 ? 'PASS' : 'FAIL', { http: response.status, cantidad: response.data?.data?.length, procesos: response.data?.data?.map((item) => item.id_proceso) });
    }
    for (const state of ['PENDIENTE_ASIGNACION', 'EN_ANALISIS', 'ESPERANDO_INFORMACION', 'ESPERANDO_CLIENTE', 'RESUELTO', 'CERRADO']) {
      const response = await http(base, 'GET', `/legales?estado=${state}&limit=100`);
      const valid = response.data?.data?.every((item) => item.estado_proceso === state);
      record(`Filtro estado Legal ${state}`, response.status === 200 && valid ? 'PASS' : 'FAIL', { http: response.status, cantidad: response.data?.data?.length, procesos: response.data?.data?.map((item) => item.id_proceso) });
    }

    const reapplication = await http(base, 'POST', `/negados/${normalId}/reaplicacion`, { id_empleado: employee.id_empleado });
    const reappliedId = reapplication.data?.id_solicitud; created.solicitudes.push(reappliedId);
    const reapplied = await row('SELECT * FROM solicitudes WHERE id_solicitud=$1', [reappliedId]);
    const reapRelation = await row("SELECT * FROM solicitudes_relaciones WHERE id_solicitud_origen=$1 AND id_solicitud_destino=$2 AND tipo_relacion='REAPLICACION'", [normalId, reappliedId]);
    const reapHistory = await rows('SELECT origen,descripcion FROM seguimientos WHERE id_solicitud=$1', [reappliedId]);
    const inheritance = await row('SELECT (SELECT COUNT(*) FROM pagos WHERE id_solicitud=$1) pagos,(SELECT COUNT(*) FROM documentos WHERE id_solicitud=$1) documentos,(SELECT COUNT(*) FROM perfiles_solicitud WHERE id_solicitud=$1) perfiles', [reappliedId]);
    record('Reaplicación', reapplication.status === 200 && Number(reapplied.id_cliente) === Number(client.id_cliente) && reapRelation && reapHistory.some((item) => item.origen === 'REAPLICACION_NEGADOS') && Number(inheritance.pagos) === 0 && Number(inheritance.documentos) === 0 && Number(inheritance.perfiles) === 0 ? 'PASS' : 'FAIL', { http: reapplication.status, origen: normalId, destino: reapplied, relacion: reapRelation, seguimiento: reapHistory, herencia: inheritance });

    const legalSource = await createRequest('LEGAL_SOURCE');
    const legalSourceId = legalSource.request.id_solicitud;
    await http(base, 'PATCH', `/solicitudes/${legalSourceId}/mover-area`, { area_destino: 'INDIVIDUALES', origen: 'DEMO' });
    await http(base, 'PATCH', `/solicitudes/${legalSourceId}`, { resultado: 'NEGADO', estado_actual: 303 });
    await http(base, 'PATCH', `/negados/${legalSourceId}`, { id_responsable_proceso: employee.id_empleado, resultado_analisis: 'REQUIERE_ANALISIS_LEGAL', id_empleado: employee.id_empleado });
    await http(base, 'POST', `/negados/${legalSourceId}/legal`, { motivo: 'DEMO nuevo trámite Legal', id_empleado: employee.id_empleado });
    const legalNew = await row("SELECT * FROM procesos_solicitud WHERE id_solicitud=$1 AND tipo_proceso='LEGAL' AND fecha_salida IS NULL", [legalSourceId]); created.procesos.push(legalNew.id_proceso);
    await http(base, 'PATCH', `/legales/${legalNew.id_proceso}`, { id_responsable_proceso: employee.id_empleado, estado_proceso: 'EN_ANALISIS', id_empleado: employee.id_empleado });
    await http(base, 'POST', `/legales/${legalNew.id_proceso}/resolver`, { resultado: 'REQUIERE_NUEVO_TRAMITE', resolucion: 'DEMO requiere Asesoría legal', id_empleado: employee.id_empleado });
    const newLegalRequest = await http(base, 'POST', `/legales/${legalNew.id_proceso}/nueva-solicitud`, { id_tipo_tramite: legalType.id_tipo_tramite, id_empleado: employee.id_empleado });
    const newLegalRequestId = newLegalRequest.data?.id_solicitud; created.solicitudes.push(newLegalRequestId);
    const newLegalDb = await row('SELECT s.*,a.clave area FROM solicitudes s LEFT JOIN catalogo_areas a ON a.id_area=s.id_area_actual WHERE s.id_solicitud=$1', [newLegalRequestId]);
    const newLegalRelation = await row("SELECT * FROM solicitudes_relaciones WHERE id_solicitud_origen=$1 AND id_solicitud_destino=$2 AND tipo_relacion='ORIGINA_TRAMITE_LEGAL'", [legalSourceId, newLegalRequestId]);
    const lackBefore = await http(base, 'GET', `/legales?vista=falta_cobro&q=${legalSourceId}`);
    record('Nuevo trámite Legal', newLegalRequest.status === 200 && Number(newLegalDb.id_cliente) === Number(client.id_cliente) && newLegalDb.area === 'PAGOS' && newLegalRelation && lackBefore.data?.data?.some((item) => Number(item.id_proceso) === Number(legalNew.id_proceso)) ? 'PASS' : 'FAIL', { http: newLegalRequest.status, solicitud: newLegalDb, relacion: newLegalRelation, falta_cobro_antes: lackBefore.data?.data?.map((item) => item.id_proceso) });

    const legalPaymentResponse = await http(base, 'POST', `/solicitudes/${newLegalRequestId}/pagos`, { monto: 1, moneda: 'MXN', concepto: 'DEMO COBRO LEGAL', metodo_pago: 'DEMO', registrado_por: employee.id_empleado });
    const legalPayment = legalPaymentResponse.data?.pago; created.pagos.push(legalPayment?.id_pago);
    const lackRegistered = await http(base, 'GET', `/legales?vista=falta_cobro&q=${legalSourceId}`);
    await http(base, 'PATCH', `/pagos/${legalPayment.id_pago}/validar`, { validado_por: employee.id_empleado });
    const lackValidated = await http(base, 'GET', `/legales?vista=falta_cobro&q=${legalSourceId}`);
    record('Falta de cobro antes/después', !lackRegistered.data?.data?.some((item) => Number(item.id_proceso) === Number(legalNew.id_proceso)) && !lackValidated.data?.data?.some((item) => Number(item.id_proceso) === Number(legalNew.id_proceso)) ? 'PASS' : 'FAIL', { registrado: lackRegistered.data?.data?.map((item) => item.id_proceso), validado: lackValidated.data?.data?.map((item) => item.id_proceso) });

    const additional = await createRequest('ADICIONAL', visa.id_tipo_tramite, newLegalRequestId);
    const additionalRelation = await row("SELECT * FROM solicitudes_relaciones WHERE id_solicitud_origen=$1 AND id_solicitud_destino=$2 AND tipo_relacion='NUEVO_TRAMITE'", [newLegalRequestId, additional.request.id_solicitud]);
    record('Trámite adicional relacionado', additional.response.status === 201 && additionalRelation ? 'PASS' : 'FAIL', { http: additional.response.status, destino: additional.request.id_solicitud, relacion: additionalRelation });

    const historyOrigins = await rows("SELECT id_solicitud,origen,descripcion FROM seguimientos WHERE id_solicitud=ANY($1::int[]) ORDER BY creado_en", [created.solicitudes.filter(Boolean)]);
    const activityNoise = historyOrigins.filter((item) => ['WHATSAPP', 'LLAMADA', 'nota'].includes(item.origen));
    record('Historial sin ruido de actividades/notas', activityNoise.length === 0 ? 'PASS' : 'FAIL', { eventos: historyOrigins, ruido: activityNoise });

    console.log(JSON.stringify({ marker: `DEMO_VALIDACION_FLUJO_2026_${suffix}`, created, evidence }, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
