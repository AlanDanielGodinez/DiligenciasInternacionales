/**
 * Bitácora de accesos (login, cambios de contraseña, descargas de documentos, rechazos).
 * Escribe en public.auditoria_accesos (sql/2026_10_02_auth_credenciales.sql). Si la tabla aún
 * no existe, deja la traza en consola y NUNCA interrumpe la petición.
 */
const { pool } = require('../config/db');

let tableMissingWarned = false;

async function registrarAcceso({ evento, idEmpleado = null, correo = null, req = null, recurso = null, detalle = null, exito = true }) {
  const ip = req ? (req.ip || req.socket?.remoteAddress || null) : null;
  const userAgent = req ? String(req.headers?.['user-agent'] || '').slice(0, 300) : null;
  try {
    await pool.query(
      `INSERT INTO public.auditoria_accesos (evento, id_empleado, correo, exito, recurso, ip, user_agent, detalle)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [evento, idEmpleado, correo, exito, recurso, ip, userAgent, detalle ? JSON.stringify(detalle) : null]
    );
  } catch (error) {
    if (error && error.code === '42P01') {
      if (!tableMissingWarned) {
        tableMissingWarned = true;
        console.warn('[auditoria] Falta la tabla public.auditoria_accesos; aplique sql/2026_10_02_auth_credenciales.sql');
      }
    } else {
      console.warn('[auditoria] No se pudo registrar el evento', { evento, code: error && error.code });
    }
    console.info('[auditoria]', { evento, idEmpleado, exito, recurso });
  }
}

module.exports = { registrarAcceso };
