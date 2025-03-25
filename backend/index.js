const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aplicacion_web_dii',
  password: process.env.DB_PASSWORD || 'tu_contraseña',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario en la base de datos
    const userQuery = await pool.query(
      'SELECT e.*, r.nombreRol FROM Empleado e JOIN Rol r ON e.idRol = r.idRol WHERE e.email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userQuery.rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: user.idempleado,
        email: user.email,
        role: user.nombrerol
      },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '8h' }
    );

    // Responder con el token y datos del usuario (sin la contraseña)
    delete user.password;
    res.json({ token, user });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esta es una ruta protegida', user: req.user });
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Ruta para verificar el usuario admin
app.get('/api/check-admin', async (req, res) => {
  try {
    const adminQuery = await pool.query(
      "SELECT * FROM Empleado WHERE email = 'admin@example.com'"
    );
    
    if (adminQuery.rows.length > 0) {
      console.log('Usuario admin encontrado:', adminQuery.rows[0]);
      res.json({ exists: true, admin: adminQuery.rows[0] });
    } else {
      console.log('Usuario admin no encontrado');
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error verificando admin:', error);
    res.status(500).json({ error: 'Error verificando usuario admin' });
  }
});

app.get('/', (req, res) => {
  res.send('¡Backend funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  // Verificar automáticamente si el admin existe al iniciar
  pool.query("SELECT * FROM Empleado WHERE email = 'admin@example.com'")
    .then(result => {
      if (result.rows.length > 0) {
        console.log('[✓] Usuario admin está configurado');
      } else {
        console.log('[!] Usuario admin no encontrado');
      }
    })
    .catch(err => {
      console.error('Error verificando admin:', err);
    });
});