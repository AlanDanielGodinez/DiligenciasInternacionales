const { pool } = require('../src/config/db');

const condition = { field: 'viajo_eeuu', operator: 'eq', value: true };
const TEMPLATE = {
  schema_version: 2,
  sections: [
    {
      id: 'datos',
      label: 'Datos generales',
      fields: [
        { key: 'nombre_demo', label: 'Nombre DEMO', type: 'text', required: true, min_length: 2, max_length: 80 },
        { key: 'descripcion', label: 'Descripción', type: 'textarea', max_length: 500 },
        { key: 'edad', label: 'Edad', type: 'number', required: true, min: 18, max: 99 },
        { key: 'fecha', label: 'Fecha', type: 'date', required: true },
        { key: 'pais_demo', label: 'País', type: 'select', options: ['México', 'Guatemala', 'Estados Unidos'], required: true },
        { key: 'acepta', label: 'Acepta declaración', type: 'boolean', required: true },
        { key: 'modalidad', label: 'Modalidad', type: 'radio', options: ['Individual', 'Grupo'], required: true },
        { key: 'idiomas', label: 'Idiomas', type: 'multiselect', options: ['Español', 'Inglés', 'Francés'] },
        { key: 'correo', label: 'Correo', type: 'email', required: true },
        { key: 'telefono', label: 'Teléfono', type: 'phone', required: true },
      ],
    },
    {
      id: 'viajes',
      label: 'Viajes y condiciones',
      fields: [
        { key: 'viajo_eeuu', label: '¿Ha viajado a Estados Unidos?', type: 'boolean', required: true },
        { key: 'detalle_viaje', label: 'Detalle del viaje', type: 'textarea', show_if: condition, required_if: condition },
        { key: 'referencia_bloqueada', label: 'Referencia editable sólo con viaje', type: 'text', editable_if: condition },
      ],
    },
    {
      id: 'familia',
      label: 'Familiares en Estados Unidos',
      fields: [
        {
          key: 'familiares_eeuu', label: 'Familiares', type: 'repeater', min_items: 1, max_items: 10,
          item_label_fields: ['nombre', 'relacion'],
          fields: [
            { key: 'nombre', label: 'Nombre', type: 'text', required: true },
            { key: 'relacion', label: 'Relación', type: 'select', options: ['Padre', 'Madre', 'Hermano', 'Hijo', 'Otro'], required: true },
            { key: 'estatus', label: 'Estatus', type: 'radio', options: ['Ciudadano', 'Residente', 'Otro'], required: true },
            { key: 'telefono', label: 'Teléfono', type: 'phone' },
          ],
        },
      ],
    },
  ],
};

(async () => {
  const { rows } = await pool.query(
    `INSERT INTO public.perfil_plantillas
       (nombre, id_tipo_tramite, id_pais, clave, version, estructura_json, activo, creado_en, actualizado_en)
     VALUES ('DEMO_MOTOR_V2', NULL, NULL, 'DEMO_MOTOR_V2', 2, $1::jsonb, true, NOW(), NOW())
     ON CONFLICT (clave) DO UPDATE
       SET nombre = EXCLUDED.nombre,
           version = EXCLUDED.version,
           estructura_json = EXCLUDED.estructura_json,
           activo = true,
           actualizado_en = NOW()
     RETURNING id_plantilla, clave, version, activo`,
    [JSON.stringify(TEMPLATE)]
  );
  console.log(JSON.stringify(rows[0]));
  await pool.end();
})().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch {}
  process.exit(1);
});
