const express = require('express');
const { register, login, verify } = require('../controllers/authController'); // Agregar verify
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify - NUEVO
router.get('/verify', authenticateToken, verify);

module.exports = router;