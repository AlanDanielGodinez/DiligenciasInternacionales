const express = require('express');
const controller = require('../controllers/quickbooks.controller');
const { requireQuickBooksAccess, requireQuickBooksAdmin } = require('../middlewares/quickbooksAuth');

const router = express.Router();

router.get('/callback', controller.callback);
router.use(requireQuickBooksAccess);
router.get('/estado', controller.getStatus);
router.get('/conectar', requireQuickBooksAdmin, controller.connect);
router.post('/desconectar', requireQuickBooksAdmin, controller.disconnect);
router.post('/clientes/:idCliente/sincronizar', controller.syncClient);
router.get('/clientes/:idCliente/estado', controller.getClientStatus);
router.get('/clientes', controller.listClients);

module.exports = router;
