// ============================================================================
// BACKEND HEREDADO — NO USAR. El servidor vigente es backend/src/server.js (npm start en backend/).
// Este archivo contiene lógica de autenticación antigua (MongoDB, abandonado; secretos de respaldo).
// Se bloquea su arranque accidental; se eliminará en la Fase 1 (limpieza).
// ============================================================================
if (process.env.ALLOW_LEGACY_BACKEND !== 'si-entiendo-el-riesgo') {
  console.error('[seguridad] backend-mongo/server.js es un servidor heredado e inseguro. Use: npm start (src/server.js).');
  process.exit(1);
}
const express = require('express');
const cors = require('cors');
// const connectDB = require('./src/config/database');
const { PORT } = require('./src/config/env');
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/auth');
const syncRoutes = require('./src/routes/sync');
const dashboardRoutes = require('./src/routes/dashboard');
const clientesRoutes = require('./src/routes/clientes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Inicializar conexión a PostgreSQL (Sequelize)
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Conectado a PostgreSQL via Sequelize');
  } catch (err) {
    console.error('Error conectando a PostgreSQL:', err);
  }
})();

app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', clientesRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend MongoDB funcionando correctamente',
    version: '1.0.0',
    database: 'PostgreSQL (Sequelize)'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    message: 'Server OK',
    mongodb: 'Conectado',
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`CORS habilitado`);
  console.log(`Base de datos: MongoDB Atlas`);
});