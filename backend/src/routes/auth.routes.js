const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

const loginEmailKey = (req) => String(req.body?.email || req.body?.correo || '').trim().toLowerCase().slice(0, 254);

// Límite por IP (frena barridos de correos) y por IP+correo (frena fuerza bruta a una cuenta).
const loginLimiterByIp = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_LOGIN_MAX_PER_IP || 50),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_ATTEMPTS', message: 'Demasiados intentos. Intente de nuevo más tarde.' } },
});
const loginLimiterByAccount = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_LOGIN_MAX_PER_ACCOUNT || 8),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}|${loginEmailKey(req)}`,
  message: { error: { code: 'TOO_MANY_ATTEMPTS', message: 'Demasiados intentos. Intente de nuevo más tarde.' } },
});

router.post('/login', loginLimiterByIp, loginLimiterByAccount, controller.login);
router.post('/register', controller.register);
router.post('/cliente-login', controller.clienteLogin);
router.get('/verify', requireAuth, controller.verify);
router.get('/me', requireAuth, controller.verify);
router.post('/cambiar-password', requireAuth, controller.changePassword);

module.exports = router;
