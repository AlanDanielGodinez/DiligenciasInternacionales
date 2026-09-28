const express = require('express');
const controller = require('../controllers/metodosPago.controller');

const router = express.Router();

router.get('/', controller.listMetodosPago);
router.post('/', controller.createMetodoPago);
router.patch('/:idMetodoPago', controller.updateMetodoPago);
router.delete('/:idMetodoPago', controller.deactivateMetodoPago);

module.exports = router;
