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