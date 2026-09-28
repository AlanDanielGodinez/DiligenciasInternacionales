const express = require('express');
const cors = require('cors');
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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
