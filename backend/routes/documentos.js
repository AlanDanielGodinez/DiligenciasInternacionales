const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const pool = require('../db');

router.post('/api/documentos', upload.single('archivo'), async (req, res) => {
  const { idSolicitud, nombreDocumento, tipoDocumento, estado } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo' });
  }

  const archivo = req.file.filename;

  try {
    const result = await pool.query(`
      INSERT INTO Documento (idSolicitud, nombreDocumento, tipoDocumento, archivo, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [idSolicitud, nombreDocumento, tipoDocumento, archivo, estado || 'activo']);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar documento:', error);
    res.status(500).json({ error: 'Error al guardar documento' });
  }
});

module.exports = router;
