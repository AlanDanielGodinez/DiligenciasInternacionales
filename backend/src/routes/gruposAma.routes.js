const express = require('express');
const controller = require('../controllers/gruposAma.controller');

const { requirePermissionForWrites } = require('../middlewares/auth');

const router = express.Router();

router.use(requirePermissionForWrites('ama.grupos.editar'));

router.get('/candidatos', controller.listCandidatos);
router.get('/aplicantes', controller.listAplicantes);
router.get('/', controller.listGrupos);
router.post('/', controller.createGrupo);
router.get('/:idGrupo', controller.getGrupo);
router.patch('/:idGrupo', controller.updateGrupo);
router.post('/:idGrupo/terminar', controller.terminarGrupo);
router.get('/:idGrupo/checklist', controller.listChecklist);
router.post('/:idGrupo/checklist/generar', controller.generateChecklist);
router.patch('/:idGrupo/checklist/:idChecklist', controller.updateChecklistItem);
router.get('/:idGrupo/solicitudes', controller.listSolicitudes);
router.post('/:idGrupo/solicitudes', controller.addSolicitudes);
router.delete('/:idGrupo/solicitudes/:idSolicitud', controller.removeSolicitud);

module.exports = router;
