const { google } = require('googleapis');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Diligencia = require('../models/Diligencia');
const Documento = require('../models/documento');

function createSheetsClient() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const hasServiceAccount = keyPath && fs.existsSync(keyPath);

  if (hasServiceAccount) {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    return google.sheets({ version: 'v4', auth });
  }

  return google.sheets({
    version: 'v4',
    auth: process.env.GOOGLE_API_KEY
  });
}

const sheets = createSheetsClient();

// Configuración de tabs y rangos (ingestión cruda)
const SHEET_CONFIG = {
  // GESTION AMA
  gestion_aplicantes: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'APLICANTES AMA!A1:U1929',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'gestion_aplicantes'
  },
  gestion_grupos: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'GRUPOS AMA!A1:S194',
    type: 'raw',
    keyField: 'id_grupo',
    collection: 'gestion_grupos'
  },
  gestion_calendario: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'CALENDARIO!A1:G432',
    type: 'raw',
    keyField: 'fecha',
    collection: 'gestion_calendario'
  },
  gestion_grupo_asignado: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'grupo_asignado!A1:F4',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'gestion_grupo_asignado'
  },
  gestion_logistica: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'logistica_viajes!A1:L48',
    type: 'raw',
    keyField: 'id_viaje',
    collection: 'gestion_logistica_viajes'
  },
  gestion_vuelos: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'vuelos!A1:G2',
    type: 'raw',
    keyField: 'numero_vuelo',
    collection: 'gestion_vuelos'
  },
  gestion_realizados: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'REALIZADOS GRUPOS AMA!A1:E185',
    type: 'raw',
    keyField: 'grupo',
    collection: 'gestion_realizados_grupos'
  },
  gestion_negados: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'NEGADOS!A1:J1056',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'gestion_negados'
  },
  gestion_check_ds: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'check_ds!A1:E62',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'gestion_check_ds'
  },
  gestion_notas_protocolo: {
    spreadsheetId: process.env.GOOGLE_SHEET_GESTION_AMA_ID,
    range: 'NotasProtocolo!A1:C4',
    type: 'raw',
    keyField: 'tema',
    collection: 'gestion_notas_protocolo'
  },

  // FORMULARIO PERFILES AMA
  perfiles_aplicantes: {
    spreadsheetId: process.env.GOOGLE_SHEET_PERFILES_ID,
    range: 'APLICANTES AMA PERFILES!A1:R569',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'perfiles_aplicantes'
  },
  perfiles_detalle: {
    spreadsheetId: process.env.GOOGLE_SHEET_PERFILES_ID,
    range: 'PERFILES AMA!A1:DY487',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'perfiles_detalle'
  },
  perfiles_familiares: {
    spreadsheetId: process.env.GOOGLE_SHEET_PERFILES_ID,
    range: 'FAMILIARES EN EE. Uu!A1:G1870',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'perfiles_familiares_usa'
  },
  perfiles_estudios: {
    spreadsheetId: process.env.GOOGLE_SHEET_PERFILES_ID,
    range: 'estudios!A1:G1',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'perfiles_estudios'
  },

  // VISA Y PASAPORTES INDIVIDUALES
  visa_individual: {
    spreadsheetId: process.env.GOOGLE_SHEET_VISA_PASSPORT_ID,
    range: 'VISA INDIVIDUAL!A1:AE381',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'visa_individual'
  },

  // INFORMES Y PAGOS
  informes: {
    spreadsheetId: process.env.GOOGLE_SHEET_INFORMES_PAGOS_ID,
    range: 'INFORMES!A1:AA1628',
    type: 'raw',
    keyField: 'id_del_aplicante',
    collection: 'informes'
  },
  contacto: {
    spreadsheetId: process.env.GOOGLE_SHEET_INFORMES_PAGOS_ID,
    range: 'CONTACTO!A1:F1194',
    type: 'raw',
    keyField: 'correo',
    collection: 'contacto'
  },
  historial_tramites: {
    spreadsheetId: process.env.GOOGLE_SHEET_INFORMES_PAGOS_ID,
    range: 'HISTORIAL DE TRAMITES!A1:F2146',
    type: 'raw',
    keyField: 'id_aplicante',
    collection: 'historial_tramites'
  },
  tramites_cat: {
    spreadsheetId: process.env.GOOGLE_SHEET_INFORMES_PAGOS_ID,
    range: 'TRAMITES!A1:D19',
    type: 'raw',
    keyField: 'id',
    collection: 'catalogo_tramites'
  },
  paises_cat: {
    spreadsheetId: process.env.GOOGLE_SHEET_INFORMES_PAGOS_ID,
    range: 'PAISES!A1:B29',
    type: 'raw',
    keyField: 'id',
    collection: 'catalogo_paises'
  },
  telefonos_recepcion: {
    spreadsheetId: process.env.GOOGLE_SHEET_INFORMES_PAGOS_ID,
    range: 'TELEFONOS DE RECEPCION!A1:C12',
    type: 'raw',
    keyField: 'telefono',
    collection: 'telefonos_recepcion'
  },

  // BD LEGALES
  legales: {
    spreadsheetId: process.env.GOOGLE_SHEET_BD_LEGALES_ID,
    range: 'legal!A1:X167',
    type: 'raw',
    keyField: 'id_tramite',
    collection: 'bd_legales'
  }
};

async function getSheetData(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range
    });

    if (!response.data.values || response.data.values.length === 0) {
      return [];
    }

    return response.data.values;
  } catch (error) {
    console.error(`Error obteniendo datos de Sheet ${spreadsheetId}:`, error.message);
    throw error;
  }
}

function parseSheetData(rawData, mapping) {
  if (rawData.length < 2) return [];

  const headers = rawData[0].map(h => h.toLowerCase().trim());
  const records = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const record = {};
    for (const [headerIdx, headerName] of headers.entries()) {
      if (mapping[headerName]) {
        const mongoField = mapping[headerName];
        const value = row[headerIdx] || '';
        record[mongoField] = parseValue(value, mongoField);
      }
    }

    if (Object.keys(record).length > 0) {
      records.push(record);
    }
  }

  return records;
}

function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseRawSheetData(rawData) {
  if (!rawData || rawData.length < 2) return [];

  const headers = rawData[0].map(normalizeHeader);
  const records = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i] || [];
    const record = { _rowIndex: i };

    headers.forEach((header, idx) => {
      if (!header) return;
      const value = row[idx];
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        record[header] = `${value}`.trim();
      }
    });

    if (Object.keys(record).length > 1) {
      records.push(record);
    }
  }

  return records;
}

function parseValue(value, fieldName) {
  if (!value) return null;
  
  if (fieldName === 'isActive') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'activo' || value === '1';
  }
  
  if (fieldName.includes('Fecha') || fieldName.includes('fecha')) {
    return new Date(value);
  }
  
  if (fieldName === 'status') {
    return value.toLowerCase().replace(/ /g, '_');
  }
  
  return value.trim();
}

async function syncUsers(records, keyField) {
  const results = { created: 0, updated: 0, errors: 0 };

  for (const record of records) {
    try {
      const keyValue = record[keyField];
      if (!keyValue) continue;

      const query = { [keyField]: keyValue };
      const updateData = {
        ...record,
        role: record.role || 'user'
      };

      const existingUser = await User.findOne(query);

      if (existingUser) {
        await User.updateOne(query, { $set: updateData });
        results.updated++;
      } else {
        const newUser = new User(updateData);
        await newUser.save();
        results.created++;
      }
    } catch (error) {
      console.error(`Error procesando usuario:`, error.message);
      results.errors++;
    }
  }

  return results;
}

async function syncDiligencias(records, keyField) {
  const results = { created: 0, updated: 0, errors: 0 };

  for (const record of records) {
    try {
      const keyValue = record[keyField];
      if (!keyValue) continue;

      const query = { _id: keyValue };
      
      let userId = null;
      if (record.clienteEmail) {
        const user = await User.findOne({ email: record.clienteEmail });
        if (user) {
          userId = user._id;
        }
      }

      const updateData = {
        ...record,
        userId: userId,
        status: record.status || 'pendiente'
      };

      const existingDiligencia = await Diligencia.findById(keyValue);

      if (existingDiligencia) {
        await Diligencia.updateOne(query, { $set: updateData });
        results.updated++;
      } else {
        const newDiligencia = new Diligencia(updateData);
        await newDiligencia.save();
        results.created++;
      }
    } catch (error) {
      console.error(`Error procesando diligencia:`, error.message);
      results.errors++;
    }
  }

  return results;
}

async function syncDocumentos(records, keyField) {
  const results = { created: 0, updated: 0, errors: 0 };

  for (const record of records) {
    try {
      const keyValue = record[keyField];
      if (!keyValue) continue;

      const query = { _id: keyValue };
      const updateData = {
        ...record
      };

      const existingDoc = await Documento.findById(keyValue);

      if (existingDoc) {
        await Documento.updateOne(query, { $set: updateData });
        results.updated++;
      } else {
        const newDoc = new Documento(updateData);
        await newDoc.save();
        results.created++;
      }
    } catch (error) {
      console.error(`Error procesando documento:`, error.message);
      results.errors++;
    }
  }

  return results;
}

async function syncRaw(records, config, sheetKey) {
  const results = { created: 0, updated: 0, errors: 0 };
  const collection = mongoose.connection.collection(config.collection || sheetKey);

  for (const record of records) {
    try {
      const keyValue = record[config.keyField];
      const _id = keyValue && `${keyValue}`.trim() !== ''
        ? `${sheetKey}:${keyValue}`
        : `${sheetKey}:row_${record._rowIndex}`;

      const doc = {
        ...record,
        _sheet: sheetKey,
        _keyField: config.keyField,
        _keyValue: keyValue || null,
        _updatedAt: new Date()
      };

      await collection.updateOne(
        { _id },
        { $set: doc },
        { upsert: true }
      );

      if (keyValue) {
        results.updated++;
      } else {
        results.created++;
      }
    } catch (error) {
      console.error(`Error procesando raw ${sheetKey}:`, error.message);
      results.errors++;
    }
  }

  return results;
}

async function syncSheet(sheetKey) {
  const config = SHEET_CONFIG[sheetKey];
  if (!config) {
    throw new Error(`Configuración no encontrada para ${sheetKey}`);
  }

  console.log(`Iniciando sincronización de ${sheetKey}...`);

  try {
    const rawData = await getSheetData(config.spreadsheetId, config.range);
    const records = config.type === 'raw'
      ? parseRawSheetData(rawData)
      : parseSheetData(rawData, config.mapping || {});

    console.log(`Se encontraron ${records.length} registros en ${sheetKey}`);

    let results;
    switch (config.type) {
      case 'users':
        results = await syncUsers(records, config.keyField);
        break;
      case 'diligencias':
        results = await syncDiligencias(records, config.keyField);
        break;
      case 'documentos':
        results = await syncDocumentos(records, config.keyField);
        break;
      case 'raw':
        results = await syncRaw(records, config, sheetKey);
        break;
      default:
        results = { created: 0, updated: 0, errors: 0 };
    }

    console.log(`${sheetKey} completado:`, results);
    return results;
  } catch (error) {
    console.error(`Error en sincronización de ${sheetKey}:`, error.message);
    throw error;
  }
}

async function syncAll() {
  const allResults = {};

  for (const sheetKey of Object.keys(SHEET_CONFIG)) {
    try {
      allResults[sheetKey] = await syncSheet(sheetKey);
    } catch (error) {
      allResults[sheetKey] = { error: error.message };
    }
  }

  return allResults;
}

async function previewSync(sheetKey) {
  const config = SHEET_CONFIG[sheetKey];
  if (!config) {
    throw new Error(`Configuración no encontrada para ${sheetKey}`);
  }

  try {
    const rawData = await getSheetData(config.spreadsheetId, config.range);
    const records = config.type === 'raw'
      ? parseRawSheetData(rawData)
      : parseSheetData(rawData, config.mapping || {});

    return {
      sheet: sheetKey,
      totalRecords: records.length,
      sampleRecords: records.slice(0, 5),
      type: config.type,
      keyField: config.keyField
    };
  } catch (error) {
    console.error(`Error en preview de ${sheetKey}:`, error.message);
    throw error;
  }
}

module.exports = {
  syncSheet,
  syncAll,
  previewSync,
  SHEET_CONFIG
};
