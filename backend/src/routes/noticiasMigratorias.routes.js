const express = require('express');
const controller = require('../controllers/noticiasMigratorias.controller');

const router = express.Router();

router.get('/', controller.getNoticiasMigratorias);

module.exports = router;
