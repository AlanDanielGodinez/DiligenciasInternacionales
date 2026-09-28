const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientes.controller');
const encuestasController = require('../controllers/encuestasSatisfaccion.controller');

router.post('/', controller.createCliente);
router.get('/', controller.listClientes);
router.post('/:idCliente/solicitudes', controller.createSolicitudForCliente);
router.patch('/:idCliente', controller.updateCliente);
router.get('/:idCliente/ficha', controller.getClienteFicha);
router.get('/:idCliente/encuestas-satisfaccion', encuestasController.listByCliente);
router.post('/:idCliente/encuestas-satisfaccion', encuestasController.createForCliente);
router.patch('/:idCliente/encuestas-satisfaccion/:idEncuesta', encuestasController.updateForCliente);
router.get('/:id', controller.getClienteById);

module.exports = router;
