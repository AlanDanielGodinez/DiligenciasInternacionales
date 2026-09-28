// Read-only metadata and aggregate audit. Never prints applicant data.
require('dotenv').config();
const { Client } = require('pg');
const client = new Client({host:process.env.DB_HOST, port:process.env.DB_PORT,
  database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,
  ssl:process.env.DB_SSL === 'true' ? {rejectUnauthorized:false} : false,connectionTimeoutMillis:5000});
(async () => {
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const schema=(await client.query(`SELECT table_name,column_name,data_type
      FROM information_schema.columns WHERE table_schema='public' AND table_name IN
      ('solicitudes','seguimientos','documentos','pagos','perfiles_solicitud_versiones','notas_solicitud')
      ORDER BY table_name,ordinal_position`)).rows;
    console.log(JSON.stringify({schema},null,2));
    const columns=new Set(schema.map(r=>`${r.table_name}.${r.column_name}`));
    const required=['solicitudes.fecha_asignacion_asesor','pagos.fecha_validacion','pagos.estado_pago'];
    if(required.every(column=>columns.has(column))){
      const {ACTIVITY_SQL}=require('../src/services/amaActividad.service');
      const ids=(await client.query(`SELECT id_solicitud FROM solicitudes WHERE id_area_actual=4 ORDER BY id_solicitud`)).rows.map(r=>r.id_solicitud);
      const states=ids.length?(await client.query(ACTIVITY_SQL,[ids,null])).rows:[];
      const buckets={cero_a_un_mes:0,uno_a_tres_meses:0,tres_a_seis_meses:0,seis_o_mas:0};
      states.forEach(s=>{const d=Number(s.dias_sin_movimiento || 0);if(d<31)buckets.cero_a_un_mes++;else if(d<92)buckets.uno_a_tres_meses++;else if(d<184)buckets.tres_a_seis_meses++;else buckets.seis_o_mas++;});
      const anomalous=(await client.query(`SELECT p.id_pago,p.id_solicitud FROM pagos p
        WHERE LOWER(COALESCE(p.estado_pago,''))='validado' AND p.fecha_validacion IS NULL
        ORDER BY p.id_pago LIMIT 100`)).rows;
      const falseEvents=(await client.query(`SELECT sg.id_seguimiento,sg.id_solicitud FROM seguimientos sg
        WHERE sg.origen='pago_inicial_validado' AND NOT EXISTS (SELECT 1 FROM pagos p
          WHERE p.id_solicitud=sg.id_solicitud AND LOWER(COALESCE(p.estado_pago,''))='validado'
            AND p.fecha_validacion IS NOT NULL) ORDER BY sg.id_seguimiento LIMIT 100`)).rows;
      const groups=(await client.query(`SELECT gas.id_grupo_ama_solicitud,gas.id_solicitud FROM grupo_ama_solicitudes gas
        WHERE COALESCE(gas.activo,true) AND gas.id_solicitud=ANY($1::int[]) ORDER BY gas.id_solicitud LIMIT 100`,[ids])).rows;
      console.log(JSON.stringify({timezone:(await client.query("SELECT current_setting('TimeZone') zona")).rows[0].zona,
        total_solicitudes_ama:states.length,con_fecha_base:states.filter(s=>s.fecha_base).length,
        sin_fecha_base:states.filter(s=>s.motivo_bloqueo==='SIN_FECHA_BASE').map(s=>s.id_solicitud),
        fecha_base_futura:states.filter(s=>s.motivo_bloqueo==='FECHA_BASE_FUTURA').map(s=>s.id_solicitud),
        antiguedad:buckets,inconsistencias:states.filter(s=>s.fecha_base&&s.ultima_actividad_valida&&s.ultima_actividad_valida<s.fecha_base).map(s=>s.id_solicitud),
        expedientes_en_grupos:groups,pagos_validados_anomalos:anomalous,eventos_pago_sin_pago_real:falseEvents,
        perfiles_snapshot_relevantes:(await client.query(`SELECT COUNT(*)::int total FROM perfiles_solicitud_versiones v
          JOIN perfiles_solicitud p ON p.id_perfil=v.id_perfil WHERE p.id_solicitud=ANY($1::int[])`,[ids])).rows[0].total},null,2));
    } else console.log(JSON.stringify({audit_skipped:'Faltan columnas AMA requeridas',missing:required.filter(column=>!columns.has(column))}));
    await client.query('ROLLBACK');
  } catch (error) { console.error('Auditoría no completada:',error.code || error.message); process.exitCode=1; }
  finally { await client.end(); }
})();
