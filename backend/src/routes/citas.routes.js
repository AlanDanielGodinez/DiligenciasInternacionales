const express = require('express');
const router = express.Router();
const controller = require('../controllers/citas.controller');
const individual = require('../controllers/individualOperacion.controller');

router.get('/', controller.listCitas);
router.get('/individual', individual.list);
router.post('/individual/:idSolicitud', individual.create);
router.patch('/individual/:idSolicitud/:idCita', individual.update);

module.exports = router;
