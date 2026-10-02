const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudes.controller');
const seguimientosController = require('../controllers/seguimientos.controller');
const individualOperacionController = require('../controllers/individualOperacion.controller');
const perfilesController = require('../controllers/perfiles.controller');
const documentosController = require('../controllers/documentos.controller');
const pagosController = require('../controllers/pagos.controller');
const viajesController = require('../controllers/viajes.controller');
const encuestasSatisfaccionController = require('../controllers/encuestasSatisfaccion.controller');
const multer = require('multer');
const { requirePermission, bindActor } = require('../middlewares/auth');
const { requireSolicitudAccess } = require('../security/expedienteAccess');
const expediente = requireSolicitudAccess('idSolicitud');

const allowedDocumentoMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const uploadDocumentoRequerido = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedDocumentoMimeTypes.has(String(file.mimetype || '').toLowerCase())) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF, JPG and PNG files are allowed'));
  },
});

const uploadComprobantePago = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedDocumentoMimeTypes.has(String(file.mimetype || '').toLowerCase())) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF, JPG and PNG files are allowed'));
  },
});

router.post('/', controller.createSolicitud);
router.get('/', controller.listSolicitudes);
router.get('/mis-expedientes', controller.getMisExpedientes);
router.post('/:idSolicitud/drive/asegurar-carpetas', controller.ensureDriveCarpetas);
router.patch('/:idSolicitud/estado', controller.updateSolicitudEstado);
router.patch('/:idSolicitud/mover-area', controller.moverSolicitudArea);
router.patch('/:idSolicitud/responsable', controller.updateSolicitudResponsable);
router.patch('/:idSolicitud', controller.updateSolicitud);
router.get('/:idSolicitud/resumen-avance', controller.getResumenAvance);
router.get('/:idSolicitud/estados-disponibles', controller.getEstadosDisponibles);
router.post('/:idSolicitud/seguimientos-operativos', controller.createSeguimientoOperativo);
router.get('/:idSolicitud/destino-post-pago', controller.getDestinoPostPago);
router.patch('/:idSolicitud/enviar-post-pago', controller.enviarSolicitudPostPago);
router.get('/:idSolicitud/pagos', pagosController.listPagosBySolicitud);
router.post('/:idSolicitud/pagos', uploadComprobantePago.single('comprobante'), bindActor, pagosController.createPago);
router.get('/:idSolicitud/cotizaciones-viaje', viajesController.listCotizacionesBySolicitud);
router.post('/:idSolicitud/cotizaciones-viaje', requirePermission('logistica.editar'), viajesController.createCotizacion);
router.get('/:idSolicitud/itinerario-viaje', viajesController.getItinerarioBySolicitud);
router.post('/:idSolicitud/itinerario-viaje', requirePermission('logistica.editar'), viajesController.createItinerario);
router.get('/:idSolicitud/encuesta-satisfaccion', encuestasSatisfaccionController.getBySolicitud);
router.post('/:idSolicitud/encuesta-satisfaccion', encuestasSatisfaccionController.createForSolicitud);
router.get('/:idSolicitud/perfil', perfilesController.getPerfilBySolicitud);
router.post('/:idSolicitud/perfil', perfilesController.createPerfilForSolicitud);
router.get('/:idSolicitud/documentos-requeridos', expediente, documentosController.listDocumentosRequeridosBySolicitud);
router.post(
  '/:idSolicitud/documentos-requeridos/:claveDocumento',
  expediente,
  uploadDocumentoRequerido.single('archivo'),
  bindActor,
  documentosController.uploadDocumentoRequerido
);
router.get('/:idSolicitud/seguimientos', seguimientosController.listSeguimientosBySolicitud);
router.get('/:idSolicitud/ds-actividades', individualOperacionController.listDs);
router.post('/:idSolicitud/ds-actividades', requirePermission('individual.operacion'), individualOperacionController.createDs);
router.patch('/:idSolicitud/resultado-individual', requirePermission('individual.operacion'), individualOperacionController.setResult);
const amaOperacionController = require('../controllers/amaOperacion.controller');
router.get('/:idSolicitud/operacion-ama', amaOperacionController.detail);
router.post('/:idSolicitud/operacion-ama/ds', requirePermission('ama.operacion'), amaOperacionController.addDs);
router.post('/:idSolicitud/operacion-ama/protocolo', requirePermission('ama.protocolo'), amaOperacionController.addProtocol);
router.patch('/:idSolicitud/operacion-ama/resultado', requirePermission('ama.operacion'), amaOperacionController.setResult);
router.patch('/:idSolicitud/operacion-ama/visa-recibida', requirePermission('ama.operacion'), amaOperacionController.receiveVisa);
router.get('/:idSolicitud/actividad-ama', async (req,res,next) => {
  try {
    const id=require('../services/solicitudes.service').positiveInteger(req.params.idSolicitud,'id_solicitud');
    const [state]=await require('../services/amaActividad.service').getActividad([id]);
    if(!state) return res.status(404).json({error:{message:'Solicitud no encontrada'}});
    res.json(state);
  } catch(error) { next(error); }
});
router.get('/:idSolicitud/notas', async (req,res,next) => {
  try {
    const {user}=req;
    res.json(await require('../services/solicitudNotas.service').listNotas(req.params.idSolicitud,user));
  }
  catch(error) { next(error); }
});
router.post('/:idSolicitud/notas', async (req,res,next) => {
  try {
    const {user}=req;
    res.status(201).json(await require('../services/solicitudNotas.service').addNota(req.params.idSolicitud,req.body || {},user));
  } catch(error) { next(error); }
});
router.post('/:idSolicitud/seguimientos', seguimientosController.createSeguimiento);
router.get('/:id', controller.getSolicitudById);

module.exports = router;
