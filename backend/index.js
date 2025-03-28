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
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
  // 1. Buscar token en múltiples ubicaciones posibles
  const token = req.headers['authorization']?.split(' ')[1] || 
                req.headers['x-access-token'] || 
                req.query.token;
  
  // 2. Mejor logging para depuración
  console.log('Middleware de autenticación - Token recibido:', token ? '*****' + token.slice(-5) : 'Ninguno');
  console.log('Headers recibidos:', req.headers);

  if (!token) {
    console.error('Error: Intento de acceso sin token a:', req.path);
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      details: 'Debes incluir el token en el header Authorization: Bearer <token>'
    });
  }

  // 3. Verificación más robusta
  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      console.error('Error verificando token:', err.message);
      return res.status(403).json({ 
        error: 'Token inválido',
        details: err.message.includes('expired') ? 'Token expirado' : 'Token mal formado'
      });
    }
    
    // 4. Añadir información de usuario a la request
    req.user = {
      ...user,
      token // Opcional: guardar el token completo en la request
    };
    next();
  });
}

// Añade esto en tus rutas de autenticación
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
    expiresIn: new Date(req.user.exp * 1000)
  });
});

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

// Obtener usuario actual
app.get('/api/auth/current-user', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT idEmpleado, nombreEmpleado, apellidoPaternoEmpleado 
       FROM Empleado WHERE idEmpleado = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear nuevo cliente
app.post('/api/clientes', authenticateToken, async (req, res) => {
  const { nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente, telefono, identificacionunicanacional } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Cliente (
        nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente,
        telefono, identificacionunicanacional
      ) VALUES ($1, $2, $3, $4, $5) RETURNING idCliente, nombreCliente, apellidoPaternoCliente`,
      [nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente, telefono, identificacionunicanacional]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// Crear nuevo trámite
app.post('/api/tramites', authenticateToken, async (req, res) => {
  const { tipoTramite, descripcion, requisitos } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Tramite (
        tipoTramite, descripcion, requisitos
      ) VALUES ($1, $2, $3) RETURNING idTramite, tipoTramite, descripcion`,
      [tipoTramite, descripcion, requisitos || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear trámite:', error);
    res.status(500).json({ error: 'Error al crear trámite' });
  }
});


// ==============================================
// RUTAS PARA EL FORMULARIO DE SOLICITUDES
// ==============================================

// Obtener todos los clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idCliente, nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente 
      FROM Cliente
      ORDER BY nombreCliente
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener todos los trámites
app.get('/api/tramites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idTramite, tipoTramite, descripcion 
      FROM Tramite
      ORDER BY tipoTramite
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener trámites:', error);
    res.status(500).json({ error: 'Error al obtener trámites' });
  }
});

// Obtener todos los empleados
app.get('/api/empleados', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idEmpleado, nombreEmpleado, apellidoPaternoEmpleado, correoEmpleado 
      FROM Empleado
      ORDER BY nombreEmpleado
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// Crear una nueva solicitud
app.post('/api/solicitudes', authenticateToken, async (req, res) => {
  const { idCliente, idTramite, idEmpleado, fechaSolicitud, estado_actual } = req.body;

  if (!idCliente || !idTramite || !idEmpleado || !fechaSolicitud || !estado_actual) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Solicitud 
       (idCliente, idTramite, idEmpleado, fechaSolicitud, estado_actual) 
       VALUES ($1, $2, $3, $4, $5) RETURNING idSolicitud`,
      [idCliente, idTramite, idEmpleado, fechaSolicitud, estado_actual]
    );

    res.status(201).json({
      message: 'Solicitud creada exitosamente',
      idSolicitud: result.rows[0].idsolicitud
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
});


// ==============================================
// RUTAS PARA ÁREAS
// ==============================================

// Obtener todas las áreas
app.get('/api/areas', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.idArea as "idArea", 
        COALESCE(a.nombreArea, '') as "nombreArea",
        COALESCE(a.descripcion, '') as "descripcion",
        COALESCE(e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado, 'Sin asignar') as "responsable",
        e.idEmpleado as "idResponsable"
      FROM Area a
      LEFT JOIN Empleado e ON a.responsableArea = e.idEmpleado
      ORDER BY a.nombreArea
    `);
    
    const areasWithCount = await Promise.all(result.rows.map(async area => {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM Empleado WHERE idArea = $1',
        [area.idArea]  // Usar idArea en lugar de idarea
      );
      return {
        idArea: area.idArea,
        nombreArea: area.nombreArea,
        descripcion: area.descripcion,
        responsable: area.responsable,
        idResponsable: area.idResponsable,
        empleados: parseInt(countResult.rows[0].count || 0)
      };
    }));
    
    res.json(areasWithCount);
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ error: 'Error al obtener áreas' });
  }
});

// Crear nueva área
app.post('/api/areas', authenticateToken, async (req, res) => {
  console.log('Datos recibidos para crear área:', req.body); // Log de lo que llega
  
  const { nombreArea, descripcion } = req.body;

  if (!nombreArea) {
    console.error('Error validación: Nombre faltante');
    return res.status(400).json({ error: 'El nombre del área es requerido' });
  }

  try {
    console.log('Ejecutando query SQL...');
    const result = await pool.query(
      `INSERT INTO Area (nombreArea, descripcion, responsableArea)
       VALUES ($1, $2, NULL)
       RETURNING idArea, nombreArea, descripcion`,
      [nombreArea, descripcion || '']
    );
    
    console.log('Área creada con ID:', result.rows[0].idArea);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error en la base de datos:', {
      message: error.message,
      query: error.query,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Error al crear área',
      details: error.message,
      hint: 'Verifique que la tabla Area exista y tenga los campos correctos'
    });
  }
});

// Elimina una de las rutas PUT duplicadas y deja solo esta:
app.put('/api/areas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombreArea, descripcion, responsableArea } = req.body;

  if (!nombreArea) {
    return res.status(400).json({ error: 'El nombre del área es requerido' });
  }

  try {
    // Verificar si el responsable existe si se proporciona
    if (responsableArea) {
      const empleadoExists = await pool.query(
        'SELECT idEmpleado FROM Empleado WHERE idEmpleado = $1',
        [responsableArea]
      );
      
      if (empleadoExists.rows.length === 0) {
        return res.status(400).json({ error: 'El empleado responsable no existe' });
      }
    }

    const result = await pool.query(
      `UPDATE Area 
       SET nombreArea = $1, 
           descripcion = $2, 
           responsableArea = $3
       WHERE idArea = $4
       RETURNING idArea, nombreArea, descripcion, responsableArea`,
      [
        nombreArea, 
        descripcion || '', 
        responsableArea || null, 
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ 
      error: 'Error al actualizar área',
      details: error.message
    });
  }
});

// Añade esta ruta DELETE para eliminar áreas
app.delete('/api/areas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Primero verificar si hay empleados asignados al área
    const empleadosResult = await pool.query(
      'SELECT COUNT(*) FROM Empleado WHERE idArea = $1',
      [id]
    );
    
    const count = parseInt(empleadosResult.rows[0].count || 0);
    
    if (count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el área',
        details: `Hay ${count} empleados asignados a esta área. Reasígnelos antes de eliminar.`
      });
    }

    const result = await pool.query(
      'DELETE FROM Area WHERE idArea = $1 RETURNING idArea',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    
    res.json({ 
      success: true,
      message: 'Área eliminada correctamente',
      idArea: result.rows[0].idArea
    });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({ 
      error: 'Error al eliminar área',
      details: error.message
    });
  }
});

// Obtener empleados por área
app.get('/api/areas/:id/empleados', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT e.idEmpleado, e.nombreEmpleado, e.apellidoPaternoEmpleado, 
              e.correoEmpleado, r.nombreRol
       FROM Empleado e
       JOIN Rol r ON e.idRol = r.idRol
       WHERE e.idArea = $1
       ORDER BY e.nombreEmpleado`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener empleados del área:', error);
    res.status(500).json({ error: 'Error al obtener empleados del área' });
  }
});

// ==============================================
// RUTAS PARA ROLES
// ==============================================

/**
 * Obtener todos los roles
 */
app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idRol, nombreRol, COALESCE(descripcion, '') as descripcion 
      FROM Rol 
      ORDER BY nombreRol
    `);
    
    // Contar empleados por rol
    const rolesWithCount = await Promise.all(result.rows.map(async rol => {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM Empleado WHERE idRol = $1',
        [rol.idrol]
      );
      return {
        ...rol,
        empleados: parseInt(countResult.rows[0].count || 0)
      };
    }));
    
    res.json(rolesWithCount);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

/**
 * Crear un nuevo rol
 */
app.post('/api/roles', authenticateToken, async (req, res) => {
  const { nombreRol, descripcion } = req.body;

  if (!nombreRol) {
    return res.status(400).json({ error: 'El nombre del rol es requerido' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Rol (nombreRol, descripcion)
       VALUES ($1, $2)
       RETURNING idRol, nombreRol, descripcion`,
      [nombreRol, descripcion || '']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear rol:', error);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json({ 
        error: 'Error al crear rol',
        details: 'Ya existe un rol con ese nombre'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear rol',
      details: error.message
    });
  }
});

/**
 * Actualizar un rol existente
 */
app.put('/api/roles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombreRol, descripcion } = req.body;

  if (!nombreRol) {
    return res.status(400).json({ error: 'El nombre del rol es requerido' });
  }

  try {
    const result = await pool.query(
      `UPDATE Rol 
       SET nombreRol = $1, 
           descripcion = $2
       WHERE idRol = $3
       RETURNING idRol, nombreRol, descripcion`,
      [nombreRol, descripcion || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json({ 
        error: 'Error al actualizar rol',
        details: 'Ya existe un rol con ese nombre'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar rol',
      details: error.message
    });
  }
});

/**
 * Eliminar un rol
 */
app.delete('/api/roles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si hay empleados con este rol
    const empleadosResult = await pool.query(
      'SELECT COUNT(*) FROM Empleado WHERE idRol = $1',
      [id]
    );
    
    const count = parseInt(empleadosResult.rows[0].count || 0);
    
    if (count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el rol',
        details: `Hay ${count} empleados asignados a este rol. Reasígnelos antes de eliminar.`
      });
    }

    const result = await pool.query(
      'DELETE FROM Rol WHERE idRol = $1 RETURNING idRol',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    res.json({ 
      success: true,
      message: 'Rol eliminado correctamente',
      idRol: result.rows[0].idrol
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ 
      error: 'Error al eliminar rol',
      details: error.message
    });
  }
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