const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { PORT } = require('./src/config/env');

// Importar rutas
const authRoutes = require('./src/routes/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB();

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend MongoDB funcionando correctamente!' });
});

// Ruta para verificar conexión a BD
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Server OK',
    mongodb: 'Conectado',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});