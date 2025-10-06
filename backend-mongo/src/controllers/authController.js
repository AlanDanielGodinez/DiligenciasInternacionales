const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Generar JWT (igual que el backend anterior)
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

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos',
        required: ['email', 'password', 'name']
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    const user = new User({ email, password, name });
    await user.save();

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.name, // Cambiado a 'nombre' para coincidir con el frontend
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login (adaptado del backend anterior)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Intento de login recibido para email:', email);

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos'
      });
    }

    // Buscar usuario (equivalente al SELECT en PostgreSQL)
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Verificar password (igual que en el backend anterior)
    const validPassword = await user.comparePassword(password);
    
    if (!validPassword) {
      console.log('Contraseña incorrecta para:', email);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token (igual estructura que el backend anterior)
    const token = generateToken(user);

    console.log('Login exitoso para:', email);

    // Respuesta igual que el backend anterior
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.name // Cambiado a 'nombre' para coincidir con el frontend
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login
};