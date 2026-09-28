const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth');

// Función helper para obtener o crear modelo
function getModel(name, collection) {
  return mongoose.models[name] || mongoose.model(name, new mongoose.Schema({}, { strict: false, collection }));
}

// GET /api/dashboard/grupos-ama-activos
router.get('/grupos-ama-activos', authenticateToken, async (req, res) => {
  try {
    // Por ahora retorna vacío, implementar lógica cuando tengas datos de grupos
    res.json([]);
  } catch (error) {
    console.error('Error en grupos-ama-activos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/dashboard/tramites-activos
router.get('/tramites-activos', authenticateToken, async (req, res) => {
  try {
    const HistorialTramites = getModel('historial_tramites', 'historial_tramites');
    const CatalogoTramites = getModel('catalogo_tramites', 'catalogo_tramites');
    
    // Obtener trámites únicos del historial
    const tramites = await HistorialTramites.aggregate([
      {
        $group: {
          _id: '$id_tramite',
          total: { $sum: 1 }
        }
      }
    ]);

    // Enriquecer con nombres del catálogo
    const catalogoMap = {};
    const catalogo = await CatalogoTramites.find({});
    catalogo.forEach(t => {
      catalogoMap[t.id_tramite || t['id tramite']] = t.tramite || t.nombre || 'Sin nombre';
    });

    const result = tramites.map(t => ({
      tipotramite: catalogoMap[t._id] || 'Desconocido',
      total: t.total
    }));

    res.json(result);
  } catch (error) {
    console.error('Error en tramites-activos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/dashboard/clientes-por-pais
router.get('/clientes-por-pais', authenticateToken, async (req, res) => {
  try {
    const Informes = getModel('informes', 'informes');
    const CatalogoPaises = getModel('catalogo_paises', 'catalogo_paises');
    
    // Agrupar por país
    const paises = await Informes.aggregate([
      {
        $group: {
          _id: '$pais_donde_se_realizara_el_tramite',
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Enriquecer con nombres
    const catalogoMap = {};
    const catalogo = await CatalogoPaises.find({});
    catalogo.forEach(p => {
      catalogoMap[p.id_pais] = p.pais;
    });

    const result = paises.map(p => ({
      nombrepais: catalogoMap[p._id] || 'Desconocido',
      total: p.total
    }));

    res.json(result);
  } catch (error) {
    console.error('Error en clientes-por-pais:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
