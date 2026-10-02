require('dotenv').config();
// Legacy (MongoDB). La contraseña ya no está escrita en el código: defina ADMIN_PASSWORD en el entorno.
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 10) {
  console.error('Defina ADMIN_PASSWORD (>= 10 caracteres) en el entorno.');
  process.exit(1);
}
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
            process.exit(0);
    }
    
    const user = new User({
      name: 'Admin',
      email: 'admin@diligencias.com',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    
    await user.save();
    console.log('✅ Usuario admin creado exitosamente');
    console.log('Email: admin@diligencias.com');
        process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
