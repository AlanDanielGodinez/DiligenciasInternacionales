const { pool } = require('../config/db');
const gruposAmaService = require('./gruposAma.service');
const pagosService = require('./pagos.service');
const solicitudesService = require('./solicitudes.service');

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const optionalPositiveInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) return null;
  return numberValue;
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const roleAliases = [
  { key: 'ADMIN', matches: ['admin', 'administrador', 'direccion', 'configuracion'] },
  { key: 'INFORMES', matches: ['informes'] },
  { key: 'FINANZAS', matches: ['finanzas', 'pagos', 'contabilidad'] },
  { key: 'INDIVIDUALES', matches: ['individuales', 'multinacionales'] },
  { key: 'AMA', matches: ['ama'] },
  { key: 'LEGALES', matches: ['legales', 'legal', 'asesoria legal'] },
  { key: 'VUELOS', matches: ['vuelos', 'viajes', 'logistica', 'dilitours', 'turismo'] },
];

const areaByRole = {
  INDIVIDUALES: 3,
  AMA: 4,
  LEGALES: 5,
  VUELOS: 11,
};

function normalizeRole(value) {
  const normalized = normalizeText(value);
  if (!normalized) return 'ADMIN';

  const match = roleAliases.find(({ matches }) =>
    matches.some((alias) => normalized.includes(normalizeText(alias)))
  );

  return match?.key || 'ADMIN';
}

function buildFullName(row, prefix = '') {
  return [
    row[`${prefix}nombre`],
    row[`${prefix}apellido_paterno`],
    row[`${prefix}apellido_materno`],
    row[`${prefix}apellidos`],
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function mapSolicitudRow(row) {
  const aplicante = [
    row.cliente_nombre,
    row.cliente_apellido_paterno,
    row.cliente_apellido_materno,
  ].filter(Boolean).join(' ');
  const responsable = [row.responsable_nombre, row.responsable_apellidos].filter(Boolean).join(' ');

  return {
    ...row,
    folio: row.folio || row.id_solicitud,
    aplicante: aplicante || null,
    responsable_nombre_completo: responsable || null,
  };
}

function compactAvance(resumen) {
  if (!resumen) return null;
  return {
    perfil_porcentaje: resumen.perfil?.porcentaje_completado || 0,
    documentos_obligatorios_subidos: resumen.documentos?.obligatorios_subidos || 0,
    documentos_obligatorios_total: resumen.documentos?.obligatorios || 0,
    pdf_generado: Boolean(resumen.perfil?.pdf_generado),
    faltantes: Array.isArray(resumen.faltantes) ? resumen.faltantes.slice(0, 3) : [],
  };
}

async function safeGetAvance(idSolicitud) {
  try {
    return await solicitudesService.getResumenAvanceSolicitud(idSolicitud);
  } catch (error) {
    return null;
  }
}

async function getEmpleado(idEmpleado) {
  if (!idEmpleado) return null;
  const { rows } = await pool.query(
    `SELECT id_empleado, nombre, apellidos, correo, area, rol
     FROM public.empleados
     WHERE id_empleado = $1
     LIMIT 1`,
    [idEmpleado]
  );

  const empleado = rows[0];
  if (!empleado) return null;

  return {
    ...empleado,
    nombre_completo: [empleado.nombre, empleado.apellidos].filter(Boolean).join(' ') || null,
  };
}

async function getSolicitudesBase({ idEmpleado, idArea, limit = 12, recientes = false }) {
  const values = [];
  const where = [];

  if (idEmpleado) {
    values.push(idEmpleado);
    where.push(`s.id_empleado_responsable = $${values.length}`);
  }

  if (idArea) {
    values.push(idArea);
    where.push(`s.id_area_actual = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  values.push(limit);

  const { rows } = await pool.query(
    `SELECT
       s.id_solicitud,
       s.id_solicitud AS folio,
       s.id_cliente,
       s.estado_actual,
       ce.valor AS estado_actual_nombre,
       ce.valor AS estado_actual_valor,
       s.id_area_actual,
       ca.nombre AS area_actual_nombre,
       ca.clave AS area_actual_clave,
       s.id_empleado_responsable,
       s.canal_contacto,
       s.fecha_inicio,
       s.fecha_ultimo_movimiento,
       s.fecha_proximo_contacto,
       s.resultado,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       co.telefono AS contacto_telefono,
       tt.id_tipo_tramite,
       tt.nombre_tramite AS tipo_tramite,
       e.nombre AS responsable_nombre,
       e.apellidos AS responsable_apellidos
     FROM public.solicitudes s
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable
     ${whereSql}
     ORDER BY ${
       recientes
         ? 's.creado_en DESC NULLS LAST, s.id_solicitud DESC'
         : 's.fecha_ultimo_movimiento DESC NULLS LAST, s.fecha_inicio DESC NULLS LAST, s.id_solicitud DESC'
     }
     LIMIT $${values.length}`,
    values
  );

  const mapped = rows.map(mapSolicitudRow);
  return Promise.all(mapped.map(async (solicitud) => ({
    ...solicitud,
    avance: compactAvance(await safeGetAvance(solicitud.id_solicitud)),
  })));
}

async function getExpedientesPorArea() {
  const { rows } = await pool.query(
    `SELECT
       ca.id_area,
       ca.clave,
       ca.nombre,
       COUNT(s.id_solicitud)::int AS total
     FROM public.catalogo_areas ca
     LEFT JOIN public.solicitudes s ON s.id_area_actual = ca.id_area
     WHERE ca.activo = true
     GROUP BY ca.id_area, ca.clave, ca.nombre
     ORDER BY ca.id_area`
  );
  return rows;
}

async function getUltimosMovimientos({ idEmpleado, idArea, limit = 8 }) {
  const values = [];
  const where = [];

  if (idEmpleado) {
    values.push(idEmpleado);
    where.push(`s.id_empleado_responsable = $${values.length}`);
  }

  if (idArea) {
    values.push(idArea);
    where.push(`s.id_area_actual = $${values.length}`);
  }

  values.push(limit);

  const { rows } = await pool.query(
    `SELECT
       sg.id_seguimiento,
       sg.id_solicitud,
       sg.descripcion,
       sg.origen,
       sg.estado_anterior,
       sg.estado_nuevo,
       ea.valor AS estado_anterior_valor,
       en.valor AS estado_nuevo_valor,
       sg.fecha_seguimiento,
       sg.creado_en,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       tt.nombre_tramite AS tipo_tramite
     FROM public.seguimientos sg
     JOIN public.solicitudes s ON s.id_solicitud = sg.id_solicitud
     LEFT JOIN public.catalogo_estatus ea ON ea.id = sg.estado_anterior
     LEFT JOIN public.catalogo_estatus en ON en.id = sg.estado_nuevo
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY sg.creado_en DESC NULLS LAST, sg.id_seguimiento DESC
     LIMIT $${values.length}`,
    values
  );

  return rows.map((row) => ({
    ...row,
    aplicante: buildFullName(row, 'cliente_'),
  }));
}

async function getProximosContactos({ idEmpleado, idArea, limit = 8 }) {
  const values = [];
  const where = ['s.fecha_proximo_contacto IS NOT NULL'];

  if (idEmpleado) {
    values.push(idEmpleado);
    where.push(`s.id_empleado_responsable = $${values.length}`);
  }

  if (idArea) {
    values.push(idArea);
    where.push(`s.id_area_actual = $${values.length}`);
  }

  values.push(limit);

  const { rows } = await pool.query(
    `SELECT
       s.id_solicitud,
       s.fecha_proximo_contacto,
       ce.valor AS estado_actual_nombre,
       ca.nombre AS area_actual_nombre,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       tt.nombre_tramite AS tipo_tramite
     FROM public.solicitudes s
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     WHERE ${where.join(' AND ')}
     ORDER BY s.fecha_proximo_contacto ASC, s.id_solicitud DESC
     LIMIT $${values.length}`,
    values
  );

  return rows.map((row) => ({
    ...row,
    aplicante: buildFullName(row, 'cliente_'),
  }));
}

async function getPagosPorValidar(limit = 8) {
  const { rows } = await pool.query(
    `SELECT
       p.id_pago,
       p.id_solicitud,
       p.monto,
       p.moneda,
       p.concepto,
       p.estado_pago,
       p.fecha_pago,
       p.creado_en,
       p.id_documento_comprobante,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       tt.nombre_tramite AS tipo_tramite
     FROM public.pagos p
     LEFT JOIN public.solicitudes s ON s.id_solicitud = p.id_solicitud
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     WHERE lower(COALESCE(p.estado_pago, '')) = 'registrado'
     ORDER BY p.creado_en DESC NULLS LAST, p.id_pago DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    ...row,
    aplicante: buildFullName(row, 'cliente_'),
  }));
}

async function getPagosRecientes(limit = 8) {
  const { rows } = await pool.query(
    `SELECT
       p.id_pago,
       p.id_solicitud,
       p.monto,
       p.moneda,
       p.concepto,
       p.estado_pago,
       p.fecha_pago,
       p.creado_en,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       tt.nombre_tramite AS tipo_tramite
     FROM public.pagos p
     LEFT JOIN public.solicitudes s ON s.id_solicitud = p.id_solicitud
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     ORDER BY p.creado_en DESC NULLS LAST, p.id_pago DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    ...row,
    aplicante: buildFullName(row, 'cliente_'),
  }));
}

function buildAlertas({ solicitudes, pendientesPago, pagosPorValidar }) {
  const alertas = [];

  solicitudes.forEach((solicitud) => {
    const avance = solicitud.avance;
    if (avance && avance.perfil_porcentaje < 100) {
      alertas.push({
        tipo: 'perfil_incompleto',
        severidad: 'media',
        id_solicitud: solicitud.id_solicitud,
        titulo: `Perfil incompleto en solicitud #${solicitud.id_solicitud}`,
        descripcion: `${avance.perfil_porcentaje}% capturado`,
      });
    }

    if (avance && avance.documentos_obligatorios_subidos < avance.documentos_obligatorios_total) {
      alertas.push({
        tipo: 'documentos_faltantes',
        severidad: 'alta',
        id_solicitud: solicitud.id_solicitud,
        titulo: `Documentos pendientes en solicitud #${solicitud.id_solicitud}`,
        descripcion: avance.faltantes?.length ? avance.faltantes.join(', ') : 'Faltan documentos obligatorios',
      });
    }

    if (!solicitud.id_empleado_responsable) {
      alertas.push({
        tipo: 'sin_responsable',
        severidad: 'media',
        id_solicitud: solicitud.id_solicitud,
        titulo: `Solicitud #${solicitud.id_solicitud} sin responsable`,
        descripcion: solicitud.tipo_tramite || 'Expediente sin asignar',
      });
    }

    if (solicitud.fecha_proximo_contacto) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fecha = new Date(solicitud.fecha_proximo_contacto);
      if (!Number.isNaN(fecha.getTime()) && fecha < today) {
        alertas.push({
          tipo: 'proximo_contacto_vencido',
          severidad: 'alta',
          id_solicitud: solicitud.id_solicitud,
          titulo: `Contacto vencido en solicitud #${solicitud.id_solicitud}`,
          descripcion: `Fecha programada: ${solicitud.fecha_proximo_contacto}`,
        });
      }
    }
  });

  pendientesPago.slice(0, 4).forEach((solicitud) => {
    alertas.push({
      tipo: 'pago_pendiente',
      severidad: 'media',
      id_solicitud: solicitud.id_solicitud,
      titulo: `Pago pendiente en solicitud #${solicitud.id_solicitud}`,
      descripcion: solicitud.aplicante || solicitud.tipo_tramite || 'Pendiente de pago',
    });
  });

  pagosPorValidar.slice(0, 4).forEach((pago) => {
    alertas.push({
      tipo: 'pago_por_validar',
      severidad: 'alta',
      id_solicitud: pago.id_solicitud,
      titulo: `Pago por validar en solicitud #${pago.id_solicitud}`,
      descripcion: `${pago.monto || ''} ${pago.moneda || ''}`.trim(),
    });
  });

  return alertas.slice(0, 10);
}

async function getDashboardResumen(filters = {}) {
  const idEmpleado = optionalPositiveInteger(filters.id_empleado || filters.id_empleado_responsable);
  const role = normalizeRole(filters.rol || filters.role);
  const idAreaQuery = optionalPositiveInteger(filters.id_area);
  const idArea = idAreaQuery || areaByRole[role] || null;
  const includeGlobal = String(filters.include_global || '').toLowerCase() === 'true' || role === 'ADMIN';
  const empleado = await getEmpleado(idEmpleado);

  const shouldUseMisExpedientes = Boolean(idEmpleado);
  const misExpedientes = shouldUseMisExpedientes
    ? await getSolicitudesBase({ idEmpleado, limit: 10 })
    : [];

  const areaSolicitudes = idArea && !shouldUseMisExpedientes
    ? await getSolicitudesBase({ idArea, limit: 10 })
    : [];

  const recientes = role === 'INFORMES' || role === 'ADMIN'
    ? await getSolicitudesBase({ limit: 8, recientes: true })
    : [];

  const solicitudesTrabajo = misExpedientes.length ? misExpedientes : areaSolicitudes;
  const pendientesPago = role === 'FINANZAS' || role === 'ADMIN' || role === 'INFORMES'
    ? await pagosService.listSolicitudesPendientesPago({ include_avance: 'false' })
    : [];
  const pagosPorValidar = role === 'FINANZAS' || role === 'ADMIN'
    ? await getPagosPorValidar()
    : [];
  const pagosRecientes = role === 'FINANZAS' || role === 'ADMIN'
    ? await getPagosRecientes()
    : [];
  const gruposAma = role === 'AMA' || role === 'ADMIN'
    ? await gruposAmaService.listGrupos({ activo: true })
    : [];
  const proximosContactos = await getProximosContactos({ idEmpleado, idArea: includeGlobal ? null : idArea });
  const ultimosMovimientos = await getUltimosMovimientos({ idEmpleado, idArea: includeGlobal ? null : idArea });
  const expedientesPorArea = includeGlobal ? await getExpedientesPorArea() : [];

  const documentosFaltantes = solicitudesTrabajo.reduce((total, solicitud) => {
    const avance = solicitud.avance;
    if (!avance) return total;
    return total + Math.max(
      0,
      (avance.documentos_obligatorios_total || 0) - (avance.documentos_obligatorios_subidos || 0)
    );
  }, 0);
  const perfilesIncompletos = solicitudesTrabajo.filter((solicitud) =>
    solicitud.avance && solicitud.avance.perfil_porcentaje < 100
  ).length;
  const hoy = new Date().toISOString().slice(0, 10);
  const proximosContactosHoy = proximosContactos.filter((contacto) =>
    String(contacto.fecha_proximo_contacto || '').slice(0, 10) === hoy
  ).length;

  return {
    usuario: {
      id_empleado: idEmpleado || null,
      rol: role,
      nombre: empleado?.nombre_completo || trimString(filters.nombre) || null,
      area: empleado?.area || null,
      fallback_temporal: !idEmpleado,
    },
    metricas: {
      mis_expedientes_activos: solicitudesTrabajo.length,
      pendientes_pago: pendientesPago.length,
      pagos_por_validar: pagosPorValidar.length,
      perfiles_incompletos: perfilesIncompletos,
      documentos_faltantes: documentosFaltantes,
      proximos_contactos_hoy: proximosContactosHoy,
      grupos_ama_activos: gruposAma.filter((grupo) => grupo.activo !== false).length,
    },
    mis_expedientes: solicitudesTrabajo,
    expedientes_recientes: recientes,
    alertas: buildAlertas({ solicitudes: solicitudesTrabajo, pendientesPago, pagosPorValidar }),
    proximos_contactos: proximosContactos,
    ultimos_movimientos: ultimosMovimientos,
    expedientes_por_area: expedientesPorArea,
    pagos_recientes: pagosRecientes,
    pagos_por_validar: pagosPorValidar,
    grupos_ama: gruposAma,
  };
}

module.exports = {
  getDashboardResumen,
};
