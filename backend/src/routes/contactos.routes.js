const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactos.controller');

router.post('/', controller.createContacto);
router.get('/', controller.listContactos);
router.post('/:idContacto/aplicantes', controller.createAplicanteForContacto);
router.get('/:id/aplicantes', controller.listAplicantesByContacto);
router.patch('/:idContacto', controller.updateContacto);
router.get('/:id', controller.getContactoById);

module.exports = router;
