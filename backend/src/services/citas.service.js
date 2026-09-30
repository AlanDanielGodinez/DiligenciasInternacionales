const { pool } = require('../config/db');

async function getCitas({ limit = 50, offset = 0 }) {
  // El cliente se obtiene desde la solicitud; citas no tiene id_cliente
  const sql = `SELECT ci.*, 
    s.id_solicitud AS solicitud_id, s.id_cliente AS solicitud_id_cliente,
    c.id_cliente AS cliente_id, c.nombre AS cliente_nombre, c.apellido_paterno AS cliente_apellido_paterno, c.apellido_materno AS cliente_apellido_materno, c.telefono AS cliente_telefono, c.correo AS cliente_correo,
    tt.id_tipo_tramite AS tipo_id, tt.nombre_tramite AS tipo_nombre
    FROM citas ci
    LEFT JOIN solicitudes s ON s.id_solicitud = ci.id_solicitud
    LEFT JOIN clientes c ON c.id_cliente = s.id_cliente
    LEFT JOIN tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
    ORDER BY ci.id_cita DESC LIMIT $1 OFFSET $2`;
  const { rows } = await pool.query(sql, [limit, offset]);
  return rows;
}

module.exports = { getCitas };
