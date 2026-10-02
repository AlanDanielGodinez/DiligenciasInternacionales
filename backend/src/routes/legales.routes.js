const r=require('express').Router(),c=require('../controllers/legales.controller');
const {requirePermissionForWrites}=require('../middlewares/auth');
r.use(requirePermissionForWrites('legales.editar'));
r.get('/',c.list);r.get('/solicitud/:idSolicitud',c.bySolicitud);r.patch('/:idProceso',c.update);
r.post('/:idProceso/actividades',c.activity);r.post('/:idProceso/notas',c.note);r.post('/:idProceso/resolver',c.resolve);
r.post('/:idProceso/regresar-origen',c.returnOrigin);r.post('/:idProceso/cerrar',c.close);r.post('/:idProceso/nueva-solicitud',c.createRequest);
module.exports=r;
