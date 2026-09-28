const express = require('express');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/cliente-login', controller.clienteLogin);
router.get('/verify', controller.verify);

module.exports = router;
