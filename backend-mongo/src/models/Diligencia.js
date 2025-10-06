const mongoose = require('mongoose');

const diligenciaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaVencimiento: {
    type: Date
  },
  documentos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Documento'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Diligencia', diligenciaSchema);