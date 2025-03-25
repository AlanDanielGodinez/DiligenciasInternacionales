require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aplicacion_web_dii',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Middlewares
app.use(cors());
app.use(express.json());

// ==============================================
// FUNCIONES DE UTILIDAD
// ==============================================

/**
 * Verifica y repara el usuario admin en la base de datos
 */
async function initializeAdmin() {
  try {
    // 1. Verificar/Crear rol Administrador
    let rolQuery = await pool.query("SELECT idrol FROM rol WHERE nombrerol = 'Administrador'");
    if (rolQuery.rows.length === 0) {
      rolQuery = await pool.query("INSERT INTO rol (nombrerol) VALUES ('Administrador') RETURNING idrol");
      console.log('[✓] Rol Administrador creado');
    }
    const idRol = rolQuery.rows[0].idrol;

    // 2. Verificar existencia del admin
    const adminQuery = await pool.query(
      "SELECT * FROM empleado WHERE correoempleado = 'admin@example.com' OR email = 'admin@example.com'"
    );

    // 3. Crear o actualizar admin
    if (adminQuery.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(`
        INSERT INTO empleado (
          nombreempleado, apellidopaternoempleado, apellidomaternoempleado,
          correoempleado, email, password, idrol
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['Admin', 'System', 'User', 'admin@example.com', 'admin@example.com', hashedPassword, idRol]);
      console.log('[✓] Usuario admin creado');
    } else {
      const admin = adminQuery.rows[0];
      const needsUpdate = !(await bcrypt.compare('admin123', admin.password));
      
      if (needsUpdate) {
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
          "UPDATE empleado SET password = $1 WHERE idempleado = $2",
          [newHashedPassword, admin.idempleado]
        );
        console.log('[✓] Contraseña de admin actualizada');
      }
    }
  } catch (error) {
    console.error('[!] Error inicializando admin:', error.message);
  }
}

/**
 * Middleware de autenticación JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// ==============================================
// RUTAS DE AUTENTICACIÓN
// ==============================================

/**
 * Login de usuario
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    // 1. Buscar usuario
    const userQuery = await pool.query(
      `SELECT e.*, r.nombrerol 
       FROM empleado e 
       JOIN rol r ON e.idrol = r.idrol 
       WHERE e.correoempleado = $1 OR e.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userQuery.rows[0];

    // 2. Validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generar token
    const token = jwt.sign(
      {
        id: user.idempleado,
        email: user.correoempleado || user.email,
        role: user.nombrerol
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

    // 4. Responder sin datos sensibles
    const userData = {
      id: user.idempleado,
      nombre: user.nombreempleado,
      email: user.correoempleado || user.email,
      rol: user.nombrerol
    };

    res.json({ token, user: userData });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * Verificar estado del admin
 */
app.get('/api/admin/status', async (req, res) => {
  try {
    const admin = await pool.query(
      `SELECT e.idempleado, e.nombreempleado, e.correoempleado, e.email, r.nombrerol
       FROM empleado e JOIN rol r ON e.idrol = r.idrol
       WHERE e.correoempleado = 'admin@example.com' OR e.email = 'admin@example.com'`
    );

    if (admin.rows.length === 0) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      admin: {
        ...admin.rows[0],
        email: admin.rows[0].correoempleado || admin.rows[0].email
      }
    });
  } catch (error) {
    console.error('Error verificando admin:', error);
    res.status(500).json({ error: 'Error verificando admin' });
  }
});

// ==============================================
// RUTAS PROTEGIDAS
// ==============================================

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Ruta protegida', 
    user: req.user 
  });
});

// ==============================================
// INICIO DEL SERVIDOR
// ==============================================

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await initializeAdmin();
});

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('Backend operativo');
});