require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Lee desde .env

// Mapeo de archivos CSV a colecciones
const CSV_MAPPING = {
  'INFORMES Y PAGOS - PAISES.csv': {
    collection: 'catalogo_paises',
    keyField: 'id_pais'
  },
  'INFORMES Y PAGOS - TRAMITES.csv': {
    collection: 'catalogo_tramites',
    keyField: 'id_tramite'
  },
  'INFORMES Y PAGOS - HISTORIAL DE TRAMITES.csv': {
    collection: 'historial_tramites',
    keyField: 'id'
  },
  'INFORMES Y PAGOS - CONTACTO.csv': {
    collection: 'contacto',
    keyField: 'id_contacto'
  },
  'INFORMES Y PAGOS - INFORMES (2).csv': {
    collection: 'informes',
    keyField: 'id_del_aplicante'
  },
  'INFORMES Y PAGOS - TELEFONOS DE RECEPCION.csv': {
    collection: 'telefonos_recepcion',
    keyField: 'id_telefono'
  }
};

function normalizeHeader(header) {
  return header
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9_]/g, '');
}

function parseCSV(csvContent) {
  const lines = csvContent.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => normalizeHeader(h));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    const row = {};
    
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].trim() : '';
      row[header] = value;
    });

    rows.push(row);
  }

  return rows;
}

async function importCSV(fileName, config) {
  const filePath = path.join(__dirname, 'data', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${fileName}`);
    return;
  }

  console.log(`\nImportando ${fileName}...`);
  
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(csvContent);

  if (rows.length === 0) {
    console.log(`⚠️  Sin datos en ${fileName}`);
    return;
  }

  const Collection = mongoose.model(
    config.collection,
    new mongoose.Schema({}, { strict: false, collection: config.collection })
  );

  let imported = 0;
  let updated = 0;

  for (const row of rows) {
    const keyValue = row[config.keyField];
    if (!keyValue) continue;

    const doc = {
      ...row,
      _sheet: fileName,
      _keyField: config.keyField,
      _keyValue: keyValue,
      _updatedAt: new Date()
    };

    const result = await Collection.updateOne(
      { _keyField: config.keyField, _keyValue: keyValue },
      { $set: doc },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      imported++;
    } else if (result.modifiedCount > 0) {
      updated++;
    }
  }

  console.log(`✅ ${config.collection}: ${imported} nuevos, ${updated} actualizados`);
}

async function main() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    for (const [fileName, config] of Object.entries(CSV_MAPPING)) {
      await importCSV(fileName, config);
    }

    console.log('\nImportación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
