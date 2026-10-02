const express = require('express');
const controller = require('../controllers/viajes.controller');
const catalogos = require('../controllers/logisticaCatalogos.controller');

const { requirePermissionForWrites } = require('../middlewares/auth');

const router = express.Router();

router.use(requirePermissionForWrites('logistica.editar'));

router.get('/cotizaciones', controller.listCotizaciones);
router.patch('/cotizaciones/:idCotizacion', controller.updateCotizacion);
router.get('/itinerarios', controller.listItinerarios);
router.patch('/itinerarios/:idItinerario', controller.updateItinerario);
router.get('/tours', catalogos.listTours);
router.post('/tours', catalogos.createTour);
router.patch('/tours/:id', catalogos.updateTour);
router.get('/grupos', catalogos.listGroups);
router.post('/grupos', catalogos.createGroup);
router.get('/grupos/:id', catalogos.getGroup);
router.patch('/grupos/:id', catalogos.updateGroup);
router.post('/grupos/:id/integrantes', catalogos.addMember);

module.exports = router;
