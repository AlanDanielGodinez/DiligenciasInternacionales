const express = require('express');
const { register, login, verify, clienteLogin } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/register - Registro de nuevos usuarios
router.post('/register', register);

// POST /api/auth/login - Login para empleados/administradores
router.post('/login', login);

// POST /api/auth/cliente-login - Login para clientes
router.post('/cliente-login', clienteLogin);

// GET /api/auth/verify - Verificar token (requiere autenticación)
router.get('/verify', authenticateToken, verify);

module.exports = router;