const router=require('express').Router();const controller=require('../controllers/negados.controller');
router.get('/',controller.list);router.get('/:idSolicitud',controller.detail);router.patch('/:idSolicitud',controller.update);
router.post('/:idSolicitud/actividades',controller.activity);router.post('/:idSolicitud/notas',controller.note);
router.put('/:idSolicitud/preguntas-consulado',controller.questions);router.post('/:idSolicitud/legal',controller.legal);
router.post('/:idSolicitud/cerrar',controller.close);router.post('/:idSolicitud/reaplicacion',controller.reapplication);
module.exports=router;
