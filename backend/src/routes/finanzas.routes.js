const express = require('express');
const pagosController = require('../controllers/pagos.controller');

const { requirePermission } = require('../middlewares/auth');

const router = express.Router();

router.use(requirePermission('pagos.bandeja'));

router.get('/pagos', pagosController.listPagosFinanzas);
router.get('/solicitudes-pendientes-pago', pagosController.listSolicitudesPendientesPago);

module.exports = router;
