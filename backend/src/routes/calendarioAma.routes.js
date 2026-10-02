const express = require('express');
const router = express.Router();
const controller = require('../controllers/calendarioAma.controller');
const { requirePermissionForWrites } = require('../middlewares/auth');

router.use(requirePermissionForWrites('ama.calendario.editar'));

router.get('/', controller.listCalendarioAma);
router.get('/llamadas', controller.listLlamadas);
router.post('/llamadas', controller.createLlamada);
router.patch('/llamadas/:idLlamada', controller.updateLlamada);

module.exports = router;
