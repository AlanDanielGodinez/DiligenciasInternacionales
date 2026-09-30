const User = require('../models/user');
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

// Login para Empleados/Administradores
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Intento de login (empleado) para:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Validar que sea admin o user
    if (user.role !== 'admin' && user.role !== 'user') {
      console.log('❌ Usuario no es empleado:', email);
      return res.status(403).json({ error: 'Este usuario no es empleado' });
    }

    const validPassword = await user.comparePassword(password);
    
    if (!validPassword) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = generateToken(user);

    console.log('✅ Login exitoso (empleado) para:', email);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.name,
        role: user.role,
        rol: user.role === 'admin' ? 'Administrador' : 'Empleado'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login para Clientes
const clienteLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Intento de login (cliente) para:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ Cliente no encontrado:', email);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Validar que sea cliente
    if (user.role !== 'user' && user.role !== 'cliente') {
      console.log('❌ Usuario no es cliente:', email);
      return res.status(403).json({ error: 'Este usuario no es cliente' });
    }

    const validPassword = await user.comparePassword(password);
    
    if (!validPassword) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = generateToken(user);

    console.log('✅ Login exitoso (cliente) para:', email);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.name,
        role: 'cliente',
        rol: 'Cliente'
      }
    });

  } catch (error) {
    console.error('Error en login cliente:', error);
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

module.exports = {
  register,
  login,
  clienteLogin,
  verify
};