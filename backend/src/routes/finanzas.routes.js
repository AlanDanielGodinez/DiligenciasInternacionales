const express = require('express');
const pagosController = require('../controllers/pagos.controller');

const router = express.Router();

router.get('/pagos', pagosController.listPagosFinanzas);
router.get('/solicitudes-pendientes-pago', pagosController.listSolicitudesPendientesPago);

module.exports = router;
