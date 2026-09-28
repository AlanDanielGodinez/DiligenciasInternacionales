const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Documento extends Model {}

Documento.init({
  nombre: { type: DataTypes.STRING, allowNull: false },
  nombreArchivo: { type: DataTypes.STRING, allowNull: false },
  ruta: { type: DataTypes.STRING, allowNull: false },
  tamaño: { type: DataTypes.INTEGER, allowNull: false },
  tipoMime: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize,
  modelName: 'Documento',
  timestamps: true
});

module.exports = Documento;
const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  diligenciaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diligencia',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  nombreArchivo: {
    type: String,
    required: true
  },
  ruta: {
    type: String,
    required: true
  },
  tamaño: {
    type: Number,
    required: true
  },
  tipoMime: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Documento', documentoSchema);