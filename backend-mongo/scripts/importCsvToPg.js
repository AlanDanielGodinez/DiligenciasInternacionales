const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/lib/sync');
const { sequelize, User, Diligencia } = require('../src/models');

async function importUsers() {
  const file = path.join(__dirname, '..', 'data', 'usuarios_ejemplo.csv');
  const content = fs.readFileSync(file, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true });

  for (const r of records) {
    try {
      await User.findOrCreate({ where: { email: r.email }, defaults: { name: r.nombre, role: r.rol || 'user', password: r.password } });
    } catch (err) {
      console.error('Error creando usuario', r.email, err);
    }
  }
}

async function importDiligencias() {
  const file = path.join(__dirname, '..', 'data', 'diligencias_ejemplo.csv');
  const content = fs.readFileSync(file, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true });

  // Buscar admin para asignar como creador si existe
  const admin = await User.findOne({ where: { role: 'admin' } });
  const userId = admin ? admin.id : null;

  for (const r of records) {
    try {
      await Diligencia.create({
        titulo: r.titulo,
        descripcion: r.descripcion,
        status: r.status || 'pendiente',
        fechaVencimiento: r.fechaVencimiento ? new Date(r.fechaVencimiento) : null,
        userId
      });
    } catch (err) {
      console.error('Error creando diligencia', r.titulo, err);
    }
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('DB sync completa');
    await importUsers();
    await importDiligencias();
    console.log('Importación terminada');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
