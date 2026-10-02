const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentos.controller');
const { requirePermission } = require('../middlewares/auth');
const { requireSolicitudAccess } = require('../security/expedienteAccess');

// Toda la API ya exige sesión (middlewares/auth.authenticateApi); aquí se exige además
// permiso sobre el expediente o el documento.
router.get('/solicitud/:idSolicitud', requireSolicitudAccess('idSolicitud'), controller.listDocumentosBySolicitud);
router.get('/:idDocumento/descargar', controller.downloadDocumento); // valida acceso al documento en el controlador
router.get('/', requirePermission('documentos.listarTodos'), controller.listDocumentos);

module.exports = router;
