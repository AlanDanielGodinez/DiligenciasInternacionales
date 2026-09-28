const { pool } = require('../config/db');

async function getTiposTramite({ limit = 50, offset = 0 }) {
  const { rows } = await pool.query('SELECT * FROM tipos_tramite ORDER BY id_tipo_tramite ASC LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
}

module.exports = { getTiposTramite };
