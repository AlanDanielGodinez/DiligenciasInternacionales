const express = require('express');
const router = express.Router();
const controller = require('../controllers/catalogos.controller');

router.get('/areas', controller.listAreas);
router.get('/paises', controller.listPaises);
router.get('/estatus', controller.listEstatus);

module.exports = router;
