const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentos.controller');

router.get('/solicitud/:idSolicitud', controller.listDocumentosBySolicitud);
router.get('/:idDocumento/descargar', controller.downloadDocumento);
router.get('/', controller.listDocumentos);

module.exports = router;
