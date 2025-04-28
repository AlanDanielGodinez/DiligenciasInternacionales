require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_TOKEN_VERSION = Date.now(); // Cambia cada vez que el servidor se reinicia

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
  const token = req.headers['authorization']?.split(' ')[1] || 
                req.cookies?.token || 
                req.query.token;

  // Solo muestra logs para rutas importantes (opcional)
  const shouldLog = !req.path.includes('/api/protected') && 
                   !req.path.includes('/favicon.ico');
  
  if (shouldLog) {
    console.log(`[Auth] Verificando token para ruta: ${req.path}`);
  }

  if (!token) {
    console.error(`[Auth Error] Intento de acceso sin token a: ${req.path}`);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    // Verificar versión del token
    if (user.version !== SERVER_TOKEN_VERSION) {
      return res.status(403).json({ error: 'Sesión inválida. Por favor inicie sesión nuevamente.' });
    }
    
    req.user = user;
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

  console.log('Intento de login recibido para email:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const userQuery = await pool.query(
      `SELECT e.*, r.nombrerol 
       FROM empleado e 
       JOIN rol r ON e.idrol = r.idrol 
       WHERE (e.correoempleado = $1 OR e.email = $1) 
       AND e.password IS NOT NULL`,  // Asegurar que tenga contraseña
      [email.toLowerCase().trim()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario no tiene contraseña establecida' });
    }

    const user = userQuery.rows[0];
    
    // Verificar si la contraseña es la temporal
    const isTempPassword = await bcrypt.compare('Temp1234', user.password);
    if (isTempPassword) {
      return res.status(403).json({ 
        error: 'Debe cambiar su contraseña temporal',
        tempPassword: true
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.idempleado,
        email: user.correoempleado || user.email,
        role: user.nombrerol,
        version: SERVER_TOKEN_VERSION // Agrega esta línea
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

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

app.put('/api/empleados/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    nombreEmpleado,
    apellidoPaternoEmpleado,
    apellidoMaternoEmpleado,
    correoEmpleado,
    idRol,
    idArea,
    password // Nueva contraseña (opcional)
  } = req.body;

  if (!nombreEmpleado?.trim() || !apellidoPaternoEmpleado?.trim() || !correoEmpleado?.trim() || !idRol) {
    return res.status(400).json({
      error: 'Faltan campos requeridos',
      details: 'Nombre, apellido paterno, correo y rol son obligatorios'
    });
  }

  try {
    // 1. Verificar existencia del empleado
    const empleadoResult = await pool.query('SELECT * FROM Empleado WHERE idEmpleado = $1', [id]);
    if (empleadoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // 2. Verificar correo duplicado
    const correoRepetido = await pool.query(
      `SELECT idEmpleado FROM Empleado 
       WHERE LOWER(correoEmpleado) = LOWER($1) AND idEmpleado <> $2`,
      [correoEmpleado.trim(), id]
    );
    if (correoRepetido.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro empleado con este correo' });
    }

    // 3. Hashear nueva contraseña si se proporciona
    let hashedPassword = null;
    if (password?.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    // 4. Actualizar en base de datos
    const result = await pool.query(`
      UPDATE Empleado SET
        nombreEmpleado = $1,
        apellidoPaternoEmpleado = $2,
        apellidoMaternoEmpleado = $3,
        correoEmpleado = $4,
        idRol = $5,
        idArea = $6,
        password = COALESCE($7, password)
      WHERE idEmpleado = $8
      RETURNING idEmpleado
    `, [
      nombreEmpleado.trim(),
      apellidoPaternoEmpleado.trim(),
      apellidoMaternoEmpleado?.trim() || null,
      correoEmpleado.trim().toLowerCase(),
      idRol,
      idArea || null,
      hashedPassword,
      id
    ]);

    res.json({
      success: true,
      message: 'Empleado actualizado correctamente',
      idEmpleado: result.rows[0].idEmpleado
    });

  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado', details: error.message });
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

    // Validar contraseña
  if (!req.body.password || req.body.password.trim().length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);


    // Insertar empleado
    const result = await pool.query(
      `INSERT INTO Empleado (
        nombreEmpleado, 
        apellidoPaternoEmpleado, 
        apellidoMaternoEmpleado,
        correoEmpleado, 
        email,
        idRol, 
        idArea,
        password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING idempleado`,
      [
        nombreEmpleado.trim(),
        apellidoPaternoEmpleado.trim(),
        apellidoMaternoEmpleado?.trim() || null,
        correoEmpleado.trim().toLowerCase(),
        correoEmpleado.trim().toLowerCase(), // para campo email
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

//versión mejorada:
app.put('/api/areas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombreArea, descripcion, responsableArea } = req.body;

  if (!nombreArea?.trim()) {
    return res.status(400).json({ error: 'El nombre del área es requerido' });
  }

  try {
    // Verificar si el área existe
    const areaExists = await pool.query('SELECT idArea FROM Area WHERE idArea = $1', [id]);
    if (areaExists.rows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

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
           descripcion = COALESCE($2, descripcion), 
           responsableArea = $3
       WHERE idArea = $4
       RETURNING *`,
      [
        nombreArea.trim(), 
        descripcion?.trim(), 
        responsableArea || null, 
        id
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ 
      error: 'Error al actualizar área',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta solo para asignar responsable sin pedir nombreArea
app.put('/api/areas/:id/responsable', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { responsableArea } = req.body;

  if (!responsableArea) {
    return res.status(400).json({ error: 'Debe seleccionar un responsable' });
  }

  try {
    const empleadoExists = await pool.query(
      'SELECT idEmpleado FROM Empleado WHERE idEmpleado = $1',
      [responsableArea]
    );

    if (empleadoExists.rows.length === 0) {
      return res.status(400).json({ error: 'El empleado responsable no existe' });
    }

    const result = await pool.query(
      `UPDATE Area 
       SET responsableArea = $1
       WHERE idArea = $2
       RETURNING idArea, responsableArea`,
      [responsableArea, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al asignar responsable:', error);
    res.status(500).json({ error: 'Error al asignar responsable' });
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

// Obtener empleados con rol de Coordinador
app.get('/api/empleados/coordinadores', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.idEmpleado AS "idEmpleado",
        e.nombreEmpleado AS "nombreEmpleado",
        e.apellidoPaternoEmpleado AS "apellidoPaternoEmpleado",
        e.correoEmpleado AS "correoEmpleado"
      FROM Empleado e
      JOIN Rol r ON e.idRol = r.idRol
      WHERE LOWER(r.nombreRol) LIKE '%coordinador%'
      ORDER BY e.nombreEmpleado
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener coordinadores:', error);
    res.status(500).json({ error: 'Error al obtener coordinadores' });
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
// RUTAS PARA CLIENTES
// ==============================================

// Obtener todos los clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT idCliente, nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente, telefono, identificacionunicanacional 
      FROM Cliente
      ORDER BY nombreCliente
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Crear nuevo cliente - Versión corregida
app.post('/api/clientes', authenticateToken, async (req, res) => {
  const {
    nombreCliente,
    apellidoPaternoCliente,
    apellidoMaternoCliente,
    sexo,
    edad,
    telefono,
    estado_civil,
    identificacionunicanacional,
    Domicilio,
    condicionesEspeciales,
    fechaNacimiento,
    municipioNacimiento,
    EstadoNacimiento,
    PaisNacimiento,
    idCiudad,
    idPais
  } = req.body;

  // Validación básica
  if (!nombreCliente || !apellidoPaternoCliente || !telefono || !identificacionunicanacional || !idPais || !idCiudad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si el cliente ya existe (por identificación)
    const existe = await pool.query(
      'SELECT idCliente FROM Cliente WHERE identificacionunicanacional = $1',
      [identificacionunicanacional]
    );
    
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un cliente con esta identificación' });
    }

    // Formatear fecha si existe
    const fechaNacimientoFormateada = fechaNacimiento 
      ? new Date(fechaNacimiento).toISOString().split('T')[0]
      : null;

    const result = await pool.query(
      `INSERT INTO Cliente (
        nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente,
        sexo, edad, telefono, estado_civil, identificacionunicanacional,
        Domicilio, condicionesEspeciales, fechaNacimiento, municipioNacimiento,
        EstadoNacimiento, PaisNacimiento, idCiudad, idPais
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING idCliente, nombreCliente, apellidoPaternoCliente`,
      [
        nombreCliente,
        apellidoPaternoCliente,
        apellidoMaternoCliente || null,
        sexo || null,
        edad ? parseInt(edad) : null,
        telefono,
        estado_civil || null,
        identificacionunicanacional,
        Domicilio || null,
        condicionesEspeciales || null,
        fechaNacimientoFormateada,
        municipioNacimiento || null,
        EstadoNacimiento || null,
        PaisNacimiento || null,
        idCiudad,
        idPais
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    let mensajeError = 'Error al crear cliente';
    if (error.code === '23503') { // Foreign key violation
      if (error.constraint.includes('idPais')) {
        mensajeError = 'El país seleccionado no existe';
      } else if (error.constraint.includes('idCiudad')) {
        mensajeError = 'La ciudad seleccionada no existe';
      }
    } else if (error.code === '23505') { // Unique violation
      mensajeError = 'Ya existe un cliente con esta identificación';
    }
    
    res.status(500).json({ 
      error: mensajeError,
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});
// Actualizar cliente
app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    nombreCliente,
    apellidoPaternoCliente,
    apellidoMaternoCliente,
    sexo,
    edad,
    telefono,
    estado_civil,
    identificacionunicanacional,
    Domicilio,
    condicionesEspeciales,
    fechaNacimiento,
    municipioNacimiento,
    EstadoNacimiento,
    PaisNacimiento,
    idCiudad,
    idPais
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Cliente SET
        nombreCliente = $1,
        apellidoPaternoCliente = $2,
        apellidoMaternoCliente = $3,
        sexo = $4,
        edad = $5,
        telefono = $6,
        estado_civil = $7,
        identificacionunicanacional = $8,
        Domicilio = $9,
        condicionesEspeciales = $10,
        fechaNacimiento = $11,
        municipioNacimiento = $12,
        EstadoNacimiento = $13,
        PaisNacimiento = $14,
        idCiudad = $15,
        idPais = $16
      WHERE idCliente = $17
      RETURNING idCliente`,
      [
        nombreCliente,
        apellidoPaternoCliente,
        apellidoMaternoCliente,
        sexo,
        edad,
        telefono,
        estado_civil,
        identificacionunicanacional,
        Domicilio,
        condicionesEspeciales,
        fechaNacimiento,
        municipioNacimiento,
        EstadoNacimiento,
        PaisNacimiento,
        idCiudad,
        idPais,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ success: true, message: 'Cliente actualizado', idCliente: result.rows[0].idCliente });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
app.delete('/api/clientes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM Cliente WHERE idCliente = $1 RETURNING idCliente',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ success: true, message: 'Cliente eliminado', idCliente: result.rows[0].idCliente });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// ==============================================
// RUTAS PARA PAÍSES
// ==============================================

// Obtener todos los países (lista simple)
app.get('/api/paises', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT idPais, nombrePais FROM Pais ORDER BY nombrePais'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener países:', error);
    res.status(500).json({ error: 'Error al obtener países' });
  }
});

// Obtener países con sus ciudades (estructura completa)
app.get('/api/paises-completos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.idPais, 
        p.nombrePais,
        json_agg(
          json_build_object(
            'idCiudad', c.idCiudad,
            'nombreCiudad', c.nombreCiudad
          ) ORDER BY c.nombreCiudad
        ) AS ciudades
      FROM Pais p
      LEFT JOIN Ciudad c ON p.idPais = c.idPais
      GROUP BY p.idPais
      ORDER BY p.nombrePais
    `);
    
    // Transformar el resultado para manejar casos sin ciudades
    const paises = result.rows.map(pais => ({
      ...pais,
      ciudades: pais.ciudades[0] ? pais.ciudades : []
    }));
    
    res.json(paises);
  } catch (error) {
    console.error('Error al obtener países con ciudades:', error);
    res.status(500).json({ error: 'Error al obtener países con ciudades' });
  }
});

// Crear nuevo país
app.post('/api/paises', authenticateToken, async (req, res) => {
  const { nombrePais } = req.body;

  if (!nombrePais?.trim()) {
    return res.status(400).json({ error: 'El nombre del país es requerido' });
  }

  try {
    // Verificar si el país ya existe
    const existe = await pool.query(
      'SELECT idPais FROM Pais WHERE LOWER(nombrePais) = LOWER($1)',
      [nombrePais.trim()]
    );
    
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un país con ese nombre' });
    }

    const result = await pool.query(
      `INSERT INTO Pais (nombrePais)
       VALUES ($1)
       RETURNING idPais, nombrePais`,
      [nombrePais.trim()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear país:', error);
    res.status(500).json({ error: 'Error al crear país' });
  }
});

// Actualizar país
app.put('/api/paises/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombrePais } = req.body;

  if (!nombrePais?.trim()) {
    return res.status(400).json({ error: 'El nombre del país es requerido' });
  }

  try {
    // Verificar si el país existe
    const paisExists = await pool.query(
      'SELECT idPais FROM Pais WHERE idPais = $1',
      [id]
    );
    
    if (paisExists.rows.length === 0) {
      return res.status(404).json({ error: 'País no encontrado' });
    }

    // Verificar si el nuevo nombre ya existe
    const nombreExiste = await pool.query(
      'SELECT idPais FROM Pais WHERE LOWER(nombrePais) = LOWER($1) AND idPais != $2',
      [nombrePais.trim(), id]
    );
    
    if (nombreExiste.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro país con ese nombre' });
    }

    const result = await pool.query(
      `UPDATE Pais 
       SET nombrePais = $1 
       WHERE idPais = $2
       RETURNING idPais, nombrePais`,
      [nombrePais.trim(), id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar país:', error);
    res.status(500).json({ error: 'Error al actualizar país' });
  }
});

// Eliminar país
app.delete('/api/paises/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el país existe
    const paisExists = await pool.query(
      'SELECT idPais FROM Pais WHERE idPais = $1',
      [id]
    );
    
    if (paisExists.rows.length === 0) {
      return res.status(404).json({ error: 'País no encontrado' });
    }

    // Verificar si tiene ciudades asociadas
    const ciudadesCount = await pool.query(
      'SELECT COUNT(*) FROM Ciudad WHERE idPais = $1',
      [id]
    );
    
    if (parseInt(ciudadesCount.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el país',
        details: 'Tiene ciudades asociadas. Elimine las ciudades primero.'
      });
    }

    const result = await pool.query(
      'DELETE FROM Pais WHERE idPais = $1 RETURNING idPais',
      [id]
    );

    res.json({
      success: true,
      message: 'País eliminado correctamente',
      idPais: result.rows[0].idPais
    });
  } catch (error) {
    console.error('Error al eliminar país:', error);
    res.status(500).json({ error: 'Error al eliminar país' });
  }
});

// ==============================================
// RUTAS PARA CIUDADES
// ==============================================

// Obtener ciudades por país
app.get('/api/paises/:idPais/ciudades', authenticateToken, async (req, res) => {
  const { idPais } = req.params;
  
  try {
    // Verificar si el país existe
    const paisExists = await pool.query(
      'SELECT idPais FROM Pais WHERE idPais = $1',
      [idPais]
    );
    
    if (paisExists.rows.length === 0) {
      return res.status(404).json({ error: 'País no encontrado' });
    }

    const result = await pool.query(
      'SELECT idCiudad, nombreCiudad FROM Ciudad WHERE idPais = $1 ORDER BY nombreCiudad',
      [idPais]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ciudades por país:', error);
    res.status(500).json({ error: 'Error al obtener ciudades por país' });
  }
});

// Crear nueva ciudad
app.post('/api/ciudades', authenticateToken, async (req, res) => {
  const { nombreCiudad, idPais } = req.body;

  if (!nombreCiudad?.trim() || !idPais) {
    return res.status(400).json({ 
      error: 'El nombre de la ciudad y el ID del país son requeridos' 
    });
  }

  try {
    // Verificar que el país existe
    const paisExists = await pool.query(
      'SELECT idPais FROM Pais WHERE idPais = $1',
      [idPais]
    );
    
    if (paisExists.rows.length === 0) {
      return res.status(400).json({ error: 'El país especificado no existe' });
    }

    // Verificar si la ciudad ya existe en ese país
    const ciudadExists = await pool.query(
      'SELECT idCiudad FROM Ciudad WHERE LOWER(nombreCiudad) = LOWER($1) AND idPais = $2',
      [nombreCiudad.trim(), idPais]
    );
    
    if (ciudadExists.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una ciudad con ese nombre en este país' });
    }

    const result = await pool.query(
      `INSERT INTO Ciudad (nombreCiudad, idPais)
       VALUES ($1, $2)
       RETURNING idCiudad, nombreCiudad, idPais`,
      [nombreCiudad.trim(), idPais]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear ciudad:', error);
    res.status(500).json({ error: 'Error al crear ciudad' });
  }
});

// Actualizar ciudad
app.put('/api/ciudades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombreCiudad } = req.body;

  if (!nombreCiudad?.trim()) {
    return res.status(400).json({ error: 'El nombre de la ciudad es requerido' });
  }

  try {
    // Verificar si la ciudad existe
    const ciudadExists = await pool.query(
      'SELECT idCiudad, idPais FROM Ciudad WHERE idCiudad = $1',
      [id]
    );
    
    if (ciudadExists.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    // Verificar si el nuevo nombre ya existe en el mismo país
    const nombreExiste = await pool.query(
      'SELECT idCiudad FROM Ciudad WHERE LOWER(nombreCiudad) = LOWER($1) AND idPais = $2 AND idCiudad != $3',
      [nombreCiudad.trim(), ciudadExists.rows[0].idPais, id]
    );
    
    if (nombreExiste.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe otra ciudad con ese nombre en este país' });
    }

    const result = await pool.query(
      `UPDATE Ciudad 
       SET nombreCiudad = $1 
       WHERE idCiudad = $2
       RETURNING idCiudad, nombreCiudad, idPais`,
      [nombreCiudad.trim(), id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar ciudad:', error);
    res.status(500).json({ error: 'Error al actualizar ciudad' });
  }
});

// Eliminar ciudad
app.delete('/api/ciudades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la ciudad existe
    const ciudadExists = await pool.query(
      'SELECT idCiudad FROM Ciudad WHERE idCiudad = $1',
      [id]
    );
    
    if (ciudadExists.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    // Verificar si hay clientes asociados a esta ciudad
    const clientesCount = await pool.query(
      'SELECT COUNT(*) FROM Cliente WHERE idCiudad = $1',
      [id]
    );
    
    if (parseInt(clientesCount.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la ciudad',
        details: 'Hay clientes asociados a esta ciudad. Actualice sus datos primero.'
      });
    }

    const result = await pool.query(
      'DELETE FROM Ciudad WHERE idCiudad = $1 RETURNING idCiudad',
      [id]
    );

    res.json({
      success: true,
      message: 'Ciudad eliminada correctamente',
      idCiudad: result.rows[0].idCiudad
    });
  } catch (error) {
    console.error('Error al eliminar ciudad:', error);
    res.status(500).json({ error: 'Error al eliminar ciudad' });
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