const { pool } = require('../src/config/db');

const base = 'http://127.0.0.1:5000/api';
const marker = `DEMO_MOTOR_V2_${Date.now()}`;
const results = [];
const ids = { marker };

async function http(method, path, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}

const check = (name, pass, evidence) => results.push({ name, status: pass ? 'PASS' : 'FAIL', evidence });
const one = async (sql, params = []) => (await pool.query(sql, params)).rows[0];

(async () => {
  const template = await one("SELECT * FROM perfil_plantillas WHERE clave='DEMO_MOTOR_V2'");
  const v1Template = await one("SELECT * FROM perfil_plantillas WHERE clave='perfil_visa_individual'");
  const type = await one('SELECT id_tipo_tramite FROM tipos_tramite WHERE activo=true ORDER BY id_tipo_tramite LIMIT 1');
  const employee = await one('SELECT id_empleado FROM empleados WHERE activo=true ORDER BY id_empleado LIMIT 1');
  check('Plantilla V2 cargada', Number(template.estructura_json.schema_version) === 2, { id_plantilla: template.id_plantilla, schema_version: template.estructura_json.schema_version });

  const contact = await http('POST', '/contactos', { nombre: marker, telefono: '5550002026', correo: `${marker.toLowerCase()}@example.invalid`, source_id: marker });
  ids.id_contacto = contact.data?.id_contacto;
  check('Contacto DEMO', contact.status === 201, { http: contact.status, id_contacto: ids.id_contacto });
  const client = await http('POST', `/contactos/${ids.id_contacto}/aplicantes`, { nombre: 'DEMO', apellido_paterno: 'MOTOR', apellido_materno: 'V2', telefono: '5550002026', id_pais: 1, source_id: marker });
  ids.id_cliente = client.data?.id_cliente;
  check('Cliente DEMO', client.status === 201, { http: client.status, id_cliente: ids.id_cliente });

  const makeRequest = async (label) => http('POST', `/clientes/${ids.id_cliente}/solicitudes`, { id_tipo_tramite: type.id_tipo_tramite, estado_actual: 102, fecha_inicio: new Date().toISOString().slice(0, 10), origen_registro: marker, observaciones: `${marker} ${label}`, creado_por: employee.id_empleado });
  const request = await makeRequest('V2');
  ids.id_solicitud_v2 = request.data?.id_solicitud;
  check('Solicitud V2 DEMO', request.status === 201, { http: request.status, id_solicitud: ids.id_solicitud_v2 });

  const invalidDraft = await http('POST', `/solicitudes/${ids.id_solicitud_v2}/perfil`, { id_plantilla: template.id_plantilla, estado: 'borrador', respuestas_json: { correo: 'incorrecto' }, repeaters: {}, creado_por: employee.id_empleado });
  check('Borrador valida valores presentes', invalidDraft.status === 400 && invalidDraft.data?.error?.details?.errors?.[0]?.code === 'invalid_email', { http: invalidDraft.status, error: invalidDraft.data?.error });

  const draft = await http('POST', `/solicitudes/${ids.id_solicitud_v2}/perfil`, { id_plantilla: template.id_plantilla, estado: 'borrador', respuestas_json: { descripcion: 'Borrador incompleto DEMO_MOTOR_V2' }, repeaters: {}, creado_por: employee.id_empleado });
  ids.id_perfil_v2 = draft.data?.id_perfil;
  check('Guardar borrador incompleto', draft.status === 201 && draft.data?.estado === 'borrador', { http: draft.status, id_perfil: ids.id_perfil_v2 });
  const reopened = await http('GET', `/solicitudes/${ids.id_solicitud_v2}/perfil`);
  check('Reabrir y conservar borrador', reopened.status === 200 && reopened.data?.respuestas_json?.descripcion?.includes('DEMO_MOTOR_V2'), { http: reopened.status, version: reopened.data?.version_actual, completion: reopened.data?.completitud_porcentaje });

  const incomplete = await http('PATCH', `/perfiles/${ids.id_perfil_v2}`, { estado: 'completo', respuestas_json: reopened.data.respuestas_json, repeaters: {}, actualizado_por: employee.id_empleado });
  check('Completo con faltantes falla', incomplete.status === 400 && incomplete.data?.error?.details?.errors?.length > 0, { http: incomplete.status, errors: incomplete.data?.error?.details?.errors?.map((error) => error.path) });

  const answers = { nombre_demo: marker, descripcion: 'Todos los tipos', edad: 30, fecha: '2026-08-27', pais_demo: 'México', acepta: true, modalidad: 'Individual', idiomas: ['Español', 'Inglés'], correo: 'demo.motor.v2@example.invalid', telefono: '+52 555 000 2026', viajo_eeuu: false, detalle_viaje: 'Este valor debe conservarse oculto', referencia_bloqueada: 'Sólo lectura cuando viajo=false' };
  const repeaters = { familiares_eeuu: [
    { data: { nombre: 'Familiar Uno', relacion: 'Hermano', estatus: 'Residente', telefono: '+1 555 111 1111' } },
    { data: { nombre: 'Familiar Dos', relacion: 'Otro', estatus: 'Ciudadano' } },
  ] };
  const complete = await http('PATCH', `/perfiles/${ids.id_perfil_v2}`, { estado: 'completo', respuestas_json: answers, repeaters, motivo_cambio: marker, actualizado_por: employee.id_empleado });
  check('Marcar completo', complete.status === 200 && complete.data?.estado === 'completo', { http: complete.status, estado: complete.data?.estado, completion: complete.data?.completitud_porcentaje });
  const completeDb = await one('SELECT estado,completitud_porcentaje,respuestas_json FROM perfiles_solicitud WHERE id_perfil=$1', [ids.id_perfil_v2]);
  const repeatDb = await one('SELECT COUNT(*)::int total FROM perfil_respuestas_repetibles WHERE id_perfil=$1', [ids.id_perfil_v2]);
  check('ShowIf oculto conserva valor', completeDb.respuestas_json.detalle_viaje === 'Este valor debe conservarse oculto', { stored: completeDb.respuestas_json.detalle_viaje });
  check('Dos repetibles persistidos', repeatDb.total === 2, repeatDb);
  check('Completitud general', completeDb.completitud_porcentaje === 100, completeDb);

  const versionsBefore = await http('GET', `/perfiles/${ids.id_perfil_v2}/versiones`);
  const snapshotTwo = versionsBefore.data?.find((version) => version.version === 2);
  check('Snapshot versión con dos repetibles', snapshotTwo?.repetibles_snapshot_json?.familiares_eeuu?.length === 2, { version: snapshotTwo?.version, items: snapshotTwo?.repetibles_snapshot_json?.familiares_eeuu?.length });

  const edit = await http('PATCH', `/perfiles/${ids.id_perfil_v2}`, { estado: 'borrador', respuestas_json: { ...answers, nombre_demo: `${marker}_EDITADO` }, repeaters: { familiares_eeuu: [repeaters.familiares_eeuu[0]] }, motivo_cambio: `${marker} eliminar repetible`, actualizado_por: employee.id_empleado });
  const afterEdit = await http('GET', `/solicitudes/${ids.id_solicitud_v2}/perfil`);
  const versionsAfter = await http('GET', `/perfiles/${ids.id_perfil_v2}/versiones`);
  const preserved = versionsAfter.data?.find((version) => version.version === 2);
  check('Editar y eliminar repetible', edit.status === 200 && afterEdit.data?.repeaters?.familiares_eeuu?.length === 1, { http: edit.status, current_items: afterEdit.data?.repeaters?.familiares_eeuu?.length });
  check('Versión anterior inmutable', preserved?.repetibles_snapshot_json?.familiares_eeuu?.length === 2, { old_items: preserved?.repetibles_snapshot_json?.familiares_eeuu?.length, versions: versionsAfter.data?.length });

  const v1Request = await makeRequest('V1');
  ids.id_solicitud_v1 = v1Request.data?.id_solicitud;
  const v1Create = await http('POST', `/solicitudes/${ids.id_solicitud_v1}/perfil`, { id_plantilla: v1Template.id_plantilla, respuestas_json: { observaciones_generales: marker }, creado_por: employee.id_empleado });
  ids.id_perfil_v1 = v1Create.data?.id_perfil;
  const v1Update = await http('PATCH', `/perfiles/${ids.id_perfil_v1}`, { respuestas_json: { observaciones_generales: `${marker} editado` }, motivo_cambio: marker, actualizado_por: employee.id_empleado });
  const v1Versions = await http('GET', `/perfiles/${ids.id_perfil_v1}/versiones`);
  check('Compatibilidad V1 crear/editar/versionar', v1Create.status === 201 && v1Update.status === 200 && v1Versions.data?.length === 2, { create: v1Create.status, update: v1Update.status, versions: v1Versions.data?.length, id_perfil: ids.id_perfil_v1 });

  const pdfVersion = versionsAfter.data?.[0]?.id_version;
  const pdf = await http('POST', `/perfiles/versiones/${pdfVersion}/generar-pdf`);
  check('PDF V2 de versión', pdf.status === 200 && pdf.data?.documento?.id_documento, { http: pdf.status, data: pdf.data });

  const counts = await one(`SELECT
    (SELECT COUNT(*)::int FROM contacto WHERE source_id=$1) contactos,
    (SELECT COUNT(*)::int FROM clientes WHERE source_id=$1) clientes,
    (SELECT COUNT(*)::int FROM solicitudes WHERE origen_registro=$1) solicitudes,
    (SELECT COUNT(*)::int FROM perfiles_solicitud WHERE id_solicitud IN (SELECT id_solicitud FROM solicitudes WHERE origen_registro=$1)) perfiles,
    (SELECT COUNT(*)::int FROM perfil_respuestas_repetibles WHERE id_perfil=$2) repetibles`, [marker, ids.id_perfil_v2]);
  console.log(JSON.stringify({ marker, ids, results, counts }, null, 2));
  await pool.end();
})().catch(async (error) => {
  console.error(JSON.stringify({ marker, ids, fatal: { message: error.message, stack: error.stack }, results }, null, 2));
  try { await pool.end(); } catch {}
  process.exit(1);
});
