const { pool } = require('../src/config/db');

const TEMPLATE = {
  nombre: 'Perfil Pasaporte México',
  clave: 'perfil_pasaporte_mexico',
  version: 1,
  activo: true,
  id_tipo_tramite: 15,
  id_pais: 1,
  estructura_json: {
    secciones: [
      {
        titulo: 'Información personal',
        campos: [
          {
            name: 'numero_identificacion_principal',
            label: 'Número de Identificación Principal (INE)',
            type: 'text',
            required: false,
          },
          {
            name: 'estado_civil',
            label: 'Estado civil',
            type: 'text',
            required: false,
          },
          {
            name: 'lugar_nacimiento',
            label: 'Lugar de nacimiento',
            type: 'text',
            required: false,
          },
          {
            name: 'vigencia_pasaporte_solicitado',
            label: 'Vigencia de pasaporte solicitado',
            type: 'select',
            required: false,
            options: ['1 año', '3 años', '6 años', '10 años'],
          },
          {
            name: 'edad',
            label: 'Edad',
            type: 'number',
            required: false,
          },
        ],
      },
      {
        titulo: 'Acta de nacimiento',
        campos: [
          {
            name: 'folio_acta_nacimiento',
            label: 'Folio de acta de nacimiento',
            type: 'text',
            required: false,
          },
          {
            name: 'fecha_registro_nacimiento',
            label: 'Fecha de registro de nacimiento',
            type: 'date',
            required: false,
          },
          {
            name: 'libro_registro_nacimiento',
            label: 'Libro de registro de nacimiento',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Información INE',
        campos: [
          {
            name: 'numero_ine',
            label: 'Número INE',
            type: 'text',
            required: false,
          },
          {
            name: 'anio_ine',
            label: 'Año INE',
            type: 'text',
            required: false,
          },
          {
            name: 'clave_ine',
            label: 'Clave INE',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Pasaporte anterior',
        campos: [
          {
            name: 'numero_pasaporte_anterior',
            label: 'Número de pasaporte anterior',
            type: 'text',
            required: false,
          },
          {
            name: 'fecha_emision_pasaporte_anterior',
            label: 'Fecha de emisión de pasaporte anterior',
            type: 'date',
            required: false,
          },
          {
            name: 'fecha_caducidad_pasaporte_anterior',
            label: 'Fecha de caducidad de pasaporte anterior',
            type: 'date',
            required: false,
          },
        ],
      },
      {
        titulo: 'Domicilio',
        campos: [
          {
            name: 'calle_numero',
            label: 'Calle y número',
            type: 'text',
            required: false,
          },
          {
            name: 'colonia',
            label: 'Colonia',
            type: 'text',
            required: false,
          },
          {
            name: 'codigo_postal',
            label: 'Código postal',
            type: 'text',
            required: false,
          },
          {
            name: 'municipio',
            label: 'Municipio',
            type: 'text',
            required: false,
          },
          {
            name: 'estado_departamento',
            label: 'Estado / Departamento',
            type: 'text',
            required: false,
          },
          {
            name: 'pais',
            label: 'País',
            type: 'text',
            required: false,
          },
          {
            name: 'numero_telefono',
            label: 'Número de teléfono',
            type: 'text',
            required: false,
          },
          {
            name: 'telefono_adicional_emergencia',
            label: 'Teléfono adicional / emergencia',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Contacto USA o MX',
        campos: [
          {
            name: 'nombre_contacto',
            label: 'Nombre del contacto',
            type: 'text',
            required: false,
          },
          {
            name: 'telefono_contacto',
            label: 'Teléfono del contacto',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Observaciones',
        campos: [
          {
            name: 'observaciones',
            label: 'Observaciones del perfil',
            type: 'textarea',
            required: false,
          },
        ],
      },
    ],
  },
};

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id_plantilla, clave
       FROM public.perfil_plantillas
       WHERE clave IN ($1, $2)
       ORDER BY CASE WHEN clave = $1 THEN 0 ELSE 1 END, id_plantilla
       FOR UPDATE`,
      [TEMPLATE.clave, 'perfil_demo_pasaporte_mexico']
    );

    const target = existing.rows[0];
    let result;
    let action;

    if (target) {
      result = await client.query(
        `UPDATE public.perfil_plantillas
         SET nombre = $1,
             clave = $2,
             version = $3,
             activo = $4,
             id_tipo_tramite = $5,
             id_pais = $6,
             estructura_json = $7::jsonb,
             actualizado_en = NOW()
         WHERE id_plantilla = $8
         RETURNING id_plantilla, nombre, clave, version, activo,
                   id_tipo_tramite, id_pais, estructura_json, actualizado_en`,
        [
          TEMPLATE.nombre,
          TEMPLATE.clave,
          TEMPLATE.version,
          TEMPLATE.activo,
          TEMPLATE.id_tipo_tramite,
          TEMPLATE.id_pais,
          JSON.stringify(TEMPLATE.estructura_json),
          target.id_plantilla,
        ]
      );
      action = `updated:${target.clave}`;
    } else {
      result = await client.query(
        `INSERT INTO public.perfil_plantillas (
           nombre,
           clave,
           version,
           activo,
           id_tipo_tramite,
           id_pais,
           estructura_json,
           creado_en,
           actualizado_en
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW())
         RETURNING id_plantilla, nombre, clave, version, activo,
                   id_tipo_tramite, id_pais, estructura_json, actualizado_en`,
        [
          TEMPLATE.nombre,
          TEMPLATE.clave,
          TEMPLATE.version,
          TEMPLATE.activo,
          TEMPLATE.id_tipo_tramite,
          TEMPLATE.id_pais,
          JSON.stringify(TEMPLATE.estructura_json),
        ]
      );
      action = 'inserted';
    }

    await client.query('COMMIT');

    const plantilla = result.rows[0];
    console.log(JSON.stringify({
      ok: true,
      action,
      id_plantilla: plantilla.id_plantilla,
      nombre: plantilla.nombre,
      clave: plantilla.clave,
      version: plantilla.version,
      activo: plantilla.activo,
      id_tipo_tramite: plantilla.id_tipo_tramite,
      id_pais: plantilla.id_pais,
      secciones: plantilla.estructura_json.secciones.length,
      campos: plantilla.estructura_json.secciones.reduce(
        (total, section) => total + section.campos.length,
        0
      ),
      actualizado_en: plantilla.actualizado_en,
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
