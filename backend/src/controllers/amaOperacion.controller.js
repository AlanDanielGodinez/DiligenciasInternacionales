const s=require('../services/amaOperacion.service');const run=(fn,status=200)=>async(req,res,next)=>{try{res.status(status).json(await fn(req.params.idSolicitud,req.body||{}))}catch(e){next(e)}};
exports.detail=run(s.detail);exports.addDs=run(s.addDs,201);exports.addProtocol=run(s.addProtocol,201);exports.setResult=run(s.setResult);exports.receiveVisa=run(s.receiveVisa);
