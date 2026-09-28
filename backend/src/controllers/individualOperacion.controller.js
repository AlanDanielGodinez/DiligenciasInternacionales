const service=require('../services/individualOperacion.service');
exports.list=async(req,res,next)=>{try{res.json({citas:await service.list(req.query)})}catch(e){next(e)}};
exports.create=async(req,res,next)=>{try{res.status(201).json({cita:await service.save(req.params.idSolicitud,null,req.body)})}catch(e){next(e)}};
exports.update=async(req,res,next)=>{try{res.json({cita:await service.save(req.params.idSolicitud,req.params.idCita,req.body)})}catch(e){next(e)}};
exports.listDs=async(req,res,next)=>{try{res.json({actividades:await service.listDs(req.params.idSolicitud)})}catch(e){next(e)}};
exports.createDs=async(req,res,next)=>{try{res.status(201).json({actividad:await service.createDs(req.params.idSolicitud,req.body)})}catch(e){next(e)}};
exports.setResult=async(req,res,next)=>{try{res.json(await service.setResult(req.params.idSolicitud,req.body))}catch(e){next(e)}};
