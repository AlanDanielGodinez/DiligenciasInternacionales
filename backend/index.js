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


// ==============================================
// RUTAS PARA SOLICITUDES (COMPLETO)
// ==============================================

app.post('/api/solicitudes', authenticateToken, async (req, res) => {
  const { idTramite, idCliente, observaciones } = req.body;
  const idEmpleado = req.user.id; // Obtenido del token JWT

  // Validación de campos obligatorios
  if (!idTramite || !idCliente) {
    return res.status(400).json({ 
      error: 'Campos obligatorios faltantes',
      detalles: {
        requeridos: {
          idTramite: 'ID del trámite es requerido',
          idCliente: 'ID del cliente es requerido'
        },
        recibidos: req.body
      }
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar que existen todos los recursos necesarios
    const [tramite, cliente, empleado] = await Promise.all([
      client.query('SELECT idTramite FROM Tramite WHERE idTramite = $1', [idTramite]),
      client.query('SELECT idCliente FROM Cliente WHERE idCliente = $1', [idCliente]),
      client.query('SELECT idEmpleado FROM Empleado WHERE idEmpleado = $1', [idEmpleado])
    ]);

    // Validar que todos los recursos existen
    if (tramite.rows.length === 0 || cliente.rows.length === 0 || empleado.rows.length === 0) {
      throw {
        code: 'RECURSOS_NO_ENCONTRADOS',
        detalles: {
          tramite: tramite.rows.length > 0,
          cliente: cliente.rows.length > 0,
          empleado: empleado.rows.length > 0
        }
      };
    }

    // 2. Crear la solicitud (con todos los campos requeridos)
    const solicitudResult = await client.query(
      `INSERT INTO Solicitud (
        idTramite, 
        idCliente, 
        idEmpleado, 
        fechaSolicitud, 
        estado_actual
      ) VALUES ($1, $2, $3, NOW(), 'Pendiente')
      RETURNING idSolicitud`,
      [idTramite, idCliente, idEmpleado]
    );

    const idSolicitud = solicitudResult.rows[0].idsolicitud;

    // 3. Crear registro de seguimiento inicial
    await client.query(
      `INSERT INTO Seguimiento (
        idSolicitud, 
        idEmpleado, 
        descripcion, 
        fecha_actualizacion, 
        estado
      ) VALUES ($1, $2, $3, NOW(), $4)`,
      [
        idSolicitud,
        idEmpleado,
        observaciones ? `Solicitud creada. Observaciones: ${observaciones}` : 'Solicitud creada',
        'Pendiente'
      ]
    );

    await client.query('COMMIT');

    // 4. Obtener y devolver la solicitud completa
    const solicitudCompleta = await getSolicitudCompleta(idSolicitud);
    res.status(201).json({
      mensaje: 'Solicitud creada exitosamente',
      solicitud: solicitudCompleta
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    // Manejo específico de errores
    if (error.code === 'RECURSOS_NO_ENCONTRADOS') {
      return res.status(404).json({
        error: 'Recursos no encontrados',
        detalles: {
          tramite: error.detalles.tramite ? 'Encontrado' : 'No encontrado',
          cliente: error.detalles.cliente ? 'Encontrado' : 'No encontrado',
          empleado: error.detalles.empleado ? 'Encontrado' : 'No encontrado'
        },
        solucion: 'Verifique que existen el trámite, cliente y empleado con los IDs proporcionados'
      });
    }

    console.error('Error al crear solicitud:', error);
    res.status(500).json({ 
      error: 'Error interno al crear solicitud',
      detalles: process.env.NODE_ENV === 'development' ? {
        mensaje: error.message,
        stack: error.stack
      } : undefined
    });
  } finally {
    client.release();
  }
});

// Función auxiliar mejorada
async function getSolicitudCompleta(idSolicitud) {
  const query = `
    SELECT 
      s.idSolicitud,
      s.fechaSolicitud,
      s.estado_actual,
      t.idTramite,
      t.tipoTramite,
      c.idCliente,
      c.nombreCliente || ' ' || c.apellidoPaternoCliente AS nombre_cliente,
      e.idEmpleado,
      e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado AS nombre_empleado,
      (
        SELECT json_agg(json_build_object(
          'idSeguimiento', sg.idSeguimiento,
          'fecha', sg.fecha_actualizacion,
          'estado', sg.estado,
          'descripcion', sg.descripcion,
          'empleado', emp.nombreEmpleado || ' ' || emp.apellidoPaternoEmpleado
        ))
        FROM Seguimiento sg
        JOIN Empleado emp ON sg.idEmpleado = emp.idEmpleado
        WHERE sg.idSolicitud = s.idSolicitud
        ORDER BY sg.fecha_actualizacion DESC
      ) AS historial_seguimiento
    FROM Solicitud s
    JOIN Tramite t ON s.idTramite = t.idTramite
    JOIN Cliente c ON s.idCliente = c.idCliente
    JOIN Empleado e ON s.idEmpleado = e.idEmpleado
    WHERE s.idSolicitud = $1
  `;
  
  const result = await pool.query(query, [idSolicitud]);
  return result.rows[0];
}

// 2. Obtener todas las solicitudes (con filtros)
app.get('/api/solicitudes', authenticateToken, async (req, res) => {
  const { estado, fechaDesde, fechaHasta, idCliente } = req.query;

  try {
    let query = `
      SELECT 
        s.idSolicitud,
        s.fechaSolicitud,
        s.estado_actual,
        t.tipoTramite,
        c.nombreCliente || ' ' || c.apellidoPaternoCliente AS cliente,
        e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado AS empleado,
        (
          SELECT estado 
          FROM Seguimiento 
          WHERE idSolicitud = s.idSolicitud 
          ORDER BY fecha_actualizacion DESC 
          LIMIT 1
        ) AS ultimoEstado
      FROM Solicitud s
      JOIN Tramite t ON s.idTramite = t.idTramite
      JOIN Cliente c ON s.idCliente = c.idCliente
      JOIN Empleado e ON s.idEmpleado = e.idEmpleado
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (estado) {
      conditions.push(`s.estado_actual = $${paramIndex}`);
      params.push(estado);
      paramIndex++;
    }

    if (fechaDesde) {
      conditions.push(`s.fechaSolicitud >= $${paramIndex}`);
      params.push(fechaDesde);
      paramIndex++;
    }

    if (fechaHasta) {
      conditions.push(`s.fechaSolicitud <= $${paramIndex}`);
      params.push(fechaHasta);
      paramIndex++;
    }

    if (idCliente) {
      conditions.push(`s.idCliente = $${paramIndex}`);
      params.push(idCliente);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.fechaSolicitud DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

// 3. Obtener una solicitud específica con todos sus datos
app.get('/api/solicitudes/:id/completa', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const solicitud = await getSolicitudCompleta(id);
    
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Obtener documentos asociados
    const documentos = await pool.query(
      'SELECT * FROM Documento WHERE idSolicitud = $1',
      [id]
    );

    // Obtener pagos asociados
    const pagos = await pool.query(
      `SELECT p.*, m.nombreMetodo 
       FROM Pago p
       JOIN MetodoPago m ON p.idMetodopago = m.idMetodopago
       WHERE p.idSolicitud = $1`,
      [id]
    );

    // Obtener itinerario si existe
    const itinerario = await pool.query(
      `SELECT i.*, a.nombreAerolinea
       FROM Itinerario i
       LEFT JOIN Aerolinea a ON i.idAerolinea = a.idAerolinea
       WHERE i.idSolicitud = $1`,
      [id]
    );

    // Obtener historial de seguimiento
    const seguimiento = await pool.query(
      `SELECT s.*, e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado AS empleado
       FROM Seguimiento s
       JOIN Empleado e ON s.idEmpleado = e.idEmpleado
       WHERE s.idSolicitud = $1
       ORDER BY s.fecha_actualizacion DESC`,
      [id]
    );

    res.json({
      ...solicitud,
      documentos: documentos.rows,
      pagos: pagos.rows,
      itinerario: itinerario.rows[0] || null,
      historial: seguimiento.rows
    });

  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ error: 'Error al obtener solicitud' });
  }
});

// 4. Actualizar estado de una solicitud
app.put('/api/solicitudes/:id/estado', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { estado, comentario } = req.body;
  const idEmpleado = req.user.id;

  if (!estado) {
    return res.status(400).json({ error: 'El nuevo estado es requerido' });
  }

  const estadosPermitidos = ['Pendiente', 'En revisión', 'Aprobado', 'Rechazado', 'Completado'];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado no válido',
      estadosPermitidos
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar estado principal
    await client.query(
      'UPDATE Solicitud SET estado_actual = $1 WHERE idSolicitud = $2',
      [estado, id]
    );

    // Registrar en seguimiento
    await client.query(
      `INSERT INTO Seguimiento (
        idSolicitud, idEmpleado, descripcion, 
        fecha_actualizacion, estado
      ) VALUES ($1, $2, $3, NOW(), $4)`,
      [id, idEmpleado, comentario || `Estado cambiado a: ${estado}`, estado]
    );

    await client.query('COMMIT');
    res.json({ success: true, nuevoEstado: estado });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  } finally {
    client.release();
  }
});

// 5. Agregar documento a solicitud
app.post('/api/solicitudes/:id/documentos', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombreDocumento, tipoDocumento, archivo } = req.body; // Asume que el archivo viene como base64

  if (!nombreDocumento || !tipoDocumento || !archivo) {
    return res.status(400).json({ 
      error: 'Nombre, tipo y archivo son requeridos' 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Documento (
        idSolicitud, nombreDocumento, tipoDocumento, 
        archivo, fechasubida, estado
      ) VALUES ($1, $2, $3, $4, NOW(), 'Pendiente de revisión')
      RETURNING *`,
      [id, nombreDocumento, tipoDocumento, archivo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar documento:', error);
    res.status(500).json({ error: 'Error al agregar documento' });
  }
});

// 6. Registrar pago para solicitud
app.post('/api/solicitudes/:id/pagos', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { idMetodopago, monto, fechaPago } = req.body;
  const idEmpleado = req.user.id;

  if (!idMetodopago || !monto) {
    return res.status(400).json({ 
      error: 'Método de pago y monto son requeridos' 
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar que la solicitud existe
    const solicitud = await client.query(
      'SELECT idSolicitud FROM Solicitud WHERE idSolicitud = $1',
      [id]
    );

    if (solicitud.rows.length === 0) {
      throw { code: 'NOT_FOUND' };
    }

    // Registrar pago
    const pagoResult = await client.query(
      `INSERT INTO Pago (
        idSolicitud, idMetodopago, monto, 
        fechaPago, estadoPago
      ) VALUES ($1, $2, $3, $4, 'Pendiente')
      RETURNING *`,
      [id, idMetodopago, monto, fechaPago || new Date().toISOString()]
    );

    // Actualizar seguimiento
    await client.query(
      `INSERT INTO Seguimiento (
        idSolicitud, idEmpleado, descripcion, 
        fecha_actualizacion, estado
      ) VALUES ($1, $2, $3, NOW(), 'Pago registrado')`,
      [id, idEmpleado, `Pago de $${monto} registrado`]
    );

    await client.query('COMMIT');
    res.status(201).json(pagoResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  } finally {
    client.release();
  }
});

// 7. Crear/Actualizar itinerario
app.post('/api/solicitudes/:id/itinerario', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { 
    fecha_salida, 
    fecha_regreso, 
    idAerolinea, 
    numero_vuelo, 
    hotel, 
    direccion_hotel, 
    contacto_hotel 
  } = req.body;

  if (!fecha_salida || !fecha_regreso) {
    return res.status(400).json({ 
      error: 'Fechas de salida y regreso son requeridas' 
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar si ya existe itinerario
    const existe = await client.query(
      'SELECT idItinerario FROM Itinerario WHERE idSolicitud = $1',
      [id]
    );

    let resultado;
    if (existe.rows.length > 0) {
      // Actualizar
      resultado = await client.query(
        `UPDATE Itinerario SET
          fecha_salida = $1,
          fecha_regreso = $2,
          idAerolinea = $3,
          numero_vuelo = $4,
          hotel = $5,
          direccion_hotel = $6,
          contacto_hotel = $7
        WHERE idSolicitud = $8
        RETURNING *`,
        [
          fecha_salida,
          fecha_regreso,
          idAerolinea || null,
          numero_vuelo || null,
          hotel || null,
          direccion_hotel || null,
          contacto_hotel || null,
          id
        ]
      );
    } else {
      // Crear nuevo
      resultado = await client.query(
        `INSERT INTO Itinerario (
          idSolicitud, fecha_salida, fecha_regreso,
          idAerolinea, numero_vuelo, hotel,
          direccion_hotel, contacto_hotel
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          id,
          fecha_salida,
          fecha_regreso,
          idAerolinea || null,
          numero_vuelo || null,
          hotel || null,
          direccion_hotel || null,
          contacto_hotel || null
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(resultado.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al guardar itinerario:', error);
    res.status(500).json({ error: 'Error al guardar itinerario' });
  } finally {
    client.release();
  }
});

// 8. Obtener seguimiento de solicitud
app.get('/api/solicitudes/:id/seguimiento', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        s.*,
        e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado AS empleado
       FROM Seguimiento s
       JOIN Empleado e ON s.idEmpleado = e.idEmpleado
       WHERE s.idSolicitud = $1
       ORDER BY s.fecha_actualizacion DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener seguimiento:', error);
    res.status(500).json({ error: 'Error al obtener seguimiento' });
  }
});



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



// ==============================================
// RUTAS PARA CLIENTES
// ==============================================

// Mostrar clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        idCliente,
        nombreCliente,
        apellidoPaternoCliente,
        apellidoMaternoCliente,
        telefono,
        identificacionunicanacional
      FROM Cliente
      ORDER BY nombreCliente
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener un cliente con todos sus datos (para edición)

// Endpoint para obtener cliente completo (manteniendo fecha como string)
// En tu backend (index.js)
app.get('/api/clientes/:id/completo', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        c.idCliente,
        c.nombreCliente AS "nombreCliente",
        c.apellidoPaternoCliente AS "apellidoPaternoCliente",
        c.apellidoMaternoCliente AS "apellidoMaternoCliente",
        c.sexo AS "sexo",
        c.edad AS "edad",
        c.telefono AS "telefono",
        c.estado_civil AS "estado_civil",
        c.identificacionunicanacional AS "identificacionunicanacional",
        c.Domicilio AS "Domicilio",
        c.condicionesEspeciales AS "condicionesEspeciales",
        c.fechaNacimiento AS "fechaNacimiento",
        c.municipioNacimiento AS "municipioNacimiento",
        c.EstadoNacimiento AS "EstadoNacimiento",
        c.PaisNacimiento AS "PaisNacimiento",
        ci.nombreCiudad AS "nombreCiudad",
        p.nombrePais AS "nombrePais",
        c.idCiudad AS "idCiudad",
        c.idPais AS "idPais"
      FROM 
        Cliente c
      LEFT JOIN Ciudad ci ON c.idCiudad = ci.idCiudad
      LEFT JOIN Pais p ON c.idPais = p.idPais
      WHERE 
        c.idCliente = $1;
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente completo:', error);
    res.status(500).json({ error: 'Error al obtener cliente completo' });
  }
});

// Crear nuevo cliente
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

  // Validación de campos obligatorios
  const camposObligatorios = {
    nombreCliente: 'Nombre',
    apellidoPaternoCliente: 'Apellido paterno',
    telefono: 'Teléfono',
    identificacionunicanacional: 'Identificación',
    idPais: 'País',
    idCiudad: 'Ciudad'
  };

  const faltantes = [];
  for (const [campo, nombre] of Object.entries(camposObligatorios)) {
    if (!req.body[campo]?.toString().trim()) {
      faltantes.push(nombre);
    }
  }

  if (faltantes.length > 0) {
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios',
      camposFaltantes: faltantes 
    });
  }

  try {
    // Verificar si ya existe un cliente con la misma identificación
    const existe = await pool.query(
      'SELECT idCliente FROM Cliente WHERE identificacionunicanacional = $1',
      [identificacionunicanacional]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un cliente con esta identificación',
        idClienteExistente: existe.rows[0].idCliente
      });
    }

    // Insertar nuevo cliente
    const result = await pool.query(
      `INSERT INTO Cliente (
        nombreCliente, apellidoPaternoCliente, apellidoMaternoCliente,
        sexo, edad, telefono, estado_civil, identificacionunicanacional,
        Domicilio, condicionesEspeciales, fechaNacimiento, municipioNacimiento,
        EstadoNacimiento, PaisNacimiento, idCiudad, idPais
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        nombreCliente.trim(),
        apellidoPaternoCliente.trim(),
        apellidoMaternoCliente?.trim() || null,
        sexo || null,
        edad ? parseInt(edad) : null,
        telefono.replace(/\D/g, ''), // Eliminar caracteres no numéricos
        estado_civil || null,
        identificacionunicanacional,
        Domicilio?.trim() || null,
        condicionesEspeciales?.trim() || null,
        fechaNacimiento || null,
        municipioNacimiento?.trim() || null,
        EstadoNacimiento?.trim() || null,
        PaisNacimiento?.trim() || null,
        idCiudad,
        idPais
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error al crear cliente:', error);

    let mensajeError = 'Error al crear cliente';
    if (error.code === '23503') { // Violación de clave foránea
      if (error.constraint.includes('idPais')) {
        mensajeError = 'El país seleccionado no existe';
      } else if (error.constraint.includes('idCiudad')) {
        mensajeError = 'La ciudad seleccionada no existe o no pertenece al país especificado';
      }
    } else if (error.code === '23505') { // Violación de unicidad
      mensajeError = 'Ya existe un cliente con esta identificación';
    } else if (error.code === '22007') { // Formato de fecha inválido
      mensajeError = 'Formato de fecha inválido (use YYYY-MM-DD)';
    } else if (error.code === '22P02') { // Tipo de dato inválido
      mensajeError = 'Tipo de dato inválido para alguno de los campos';
    }

    res.status(500).json({
      error: mensajeError,
      details: process.env.NODE_ENV === 'development' ? error.message : null,
      code: error.code
    });
  }
});


// Obtener un cliente específico
app.get('/api/clientes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM Cliente WHERE idCliente = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// Actualizar cliente
app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const datosActualizados = req.body;

  // Validación de campos obligatorios
  const camposObligatorios = {
    nombreCliente: 'Nombre',
    apellidoPaternoCliente: 'Apellido paterno',
    telefono: 'Teléfono',
    identificacionunicanacional: 'Identificación',
    idPais: 'País',
    idCiudad: 'Ciudad'
  };

  const faltantes = [];
  for (const [campo, nombre] of Object.entries(camposObligatorios)) {
    if (!datosActualizados[campo]?.toString().trim()) {
      faltantes.push(nombre);
    }
  }

  if (faltantes.length > 0) {
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios',
      camposFaltantes: faltantes 
    });
  }

  try {
    // Verificar si el cliente existe
    const clienteExiste = await pool.query(
      'SELECT idCliente FROM Cliente WHERE idCliente = $1',
      [id]
    );
    
    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si la identificación ya existe en otro cliente
    if (datosActualizados.identificacionunicanacional) {
      const identificacionExistente = await pool.query(
        'SELECT idCliente FROM Cliente WHERE identificacionunicanacional = $1 AND idCliente != $2',
        [datosActualizados.identificacionunicanacional, id]
      );
      
      if (identificacionExistente.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Ya existe otro cliente con esta identificación'
        });
      }
    }

    // Formatear datos
    const telefonoLimpio = datosActualizados.telefono?.replace(/\D/g, '') || null;
    const edadFormateada = datosActualizados.edad ? parseInt(datosActualizados.edad) : null;

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
      RETURNING *`,
      [
        datosActualizados.nombreCliente.trim(),
        datosActualizados.apellidoPaternoCliente.trim(),
        datosActualizados.apellidoMaternoCliente?.trim() || null,
        datosActualizados.sexo || null,
        edadFormateada,
        telefonoLimpio,
        datosActualizados.estado_civil || null,
        datosActualizados.identificacionunicanacional,
        datosActualizados.Domicilio?.trim() || null,
        datosActualizados.condicionesEspeciales?.trim() || null,
        datosActualizados.fechaNacimiento || null,
        datosActualizados.municipioNacimiento?.trim() || null,
        datosActualizados.EstadoNacimiento?.trim() || null,
        datosActualizados.PaisNacimiento?.trim() || null,
        datosActualizados.idCiudad,
        datosActualizados.idPais,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    
    let mensaje = 'Error al actualizar cliente';
    if (error.code === '23503') { // Violación de llave foránea
      if (error.constraint.includes('idPais')) {
        mensaje = 'El país seleccionado no existe';
      } else if (error.constraint.includes('idCiudad')) {
        mensaje = 'La ciudad seleccionada no existe o no pertenece al país';
      }
    } else if (error.code === '22007') { // Formato de fecha inválido
      mensaje = 'Formato de fecha inválido (use YYYY-MM-DD)';
    }
    
    res.status(500).json({ 
      error: mensaje,
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
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
// RUTAS PARA ANTECEDENTES
// ==============================================

/**
 * Obtener antecedentes de un cliente
 */
app.get('/api/clientes/:idCliente/antecedentes', authenticateToken, async (req, res) => {
  const { idCliente } = req.params;

  try {
    // Verificar que el cliente existe
    const clienteExiste = await pool.query(
      'SELECT idCliente FROM Cliente WHERE idCliente = $1',
      [idCliente]
    );
    
    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Obtener antecedentes del cliente
    const result = await pool.query(
      `SELECT 
        idAntecedente,
        TipoTramiteA AS "tipoTramite",
        descipcion AS "descripcion",
        telefono,
        fechaTramiteAntecendente AS "fechaTramite",
        estadoTramiteAntecente AS "estadoTramite",
        Domicilio,
        observaciones
      FROM Antecedente 
      WHERE idCliente = $1
      ORDER BY fechaTramiteAntecendente DESC`,
      [idCliente]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener antecedentes:', error);
    res.status(500).json({ 
      error: 'Error al obtener antecedentes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Crear un nuevo antecedente
 */
app.post('/api/antecedentes', authenticateToken, async (req, res) => {
  const {
    idCliente,
    tipoTramite,
    descripcion,
    telefono,
    fechaTramite,
    estadoTramite,
    Domicilio,
    observaciones
  } = req.body;

  // Validación de campos obligatorios
  if (!idCliente || !tipoTramite?.trim()) {
    return res.status(400).json({ 
      error: 'El ID del cliente y el tipo de trámite son requeridos'
    });
  }

  try {
    // Verificar que el cliente existe
    const clienteExiste = await pool.query(
      'SELECT idCliente FROM Cliente WHERE idCliente = $1',
      [idCliente]
    );
    
    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Insertar nuevo antecedente
    const result = await pool.query(
      `INSERT INTO Antecedente (
        idCliente,
        TipoTramiteA,
        descipcion,
        telefono,
        fechaTramiteAntecendente,
        estadoTramiteAntecente,
        Domicilio,
        observaciones,
        apellidoPaternoCliente
      ) 
      SELECT 
        $1, $2, $3, $4, $5, $6, $7, $8,
        c.apellidoPaternoCliente
      FROM Cliente c
      WHERE c.idCliente = $1
      RETURNING 
        idAntecedente,
        TipoTramiteA AS "tipoTramite",
        descipcion AS "descripcion",
        telefono,
        fechaTramiteAntecendente AS "fechaTramite",
        estadoTramiteAntecente AS "estadoTramite",
        Domicilio,
        observaciones`,
      [
        idCliente,
        tipoTramite.trim(),
        descripcion?.trim() || null,
        telefono?.replace(/\D/g, '') || null,
        fechaTramite || null,
        estadoTramite?.trim() || null,
        Domicilio?.trim() || null,
        observaciones?.trim() || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear antecedente:', error);
    
    let mensaje = 'Error al crear antecedente';
    if (error.code === '23503') { // Violación de llave foránea
      mensaje = 'El cliente especificado no existe';
    } else if (error.code === '23505') { // Violación de unicidad
      mensaje = 'Error de duplicación (¿ya existe este antecedente?)';
    } else if (error.code === '22008') { // Formato de fecha inválido
      mensaje = 'Formato de fecha inválido (use YYYY-MM-DD)';
    }
    
    res.status(500).json({ 
      error: mensaje,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Actualizar un antecedente
 */
app.put('/api/antecedentes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    tipoTramite,
    descripcion,
    telefono,
    fechaTramite,
    estadoTramite,
    Domicilio,
    observaciones
  } = req.body;

  // Validación de campos obligatorios
  if (!tipoTramite?.trim()) {
    return res.status(400).json({ 
      error: 'El tipo de trámite es requerido'
    });
  }

  try {
    // Verificar que el antecedente existe
    const antecedenteExiste = await pool.query(
      'SELECT idAntecedente FROM Antecedente WHERE idAntecedente = $1',
      [id]
    );
    
    if (antecedenteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Antecedente no encontrado' });
    }

    // Actualizar antecedente
    const result = await pool.query(
      `UPDATE Antecedente SET
        TipoTramiteA = $1,
        descipcion = $2,
        telefono = $3,
        fechaTramiteAntecendente = $4,
        estadoTramiteAntecente = $5,
        Domicilio = $6,
        observaciones = $7
      WHERE idAntecedente = $8
      RETURNING 
        idAntecedente,
        idCliente,
        TipoTramiteA AS "tipoTramite",
        descipcion AS "descripcion",
        telefono,
        fechaTramiteAntecendente AS "fechaTramite",
        estadoTramiteAntecente AS "estadoTramite",
        Domicilio,
        observaciones`,
      [
        tipoTramite.trim(),
        descripcion?.trim() || null,
        telefono?.replace(/\D/g, '') || null,
        fechaTramite || null,
        estadoTramite?.trim() || null,
        Domicilio?.trim() || null,
        observaciones?.trim() || null,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar antecedente:', error);
    
    let mensaje = 'Error al actualizar antecedente';
    if (error.code === '22008') { // Formato de fecha inválido
      mensaje = 'Formato de fecha inválido (use YYYY-MM-DD)';
    } else if (error.code === '22P02') { // Error de tipo de dato
      mensaje = 'Error en los tipos de datos enviados. Verifique que todos los campos tengan valores válidos.';
    }
    
    res.status(500).json({ 
      error: mensaje,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Eliminar un antecedente
 */
app.delete('/api/antecedentes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que el antecedente existe
    const antecedenteExiste = await pool.query(
      'SELECT idAntecedente FROM Antecedente WHERE idAntecedente = $1',
      [id]
    );
    
    if (antecedenteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Antecedente no encontrado' });
    }

    // Eliminar antecedente
    const result = await pool.query(
      'DELETE FROM Antecedente WHERE idAntecedente = $1 RETURNING idAntecedente',
      [id]
    );

    res.json({ 
      success: true,
      message: 'Antecedente eliminado correctamente',
      idAntecedente: result.rows[0].idAntecedente
    });
  } catch (error) {
    console.error('Error al eliminar antecedente:', error);
    res.status(500).json({ 
      error: 'Error al eliminar antecedente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Obtener un antecedente específico
 */
// En el backend (index.js), modifica el endpoint para obtener un antecedente específico
app.get('/api/antecedentes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        a.idAntecedente,
        a.idCliente,
        a.TipoTramiteA AS "tipoTramite",
        a.descipcion AS "descripcion",
        a.telefono,
        a.fechaTramiteAntecendente AS "fechaTramite",
        a.estadoTramiteAntecente AS "estadoTramite",
        a.Domicilio,
        a.observaciones,
        c.nombreCliente || ' ' || c.apellidoPaternoCliente AS "nombreCliente"
      FROM Antecedente a
      JOIN Cliente c ON a.idCliente = c.idCliente
      WHERE a.idAntecedente = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Antecedente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener antecedente:', error);
    res.status(500).json({ 
      error: 'Error al obtener antecedente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
// RUTAS PARA TRÁMITES (VERSIÓN CORREGIDA)
// ==============================================

// Configuración adicional para manejo de fechas
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
};

// Crear un nuevo trámite
app.post('/api/tramites', authenticateToken, async (req, res) => {
  const {
    tipoTramite, 
    descripcion, 
    fecha_inicio, 
    fecha_fin,
    requisitos, 
    plazo_estimado, 
    costo,
    clientes = [], 
    empleados = []
  } = req.body;

  const errors = [];

  if (!tipoTramite?.trim()) errors.push('El tipo de trámite es requerido');
  if (!plazo_estimado?.trim()) errors.push('El plazo estimado es requerido');
  if (!costo?.trim()) errors.push('El costo es requerido');

  const fechaInicioFormateada = fecha_inicio ? new Date(fecha_inicio).toISOString().split('T')[0] : null;
  const fechaFinFormateada = fecha_fin ? new Date(fecha_fin).toISOString().split('T')[0] : null;

  const clienteIds = Array.isArray(clientes) ? clientes.map(Number).filter(Boolean) : [];
  const empleadoIds = Array.isArray(empleados) ? empleados.map(Number).filter(Boolean) : [];

  if (clienteIds.length === 0) errors.push('Debe seleccionar al menos un cliente');
  if (empleadoIds.length === 0) errors.push('Debe seleccionar al menos un empleado');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Error de validación', details: errors });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tramiteResult = await client.query(
      `INSERT INTO Tramite (
        tipoTramite, descripcion, fecha_inicio, fecha_fin,
        requisitos, plazo_estimado, costo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING idTramite`,
      [
        tipoTramite.trim(),
        descripcion?.trim() || '',
        fechaInicioFormateada,
        fechaFinFormateada,
        requisitos?.trim() || '',
        plazo_estimado.trim(),
        costo.trim()
      ]
    );

    const idTramite = tramiteResult.rows[0].idtramite;

    for (const idCliente of clienteIds) {
      await client.query(
        `INSERT INTO Tramite_Cliente (idTramite, idCliente) VALUES ($1, $2)`,
        [idTramite, idCliente]
      );
    }

    for (const idEmpleado of empleadoIds) {
      await client.query(
        `INSERT INTO Tramite_Empleado (idTramite, idEmpleado) VALUES ($1, $2)`,
        [idTramite, idEmpleado]
      );
    }

    await client.query('COMMIT');

    const tramiteCompleto = await client.query(`
      SELECT t.*, 
        (
          SELECT json_agg(json_build_object(
            'idCliente', c.idCliente,
            'nombre', c.nombreCliente || ' ' || c.apellidoPaternoCliente
          )) FROM Tramite_Cliente tc
          JOIN Cliente c ON tc.idCliente = c.idCliente
          WHERE tc.idTramite = t.idTramite
        ) AS clientes,
        (
          SELECT json_agg(json_build_object(
            'idEmpleado', e.idEmpleado,
            'nombre', e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado
          )) FROM Tramite_Empleado te
          JOIN Empleado e ON te.idEmpleado = e.idEmpleado
          WHERE te.idTramite = t.idTramite
        ) AS empleados
      FROM Tramite t
      WHERE t.idTramite = $1
    `, [idTramite]);

    res.status(201).json(tramiteCompleto.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear trámite:', error);
    res.status(500).json({ error: 'Error al crear trámite', details: error.message });
  } finally {
    client.release();
  }
});

// GET /api/tramites
app.get('/api/tramites', async (req, res) => {
  try {
    const { rows: tramites } = await pool.query(`
      SELECT 
        t.idtramite,
        t.tipotramite,
        t.descripcion,
        t.fecha_inicio,
        t.fecha_fin,
        t.requisitos,
        t.plazo_estimado,
        t.costo,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'idCliente', c.idcliente,
          'nombre', c.nombrecliente || ' ' || c.apellidopaternocliente
        )) FILTER (WHERE c.idcliente IS NOT NULL), '[]') AS clientes,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'idEmpleado', e.idempleado,
          'nombre', e.nombreempleado || ' ' || e.apellidopaternoempleado
        )) FILTER (WHERE e.idempleado IS NOT NULL), '[]') AS empleados
      FROM tramite t
      LEFT JOIN tramite_cliente tc ON t.idtramite = tc.idtramite
      LEFT JOIN cliente c ON tc.idcliente = c.idcliente
      LEFT JOIN tramite_empleado te ON t.idtramite = te.idtramite
      LEFT JOIN empleado e ON te.idempleado = e.idempleado
      GROUP BY t.idtramite
      ORDER BY t.fecha_inicio DESC;
    `);

    res.json(tramites);
  } catch (err) {
    console.error('Error al obtener trámites:', err);
    res.status(500).json({ error: 'Error al obtener la lista de trámites' });
  }
});

// Función auxiliar para obtener trámite completo
async function getTramiteCompleto(idTramite) {
  const query = `
    SELECT 
      t.*,
      (
        SELECT json_agg(json_build_object(
          'idCliente', c.idCliente,
          'nombre', c.nombreCliente || ' ' || c.apellidoPaternoCliente
        ))
        FROM Tramite_Cliente tc
        JOIN Cliente c ON c.idCliente = tc.idCliente
        WHERE tc.idTramite = t.idTramite
      ) AS clientes,
      (
        SELECT json_agg(json_build_object(
          'idEmpleado', e.idEmpleado,
          'nombre', e.nombreEmpleado || ' ' || e.apellidoPaternoEmpleado
        ))
        FROM Tramite_Empleado te
        JOIN Empleado e ON e.idEmpleado = te.idEmpleado
        WHERE te.idTramite = t.idTramite
      ) AS empleados
    FROM Tramite t
    WHERE t.idTramite = $1
  `;
  
  const result = await pool.query(query, [idTramite]);
  return result.rows[0];
}

// GET cierto trámite por ID
app.get('/api/tramites/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Validación del ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: 'ID de trámite inválido',
      details: `El ID proporcionado (${id}) no es válido`
    });
  }

  try {
    console.log(`Intentando obtener trámite con ID: ${id}`); // Log para depuración
    
    const tramite = await getTramiteCompleto(id);
    
    if (!tramite) {
      console.log(`Trámite con ID ${id} no encontrado`);
      return res.status(404).json({ 
        error: 'Trámite no encontrado',
        details: `No existe un trámite con el ID ${id}`
      });
    }

    console.log(`Trámite encontrado:`, tramite); // Log para depuración
    return res.json(tramite);

  } catch (error) {
    console.error('Error al obtener trámite por ID:', error);
    
    // Distinguir entre diferentes tipos de errores
    if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Timeout al consultar la base de datos',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: 'Error interno al obtener trámite',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/tramites/:id - Versión corregida
app.put('/api/tramites/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Validar que el ID sea un número
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID de trámite inválido' });
  }

  const {
    tipoTramite, 
    descripcion, 
    fecha_inicio, 
    fecha_fin,
    requisitos, 
    plazo_estimado, 
    costo,
    clientes = [], 
    empleados = []
  } = req.body;

  // Validaciones mejoradas
  const errors = [];
  if (!tipoTramite?.trim()) errors.push('El tipo de trámite es requerido');
  if (!plazo_estimado?.trim()) errors.push('El plazo estimado es requerido');
  if (!costo?.trim()) errors.push('El costo es requerido');

  // Validación y conversión segura de IDs
  const clienteIds = Array.isArray(clientes) 
    ? clientes.map(id => parseInt(id)).filter(id => !isNaN(id))
    : [];
  
  const empleadoIds = Array.isArray(empleados) 
    ? empleados.map(id => parseInt(id)).filter(id => !isNaN(id))
    : [];

  if (clienteIds.length === 0) errors.push('Debe seleccionar al menos un cliente válido');
  if (empleadoIds.length === 0) errors.push('Debe seleccionar al menos un empleado válido');

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Error de validación', 
      details: errors 
    });
  }

  // Formateo de fechas
  const fechaInicioFormateada = fecha_inicio 
    ? new Date(fecha_inicio).toISOString().split('T')[0] 
    : null;
  const fechaFinFormateada = fecha_fin 
    ? new Date(fecha_fin).toISOString().split('T')[0] 
    : null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Actualizar trámite principal
    const updateQuery = `
      UPDATE Tramite SET
        tipoTramite = $1,
        descripcion = $2,
        fecha_inicio = $3,
        fecha_fin = $4,
        requisitos = $5,
        plazo_estimado = $6,
        costo = $7
      WHERE idTramite = $8
      RETURNING *`;
    
    const updateResult = await client.query(updateQuery, [
      tipoTramite.trim(),
      descripcion?.trim() || '',
      fechaInicioFormateada,
      fechaFinFormateada,
      requisitos?.trim() || '',
      plazo_estimado.trim(),
      costo.trim(),
      parseInt(id) // Asegurar que es número
    ]);

    if (updateResult.rowCount === 0) {
      throw new Error('No se encontró el trámite para actualizar');
    }

    // 2. Eliminar relaciones anteriores
    await client.query('DELETE FROM Tramite_Cliente WHERE idTramite = $1', [id]);
    await client.query('DELETE FROM Tramite_Empleado WHERE idTramite = $1', [id]);

    // 3. Insertar nuevas relaciones
    if (clienteIds.length > 0) {
      const clienteValues = clienteIds.map(idCliente => `(${id}, ${idCliente})`).join(',');
      await client.query(
        `INSERT INTO Tramite_Cliente (idTramite, idCliente) VALUES ${clienteValues}`
      );
    }

    if (empleadoIds.length > 0) {
      const empleadoValues = empleadoIds.map(idEmpleado => `(${id}, ${idEmpleado})`).join(',');
      await client.query(
        `INSERT INTO Tramite_Empleado (idTramite, idEmpleado) VALUES ${empleadoValues}`
      );
    }

    await client.query('COMMIT');

    // Obtener el trámite actualizado con sus relaciones
    const tramiteActualizado = await getTramiteCompleto(id);
    res.json(tramiteActualizado);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar trámite:', error);
    
    let errorMessage = 'Error al actualizar trámite';
    if (error.message.includes('violates foreign key constraint')) {
      errorMessage = 'Error: Uno de los clientes o empleados no existe';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
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