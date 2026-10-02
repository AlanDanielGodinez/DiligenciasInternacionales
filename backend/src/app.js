const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const contactosRoutes = require('./routes/contactos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const documentosRoutes = require('./routes/documentos.routes');
const empleadosRoutes = require('./routes/empleados.routes');
const areasRoutes = require('./routes/areas.routes');
const pagosRoutes = require('./routes/pagos.routes');
const finanzasRoutes = require('./routes/finanzas.routes');
const metodosPagoRoutes = require('./routes/metodosPago.routes');
const citasRoutes = require('./routes/citas.routes');
const calendarioAmaRoutes = require('./routes/calendarioAma.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const tiposTramiteRoutes = require('./routes/tiposTramite.routes');
const noticiasMigratoriasRoutes = require('./routes/noticiasMigratorias.routes');
const perfilesRoutes = require('./routes/perfiles.routes');
const gruposAmaRoutes = require('./routes/gruposAma.routes');
const viajesRoutes = require('./routes/viajes.routes');
const quickbooksRoutes = require('./routes/quickbooks.routes');
const negadosRoutes = require('./routes/negados.routes');
const legalesRoutes = require('./routes/legales.routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { authenticateApi, bindActor } = require('./middlewares/auth');
const { getAllowedOrigins } = require('./config/security');

dotenv.config();

const app = express();

// Detrás de un proxy/balanceador (Cloud Run, Nginx) defina TRUST_PROXY=1 para que req.ip sea el del cliente.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.disable('x-powered-by');
app.use(helmet({
  // El frontend React (build) se sirve desde este mismo servidor; CSP se afinará al migrar a Vite.
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

const allowedOrigins = getAllowedOrigins();
app.use(cors({
  // Sin lista configurada (desarrollo local) se permite cualquier origen; la API usa token Bearer,
  // no cookies, así que CORS no es la barrera de seguridad principal.
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: false,
}));
app.use(express.json({ limit: '2mb' }));

app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT_PER_MINUTE || 600),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

// Autenticación por defecto: toda ruta /api exige sesión salvo la lista pública de middlewares/auth.js.
app.use('/api', authenticateApi);
// La autoría (id_empleado, validado_por, registrado_por, subido_por) sale de la sesión, no del cuerpo.
app.use('/api', bindActor);

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/finanzas', finanzasRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/calendario-ama', calendarioAmaRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/tipos-tramite', tiposTramiteRoutes);
app.use('/api/noticias-migratorias', noticiasMigratoriasRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/grupos-ama', gruposAmaRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/integraciones/quickbooks', quickbooksRoutes);
app.use('/api/negados', negadosRoutes);
app.use('/api/legales', legalesRoutes);

const frontendBuildPath = path.resolve(__dirname, '../../diligenciasinternacionalesinc/build');
const frontendIndexPath = path.join(frontendBuildPath, 'index.html');

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(frontendIndexPath);
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
