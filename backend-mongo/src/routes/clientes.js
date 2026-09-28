const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth');

// Función helper para obtener o crear modelo
function getModel(name, collection) {
  return mongoose.models[name] || mongoose.model(name, new mongoose.Schema({}, { strict: false, collection }));
}

// GET /api/clientes
router.get('/clientes', authenticateToken, async (req, res) => {
  try {
    const Contacto = getModel('contacto', 'contacto');
    const clientes = await Contacto.find({}).limit(200).lean();
    
    const clientesFormato = clientes.map(c => ({
      idCliente: c.id_contacto,
      nombreCliente: c.nombre_contacto || '',
      apellidoPaternoCliente: '',
      apellidoMaternoCliente: '',
      telefono: c.numero_contacto || '',
      identificacionunicanacional: '',
      email: c.email,
      numero_emergencia: c.numero_emergencia,
      cobro: c.cobro
    }));
    
    res.json(clientesFormato);
  } catch (error) {
    console.error('Error en /api/clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/paises
router.get('/paises', authenticateToken, async (req, res) => {
  try {
    const CatalogoPaises = getModel('catalogo_paises', 'catalogo_paises');
    const paises = await CatalogoPaises.find({}).lean();
    
    // Formatear para el frontend
    const paisesFormato = paises.map(p => ({
      id_pais: p.id_pais,
      pais: p.pais,
      nombre: p.pais
    }));
    
    res.json(paisesFormato);
  } catch (error) {
    console.error('Error en /api/paises:', error);
    res.status(500).json({ error: 'Error al obtener países' });
  }
});

module.exports = router;
