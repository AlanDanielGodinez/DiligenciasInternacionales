const { pool } = require('../config/db');

exports.getStatus = (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
};

exports.getDbTime = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as now');
    res.json({ dbTime: rows[0].now });
  } catch (err) {
    next(err);
  }
};

exports.getTableCounts = async (req, res, next) => {
  try {
    // Whitelisted tables to avoid SQL injection via table names
    const tables = [
      'contacto',
      'clientes',
      'solicitudes',
      'documentos',
      'pagos',
      'citas',
      'tipos_tramite',
      'calendario_ama',
      'staging.mapeo_migracion'
    ];

    const counts = {};
    for (const t of tables) {
      // table names are safe because they come from a whitelist
      const q = `SELECT COUNT(*)::int AS count FROM ${t}`;
      const { rows } = await pool.query(q);
      counts[t] = rows[0].count;
    }

    res.json({ counts });
  } catch (err) {
    next(err);
  }
};
