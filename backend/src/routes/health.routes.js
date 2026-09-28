const express = require('express');
const router = express.Router();
const controller = require('../controllers/health.controller');

router.get('/', controller.getStatus);
router.get('/db', controller.getDbTime);
router.get('/tables', controller.getTableCounts);

module.exports = router;
