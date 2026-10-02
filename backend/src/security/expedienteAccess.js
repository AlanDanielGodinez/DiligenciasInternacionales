/**
 * Acceso a expedientes y documentos de clientes (pasaportes, identificaciones, comprobantes).
 *
 * Regla (DOCUMENT_ACCESS_POLICY=area, por defecto). Un empleado puede ver/descargar
 * documentos de un expediente si:
 *   1. Tiene el permiso 'documentos.leerCualquierExpediente' (ADMIN), o
 *   2. Es el responsable del expediente (solicitudes.id_empleado_responsable), o
 *   3. El expediente está actualmente en su área (id_area del empleado o área de su grupo), o
 *   4. Es un comprobante de pago y tiene 'documentos.leerComprobantesPago' (Finanzas).
 *
 * DOCUMENT_ACCESS_POLICY=authenticated relaja la regla a "cualquier empleado con sesión"
 * (sólo como medida temporal durante la operación en paralelo con AppSheet).
 */
const { pool } = require('../config/db');
const { hasPermission, areaKeysFor } = require('./permissions');

const forbidden = (message = 'No tiene acceso a este expediente') =>
  Object.assign(new Error(message), { status: 403, code: 'EXPEDIENTE_FORBIDDEN' });

const getPolicy = () => (String(process.env.DOCUMENT_ACCESS_POLICY || 'area').toLowerCase() === 'authenticated'
  ? 'authenticated' : 'area');

function accessParams(user) {
  return [
    Number(user?.id_empleado) || null,
    Number(user?.id_area) || null,
    areaKeysFor(user),
  ];
}

async function canAccessSolicitud(user, idSolicitud, query = pool.query.bind(pool)) {
  if (!user) return false;
  if (getPolicy() === 'authenticated' || hasPermission(user, 'documentos.leerCualquierExpediente')) return true;
  const [idEmpleado, idArea, areaKeys] = accessParams(user);
  const { rows } = await query(
    `SELECT 1
     FROM public.solicitudes s
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     WHERE s.id_solicitud = $1
       AND (
         s.id_empleado_responsable = $2
         OR ($3::int IS NOT NULL AND s.id_area_actual = $3)
         OR upper(ca.clave) = ANY($4::text[])
       )
     LIMIT 1`,
    [idSolicitud, idEmpleado, idArea, areaKeys]
  );
  return Boolean(rows[0]);
}

async function assertSolicitudAccess(user, idSolicitud, query) {
  if (!(await canAccessSolicitud(user, idSolicitud, query))) throw forbidden();
  return true;
}

async function canAccessDocumento(user, idDocumento, query = pool.query.bind(pool)) {
  if (!user) return false;
  if (getPolicy() === 'authenticated' || hasPermission(user, 'documentos.leerCualquierExpediente')) return true;
  const [idEmpleado, idArea, areaKeys] = accessParams(user);
  const canReadReceipts = hasPermission(user, 'documentos.leerComprobantesPago');
  const { rows } = await query(
    `SELECT 1
     FROM public.documentos d
     LEFT JOIN public.solicitudes s
       ON s.id_solicitud = d.id_solicitud
       OR (d.id_solicitud IS NULL AND d.id_cliente IS NOT NULL AND s.id_cliente = d.id_cliente)
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     WHERE d.id_documento = $1
       AND (
         s.id_empleado_responsable = $2
         OR ($3::int IS NOT NULL AND s.id_area_actual = $3)
         OR upper(ca.clave) = ANY($4::text[])
         OR ($5::boolean AND EXISTS (
               SELECT 1 FROM public.pagos p WHERE p.id_documento_comprobante = d.id_documento))
       )
     LIMIT 1`,
    [idDocumento, idEmpleado, idArea, areaKeys, canReadReceipts]
  );
  return Boolean(rows[0]);
}

async function assertDocumentoAccess(user, idDocumento, query) {
  if (!(await canAccessDocumento(user, idDocumento, query))) throw forbidden('No tiene acceso a este documento');
  return true;
}

/** Middleware: exige acceso al expediente indicado en req.params[param]. */
function requireSolicitudAccess(param = 'idSolicitud') {
  return async (req, res, next) => {
    const id = Number(req.params[param]);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: { message: `${param} must be a positive numeric value` } });
    }
    try {
      await assertSolicitudAccess(req.user, id);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  getPolicy,
  canAccessSolicitud,
  assertSolicitudAccess,
  canAccessDocumento,
  assertDocumentoAccess,
  requireSolicitudAccess,
};
