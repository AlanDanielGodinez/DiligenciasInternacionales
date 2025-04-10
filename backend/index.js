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

// Crear una nueva solicitud



// ==============================================
// RUTAS PARA EMPLEADOS
// ==============================================


// Obtener todos los empleados
app.get('/api/empleados', authenticateToken, async (req, res) => {
  try {
    // Modifica tu consulta SQL para usar alias con las mayúsculas correctas:
      const result = await pool.query(`
        SELECT 
          e.idEmpleado AS "idEmpleado",
          e.nombreEmpleado AS "nombreEmpleado",
          e.apellidoPaternoEmpleado AS "apellidoPaternoEmpleado",
          e.apellidoMaternoEmpleado AS "apellidoMaternoEmpleado",
          e.correoEmpleado AS "correoEmpleado",
          r.nombreRol AS "nombreRol",
          a.nombreArea AS "nombreArea"
        FROM Empleado e
        LEFT JOIN Rol r ON e.idRol = r.idRol
        LEFT JOIN Area a ON e.idArea = a.idArea
        ORDER BY e.nombreEmpleado
      `);
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

app.post('/api/empleados', authenticateToken, async (req, res) => {
  const {
    nombreEmpleado,
    apellidoPaternoEmpleado,
    apellidoMaternoEmpleado,
    correoEmpleado,
    idRol,
    idArea
  } = req.body;

  // Validación básica
  if (!nombreEmpleado?.trim() || !apellidoPaternoEmpleado?.trim() || !correoEmpleado?.trim() || !idRol) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos',
      details: 'Nombre, apellido paterno, correo y rol son obligatorios'
    });
  }

  try {
    // Verificar rol
    const rolExists = await pool.query('SELECT idRol FROM Rol WHERE idRol = $1', [idRol]);
    if (rolExists.rows.length === 0) {
      return res.status(400).json({ error: 'El rol especificado no existe' });
    }

    // Verificar área si se proporcionó
    if (idArea) {
      const areaExists = await pool.query('SELECT idArea FROM Area WHERE idArea = $1', [idArea]);
      if (areaExists.rows.length === 0) {
        return res.status(400).json({ error: 'El área especificada no existe' });
      }
    }

    // Contraseña temporal
    const hashedPassword = await bcrypt.hash('Temp1234', 10);

    // Insertar empleado
    const result = await pool.query(
      `INSERT INTO Empleado (
        nombreEmpleado, 
        apellidoPaternoEmpleado, 
        apellidoMaternoEmpleado,
        correoEmpleado, 
        idRol, 
        idArea,
        password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING idempleado
`,
      [
        nombreEmpleado.trim(),
        apellidoPaternoEmpleado.trim(),
        apellidoMaternoEmpleado?.trim() || null,
        correoEmpleado.trim().toLowerCase(),
        idRol,
        idArea || null,
        hashedPassword
      ]
    );

    const nuevoId = result.rows[0].idEmpleado;

    console.log('[✓] Empleado insertado con ID:', nuevoId);

    // Obtener info del empleado (intenta con LEFT JOIN)
    const empleadoCompleto = await pool.query(
      `SELECT 
        e.idEmpleado AS "idEmpleado",
        e.nombreEmpleado AS "nombreEmpleado",
        e.apellidoPaternoEmpleado AS "apellidoPaternoEmpleado",
        e.apellidoMaternoEmpleado AS "apellidoMaternoEmpleado",
        e.correoEmpleado AS "correoEmpleado",
        r.nombreRol AS "nombreRol",
        a.nombreArea AS "nombreArea"
      FROM Empleado e
      LEFT JOIN Rol r ON r.idRol = e.idRol
      LEFT JOIN Area a ON a.idArea = e.idArea
      WHERE e.idEmpleado = $1`,
      [nuevoId]
    );

    if (empleadoCompleto.rows.length === 0) {
      console.warn('⚠ No se pudo obtener el empleado con JOIN. Enviando solo ID.');
      return res.status(201).json({ idEmpleado: nuevoId });
    }

    res.status(201).json(empleadoCompleto.rows[0]);

  } catch (error) {
    console.error('Error al crear empleado:', error);

    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Error al crear empleado',
        details: 'Ya existe un empleado con ese correo electrónico'
      });
    }

    res.status(500).json({ 
      error: 'Error al crear empleado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

//Eliminar empleado

// Ruta DELETE para eliminar empleado
app.delete('/api/empleados/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica si el empleado existe primero
    const existe = await pool.query('SELECT idEmpleado FROM empleado WHERE idEmpleado = $1', [id]);

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Eliminar empleado
    const result = await pool.query(
      'DELETE FROM empleado WHERE idEmpleado = $1 RETURNING idEmpleado',
      [id]
    );

    res.json({ 
      success: true, 
      message: 'Empleado eliminado correctamente',
      idEmpleado: result.rows[0].idEmpleado
    });

  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ 
      error: 'Error al eliminar empleado',
      details: error.message
    });
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
        a.idarea AS "idArea", 
        a.nombrearea AS "nombreArea",  /* Asegúrate de seleccionar esta columna */
        a.descripcion AS "descripcion",
        e.idempleado AS "idResponsable",
        COALESCE(e.nombreempleado || ' ' || e.apellidopaternoempleado, 'Sin asignar') AS "responsable"
      FROM Area a
      LEFT JOIN Empleado e ON a.responsablearea = e.idempleado
      ORDER BY a.nombrearea
    `);
    
    const areasWithCount = await Promise.all(result.rows.map(async area => {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM empleado WHERE idarea = $1',
        [area.idArea]
      );
      return {
        ...area,
        empleados: parseInt(countResult.rows[0].count || 0)
      };
    }));
    
    res.json(areasWithCount);
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ 
      error: 'Error al obtener áreas',
      details: error.message 
    });
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


// Obtener todos los roles
app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        idrol AS "idRol", 
        nombrerol AS "nombreRol"
      FROM rol 
      ORDER BY nombrerol
    `);
    
    // Contar empleados por rol
    const rolesWithCount = await Promise.all(result.rows.map(async rol => {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM empleado WHERE idrol = $1',
        [rol.idRol]
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

// Crear nuevo rol
app.post('/api/roles', authenticateToken, async (req, res) => {
  const { nombreRol } = req.body; // Solo necesitamos el nombre

  if (!nombreRol) {
    return res.status(400).json({ error: 'El nombre del rol es requerido' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rol (nombrerol)
       VALUES ($1)
       RETURNING idrol AS "idRol", nombrerol AS "nombreRol"`,
      [nombreRol]
    );
    
    res.status(201).json({
      ...result.rows[0],
      empleados: 0 // Inicialmente no tiene empleados
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Error al crear rol',
        details: 'Ya existe un rol con ese nombre'
      });
    }
    
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

// Actualizar rol
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
       RETURNING 
         idArea AS "idArea", 
         COALESCE(nombreArea, '') AS "nombreArea", 
         COALESCE(descripcion, '') AS "descripcion", 
         responsableArea AS "responsableArea"`,
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
    
    // Asegurar que todos los campos tengan valores
    const areaActualizada = {
      idArea: result.rows[0].idArea,
      nombreArea: result.rows[0].nombreArea || '',
      descripcion: result.rows[0].descripcion || '',
      responsableArea: result.rows[0].responsableArea || null
    };
    
    res.json(areaActualizada);
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ 
      error: 'Error al actualizar área',
      details: error.message
    });
  }
});

// Eliminar rol
app.delete('/api/roles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si hay empleados con este rol
    const empleadosResult = await pool.query(
      'SELECT COUNT(*) FROM empleado WHERE idrol = $1',
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
      'DELETE FROM rol WHERE idrol = $1 RETURNING idrol',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    res.json({ 
      success: true,
      message: 'Rol eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
});


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