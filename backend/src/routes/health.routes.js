const express = require('express');
const router = express.Router();
const controller = require('../controllers/health.controller');
const { requirePermission } = require('../middlewares/auth');

router.get('/', controller.getStatus);
// /api/health es público (monitoreo). El resto expone información interna: sólo Admin.
router.get('/db', requirePermission('sistema.diagnostico'), controller.getDbTime);
router.get('/tables', requirePermission('sistema.diagnostico'), controller.getTableCounts);

module.exports = router;
