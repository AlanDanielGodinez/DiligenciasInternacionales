const { pool } = require('../src/config/db');
const structure = require('../src/templates/perfilVisaIndividualV2.template');

const TEMPLATE = {
  nombre: 'Perfil Visa Individual V2',
  clave: 'perfil_visa_individual_v2',
  version: 2,
  activo: true,
  id_tipo_tramite: 20,
  id_pais: null,
};

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const type = await client.query(
      'SELECT id_tipo_tramite, nombre_tramite FROM tipos_tramite WHERE id_tipo_tramite=$1 AND activo=true',
      [TEMPLATE.id_tipo_tramite]
    );
    if (!type.rows[0]) throw new Error('No existe el tipo de trámite activo Visa individual (20).');

    const { rows } = await client.query(
      `INSERT INTO perfil_plantillas
         (nombre, clave, version, activo, id_tipo_tramite, id_pais, estructura_json, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,NOW(),NOW())
       ON CONFLICT (clave) DO UPDATE SET
         nombre=EXCLUDED.nombre, version=EXCLUDED.version, activo=EXCLUDED.activo,
         id_tipo_tramite=EXCLUDED.id_tipo_tramite, id_pais=EXCLUDED.id_pais,
         estructura_json=EXCLUDED.estructura_json, actualizado_en=NOW()
       RETURNING id_plantilla,nombre,clave,version,activo,id_tipo_tramite,id_pais,actualizado_en`,
      [TEMPLATE.nombre, TEMPLATE.clave, TEMPLATE.version, TEMPLATE.activo,
        TEMPLATE.id_tipo_tramite, TEMPLATE.id_pais, JSON.stringify(structure)]
    );
    await client.query('COMMIT');
    const topFields = structure.sections.flatMap((section) => section.fields || []);
    const nestedFields = topFields.flatMap((field) => field.type === 'repeater' ? field.fields || [] : []);
    console.log(JSON.stringify({
      ...rows[0],
      tipo_tramite: type.rows[0].nombre_tramite,
      schema_version: structure.schema_version,
      sections: structure.sections.length,
      top_fields: topFields.length,
      repeater_children: nestedFields.length,
      total_definitions: topFields.length + nestedFields.length,
      repeaters: topFields.filter((field) => field.type === 'repeater').map((field) => field.key),
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
})().catch((error) => { console.error(error); process.exit(1); });
