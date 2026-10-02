const express = require('express');
const router = express.Router();
const controller = require('../controllers/citas.controller');
const individual = require('../controllers/individualOperacion.controller');
const { requirePermission } = require('../middlewares/auth');

router.get('/', controller.listCitas);
router.get('/individual', individual.list);
router.post('/individual/:idSolicitud', requirePermission('individual.operacion'), individual.create);
router.patch('/individual/:idSolicitud/:idCita', requirePermission('individual.operacion'), individual.update);

module.exports = router;
