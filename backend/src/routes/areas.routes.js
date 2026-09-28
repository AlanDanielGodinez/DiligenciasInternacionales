const express = require('express');
const controller = require('../controllers/areas.controller');

const router = express.Router();

router.get('/:idArea/solicitudes', controller.listSolicitudesByArea);

module.exports = router;
