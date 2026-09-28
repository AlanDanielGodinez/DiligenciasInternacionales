const { pool } = require('../src/config/db');

const TEMPLATE = {
  nombre: 'Perfil Pasaporte Guatemala',
  clave: 'perfil_pasaporte_guatemala',
  version: 1,
  activo: true,
  id_tipo_tramite: 14,
  id_pais: 2,
  estructura_json: {
    secciones: [
      {
        titulo: 'Acceso y cuenta',
        campos: [
          {
            name: 'correo_electronico',
            label: 'Correo electrónico',
            type: 'text',
            required: false,
          },
          {
            name: 'contrasena',
            label: 'Contraseña',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Información personal',
        campos: [
          {
            name: 'numero_identificacion_principal_cui',
            label: 'Número de Identificación Principal (CUI)',
            type: 'text',
            required: false,
          },
          {
            name: 'fecha_nacimiento',
            label: 'Fecha de nacimiento',
            type: 'date',
            required: false,
          },
          {
            name: 'idioma_hablado',
            label: 'Idioma hablado',
            type: 'text',
            required: false,
          },
          {
            name: 'estatura_cm',
            label: 'Estatura (cm)',
            type: 'number',
            required: false,
          },
          {
            name: 'tez',
            label: 'Tez',
            type: 'text',
            required: false,
          },
          {
            name: 'color_ojos',
            label: 'Color de ojos',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Información de domicilio',
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
        ],
      },
      {
        titulo: 'Información de empleo',
        campos: [
          {
            name: 'ocupacion_dpi',
            label: 'Ocupación en DPI',
            type: 'text',
            required: false,
          },
          {
            name: 'ocupacion_actual',
            label: 'Ocupación actual',
            type: 'textarea',
            required: false,
          },
          {
            name: 'ocupacion_registrada',
            label: 'Ocupación registrada',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        titulo: 'Información de cita y pago',
        campos: [
          {
            name: 'preferencia_cita_oficina',
            label: 'Preferencia de cita (oficina)',
            type: 'select',
            required: false,
            options: ['Ciudad de Guatemala', 'Quetzaltenango', 'Otro'],
          },
          {
            name: 'vigencia_pasaporte_solicitado',
            label: 'Vigencia de pasaporte solicitado',
            type: 'select',
            required: false,
            options: ['5 años', '10 años'],
          },
          {
            name: 'numero_boleta',
            label: 'Número de boleta',
            type: 'text',
            required: false,
          },
          {
            name: 'numero_correlativo',
            label: 'Número correlativo',
            type: 'text',
            required: false,
          },
          {
            name: 'fecha_pago_boleta',
            label: 'Fecha de pago de boleta',
            type: 'date',
            required: false,
          },
          {
            name: 'tipo_pasaporte',
            label: 'Tipo de pasaporte',
            type: 'select',
            required: false,
            options: [
              'Adulto primera vez',
              'Adulto renovación',
              'Menor primera vez',
              'Menor renovación',
            ],
          },
          {
            name: 'cita',
            label: 'Cita',
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
    documentos_requeridos: [
      {
        clave: 'dpi',
        nombre: 'DPI',
        obligatorio: true,
      },
      {
        clave: 'boleto_ornato',
        nombre: 'Boleto de ornato',
        obligatorio: false,
      },
      {
        clave: 'boleta_pago',
        nombre: 'Boleta de pago',
        obligatorio: false,
      },
      {
        clave: 'pasaporte_anterior',
        nombre: 'Pasaporte anterior',
        obligatorio: false,
      },
      {
        clave: 'documento_adicional',
        nombre: 'Documento adicional',
        obligatorio: false,
      },
    ],
  },
};

async function assertCatalogIds(client) {
  const tipoResult = await client.query(
    `SELECT id_tipo_tramite, nombre_tramite
     FROM public.tipos_tramite
     WHERE id_tipo_tramite = $1
     LIMIT 1`,
    [TEMPLATE.id_tipo_tramite]
  );

  if (!tipoResult.rows[0]) {
    throw new Error(`No existe id_tipo_tramite ${TEMPLATE.id_tipo_tramite}`);
  }

  const paisResult = await client.query(
    `SELECT id_pais, nombre_pais
     FROM public.catalogo_paises
     WHERE id_pais = $1
     LIMIT 1`,
    [TEMPLATE.id_pais]
  );

  if (!paisResult.rows[0]) {
    throw new Error(`No existe id_pais ${TEMPLATE.id_pais}`);
  }

  return {
    tipo_tramite: tipoResult.rows[0],
    pais: paisResult.rows[0],
  };
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const catalogos = await assertCatalogIds(client);

    const existing = await client.query(
      `SELECT id_plantilla, clave
       FROM public.perfil_plantillas
       WHERE clave = $1
       FOR UPDATE`,
      [TEMPLATE.clave]
    );

    let result;
    let action;

    if (existing.rows[0]) {
      result = await client.query(
        `UPDATE public.perfil_plantillas
         SET nombre = $1,
             version = $2,
             activo = $3,
             id_tipo_tramite = $4,
             id_pais = $5,
             estructura_json = $6::jsonb,
             actualizado_en = NOW()
         WHERE clave = $7
         RETURNING id_plantilla, nombre, clave, version, activo,
                   id_tipo_tramite, id_pais, estructura_json, actualizado_en`,
        [
          TEMPLATE.nombre,
          TEMPLATE.version,
          TEMPLATE.activo,
          TEMPLATE.id_tipo_tramite,
          TEMPLATE.id_pais,
          JSON.stringify(TEMPLATE.estructura_json),
          TEMPLATE.clave,
        ]
      );
      action = 'updated';
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
      tipo_tramite: catalogos.tipo_tramite.nombre_tramite,
      id_pais: plantilla.id_pais,
      pais: catalogos.pais.nombre_pais,
      secciones: plantilla.estructura_json.secciones.length,
      campos: plantilla.estructura_json.secciones.reduce(
        (total, section) => total + section.campos.length,
        0
      ),
      documentos_requeridos: plantilla.estructura_json.documentos_requeridos.length,
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
