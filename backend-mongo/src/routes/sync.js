const express = require('express');
const router = express.Router();
const { syncSheet, syncAll, previewSync } = require('../services/syncSheets');
const { authenticateToken } = require('../middleware/auth');

const verifyWebhookKey = (req, res, next) => {
  const webhookKey = req.headers['x-webhook-key'] || req.query.key;
  
  if (webhookKey !== process.env.WEBHOOK_SECRET_KEY) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  
  next();
};

router.post('/all', verifyWebhookKey, async (req, res) => {
  try {
    console.log('Webhook recibido: Sincronizar TODOS los sheets');
    
    syncAll()
      .then(results => {
        console.log('Sincronización completada:', results);
      })
      .catch(err => {
        console.error('Error en sincronización:', err.message);
      });
    
    res.json({ 
      message: 'Sincronización iniciada',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/sheet/:sheetKey', verifyWebhookKey, async (req, res) => {
  try {
    const { sheetKey } = req.params;
    console.log(`Webhook recibido: Sincronizar ${sheetKey}`);
    
    syncSheet(sheetKey)
      .then(results => {
        console.log(`${sheetKey} sincronizado:`, results);
      })
      .catch(err => {
        console.error(`Error en ${sheetKey}:`, err.message);
      });
    
    res.json({ 
      message: `Sincronización de ${sheetKey} iniciada`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/preview/:sheetKey', async (req, res) => {
  try {
    const { sheetKey } = req.params;
    
    const preview = await previewSync(sheetKey);
    
    res.json({
      message: 'Preview de sincronización',
      data: preview
    });
  } catch (error) {
    console.error('Error en preview:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Sistema de sincronización activo',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
