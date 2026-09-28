require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Verificar si ya existe
    const existing = await User.findOne({ email: 'admin@diligencias.com' });
    if (existing) {
      console.log('ℹ️  El usuario admin ya existe');
      console.log('Email: admin@diligencias.com');
      console.log('Password: Admin123');
      process.exit(0);
    }
    
    const user = new User({
      name: 'Admin',
      email: 'admin@diligencias.com',
      password: 'Admin123',
      role: 'admin'
    });
    
    await user.save();
    console.log('✅ Usuario admin creado exitosamente');
    console.log('Email: admin@diligencias.com');
    console.log('Password: Admin123');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
