const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {Pool,Client}=require('pg');
// Dedicated local cluster only. No .env and no production connection.
const config={host:'127.0.0.1',port:55439,user:'ama_test',database:`ama_test_${Date.now()}`};
const pool=new Pool(config);
require.cache[require.resolve('../src/config/db')]={exports:{pool}};
const {ACTIVITY_SQL,assertElegible}=require('../src/services/amaActividad.service');
const notes=require('../src/services/solicitudNotas.service');
const groups=require('../src/services/gruposAma.service');
const clockSql=ACTIVITY_SQL.replaceAll('CURRENT_TIMESTAMP',"TIMESTAMPTZ '2026-09-10 12:00:00-06'");
const activity=async id=>(await pool.query(clockSql,[[id],'America/Chihuahua'])).rows[0];
before(async()=>{
  const admin=new Client({...config,database:'postgres'});await admin.connect();
  await admin.query(`CREATE DATABASE ${config.database}`);await admin.end();
  await pool.query(fs.readFileSync(path.join(__dirname,'fixtures/ama-schema.sql'),'utf8'));
  await pool.query(fs.readFileSync(path.join(__dirname,'../sql/2026_09_10_ama_actividad_notas.sql'),'utf8'));
  await pool.query(`INSERT INTO empleados VALUES(1,'Ana','Revisora','AMA',true),(2,'Luis','Asesor','AMA',true);
    INSERT INTO solicitudes(id_solicitud,id_cliente,id_area_actual,fecha_asignacion_asesor)
    SELECT n,n,4,'2025-01-01 00:00:00-06' FROM generate_series(1,30) n;
    INSERT INTO grupos_ama(id_grupo_ama,nombre_grupo,cupo_estimado) VALUES(1,'Uno',1),(2,'Dos',10);`);
});
after(()=>pool.end());
test('exactamente seis meses bloquea y un segundo antes permite',async()=>{
  await pool.query("UPDATE solicitudes SET fecha_asignacion_asesor='2026-03-10 12:00:00-06' WHERE id_solicitud=1");
  assert.equal((await activity(1)).elegible_por_actividad,false);
  await pool.query("UPDATE solicitudes SET fecha_asignacion_asesor='2026-03-10 12:00:01-06' WHERE id_solicitud=1");
  assert.equal((await activity(1)).elegible_por_actividad,true);
});
test('meses calendario, fin de mes y año bisiesto',async()=>{
  for(const [base,limit] of [['2023-08-31','2024-02-29'],['2024-08-31','2025-02-28'],['2024-02-29','2024-08-29']]){
    await pool.query('UPDATE solicitudes SET fecha_asignacion_asesor=$1::timestamp AT TIME ZONE $2 WHERE id_solicitud=2',[base,'America/Chihuahua']);
    assert.equal((await activity(2)).fecha_limite.slice(0,10),limit);
  }
});
test('sin base bloquea incluso con actividad; historial asesor usa primera asignación',async()=>{
  await pool.query(`UPDATE solicitudes SET fecha_asignacion_asesor=NULL WHERE id_solicitud=3;
    INSERT INTO actividades_solicitud(id_solicitud,tipo,fecha_actividad) VALUES(3,'LLAMADA','2026-09-09');`);
  assert.equal((await activity(3)).motivo_bloqueo,'SIN_FECHA_BASE');
  await pool.query(`INSERT INTO seguimientos(id_solicitud,origen,id_empleado_responsable,fecha_seguimiento)
    VALUES(3,'asesor_asignado',1,'2025-01-01'),(3,'asesor_asignado',2,'2026-09-09');`);
  assert.equal((await activity(3)).fecha_base.slice(0,10),'2025-01-01');
  assert.equal((await activity(3)).elegible_por_actividad,true);
});
test('notas son append-only y conservan autor/área sin renovar actividad',async()=>{
  await pool.query('UPDATE solicitudes SET id_empleado_responsable=1 WHERE id_solicitud=4');
  const before=await activity(4);
  await notes.addNota(4,{contenido:'Primera',id_empleado:2},{id_empleado:1});
  await pool.query("UPDATE empleados SET area='Legal' WHERE id_empleado=1");
  await notes.addNota(4,{contenido:'Corrección'},{id_empleado:1});
  const rows=await notes.listNotas(4,{id_empleado:1});assert.equal(rows.length,2);
  assert.equal(rows[1].area_historica,'AMA');assert.equal(rows[1].id_empleado,1);
  assert.equal((await activity(4)).ultima_actividad_valida,before.ultima_actividad_valida);
});
test('consultas, timestamps, área, responsable, Drive y sincronización no renuevan',async()=>{
  await pool.query(`UPDATE solicitudes SET actualizado_en=NOW(),fecha_ultimo_movimiento=NOW(),id_area_actual=4,id_empleado_responsable=2 WHERE id_solicitud=5;
    INSERT INTO seguimientos(id_solicitud,origen,fecha_seguimiento,estado_anterior,estado_nuevo)
    VALUES(5,'responsable_actualizado','2026-09-09',1,1),(5,'mover_area','2026-09-09',1,1),(5,'quickbooks_sync','2026-09-09',1,2);
    INSERT INTO documentos(id_solicitud,origen_documento,fecha_subida) VALUES(5,'drive_legacy','2026-09-09');`);
  assert.equal((await activity(5)).elegible_por_actividad,false);
});
test('perfil cambia actividad sólo al cambiar respuestas, repetibles o estado',async()=>{
  await pool.query(`INSERT INTO perfiles_solicitud VALUES(1,6);
    INSERT INTO perfiles_solicitud_versiones(id_perfil,version,respuestas_json,repetibles_snapshot_json,estado_snapshot,creado_en)
    VALUES(1,1,'{"a":1}','{}','borrador','2025-01-01'),(1,2,'{"a":1}','{}','borrador','2026-09-01');`);
  assert.equal((await activity(6)).elegible_por_actividad,false);
  await pool.query(`INSERT INTO perfiles_solicitud_versiones(id_perfil,version,respuestas_json,repetibles_snapshot_json,estado_snapshot,creado_en)
    VALUES(1,3,'{"a":2}','{}','borrador','2026-09-02');`);
  assert.equal((await activity(6)).tipo_ultima_actividad,'Actualización de perfil');
});
test('documento real, contacto y seguimiento renuevan; estado idéntico no',async()=>{
  await pool.query(`INSERT INTO documentos(id_solicitud,origen_documento,fecha_subida) VALUES(7,'documento_requerido','2026-09-01');
    INSERT INTO actividades_solicitud(id_solicitud,tipo,fecha_actividad) VALUES(8,'WHATSAPP','2026-09-01');
    INSERT INTO seguimientos(id_solicitud,origen,fecha_seguimiento,estado_anterior,estado_nuevo)
    VALUES(9,'cambio_estado','2026-09-01',1,1),(10,'cambio_estado','2026-09-01',1,2),(11,'seguimiento_operativo','2026-09-01',1,1);`);
  for(const id of [7,8,10,11])assert.equal((await activity(id)).elegible_por_actividad,true);
  assert.equal((await activity(9)).elegible_por_actividad,false);
});
test('pagos: último registrado determina estado, validación real determina actividad',async()=>{
  await pool.query(`INSERT INTO pagos(id_solicitud,estado_pago,creado_en,fecha_validacion)
    VALUES(12,'validado','2025-01-02','2026-09-03'),(12,'rechazado','2025-01-03','2026-09-09');`);
  const state=await activity(12);assert.equal(state.ultimo_pago_estado,'rechazado');
  assert.equal(state.ultima_actividad_valida.slice(0,10),'2026-09-03');
  assert.equal(state.tipo_ultima_actividad,'Validación de pago');
});
test('historial conserva validación previa aunque el pago sea rechazado después',async()=>{
  await pool.query(`INSERT INTO pagos(id_solicitud,estado_pago,creado_en,fecha_validacion)
    VALUES(23,'rechazado','2025-01-02','2026-09-09');
    INSERT INTO seguimientos(id_solicitud,origen,fecha_seguimiento) VALUES(23,'pago_inicial_validado','2026-09-03');`);
  assert.equal((await activity(23)).ultima_actividad_valida.slice(0,10),'2025-01-01');
});
test('fecha futura no extiende el plazo',async()=>{
  await pool.query("UPDATE solicitudes SET fecha_asignacion_asesor='2030-01-01' WHERE id_solicitud=13");
  assert.equal((await activity(13)).motivo_bloqueo,'FECHA_BASE_FUTURA');
});
test('timestamps de importación de pagos no rejuvenecen historial',async()=>{
  await pool.query(`INSERT INTO pagos(id_solicitud,estado_pago,source_id,fecha_pago,creado_en)
    VALUES(20,'registrado','legacy:20','2025-01-02','2026-09-09');`);
  assert.equal((await activity(20)).ultima_actividad_valida.slice(0,10),'2025-01-02');
  assert.equal((await activity(20)).elegible_por_actividad,false);
});
test('zona por defecto coincide con sesión de los escritores de timestamps',async()=>{
  const state=(await pool.query(clockSql,[[1],null])).rows[0];
  const zone=(await pool.query("SELECT current_setting('TimeZone') zone")).rows[0].zone;
  assert.equal(state.zona_horaria,zone);
});
test('primera asignación nueva captura fecha y reasignación la conserva',async()=>{
  await pool.query('INSERT INTO solicitudes(id_solicitud,id_cliente,id_area_actual,id_empleado_responsable) VALUES(31,31,4,NULL)');
  await pool.query('UPDATE solicitudes SET id_empleado_responsable=1 WHERE id_solicitud=31');
  const first=(await pool.query('SELECT fecha_asignacion_asesor FROM solicitudes WHERE id_solicitud=31')).rows[0];
  assert.ok(first.fecha_asignacion_asesor);
  await pool.query('UPDATE solicitudes SET id_empleado_responsable=2 WHERE id_solicitud=31');
  assert.deepEqual((await pool.query('SELECT fecha_asignacion_asesor FROM solicitudes WHERE id_solicitud=31')).rows[0],first);
});
test('plantillas V2 se publican sin tocar versiones anteriores y son idempotentes',async()=>{
  await pool.query(`INSERT INTO tipos_tramite SELECT n,'AMA' FROM generate_series(1,6) n;
    INSERT INTO perfil_plantillas(clave,version,estructura_json) VALUES('perfil_ama_mexico',1,'{"legacy":true}');`);
  const sql=fs.readFileSync(path.join(__dirname,'../sql/2026_09_10_perfil_ama_v2.sql'),'utf8');
  await pool.query(sql);await pool.query(sql);
  assert.equal((await pool.query('SELECT COUNT(*)::int n FROM perfil_plantillas')).rows[0].n,7);
  assert.deepEqual((await pool.query("SELECT estructura_json FROM perfil_plantillas WHERE clave='perfil_ama_mexico'")).rows[0].estructura_json,{legacy:true});
});
test('backend rechaza llamadas directas y revierte lote completo',async()=>{
  await assert.rejects(()=>assertElegible(14,pool.query.bind(pool)),{status:409});
  await pool.query('UPDATE solicitudes SET fecha_asignacion_asesor=NOW() WHERE id_solicitud=15');
  await assert.rejects(()=>groups.addSolicitudesToGrupo(2,{id_solicitudes:[15,16]}),{status:409});
  assert.equal((await pool.query('SELECT COUNT(*)::int n FROM grupo_ama_solicitudes')).rows[0].n,0);
});
test('altas concurrentes respetan cupo y pertenencia',async()=>{
  await pool.query('UPDATE solicitudes SET fecha_asignacion_asesor=NOW() WHERE id_solicitud IN (17,18,19)');
  let results=await Promise.allSettled([groups.addSolicitudesToGrupo(1,{id_solicitud:17}),groups.addSolicitudesToGrupo(1,{id_solicitud:18})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  await pool.query("INSERT INTO grupos_ama(id_grupo_ama,nombre_grupo,cupo_estimado) VALUES(3,'Tres',10)");
  results=await Promise.allSettled([groups.addSolicitudesToGrupo(2,{id_solicitud:19}),groups.addSolicitudesToGrupo(3,{id_solicitud:19})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
});
test('alta duplicada en el mismo grupo es rechazada por el backend',async()=>{
  await pool.query("INSERT INTO grupos_ama(id_grupo_ama,nombre_grupo,cupo_estimado) VALUES(5,'Cinco',10)");
  await pool.query('UPDATE solicitudes SET fecha_asignacion_asesor=NOW() WHERE id_solicitud=26');
  await groups.addSolicitudesToGrupo(5,{id_solicitud:26});
  await assert.rejects(
    ()=>groups.addSolicitudesToGrupo(5,{id_solicitud:26}),
    {status:400,message:'Solicitud 26 already belongs to this AMA group'}
  );
  assert.equal((await pool.query('SELECT COUNT(*)::int n FROM grupo_ama_solicitudes WHERE id_grupo_ama=5 AND id_solicitud=26 AND activo=true')).rows[0].n,1);
});
test('reducir cupo y agregar concurrentemente no excede capacidad',async()=>{
  await pool.query("INSERT INTO grupos_ama(id_grupo_ama,nombre_grupo,cupo_estimado) VALUES(4,'Cuatro',1)");
  await pool.query('UPDATE solicitudes SET fecha_asignacion_asesor=NOW() WHERE id_solicitud=22');
  const results=await Promise.allSettled([
    groups.addSolicitudesToGrupo(4,{id_solicitud:22}),groups.updateGrupo(4,{cupo_estimado:0})
  ]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  const group=await groups.getGrupoById(4);
  assert.ok(group.cantidad_solicitudes<=group.cupo_estimado);
});
test('reasignar un historico sin evidencia conserva SIN_FECHA_BASE',async()=>{
  await pool.query('UPDATE solicitudes SET fecha_asignacion_asesor=NULL,id_empleado_responsable=NULL WHERE id_solicitud=24');
  await pool.query('UPDATE solicitudes SET id_empleado_responsable=1 WHERE id_solicitud=24');
  assert.equal((await activity(24)).motivo_bloqueo,'SIN_FECHA_BASE');
});
test('notas requieren acceso local al expediente',async()=>{
  await pool.query('UPDATE solicitudes SET id_empleado_responsable=1 WHERE id_solicitud=25');
  await assert.rejects(()=>notes.listNotas(25,{id_empleado:2}),{status:403});
  await assert.rejects(()=>notes.addNota(25,{contenido:'No autorizada'},{id_empleado:2}),{status:403});
  await notes.addNota(25,{contenido:'Autorizada'},{id_empleado:1});
  assert.equal((await notes.listNotas(25,{id_empleado:1})).length,1);
});
