const express = require('express');
const router = express.Router();
const controller = require('../controllers/tiposTramite.controller');

router.get('/', controller.listTiposTramite);

module.exports = router;
