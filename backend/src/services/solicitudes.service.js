const { pool } = require('../config/db');
const driveExpedientesService = require('./driveExpedientes.service');
const documentosService = require('./documentos.service');
const perfilesService = require('./perfiles.service');

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const notFound = (message) => {
  const error = new Error(message);
  error.status = 404;
  return error;
};

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const positiveInteger = (value, fieldName) => {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw badRequest(`${fieldName} must be a positive numeric value`);
  }
  return numberValue;
};

const optionalPositiveInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  return positiveInteger(value, fieldName);
};

const optionalDate = (value, fieldName) => {
  const trimmed = trimString(value);
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    throw badRequest(`${fieldName} must be a valid date`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw badRequest(`${fieldName} must be a valid date`);
  }

  return trimmed;
};

const DISCOUNT_REASONS = new Set(['DISCAPACIDAD', 'ADULTO_MAYOR']);
const normalizeDiscount = (applies, reasons) => {
  const active = applies === true || applies === 'true' || applies === 1 || applies === '1';
  const values = Array.isArray(reasons) ? [...new Set(reasons.map((value) => String(value).trim().toUpperCase()).filter(Boolean))] : [];
  if (values.some((value) => !DISCOUNT_REASONS.has(value))) throw badRequest('motivos_descuento contains an unsupported value');
  if (!active && values.length) throw badRequest('motivos_descuento requires aplica_descuento');
  if (active && !values.length) throw badRequest('At least one motivos_descuento value is required');
  return { aplica_descuento: active, motivos_descuento: active ? values : [] };
};

const normalizeText = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const STATUS_ALIASES = {
  pendiente_pago_inicial: 'Pendiente de anticipo',
  pago_inicial_validado: 'Pago validado',
  aprobado: 'Aprobado',
  negado: 'Negado',
};

const ESTADOS_OPERATIVOS_POR_AREA = {
  INDIVIDUALES: [
    'Pago validado',
    'Perfil en proceso',
    'Perfil completado',
    'Documentos pendientes',
    'Documentos completos',
    'Cita en proceso',
    'Cita programada',
    'DS-160 en proceso',
    'Entrevista programada',
    'Aprobado',
    'Negado',
    'Finalizado',
  ],
  AMA: [
    'Pago validado',
    'Perfil AMA en proceso',
    'Perfil AMA completado',
    'Documentos pendientes',
    'Documentos completos',
    'En espera de grupo',
    'Grupo asignado',
    'Protocolo pendiente',
    'Protocolo realizado',
    'Cita programada',
    'Aprobado',
    'Negado',
    'Finalizado',
  ],
  LEGALES: [
    'Pago validado',
    'Revisión legal',
    'Documentos pendientes',
    'Expediente en análisis',
    'Solicitud preparada',
    'Enviado a autoridad',
    'Respuesta recibida',
    'Finalizado',
  ],
  VUELOS: [
    'Pago validado',
    'Cotización pendiente',
    'Cotización enviada',
    'Reserva en proceso',
    'Reserva confirmada',
    'Itinerario enviado',
    'Finalizado',
  ],
};

const SOLICITUD_DETAIL_SELECT = `
  SELECT s.*,
    ce.valor AS estado_actual_valor,
    ce.categoria AS estado_actual_categoria,
    c.id_cliente AS cliente_id,
    c.nombre AS cliente_nombre,
    c.apellido_paterno AS cliente_apellido_paterno,
    c.apellido_materno AS cliente_apellido_materno,
    c.telefono AS cliente_telefono,
    c.correo AS cliente_correo,
    c.fecha_nacimiento AS cliente_fecha_nacimiento,
    c.estado AS cliente_estado,
    c.ciudad AS cliente_ciudad,
    c.direccion AS cliente_direccion,
    c.id_pais AS id_pais,
    cp.nombre_pais AS pais_nombre,
    c.id_contacto AS id_contacto,
    co.nombre AS contacto_nombre,
    co.telefono AS contacto_telefono,
    co.telefono_emergencia AS contacto_telefono_emergencia,
    co.correo AS contacto_correo,
    tt.id_tipo_tramite AS tipo_id,
    tt.nombre_tramite AS tipo_nombre,
    ca.clave AS area_actual_clave,
    ca.nombre AS area_actual_nombre,
    e.nombre AS empleado_responsable_nombre,
    e.apellidos AS empleado_responsable_apellidos,
    e.area AS empleado_responsable_area,
    e.rol AS empleado_responsable_rol
  FROM public.solicitudes s
  LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
  LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
  LEFT JOIN public.catalogo_paises cp ON cp.id_pais = c.id_pais
  LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
  LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
  LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
  LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable`;

async function resolveEstadoActual(value, query = pool.query.bind(pool)) {
  if (value === undefined || value === null || value === '') return null;

  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && numericValue > 0) {
    const statusResult = await query(
      'SELECT id FROM public.catalogo_estatus WHERE id = $1 LIMIT 1',
      [numericValue]
    );
    if (statusResult.rowCount === 0) {
      throw notFound('Estado not found');
    }
    return numericValue;
  }

  const raw = trimString(value);
  if (!raw) return null;
  const target = STATUS_ALIASES[raw] || raw;
  const normalizedTarget = normalizeText(target);

  const { rows } = await query(
    'SELECT id, valor FROM public.catalogo_estatus ORDER BY id'
  );
  const match = rows.find((row) => normalizeText(row.valor) === normalizedTarget);

  if (!match) {
    throw badRequest('estado_actual must match an existing catalogo_estatus value or ID');
  }

  return match.id;
}

async function ensureEmpleadoExists(idEmpleado, query = pool.query.bind(pool)) {
  if (!idEmpleado) return;
  const empleadoResult = await query(
    'SELECT id_empleado FROM public.empleados WHERE id_empleado = $1 LIMIT 1',
    [idEmpleado]
  );

  if (empleadoResult.rowCount === 0) {
    throw notFound('Empleado not found');
  }
}

async function ensureEmpleadoActivoExists(idEmpleado, query = pool.query.bind(pool)) {
  if (!idEmpleado) return;
  const empleadoResult = await query(
    'SELECT id_empleado FROM public.empleados WHERE id_empleado = $1 AND activo = true LIMIT 1',
    [idEmpleado]
  );

  if (empleadoResult.rowCount === 0) {
    throw notFound('Empleado active not found');
  }
}

async function resolveArea(value, query = pool.query.bind(pool)) {
  if (value === undefined || value === null || value === '') {
    throw badRequest('area_destino is required');
  }

  const numericValue = Number(value);
  let result;

  if (Number.isInteger(numericValue) && numericValue > 0) {
    result = await query(
      `SELECT id_area, clave, nombre
       FROM public.catalogo_areas
       WHERE id_area = $1 AND activo = true
       LIMIT 1`,
      [numericValue]
    );
  } else {
    const clave = trimString(value);
    if (!clave) {
      throw badRequest('area_destino is required');
    }

    result = await query(
      `SELECT id_area, clave, nombre
       FROM public.catalogo_areas
       WHERE UPPER(clave) = UPPER($1) AND activo = true
       LIMIT 1`,
      [clave]
    );
  }

  if (result.rowCount === 0) {
    throw notFound('Area not found');
  }

  return result.rows[0];
}

async function getSolicitudes({ limit = 50, offset = 0 }) {
  const safeLimit = positiveInteger(limit, 'limit');
  const safeOffset = Number(offset);
  if (!Number.isInteger(safeOffset) || safeOffset < 0) {
    throw badRequest('offset must be a non-negative numeric value');
  }

  const sql = `${SOLICITUD_DETAIL_SELECT}
    ORDER BY s.id_solicitud DESC LIMIT $1 OFFSET $2`;

  const { rows } = await pool.query(sql, [safeLimit, safeOffset]);
  return rows;
}

async function getSolicitudById(id) {
  const idSolicitud = positiveInteger(id, 'id_solicitud');
  const sql = `${SOLICITUD_DETAIL_SELECT}
    WHERE s.id_solicitud = $1 LIMIT 1`;

  const { rows } = await pool.query(sql, [idSolicitud]);
  return rows[0];
}

const isTechnicalPerfilKey = (key) =>
  ['source_id', 'frontend_nuevo', 'migracion_google_sheets'].includes(String(key).toLowerCase());

const isFilledPerfilValue = (value) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return String(value).trim() !== '';
};

const getPerfilFields = (estructuraJson = {}) => {
  const secciones = Array.isArray(estructuraJson?.secciones) ? estructuraJson.secciones : [];
  return secciones.flatMap((section) =>
    Array.isArray(section?.campos)
      ? section.campos.filter((field) => field?.name && !isTechnicalPerfilKey(field.name))
      : []
  );
};

const getPercentage = (filled, total) => {
  if (!total) return 0;
  return Math.round((Number(filled || 0) / Number(total)) * 100);
};

async function getResumenAvanceSolicitud(idSolicitud) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const solicitud = await getSolicitudById(safeIdSolicitud);
  if (!solicitud) throw notFound('Solicitud not found');

  const perfil = await perfilesService.getPerfilBySolicitud(safeIdSolicitud);
  let perfilResumen = {
    existe: false,
    estado: null,
    version_actual: null,
    porcentaje_completado: 0,
    campos_totales: 0,
    campos_llenados: 0,
    pdf_generado: false,
    id_documento_pdf: null,
  };

  if (perfil) {
    const fields = getPerfilFields(perfil.estructura_json);
    const respuestas = perfil.respuestas_json || {};
    const camposLlenados = fields.filter((field) => isFilledPerfilValue(respuestas[field.name])).length;
    const versiones = await perfilesService.getPerfilVersiones(perfil.id_perfil);
    const latestVersion = versiones[0] || null;
    perfilResumen = {
      existe: true,
      estado: perfil.estado,
      version_actual: perfil.version_actual,
      porcentaje_completado: getPercentage(camposLlenados, fields.length),
      campos_totales: fields.length,
      campos_llenados: camposLlenados,
      pdf_generado: Boolean(latestVersion?.id_documento_pdf),
      id_documento_pdf: latestVersion?.id_documento_pdf || null,
    };
  }

  const documentosResult = await documentosService.getDocumentosRequeridosBySolicitud(safeIdSolicitud);
  const documentosRequeridos = documentosResult.documentos_requeridos || [];
  const obligatorios = documentosRequeridos.filter((documento) => documento.obligatorio);
  const opcionales = documentosRequeridos.filter((documento) => !documento.obligatorio);
  const obligatoriosSubidos = obligatorios.filter((documento) => documento.estado === 'subido').length;
  const opcionalesSubidos = opcionales.filter((documento) => documento.estado === 'subido').length;

  const responsable = [
    solicitud.empleado_responsable_nombre,
    solicitud.empleado_responsable_apellidos,
  ]
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== '')
    .join(' ')
    .trim();

  return {
    id_solicitud: safeIdSolicitud,
    perfil: perfilResumen,
    documentos: {
      total: documentosRequeridos.length,
      obligatorios: obligatorios.length,
      obligatorios_subidos: obligatoriosSubidos,
      opcionales: opcionales.length,
      opcionales_subidos: opcionalesSubidos,
      porcentaje_obligatorios: getPercentage(obligatoriosSubidos, obligatorios.length),
    },
    expediente: {
      estado_actual: solicitud.estado_actual_valor || solicitud.estado_actual,
      area_actual: solicitud.area_actual_nombre || solicitud.area_actual_clave || null,
      responsable: responsable || null,
      canal_contacto: solicitud.canal_contacto || null,
    },
    faltantes: obligatorios
      .filter((documento) => documento.estado !== 'subido')
      .map((documento) => documento.nombre),
  };
}

async function getSolicitudPostPagoData(idSolicitud, query = pool.query.bind(pool)) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(
    `SELECT
       s.id_solicitud,
       s.id_cliente,
       s.id_tipo_tramite,
       s.estado_actual,
       s.id_area_actual,
       s.id_empleado_responsable,
       tt.nombre_tramite,
       ce.valor AS estado_actual_valor
     FROM public.solicitudes s
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     WHERE s.id_solicitud = $1
     LIMIT 1`,
    [safeIdSolicitud]
  );

  if (!rows[0]) throw notFound('Solicitud not found');
  return rows[0];
}

async function getActiveAreaByClave(clave, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `SELECT id_area, clave, nombre
     FROM public.catalogo_areas
     WHERE UPPER(clave) = UPPER($1)
       AND activo = true
     LIMIT 1`,
    [clave]
  );
  return rows[0] || null;
}

async function getEstadoCatalogo(value, query = pool.query.bind(pool)) {
  const id = await resolveEstadoActual(value, query);
  const { rows } = await query(
    `SELECT id, valor, categoria
     FROM public.catalogo_estatus
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

function resolveAreaClaveByTipo(nombreTramite) {
  const normalized = normalizeText(nombreTramite || '');

  if (!normalized) {
    return {
      clave: null,
      motivo: 'No se encontro nombre de tramite para resolver destino post pago',
    };
  }

  if (normalized.includes('ama')) {
    return {
      clave: 'AMA',
      motivo: 'Tramite AMA detectado por nombre',
      origen: 'enviado_a_ama',
    };
  }

  if (
    normalized.includes('legal') ||
    normalized.includes('foia') ||
    normalized.includes('perdon') ||
    normalized.includes('asesoria')
  ) {
    return {
      clave: 'LEGALES',
      motivo: 'Tramite legal detectado por nombre',
      origen: 'enviado_a_legal',
    };
  }

  if (normalized.includes('vuelo') || normalized.includes('hotel')) {
    return {
      clave: 'VUELOS',
      motivo: 'Tramite de viaje detectado por nombre',
      origen: 'enviado_a_logistica',
    };
  }

  if (
    normalized.includes('visa') ||
    normalized.includes('pasaporte') ||
    normalized.includes('cita') ||
    normalized.includes('eta') ||
    normalized.includes('crba') ||
    normalized.includes('apostille') ||
    normalized.includes('traduccion')
  ) {
    return {
      clave: 'INDIVIDUALES',
      motivo: normalized.includes('pasaporte')
        ? 'Pasaporte detectado; no existe area Pasaportes, se envia a Individuales'
        : 'Tramite individual detectado por nombre',
      origen: 'enviado_a_individuales',
    };
  }

  return {
    clave: null,
    motivo: 'No hay regla configurada para este tipo de tramite',
  };
}

async function resolverDestinoPostPago(idSolicitud, options = {}) {
  const solicitud = await getSolicitudPostPagoData(idSolicitud);
  const forcedArea = options.id_area_destino || options.area_destino;
  const estadoDestino = await getEstadoCatalogo('Pago validado');

  let area = null;
  let motivo = '';
  let origen = 'post_pago_pendiente_asignacion';

  if (forcedArea !== undefined && forcedArea !== null && forcedArea !== '') {
    area = await resolveArea(forcedArea);
    motivo = 'Area destino indicada manualmente';
    origen = area.clave === 'AMA'
      ? 'enviado_a_ama'
      : area.clave === 'LEGALES'
        ? 'enviado_a_legal'
        : area.clave === 'INDIVIDUALES'
          ? 'enviado_a_individuales'
          : 'enviado_post_pago';
  } else {
    const rule = resolveAreaClaveByTipo(solicitud.nombre_tramite);
    motivo = rule.motivo;
    origen = rule.origen || origen;
    area = rule.clave ? await getActiveAreaByClave(rule.clave) : null;
  }

  return {
    id_solicitud: solicitud.id_solicitud,
    id_tipo_tramite: solicitud.id_tipo_tramite,
    nombre_tramite: solicitud.nombre_tramite,
    estado_actual: solicitud.estado_actual,
    estado_actual_valor: solicitud.estado_actual_valor,
    id_area_destino: area?.id_area || null,
    clave_area_destino: area?.clave || null,
    nombre_area_destino: area?.nombre || null,
    estado_destino: estadoDestino?.id || null,
    nombre_estado_destino: estadoDestino?.valor || null,
    motivo,
    origen,
    requiere_asignacion_manual: !area,
  };
}

async function enviarSolicitudPostPago(idSolicitud, payload = {}) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const idEmpleadoResponsable = optionalPositiveInteger(
    payload.id_empleado_responsable,
    'id_empleado_responsable'
  );
  const forzar = Boolean(payload.forzar);
  const descripcion = trimString(payload.observaciones) || 'Asignacion posterior a validacion de pago';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const solicitudResult = await client.query(
      `SELECT s.*,
          (SELECT ce.valor FROM public.catalogo_estatus ce WHERE ce.id = s.estado_actual LIMIT 1) AS estado_actual_valor
       FROM public.solicitudes s
       WHERE s.id_solicitud = $1
       FOR UPDATE`,
      [safeIdSolicitud]
    );

    if (solicitudResult.rowCount === 0) throw notFound('Solicitud not found');

    const solicitud = solicitudResult.rows[0];
    const pagoValidadoEstado = await resolveEstadoActual('Pago validado', client.query.bind(client));
    const estadoActualNormalizado = normalizeText(solicitud.estado_actual_valor || '');
    const isPagoValidado = Number(solicitud.estado_actual) === Number(pagoValidadoEstado) ||
      estadoActualNormalizado === normalizeText('Pago validado');

    if (!isPagoValidado && !forzar) {
      throw badRequest('Solicitud must be in Pago validado before post-payment assignment');
    }

    await ensureEmpleadoActivoExists(idEmpleadoResponsable, client.query.bind(client));
    const destino = await resolverDestinoPostPago(safeIdSolicitud, {
      id_area_destino: payload.id_area_destino || payload.area_destino,
    });

    if (!destino.id_area_destino) {
      await client.query('COMMIT');
      return {
        solicitud,
        destino,
        seguimiento: null,
        requiere_asignacion_manual: true,
      };
    }

    const estadoDestino = destino.estado_destino || solicitud.estado_actual;
    await client.query(
      `UPDATE public.solicitudes
       SET id_area_actual = $1,
           estado_actual = $2,
           id_empleado_responsable = COALESCE($3, id_empleado_responsable),
           fecha_ultimo_movimiento = NOW(),
           actualizado_en = NOW()
       WHERE id_solicitud = $4`,
      [
        destino.id_area_destino,
        estadoDestino,
        idEmpleadoResponsable,
        safeIdSolicitud,
      ]
    );

    const seguimiento = await insertSeguimientoIfAvailable(client, {
      idSolicitud: safeIdSolicitud,
      estadoAnterior: solicitud.estado_actual,
      estadoNuevo: estadoDestino,
      descripcion: `${descripcion}. Destino: ${destino.nombre_area_destino}`,
      idEmpleadoResponsable,
      fechaSeguimiento: null,
      origen: destino.origen || 'enviado_post_pago',
    });

    const detailResult = await client.query(
      `${SOLICITUD_DETAIL_SELECT}
       WHERE s.id_solicitud = $1 LIMIT 1`,
      [safeIdSolicitud]
    );

    await client.query('COMMIT');
    return {
      solicitud: detailResult.rows[0],
      destino,
      seguimiento,
      requiere_asignacion_manual: false,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function createSolicitud(payload) {
  return createSolicitudRecord(payload);
}

async function createSolicitudForCliente(idCliente, payload) {
  const safeIdCliente = positiveInteger(idCliente, 'id_cliente');
  return createSolicitudRecord({ ...payload, id_cliente: safeIdCliente }, 'tramite_adicional_creado');
}

async function updateSolicitudEstado(idSolicitud, payload) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');

  if (payload.estado_nuevo === undefined || payload.estado_nuevo === null || payload.estado_nuevo === '') {
    throw badRequest('estado_nuevo is required');
  }

  const idEmpleadoResponsable = optionalPositiveInteger(
    payload.id_empleado_responsable,
    'id_empleado_responsable'
  );
  const fechaSeguimiento = optionalDate(payload.fecha_seguimiento, 'fecha_seguimiento');
  const descripcion = trimString(payload.descripcion);
  const origen = trimString(payload.origen) || 'cambio_estado';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const solicitudResult = await client.query(
      `SELECT id_solicitud, estado_actual
       FROM public.solicitudes
       WHERE id_solicitud = $1
       FOR UPDATE`,
      [safeIdSolicitud]
    );

    if (solicitudResult.rowCount === 0) {
      throw notFound('Solicitud not found');
    }

    await ensureEmpleadoExists(idEmpleadoResponsable, client.query.bind(client));
    const estadoAnterior = solicitudResult.rows[0].estado_actual;
    const estadoNuevo = await resolveEstadoActual(payload.estado_nuevo, client.query.bind(client));

    await client.query(
      `UPDATE public.solicitudes
       SET estado_actual = $1,
           actualizado_en = NOW()
       WHERE id_solicitud = $2`,
      [estadoNuevo, safeIdSolicitud]
    );

    const seguimiento = await insertSeguimientoIfAvailable(client, {
      idSolicitud: safeIdSolicitud,
      estadoAnterior,
      estadoNuevo,
      descripcion: descripcion || origen,
      idEmpleadoResponsable,
      fechaSeguimiento,
      origen,
    });

    const detailResult = await client.query(
      `SELECT s.*, 
        c.id_cliente AS cliente_id, c.nombre AS cliente_nombre, c.apellido_paterno AS cliente_apellido_paterno, c.apellido_materno AS cliente_apellido_materno, c.telefono AS cliente_telefono, c.correo AS cliente_correo,
        tt.id_tipo_tramite AS tipo_id, tt.nombre_tramite AS tipo_nombre
        FROM solicitudes s
        LEFT JOIN clientes c ON c.id_cliente = s.id_cliente
        LEFT JOIN tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
        WHERE s.id_solicitud = $1 LIMIT 1`,
      [safeIdSolicitud]
    );

    await client.query('COMMIT');
    return {
      solicitud: detailResult.rows[0],
      seguimiento,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function moverSolicitudArea(idSolicitud, payload) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const idEmpleadoResponsable = optionalPositiveInteger(
    payload.id_empleado_responsable,
    'id_empleado_responsable'
  );
  const descripcion = trimString(payload.descripcion);
  const origen = trimString(payload.origen) || 'mover_area';
  const hasFechaProximoContacto = Object.prototype.hasOwnProperty.call(
    payload,
    'fecha_proximo_contacto'
  );
  const fechaProximoContacto = hasFechaProximoContacto
    ? optionalDate(payload.fecha_proximo_contacto, 'fecha_proximo_contacto')
    : undefined;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const solicitudResult = await client.query(
      `SELECT id_solicitud, estado_actual, id_area_actual
       FROM public.solicitudes
       WHERE id_solicitud = $1
       FOR UPDATE`,
      [safeIdSolicitud]
    );

    if (solicitudResult.rowCount === 0) {
      throw notFound('Solicitud not found');
    }

    await ensureEmpleadoExists(idEmpleadoResponsable, client.query.bind(client));
    const areaDestino = await resolveArea(payload.area_destino, client.query.bind(client));
    const solicitud = solicitudResult.rows[0];

    const updateValues = [areaDestino.id_area, safeIdSolicitud];
    let fechaProximoSql = '';

    if (hasFechaProximoContacto) {
      updateValues.push(fechaProximoContacto);
      fechaProximoSql = `,\n           fecha_proximo_contacto = $${updateValues.length}::date`;
    }

    await client.query(
      `UPDATE public.solicitudes
       SET id_area_actual = $1,
           fecha_ultimo_movimiento = NOW(),
           actualizado_en = NOW()
           ${fechaProximoSql}
       WHERE id_solicitud = $2`,
      updateValues
    );

    const seguimiento = await insertSeguimientoIfAvailable(client, {
      idSolicitud: safeIdSolicitud,
      estadoAnterior: solicitud.estado_actual,
      estadoNuevo: solicitud.estado_actual,
      descripcion: descripcion || `Solicitud enviada a ${areaDestino.clave}`,
      idEmpleadoResponsable,
      fechaSeguimiento: null,
      origen,
    });

    const detailResult = await client.query(
      `SELECT s.*,
        c.id_cliente AS cliente_id, c.nombre AS cliente_nombre, c.apellido_paterno AS cliente_apellido_paterno, c.apellido_materno AS cliente_apellido_materno, c.telefono AS cliente_telefono, c.correo AS cliente_correo,
        tt.id_tipo_tramite AS tipo_id, tt.nombre_tramite AS tipo_nombre,
        ca.id_area AS area_actual_id, ca.clave AS area_actual_clave, ca.nombre AS area_actual_nombre
        FROM solicitudes s
        LEFT JOIN clientes c ON c.id_cliente = s.id_cliente
        LEFT JOIN tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
        LEFT JOIN catalogo_areas ca ON ca.id_area = s.id_area_actual
        WHERE s.id_solicitud = $1 LIMIT 1`,
      [safeIdSolicitud]
    );

    await client.query('COMMIT');
    return {
      solicitud: detailResult.rows[0],
      area_destino: areaDestino,
      seguimiento,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateSolicitudResponsable(idSolicitud, payload) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const idEmpleadoResponsable = optionalPositiveInteger(
    payload.id_empleado_responsable,
    'id_empleado_responsable'
  );
  const descripcion = trimString(payload.descripcion) || 'Responsable actualizado';
  const origen = trimString(payload.origen) || 'responsable_actualizado';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const solicitudResult = await client.query(
      `SELECT id_solicitud, estado_actual, id_empleado_responsable
       FROM public.solicitudes
       WHERE id_solicitud = $1
       FOR UPDATE`,
      [safeIdSolicitud]
    );

    if (solicitudResult.rowCount === 0) {
      throw notFound('Solicitud not found');
    }

    await ensureEmpleadoActivoExists(idEmpleadoResponsable, client.query.bind(client));

    await client.query(
      `UPDATE public.solicitudes
       SET id_empleado_responsable = $1,
           actualizado_en = NOW()
       WHERE id_solicitud = $2`,
      [idEmpleadoResponsable, safeIdSolicitud]
    );

    const solicitud = solicitudResult.rows[0];
    const seguimiento = await insertSeguimientoIfAvailable(client, {
      idSolicitud: safeIdSolicitud,
      estadoAnterior: solicitud.estado_actual,
      estadoNuevo: solicitud.estado_actual,
      descripcion,
      idEmpleadoResponsable,
      fechaSeguimiento: null,
      origen,
    });

    const detailResult = await client.query(
      `${SOLICITUD_DETAIL_SELECT}
       WHERE s.id_solicitud = $1 LIMIT 1`,
      [safeIdSolicitud]
    );

    await client.query('COMMIT');
    return {
      solicitud: detailResult.rows[0],
      seguimiento,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateSolicitud(idSolicitud, payload) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query(
      `SELECT *
       FROM public.solicitudes
       WHERE id_solicitud = $1
       FOR UPDATE`,
      [safeIdSolicitud]
    );

    if (currentResult.rowCount === 0) {
      throw notFound('Solicitud not found');
    }

    const current = currentResult.rows[0];
    const updates = [];
    const values = [];
    let estadoAnterior = current.estado_actual;
    let estadoNuevo = current.estado_actual;
    let estadoChanged = false;
    let areaChanged = false;

    const pushUpdate = (field, value, cast = '') => {
      values.push(value);
      updates.push(`${field} = $${values.length}${cast}`);
    };

    if (Object.prototype.hasOwnProperty.call(payload, 'id_tipo_tramite')) {
      const idTipoTramite = positiveInteger(payload.id_tipo_tramite, 'id_tipo_tramite');
      const tipoResult = await client.query(
        'SELECT id_tipo_tramite FROM public.tipos_tramite WHERE id_tipo_tramite = $1 LIMIT 1',
        [idTipoTramite]
      );
      if (tipoResult.rowCount === 0) throw notFound('Tipo de tramite not found');
      pushUpdate('id_tipo_tramite', idTipoTramite);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'estado_actual')) {
      estadoNuevo = await resolveEstadoActual(payload.estado_actual, client.query.bind(client));
      estadoChanged = Number(estadoNuevo) !== Number(current.estado_actual);
      pushUpdate('estado_actual', estadoNuevo);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'id_area_actual')) {
      const idAreaActual = optionalPositiveInteger(payload.id_area_actual, 'id_area_actual');
      if (idAreaActual) {
        await resolveArea(idAreaActual, client.query.bind(client));
      }
      areaChanged = Number(idAreaActual || 0) !== Number(current.id_area_actual || 0);
      pushUpdate('id_area_actual', idAreaActual);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'id_empleado_responsable')) {
      const idEmpleadoResponsable = optionalPositiveInteger(
        payload.id_empleado_responsable,
        'id_empleado_responsable'
      );
      await ensureEmpleadoActivoExists(idEmpleadoResponsable, client.query.bind(client));
      pushUpdate('id_empleado_responsable', idEmpleadoResponsable);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'canal_contacto')) {
      pushUpdate('canal_contacto', trimString(payload.canal_contacto));
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'aplica_descuento') || Object.prototype.hasOwnProperty.call(payload, 'motivos_descuento')) {
      const discount = normalizeDiscount(
        Object.prototype.hasOwnProperty.call(payload, 'aplica_descuento') ? payload.aplica_descuento : current.aplica_descuento,
        Object.prototype.hasOwnProperty.call(payload, 'motivos_descuento') ? payload.motivos_descuento : current.motivos_descuento
      );
      pushUpdate('aplica_descuento', discount.aplica_descuento);
      pushUpdate('motivos_descuento', discount.motivos_descuento, '::text[]');
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'observaciones')) {
      pushUpdate('observaciones', trimString(payload.observaciones));
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'fecha_proximo_contacto')) {
      pushUpdate(
        'fecha_proximo_contacto',
        optionalDate(payload.fecha_proximo_contacto, 'fecha_proximo_contacto'),
        '::date'
      );
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'fecha_primera_aplicacion')) {
      pushUpdate(
        'fecha_primera_aplicacion',
        optionalDate(payload.fecha_primera_aplicacion, 'fecha_primera_aplicacion'),
        '::date'
      );
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'resultado')) {
      pushUpdate('resultado', trimString(payload.resultado));
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'fecha_cierre')) {
      pushUpdate('fecha_cierre', optionalDate(payload.fecha_cierre, 'fecha_cierre'), '::date');
    }

    if (updates.length === 0) {
      throw badRequest('No valid fields provided');
    }

    if (areaChanged) {
      updates.push('fecha_ultimo_movimiento = NOW()');
    }
    updates.push('actualizado_en = NOW()');
    values.push(safeIdSolicitud);

    await client.query(
      `UPDATE public.solicitudes
       SET ${updates.join(', ')}
       WHERE id_solicitud = $${values.length}`,
      values
    );

    let seguimiento = null;
    if (estadoChanged) {
      seguimiento = await insertSeguimientoIfAvailable(client, {
        idSolicitud: safeIdSolicitud,
        estadoAnterior,
        estadoNuevo,
        descripcion: trimString(payload.descripcion) || 'Estado actualizado desde edición de expediente',
        idEmpleadoResponsable: optionalPositiveInteger(
          payload.id_empleado_responsable,
          'id_empleado_responsable'
        ) || current.id_empleado_responsable,
        fechaSeguimiento: null,
        origen: trimString(payload.origen) || 'edicion_expediente',
      });
    }

    const detailResult = await client.query(
      `${SOLICITUD_DETAIL_SELECT}
       WHERE s.id_solicitud = $1 LIMIT 1`,
      [safeIdSolicitud]
    );

    await client.query('COMMIT');
    if (Object.prototype.hasOwnProperty.call(payload, 'id_tipo_tramite')) {
      await require('./quickbooksSyncTrigger.service').scheduleContactSync(
        detailResult.rows[0]?.id_contacto
      );
    }
    return {
      solicitud: detailResult.rows[0],
      seguimiento,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function createSolicitudRecord(payload, eventName = 'solicitud_creada') {
  const idCliente = positiveInteger(payload.id_cliente, 'id_cliente');
  const idTipoTramite = positiveInteger(payload.id_tipo_tramite, 'id_tipo_tramite');
  const idEmpleadoResponsable = optionalPositiveInteger(payload.id_empleado_responsable, 'id_empleado_responsable');
  const fechaInicio = optionalDate(payload.fecha_inicio, 'fecha_inicio');
  const fechaCierre = optionalDate(payload.fecha_cierre, 'fecha_cierre');
  const origenRegistro = trimString(payload.origen_registro) || 'frontend_nuevo';
  const observaciones = trimString(payload.observaciones);
  const canalContacto = trimString(
    payload.canal_contacto ||
      payload.telefono_origen ||
      payload.linea_contacto ||
      payload.medio_contacto
  );
  const sourceId = trimString(payload.source_id);
  const discount = normalizeDiscount(payload.aplica_descuento, payload.motivos_descuento);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const clienteResult = await client.query(
      'SELECT id_cliente FROM public.clientes WHERE id_cliente = $1 LIMIT 1',
      [idCliente]
    );

    if (clienteResult.rowCount === 0) {
      throw notFound('Cliente not found');
    }

    const tipoResult = await client.query(
      'SELECT id_tipo_tramite FROM public.tipos_tramite WHERE id_tipo_tramite = $1 LIMIT 1',
      [idTipoTramite]
    );

    if (tipoResult.rowCount === 0) {
      throw notFound('Tipo de tramite not found');
    }

    await ensureEmpleadoExists(idEmpleadoResponsable, client.query.bind(client));
    const estadoActual = await resolveEstadoActual(payload.estado_actual, client.query.bind(client));

    const insertResult = await client.query(
      `INSERT INTO public.solicitudes (
        id_cliente,
        id_tipo_tramite,
        id_empleado_responsable,
        estado_actual,
        fecha_inicio,
        fecha_cierre,
        origen_registro,
        observaciones,
        canal_contacto,
        aplica_descuento,
        motivos_descuento,
        source_id,
        creado_en,
        actualizado_en
      )
      VALUES (
        $1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6,
        $7, $8, $9, $10, $11::text[], $12, NOW(), NOW()
      )
      RETURNING id_solicitud`,
      [
        idCliente,
        idTipoTramite,
        idEmpleadoResponsable,
        estadoActual,
        fechaInicio,
        fechaCierre,
        origenRegistro,
        observaciones,
        canalContacto,
        discount.aplica_descuento,
        discount.motivos_descuento,
        sourceId,
      ]
    );

    const idSolicitud = insertResult.rows[0].id_solicitud;
    const idSolicitudOrigen = optionalPositiveInteger(payload.id_solicitud_origen, 'id_solicitud_origen');
    if (eventName === 'tramite_adicional_creado' && idSolicitudOrigen) {
      const originResult = await client.query(
        'SELECT id_solicitud,id_cliente FROM public.solicitudes WHERE id_solicitud=$1 LIMIT 1',
        [idSolicitudOrigen]
      );
      if (!originResult.rows[0]) throw notFound('Solicitud origen not found');
      if (Number(originResult.rows[0].id_cliente) !== Number(idCliente)) {
        throw badRequest('La solicitud origen no pertenece al mismo aplicante');
      }
      await client.query(
        `INSERT INTO public.solicitudes_relaciones
          (id_solicitud_origen,id_solicitud_destino,tipo_relacion,creado_por)
         VALUES($1,$2,'NUEVO_TRAMITE',$3)
         ON CONFLICT(id_solicitud_origen,id_solicitud_destino,tipo_relacion) DO NOTHING`,
        [idSolicitudOrigen,idSolicitud,optionalPositiveInteger(payload.creado_por,'creado_por')]
      );
    }
    await insertSeguimientoIfAvailable(client, {
      idSolicitud,
      estadoNuevo: estadoActual,
      descripcion: payload.observaciones || eventName,
      idEmpleadoResponsable,
      fechaSeguimiento: fechaInicio,
      origen: eventName,
    });

    const detailResult = await client.query(
      `${SOLICITUD_DETAIL_SELECT}
       WHERE s.id_solicitud = $1 LIMIT 1`,
      [idSolicitud]
    );

    await client.query('COMMIT');

    const solicitud = detailResult.rows[0];
    await require('./quickbooksSyncTrigger.service').scheduleContactSync(solicitud?.id_contacto);
    try {
      const driveResult = await driveExpedientesService.ensureExpedienteFoldersBySolicitud(idSolicitud);
      return {
        ...solicitud,
        drive_carpetas: driveResult.carpetas,
      };
    } catch (driveError) {
      console.warn(
        `[drive-expedientes] No se pudieron asegurar carpetas para solicitud ${idSolicitud}: ${driveError.message}`
      );
      return {
        ...solicitud,
        warning_drive: driveError.message || 'No se pudieron asegurar carpetas de Drive',
      };
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function insertSeguimientoIfAvailable(client, payload) {
  await client.query('SELECT pg_advisory_xact_lock(9021001)');
  const { rows } = await client.query(
    `INSERT INTO public.seguimientos (
       id_seguimiento,
       id_solicitud,
       estado_anterior,
       estado_nuevo,
       descripcion,
       id_empleado_responsable,
       fecha_seguimiento,
       origen,
       creado_en
     )
     SELECT
       COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos), 0) + 1,
       $1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7, NOW()
     RETURNING *`,
    [
      payload.idSolicitud,
      payload.estadoAnterior || null,
      payload.estadoNuevo || null,
      trimString(payload.descripcion),
      payload.idEmpleadoResponsable || null,
      payload.fechaSeguimiento || null,
      trimString(payload.origen),
    ]
  );

  return rows[0];
}

function normalizeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'si', 'sí', 'yes'].includes(String(value).trim().toLowerCase());
}

function buildCompactAvance(resumen) {
  if (!resumen) return null;
  return {
    perfil_porcentaje: resumen.perfil?.porcentaje_completado || 0,
    documentos_obligatorios_subidos: resumen.documentos?.obligatorios_subidos || 0,
    documentos_obligatorios_total: resumen.documentos?.obligatorios || 0,
    pdf_generado: Boolean(resumen.perfil?.pdf_generado),
    faltantes: Array.isArray(resumen.faltantes) ? resumen.faltantes.slice(0, 3) : [],
  };
}

async function resolveTipoTramite(value) {
  if (value === undefined || value === null || value === '') return null;

  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && numericValue > 0) return numericValue;

  const nombre = trimString(value);
  if (!nombre) return null;

  const { rows } = await pool.query(
    `SELECT id_tipo_tramite
     FROM public.tipos_tramite
     WHERE lower(nombre_tramite) = lower($1)
     LIMIT 1`,
    [nombre]
  );

  if (!rows[0]) throw badRequest('tipo_tramite must match an existing tipo');
  return rows[0].id_tipo_tramite;
}

async function getMisExpedientes(filters = {}) {
  const idEmpleado = optionalPositiveInteger(
    filters.id_empleado || filters.id_empleado_responsable,
    'id_empleado'
  );

  if (!idEmpleado) {
    throw badRequest('id_empleado is required until backend auth is wired');
  }

  const values = [idEmpleado];
  const where = ['s.id_empleado_responsable = $1'];

  const idAreaActual = optionalPositiveInteger(filters.id_area_actual, 'id_area_actual');
  if (idAreaActual) {
    values.push(idAreaActual);
    where.push(`s.id_area_actual = $${values.length}`);
  }

  if (filters.estado_actual !== undefined && filters.estado_actual !== null && filters.estado_actual !== '') {
    const estadoActual = await resolveEstadoActual(filters.estado_actual);
    values.push(estadoActual);
    where.push(`s.estado_actual = $${values.length}`);
  }

  if (filters.tipo_tramite !== undefined && filters.tipo_tramite !== null && filters.tipo_tramite !== '') {
    const idTipoTramite = await resolveTipoTramite(filters.tipo_tramite);
    values.push(idTipoTramite);
    where.push(`s.id_tipo_tramite = $${values.length}`);
  }

  const q = trimString(filters.q);
  if (q) {
    values.push(`%${q}%`);
    where.push(`(
      s.id_solicitud::text ILIKE $${values.length}
      OR c.nombre ILIKE $${values.length}
      OR c.apellido_paterno ILIKE $${values.length}
      OR c.apellido_materno ILIKE $${values.length}
      OR co.nombre ILIKE $${values.length}
      OR co.telefono ILIKE $${values.length}
      OR tt.nombre_tramite ILIKE $${values.length}
      OR ca.nombre ILIKE $${values.length}
      OR ca.clave ILIKE $${values.length}
    )`);
  }

  const includeAvance = normalizeBoolean(filters.include_avance, true);

  const { rows } = await pool.query(
    `SELECT
       s.id_solicitud,
       s.id_solicitud AS folio,
       s.id_cliente,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       co.telefono AS contacto_telefono,
       co.correo AS contacto_correo,
       tt.id_tipo_tramite,
       tt.nombre_tramite AS tipo_tramite,
       s.estado_actual,
       ce.valor AS estado_actual_nombre,
       ce.valor AS estado_actual_valor,
       s.id_area_actual,
       ca.nombre AS area_actual_nombre,
       ca.clave AS area_actual_clave,
       s.id_empleado_responsable,
       e.nombre AS responsable_nombre,
       e.apellidos AS responsable_apellidos,
       e.area AS responsable_area,
       s.canal_contacto,
       s.fecha_inicio,
       s.fecha_ultimo_movimiento,
       s.fecha_proximo_contacto,
       s.resultado
     FROM public.solicitudes s
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable
     WHERE ${where.join('\n       AND ')}
     ORDER BY s.fecha_ultimo_movimiento DESC NULLS LAST, s.fecha_inicio DESC NULLS LAST, s.id_solicitud DESC`,
    values
  );

  const solicitudes = await Promise.all(rows.map(async (row) => {
    let avance = null;
    if (includeAvance) {
      try {
        avance = buildCompactAvance(await getResumenAvanceSolicitud(row.id_solicitud));
      } catch (error) {
        avance = null;
      }
    }

    const aplicante = [
      row.cliente_nombre,
      row.cliente_apellido_paterno,
      row.cliente_apellido_materno,
    ].filter(Boolean).join(' ');

    const responsable = [
      row.responsable_nombre,
      row.responsable_apellidos,
    ].filter(Boolean).join(' ');

    return {
      ...row,
      aplicante: aplicante || null,
      responsable_nombre_completo: responsable || null,
      avance,
    };
  }));

  return {
    empleado: {
      id_empleado: idEmpleado,
    },
    solicitudes,
  };
}

async function getEstadosDisponiblesSolicitud(idSolicitud, query = pool.query.bind(pool)) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(
    `${SOLICITUD_DETAIL_SELECT}
     WHERE s.id_solicitud = $1
     LIMIT 1`,
    [safeIdSolicitud]
  );

  const solicitud = rows[0];
  if (!solicitud) throw notFound('Solicitud not found');

  const areaClave = String(solicitud.area_actual_clave || '').toUpperCase();
  const nombresPermitidos = ESTADOS_OPERATIVOS_POR_AREA[areaClave] || ['Pago validado'];
  const normalizedPermitidos = nombresPermitidos.map(normalizeText);

  const estadosResult = await query(
    `SELECT id, valor, categoria
     FROM public.catalogo_estatus
     ORDER BY id`
  );

  const estadosMap = new Map();
  estadosResult.rows
    .filter((estado) => normalizedPermitidos.includes(normalizeText(estado.valor)))
    .forEach((estado) => {
      const key = normalizeText(estado.valor);
      if (!estadosMap.has(key)) estadosMap.set(key, estado);
    });

  const estados = Array.from(estadosMap.values());

  return {
    solicitud: {
      id_solicitud: solicitud.id_solicitud,
      estado_actual: solicitud.estado_actual,
      estado_actual_valor: solicitud.estado_actual_valor,
      id_area_actual: solicitud.id_area_actual,
      area_actual_clave: solicitud.area_actual_clave,
      area_actual_nombre: solicitud.area_actual_nombre,
      id_tipo_tramite: solicitud.id_tipo_tramite,
      tipo_nombre: solicitud.tipo_nombre,
    },
    estados,
  };
}

async function avanzarSeguimientoOperativo(idSolicitud, payload = {}) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const estadoNuevo = positiveInteger(payload.estado_nuevo, 'estado_nuevo');
  const descripcion = trimString(payload.descripcion);
  if (!descripcion) throw badRequest('descripcion is required');

  const idEmpleado = optionalPositiveInteger(
    payload.id_empleado || payload.id_empleado_responsable,
    'id_empleado'
  );
  const fechaProximoContacto = optionalDate(payload.fecha_proximo_contacto, 'fecha_proximo_contacto');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentResult = await client.query(
      `SELECT *
       FROM public.solicitudes
       WHERE id_solicitud = $1
       FOR UPDATE`,
      [safeIdSolicitud]
    );

    const current = currentResult.rows[0];
    if (!current) throw notFound('Solicitud not found');

    await ensureEmpleadoExists(idEmpleado, client.query.bind(client));

    const disponibles = await getEstadosDisponiblesSolicitud(
      safeIdSolicitud,
      client.query.bind(client)
    );
    const permitido = disponibles.estados.find((estado) => Number(estado.id) === Number(estadoNuevo));
    if (!permitido) {
      throw badRequest('estado_nuevo is not allowed for current solicitud area');
    }

    await client.query(
      `UPDATE public.solicitudes
       SET estado_actual = $1,
           fecha_ultimo_movimiento = NOW(),
           fecha_proximo_contacto = COALESCE($2::date, fecha_proximo_contacto),
           actualizado_en = NOW()
       WHERE id_solicitud = $3`,
      [estadoNuevo, fechaProximoContacto, safeIdSolicitud]
    );

    const seguimiento = await insertSeguimientoIfAvailable(client, {
      idSolicitud: safeIdSolicitud,
      estadoAnterior: current.estado_actual,
      estadoNuevo,
      descripcion,
      idEmpleadoResponsable: idEmpleado || current.id_empleado_responsable,
      fechaSeguimiento: null,
      origen: 'seguimiento_operativo',
    });

    const detailResult = await client.query(
      `${SOLICITUD_DETAIL_SELECT}
       WHERE s.id_solicitud = $1
       LIMIT 1`,
      [safeIdSolicitud]
    );

    await client.query('COMMIT');
    return {
      solicitud: detailResult.rows[0],
      seguimiento,
      estados_disponibles: disponibles.estados,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getSolicitudes,
  getSolicitudById,
  getMisExpedientes,
  getEstadosDisponiblesSolicitud,
  avanzarSeguimientoOperativo,
  createSolicitud,
  createSolicitudForCliente,
  updateSolicitudEstado,
  moverSolicitudArea,
  updateSolicitudResponsable,
  updateSolicitud,
  getResumenAvanceSolicitud,
  resolverDestinoPostPago,
  enviarSolicitudPostPago,
  resolveEstadoActual,
  resolveArea,
  positiveInteger,
  optionalPositiveInteger,
  optionalDate,
  normalizeDiscount,
  trimString,
};
