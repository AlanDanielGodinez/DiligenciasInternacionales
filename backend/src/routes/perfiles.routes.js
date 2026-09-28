const express = require('express');
const router = express.Router();
const controller = require('../controllers/perfiles.controller');

router.get('/plantillas', controller.listPlantillas);
router.get('/plantillas/resolver', controller.resolverPlantilla);
router.post('/versiones/:idVersion/generar-pdf', controller.generarPdfVersion);
router.patch('/:idPerfil', controller.updatePerfil);
router.get('/:idPerfil/versiones', controller.listVersiones);

module.exports = router;
