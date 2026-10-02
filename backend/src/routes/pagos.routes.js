const express = require('express');
const multer = require('multer');
const controller = require('../controllers/pagos.controller');
const { requirePermission } = require('../middlewares/auth');

const router = express.Router();

const allowedComprobanteMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const uploadComprobante = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedComprobanteMimeTypes.has(String(file.mimetype || '').toLowerCase())) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF, JPG and PNG files are allowed'));
  },
});

router.get('/', requirePermission('pagos.bandeja'), controller.listPagos);
router.get('/solicitud/:idSolicitud', controller.listPagosBySolicitud);
router.patch('/:idPago/validar', requirePermission('pagos.validar'), controller.validarPago);
router.patch('/:idPago/rechazar', requirePermission('pagos.validar'), controller.rechazarPago);

router.uploadComprobante = uploadComprobante;

module.exports = router;
