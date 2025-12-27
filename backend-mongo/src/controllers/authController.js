const User = require('../models/user'); // ✅ Correcto - archivo en minúscula
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Registro
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Intento de login recibido para email:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await user.comparePassword(password);
    
    if (!validPassword) {
      console.log('Contraseña incorrecta para:', email);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = generateToken(user);

    console.log('Login exitoso para:', email);

    // CAMBIO: Actualizar rol para compatibilidad con frontend
    let userRole = user.role;
    if (user.role === 'user') {
      userRole = 'admin'; // Temporalmente tratar users como admin
    }

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.name,
        role: userRole, // Usar el rol ajustado
        rol: userRole   // Agregar compatibilidad con frontend existente
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar token
const verify = async (req, res) => {
  try {
    res.json({
      message: 'Token válido',
      user: {
        id: req.user._id,
        email: req.user.email,
        nombre: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getDashboardData = (req, res) => {
  try {
    res.json({
      gruposActivos: [
        { id: 1, nombre: 'Grupo A', descripcion: 'Descripción del Grupo A' },
        { id: 2, nombre: 'Grupo B', descripcion: 'Descripción del Grupo B' }
      ],
      tramitesActivos: [
        { id: 1, titulo: 'Trámite 1', estado: 'En progreso' },
        { id: 2, titulo: 'Trámite 2', estado: 'Completado' }
      ],
      clientePorPais: [
        { pais: 'Argentina', cantidad: 120 },
        { pais: 'Brasil', cantidad: 80 },
      ]
    });
  } catch (error) {
    console.error('Error en obtener datos del dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
      
module.exports = {
  register,
  login,
  verify,
  getDashboardData
};