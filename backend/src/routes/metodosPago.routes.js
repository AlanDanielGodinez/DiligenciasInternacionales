const express = require('express');
const controller = require('../controllers/metodosPago.controller');

const { requirePermissionForWrites } = require('../middlewares/auth');

const router = express.Router();

// Lectura: cualquier empleado (catálogo para registrar pagos). Escritura: Finanzas/Admin.
router.use(requirePermissionForWrites('metodosPago.administrar'));

router.get('/', controller.listMetodosPago);
router.post('/', controller.createMetodoPago);
router.patch('/:idMetodoPago', controller.updateMetodoPago);
router.delete('/:idMetodoPago', controller.deactivateMetodoPago);

module.exports = router;
