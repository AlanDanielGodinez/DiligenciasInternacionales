const { PDFParse } = require('pdf-parse');
const { pool } = require('../src/config/db');

const base = 'http://127.0.0.1:5000/api';
const marker = 'DEMO_PERFIL_VISA_INDIVIDUAL_V2';
const results = [];
const ids = {};
const check = (name, pass, evidence) => {
  results.push({ name, status: pass ? 'PASS' : 'FAIL', evidence });
  if (!pass) throw new Error(`${name}: ${JSON.stringify(evidence)}`);
};

async function http(method, path, body, responseType = 'json') {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data;
  if (responseType === 'buffer') data = Buffer.from(await response.arrayBuffer());
  else { try { data = await response.json(); } catch { data = null; } }
  return { status: response.status, data };
}

const one = async (sql, params = []) => (await pool.query(sql, params)).rows[0];
const pdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  try { return (await parser.getText()).text; } finally { await parser.destroy(); }
};

const answersV1 = {
  ha_usado_otro_nombre_o_lo_ha_modificado: true,
  cual_fue_su_otro_nombre: 'Nombre histórico DEMO',
  estado_civil: 'Soltero',
  tiene_alguna_otra_nacionalidad: true,
  cual_es_su_otra_nacionalidad: 'Nacionalidad DEMO',
  tiene_alguna_discapacidad: false,
  usted_pagara_por_su_viaje: false,
  quien_pagaria_su_viaje: 'Pagador DEMO',
  numero_de_telefono_de_quien_pagaria_por_su_viaje: '+52 555 100 2000',
  correo_electronico_quien_pagaria_por_su_viaje: 'pagador.demo@example.invalid',
  parentesco_quien_pagaria_por_su_viaje: 'Hermano',
  domicilio_quien_pagaria_por_su_viaje: 'Domicilio pagador DEMO',
  ha_entrado_a_estados_unidos: true,
  entro_de_manera_ilegal_o_con_documentos_falsos: 'No',
  alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria: false,
  alguna_vez_alguien_metio_una_peticion_de_migracion: false,
  en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen: false,
  alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua: false,
  alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua: false,
  redes_sociales: true,
  ha_perdido_su_pasaporte_o_se_lo_han_robado: false,
  el_padre_se_encuentra_en_los_eua: false,
  la_madre_se_encuentra_en_eeuu: false,
  tiene_familiares_directos_en_estados_unidos: true,
  tiene_mas_familiares_en_eua: false,
  tuvo_usted_algun_hijo_en_los_eua: false,
  cuenta_con_empleo_actualmente: 'No',
  anteriormente_tuvo_algun_empleo: false,
  tuvo_estudios: false,
  tuvo_educacion_antes: false,
  ha_viajado_a_algun_pais_en_los_ultimos_5_anos: false,
  cual_es_el_motivo_de_su_viaje: 'Validación del perfil real V2',
};

const repeatersV1 = {
  familiares_eeuu: [
    { data: { apellidos: 'FAMILIAR A', nombre: 'ALFA', estatus: 'Residente', relacion: 'Hermano' } },
    { data: { apellidos: 'FAMILIAR B', nombre: 'BETA', estatus: 'Ciudadano', relacion: 'Hijo' } },
  ],
  redes_sociales_detalle: [
    { data: { red_social: 'Facebook', nombre_usuario: 'DEMO_RED_A' } },
    { data: { red_social: 'X', nombre_usuario: 'DEMO_RED_B' } },
  ],
  ingresos_estados_unidos: [
    { data: { fecha_ingreso: '2019-01-10', duracion: 10, tiempo: 'Días' } },
    { data: { fecha_ingreso: '2022-05-20', duracion: 2, tiempo: 'Semanas' } },
  ],
};

(async () => {
  const previousDemo = await one(
    `SELECT id_solicitud FROM solicitudes WHERE origen_registro=$1 LIMIT 1`, [marker]
  );
  if (previousDemo) throw new Error(`${marker} ya existe como solicitud ${previousDemo.id_solicitud}; no se reutilizaron expedientes reales.`);

  const employee = await one('SELECT id_empleado FROM empleados WHERE activo=true ORDER BY id_empleado LIMIT 1');
  const resolver = await http('GET', '/perfiles/plantillas/resolver?id_tipo_tramite=20&id_pais=1');
  check('Resolución plantilla V2', resolver.status === 200 && resolver.data?.clave === 'perfil_visa_individual_v2' && resolver.data?.estructura_json?.schema_version === 2, {
    http: resolver.status, id_plantilla: resolver.data?.id_plantilla, clave: resolver.data?.clave,
  });
  ids.id_plantilla = resolver.data.id_plantilla;

  const contact = await http('POST', '/contactos', {
    nombre: marker, telefono: '+52 555 700 1000', correo: 'contacto.visa.v2@example.invalid', source_id: marker,
  });
  check('Crear contacto DEMO', contact.status === 201, { http: contact.status, data: contact.data });
  ids.id_contacto = contact.data.id_contacto;

  const client = await http('POST', `/contactos/${ids.id_contacto}/aplicantes`, {
    nombre: 'DEMO', apellido_paterno: 'PERFIL VISA', apellido_materno: 'V2',
    telefono: '+52 555 700 2000', correo: 'aplicante.visa.v2@example.invalid', fecha_nacimiento: '1990-04-15',
    id_pais: 1, estado: 'Chihuahua', ciudad: 'Chihuahua', direccion: 'Domicilio canónico DEMO', source_id: marker,
  });
  check('Crear aplicante DEMO', client.status === 201, { http: client.status, data: client.data });
  ids.id_cliente = client.data.id_cliente;

  const request = await http('POST', `/clientes/${ids.id_cliente}/solicitudes`, {
    id_tipo_tramite: 20, estado_actual: 102, fecha_inicio: '2026-08-27', origen_registro: marker,
    observaciones: marker, creado_por: employee.id_empleado,
  });
  check('Crear solicitud exclusiva DEMO', request.status === 201, { http: request.status, data: request.data });
  ids.id_solicitud = request.data.id_solicitud;

  const detail = await http('GET', `/solicitudes/${ids.id_solicitud}`);
  check('Precarga canónica', detail.status === 200 && detail.data?.cliente_fecha_nacimiento?.startsWith('1990-04-15') && detail.data?.cliente_correo === 'aplicante.visa.v2@example.invalid' && detail.data?.cliente_direccion === 'Domicilio canónico DEMO', {
    http: detail.status,
    canonical: detail.data && {
      nombre: [detail.data.cliente_nombre, detail.data.cliente_apellido_paterno, detail.data.cliente_apellido_materno].join(' '),
      fecha_nacimiento: detail.data.cliente_fecha_nacimiento, telefono: detail.data.cliente_telefono,
      correo: detail.data.cliente_correo, pais: detail.data.pais_nombre, direccion: detail.data.cliente_direccion,
    },
  });

  const invalidComplete = await http('POST', `/solicitudes/${ids.id_solicitud}/perfil`, {
    id_plantilla: ids.id_plantilla, estado: 'completo', respuestas_json: {}, repeaters: {}, creado_por: employee.id_empleado,
  });
  check('Required backend', invalidComplete.status === 400 && invalidComplete.data?.error?.details?.errors?.length >= 22, {
    http: invalidComplete.status, total_errors: invalidComplete.data?.error?.details?.errors?.length,
  });

  const missingConditional = { ...answersV1 };
  delete missingConditional.cual_fue_su_otro_nombre;
  const invalidConditional = await http('POST', `/solicitudes/${ids.id_solicitud}/perfil`, {
    id_plantilla: ids.id_plantilla, estado: 'completo', respuestas_json: missingConditional,
    repeaters: repeatersV1, creado_por: employee.id_empleado,
  });
  check('ShowIf y RequiredIf backend', invalidConditional.status === 400 && invalidConditional.data?.error?.details?.errors?.some((error) => error.path === 'cual_fue_su_otro_nombre'), {
    http: invalidConditional.status, paths: invalidConditional.data?.error?.details?.errors?.map((error) => error.path),
  });

  const draft = await http('POST', `/solicitudes/${ids.id_solicitud}/perfil`, {
    id_plantilla: ids.id_plantilla, estado: 'borrador', respuestas_json: answersV1,
    repeaters: repeatersV1, motivo_cambio: 'Versión 1 DEMO Visa Individual V2', creado_por: employee.id_empleado,
  });
  check('Guardar borrador versión 1', draft.status === 201 && draft.data?.estado === 'borrador' && draft.data?.version_actual === 1, {
    http: draft.status, id_perfil: draft.data?.id_perfil, completion: draft.data?.completitud_porcentaje,
  });
  ids.id_perfil = draft.data.id_perfil;

  const reopened = await http('GET', `/solicitudes/${ids.id_solicitud}/perfil`);
  check('Cerrar y reabrir', reopened.status === 200 && reopened.data?.respuestas_json?.cual_fue_su_otro_nombre === 'Nombre histórico DEMO' && reopened.data?.repeaters?.familiares_eeuu?.length === 2, {
    http: reopened.status, version: reopened.data?.version_actual, repeaters: Object.fromEntries(Object.entries(reopened.data?.repeaters || {}).map(([key, value]) => [key, value.length])),
  });
  check('Completitud versión 1', reopened.data?.completitud_porcentaje === 100 && reopened.data?.completitud_json?.required_complete === reopened.data?.completitud_json?.required_total, reopened.data?.completitud_json);

  const repeatersV2 = {
    familiares_eeuu: [
      { ...reopened.data.repeaters.familiares_eeuu[1], data: { ...reopened.data.repeaters.familiares_eeuu[1].data, nombre: 'BETA EDITADO' } },
      { data: { apellidos: 'FAMILIAR C', nombre: 'GAMMA', estatus: 'No inmigrante', relacion: 'Hermano' } },
    ],
    redes_sociales_detalle: [
      { ...reopened.data.repeaters.redes_sociales_detalle[0], data: { ...reopened.data.repeaters.redes_sociales_detalle[0].data, nombre_usuario: 'DEMO_RED_A_EDITADA' } },
      reopened.data.repeaters.redes_sociales_detalle[1],
    ],
    ingresos_estados_unidos: [
      ...reopened.data.repeaters.ingresos_estados_unidos,
      { data: { fecha_ingreso: '2025-02-01', duracion: 1, tiempo: 'Meses' } },
    ],
  };
  const complete = await http('PATCH', `/perfiles/${ids.id_perfil}`, {
    estado: 'completo', respuestas_json: { ...answersV1, cual_fue_su_otro_nombre: 'Nombre histórico DEMO EDITADO' },
    repeaters: repeatersV2, motivo_cambio: 'Versión 2 DEMO Visa Individual V2', actualizado_por: employee.id_empleado,
  });
  check('Editar y marcar completo versión 2', complete.status === 200 && complete.data?.estado === 'completo' && complete.data?.version_actual === 2, {
    http: complete.status, estado: complete.data?.estado, version: complete.data?.version_actual, completion: complete.data?.completitud_porcentaje,
  });

  const versions = await http('GET', `/perfiles/${ids.id_perfil}/versiones`);
  const v1 = versions.data.find((version) => version.version === 1);
  const v2 = versions.data.find((version) => version.version === 2);
  check('Snapshot versión 1 intacto', v1?.respuestas_json?.cual_fue_su_otro_nombre === 'Nombre histórico DEMO' && v1?.repetibles_snapshot_json?.familiares_eeuu?.[0]?.data?.nombre === 'ALFA' && v1?.repetibles_snapshot_json?.familiares_eeuu?.[1]?.data?.nombre === 'BETA', {
    version: v1?.version, other_name: v1?.respuestas_json?.cual_fue_su_otro_nombre,
    family: v1?.repetibles_snapshot_json?.familiares_eeuu?.map((item) => item.data.nombre),
  });
  check('Snapshot versión 2 exacto', v2?.respuestas_json?.cual_fue_su_otro_nombre === 'Nombre histórico DEMO EDITADO' && v2?.repetibles_snapshot_json?.familiares_eeuu?.[0]?.data?.nombre === 'BETA EDITADO' && v2?.repetibles_snapshot_json?.familiares_eeuu?.[1]?.data?.nombre === 'GAMMA' && v2?.repetibles_snapshot_json?.ingresos_estados_unidos?.length === 3, {
    version: v2?.version, family: v2?.repetibles_snapshot_json?.familiares_eeuu?.map((item) => item.data.nombre),
    social: v2?.repetibles_snapshot_json?.redes_sociales_detalle?.map((item) => item.data.nombre_usuario),
    entries: v2?.repetibles_snapshot_json?.ingresos_estados_unidos?.length,
  });

  for (const version of [v1, v2]) {
    const generated = await http('POST', `/perfiles/versiones/${version.id_version}/generar-pdf?force=true`);
    check(`Generar PDF versión ${version.version}`, generated.status === 200 && generated.data?.documento?.id_documento, {
      http: generated.status, id_version: version.id_version, documento: generated.data?.documento,
    });
    ids[`pdf_v${version.version}`] = generated.data.documento.id_documento;
    const downloaded = await http('GET', `/documentos/${generated.data.documento.id_documento}/descargar`, undefined, 'buffer');
    const text = await pdfText(downloaded.data);
    const expected = version.version === 1
      ? text.includes('ALFA') && text.includes('BETA') && !text.includes('BETA EDITADO') && !text.includes('GAMMA')
      : text.includes('BETA EDITADO') && text.includes('GAMMA') && !text.includes('ALFA');
    check(`Contenido PDF versión ${version.version}`, downloaded.status === 200 && expected, {
      http: downloaded.status, bytes: downloaded.data.length,
      ALFA: text.includes('ALFA'), BETA: text.includes('BETA'), BETA_EDITADO: text.includes('BETA EDITADO'), GAMMA: text.includes('GAMMA'),
    });
  }

  const db = await one(
    `SELECT ps.id_perfil,ps.id_plantilla,ps.version_actual,ps.estado,ps.completitud_porcentaje,
            (SELECT COUNT(*)::int FROM perfil_respuestas_repetibles pr WHERE pr.id_perfil=ps.id_perfil) repeaters_actuales,
            (SELECT COUNT(*)::int FROM perfiles_solicitud_versiones pv WHERE pv.id_perfil=ps.id_perfil) versiones
       FROM perfiles_solicitud ps WHERE ps.id_perfil=$1`, [ids.id_perfil]
  );
  check('Persistencia PostgreSQL final', db.id_plantilla === 11 && db.version_actual === 2 && db.estado === 'completo' && db.completitud_porcentaje === 100 && db.repeaters_actuales === 7 && db.versiones === 2, db);

  const legacy = await one(
    `SELECT ps.id_perfil,ps.id_plantilla,pp.clave,pp.version,pp.estructura_json ? 'schema_version' has_schema_version
       FROM perfiles_solicitud ps JOIN perfil_plantillas pp ON pp.id_plantilla=ps.id_plantilla
      WHERE pp.clave='perfil_visa_individual' ORDER BY ps.id_perfil DESC LIMIT 1`
  );
  check('V1 antiguo no afectado', legacy?.clave === 'perfil_visa_individual' && legacy?.version === 1 && legacy?.has_schema_version === false, legacy);

  console.log(JSON.stringify({ marker, ids, results }, null, 2));
  await pool.end();
})().catch(async (error) => {
  console.error(JSON.stringify({ marker, ids, fatal: { message: error.message, stack: error.stack }, results }, null, 2));
  try { await pool.end(); } catch {}
  process.exit(1);
});
