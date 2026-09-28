const {pool}=require('../config/db');
const {positiveInteger,trimString}=require('./solicitudes.service');
async function assertSolicitudAccess(id,user,query=pool.query.bind(pool)) {
  const idSolicitud=positiveInteger(id,'id_solicitud');
  const idEmpleado=positiveInteger(user?.id_empleado,'id_empleado');
  const {rows}=await query(`SELECT 1 FROM public.solicitudes s WHERE s.id_solicitud=$1
    AND (s.id_empleado_responsable=$2 OR ($3::int IS NOT NULL AND s.id_area_actual=$3)) LIMIT 1`,
    [idSolicitud,idEmpleado,user?.id_area || null]);
  if(!rows[0]) throw Object.assign(new Error('No tiene acceso a este expediente'),{status:403});
  return idSolicitud;
}
async function listNotas(id,user) {
  const idSolicitud=await assertSolicitudAccess(id,user);
  const {rows}=await pool.query(`SELECT n.*,n.creado_en::text AS creado_en,e.nombre AS autor_nombre_actual,e.apellidos AS autor_apellidos_actual,
    e.area AS area_actual FROM public.notas_solicitud n
    LEFT JOIN public.empleados e ON e.id_empleado=n.id_empleado
    WHERE n.id_solicitud=$1 ORDER BY n.creado_en DESC,n.id_nota DESC`,[idSolicitud]);
  return rows;
}
async function addNota(id,payload,user) {
  const idSolicitud=await assertSolicitudAccess(id,user);
  const contenido=trimString(payload.contenido);
  if(!contenido || contenido.length>10000) throw Object.assign(new Error('La nota debe contener entre 1 y 10000 caracteres'),{status:400});
  const {rows}=await pool.query(`INSERT INTO public.notas_solicitud
    (id_solicitud,id_empleado,contenido,contexto,autor_nombre_historico,area_historica)
    SELECT s.id_solicitud,e.id_empleado,$3,'REVISOR',concat_ws(' ',e.nombre,e.apellidos),e.area
    FROM public.solicitudes s CROSS JOIN public.empleados e
    WHERE s.id_solicitud=$1 AND e.id_empleado=$2 AND COALESCE(e.activo,true)=true RETURNING *,creado_en::text AS creado_en`,
    [idSolicitud,positiveInteger(user.id_empleado,'id_empleado'),contenido]);
  if(!rows[0]) throw Object.assign(new Error('Expediente o autor no encontrado'),{status:404});
  return rows[0];
}
module.exports={listNotas,addNota,assertSolicitudAccess};
