const express = require('express');
const router = express.Router();
const controller = require('../controllers/empleados.controller');

router.get('/', controller.listEmpleados);

module.exports = router;
