const { pool } = require('../src/config/db');

const yesNo = ['Sí', 'No'];

const field = (name, label, type = 'text', options) => {
  const result = { name, label, type, required: false };
  if (options) result.options = options;
  return result;
};

const TEMPLATE = {
  nombre: 'Perfil Visa Individual',
  clave: 'perfil_visa_individual',
  version: 1,
  activo: true,
  id_tipo_tramite: 20,
  id_pais: null,
  estructura_json: {
    secciones: [
      {
        titulo: 'Información general',
        campos: [
          field(
            'ha_usado_otros_nombres',
            '¿Ha usado otros nombres o lo ha modificado en algún documento de identificación oficial?',
            'select',
            yesNo
          ),
          field('otros_nombres_cual', '¿Cuál?'),
          field('estado_civil', 'Estado civil', 'select', [
            'Soltero',
            'Casado',
            'Unión libre',
            'Divorciado',
            'Viudo',
            'Separado',
          ]),
        ],
      },
      {
        titulo: 'Información de nacimiento',
        campos: [
          field('tiene_otra_nacionalidad', '¿Tiene o ha tenido alguna otra nacionalidad?', 'select', yesNo),
          field('otra_nacionalidad_cual', '¿Cuál?'),
          field(
            'tiene_discapacidad_o_enfermedad',
            '¿Tiene alguna discapacidad o enfermedad que le impida hablar por él/ella misma o viajar?',
            'select',
            yesNo
          ),
          field('discapacidad_cual', '¿Cuál es su discapacidad o enfermedad?', 'textarea'),
        ],
      },
      {
        titulo: 'Datos del viaje',
        campos: [
          field('fecha_tentativa_llegada', 'Fecha tentativa de llegada'),
          field('duracion_viaje', 'Duración del viaje'),
          field('motivo_viaje', 'Motivo del viaje', 'textarea'),
          field('domicilio_llegada_eeuu', 'Domicilio de llegada en EE.UU.', 'textarea'),
          field('parentesco_en_eeuu', 'Parentesco'),
          field('acompanantes_viaje', '¿Con quiénes viaja a EE.UU. y cuál es su parentesco?', 'textarea'),
          field('usted_pagare_viaje', '¿Usted pagará por su viaje?', 'select', yesNo),
          field('quien_pagaria_viaje', '¿Quién pagaría su viaje?'),
        ],
      },
      {
        titulo: 'Persona que pagará el viaje',
        campos: [
          field('pagador_nombre', 'Nombre de quien pagará el viaje'),
          field('pagador_numero_telefono', 'Número de teléfono'),
          field('pagador_correo', 'Correo electrónico'),
          field('pagador_parentesco', 'Parentesco'),
          field('pagador_domicilio', 'Domicilio', 'textarea'),
        ],
      },
      {
        titulo: 'Información de viajes anteriores a EE.UU.',
        campos: [
          field('ha_estado_en_eeuu', '¿Alguna vez ha estado en los EE.UU.?', 'select', yesNo),
          field(
            'viajes_anteriores_eeuu',
            'Detalle de viajes anteriores a EE.UU. (fecha de ingreso, cantidad, tiempo, legal/ilegal)',
            'textarea'
          ),
          field(
            'ingreso_ilegal_o_documentos_falsos',
            '¿Ingresó o intentó ingresar de manera ilegal o con documentos falsos a EE.UU.?',
            'select',
            yesNo
          ),
          field(
            'deportado_voluntaria_involuntariamente',
            '¿Alguna vez fue deportado de manera voluntaria o involuntaria?',
            'select',
            yesNo
          ),
          field('pago_costos_deportacion', 'En caso de deportación voluntaria, ¿pagó los costos de su deportación?'),
          field(
            'peticion_inmigracion',
            '¿Alguna vez alguien metió una petición de inmigración por su parte con USCIS?',
            'select',
            yesNo
          ),
          field(
            'detalle_peticion_inmigracion',
            'Si su respuesta es afirmativa, ¿quién y para cuál tipo de petición?',
            'textarea'
          ),
          field('peticion_rechazada_motivo', 'Y si fue rechazado, ¿por qué?', 'textarea'),
          field(
            'acto_ilicito_felonia',
            '¿En el pasado cometió un acto ilícito o felonía en EE.UU. o en su país de origen?',
            'select',
            yesNo
          ),
          field('delito_cual', '¿Cuál fue el delito?', 'textarea'),
          field('hubo_sentencia', '¿Hubo sentencia?'),
          field('sentencia_tiempo', '¿Cuánto tiempo?'),
          field('sentencia_donde', '¿Dónde?'),
          field('sentencia_cuando', '¿Cuándo?'),
          field('explicacion_viajes_anteriores', 'Explicación', 'textarea'),
        ],
      },
      {
        titulo: 'Visa anterior',
        campos: [
          field('le_otorgaron_visa', '¿Una vez le han otorgado una visa para viajar a los EUA?', 'select', yesNo),
          field('fecha_emision_visa', 'Fecha de cuando la visa fue emitida', 'date'),
          field('fecha_vencimiento_visa', 'Fecha de vencimiento de la visa', 'date'),
          field('tipo_visa', 'Tipo de visa'),
          field('numero_visa', 'Número de visa'),
          field('consulado_visa', '¿En qué consulado fue?'),
          field('solicita_mismo_tipo_visa', '¿Está solicitando el mismo tipo de visa?', 'select', yesNo),
          field(
            'aplica_mismo_pais_residencia',
            '¿Está aplicando en el mismo país donde la visa le fue emitida y es su país de residencia principal?',
            'select',
            yesNo
          ),
          field('le_sacaron_huellas', '¿Le han sacado huellas al momento de tramitar la visa?', 'select', yesNo),
          field('visa_perdida_robada', '¿Alguna vez perdió su visa o ha sido robada?', 'select', yesNo),
          field('visa_perdida_donde', 'Dónde'),
          field('visa_perdida_anio', 'Año del robo o extravío'),
          field('visa_perdida_explicacion', 'Explicación', 'textarea'),
          field('visa_cancelada_revocada', '¿Alguna vez su visa ha sido cancelada o revocada? Explique', 'textarea'),
          field(
            'negada_admision_eeuu',
            '¿Alguna vez le fue negada la admisión a EE.UU. o se le ha retirado su aplicación para admisión en el punto de entrada? Explique',
            'textarea'
          ),
        ],
      },
      {
        titulo: 'Visa negada',
        campos: [
          field('visa_eeuu_negada', '¿Alguna vez se le ha negado una visa de EE.UU.?', 'select', yesNo),
          field('visa_negada_donde_cuando', 'Dónde y cuándo'),
          field('visa_negada_observaciones', 'Observaciones', 'textarea'),
          field(
            'mintio_aplicacion_anterior',
            '¿En su aplicación anterior mintió en su entrevista sobre alguna información importante?',
            'select',
            yesNo
          ),
          field('mintio_explicacion', 'Explicación', 'textarea'),
        ],
      },
      {
        titulo: 'Dirección y teléfono',
        campos: [
          field('domicilio', 'Domicilio', 'textarea'),
          field('localidad_colonia', 'Localidad / Colonia'),
          field('municipio', 'Municipio'),
          field('estado', 'Estado'),
          field('codigo_postal', 'Código postal'),
          field('pais', 'País'),
          field('celular', 'Celular'),
          field('telefono_hogar', 'Teléfono de hogar'),
          field('telefono_empleo', 'Teléfono de empleo'),
          field('correo_electronico', 'Correo electrónico'),
        ],
      },
      {
        titulo: 'Redes sociales',
        campos: [
          field('cuenta_redes_sociales', '¿Cuenta con redes sociales?', 'select', yesNo),
          field('nombre_red_social', 'Nombre de red social'),
          field('nombre_dentro_red_social', 'Nombre dentro de la red social'),
          field('redes_sociales_detalle', 'Redes sociales adicionales', 'textarea'),
        ],
      },
      {
        titulo: 'Pasaporte',
        campos: [
          field('lugar_emision_pasaporte', 'Lugar de emisión'),
          field('pasaporte_perdido_robado', '¿Ha perdido su pasaporte o se lo han robado?', 'select', yesNo),
          field('fecha_anio_extravio_pasaporte', 'Fecha y año del extravío'),
        ],
      },
      {
        titulo: 'Información de contacto en EE.UU.',
        campos: [
          field('contacto_eeuu_nombre_completo', 'Nombre completo del contacto en EE.UU.'),
          field('contacto_eeuu_parentesco', 'Parentesco del contacto en EE.UU.'),
          field('contacto_eeuu_telefono', 'Teléfono del contacto en EE.UU.'),
          field('contacto_eeuu_domicilio', 'Domicilio del contacto en EE.UU.', 'textarea'),
          field('contacto_eeuu_correo', 'Correo electrónico del contacto en EE.UU.'),
          field('contacto_eeuu_estatus', 'Estatus del contacto en EE.UU.'),
        ],
      },
      {
        titulo: 'Información familiar',
        campos: [
          field('padre_nombre_completo', 'Nombre completo de su padre'),
          field('padre_fecha_nacimiento', 'Fecha de nacimiento del padre'),
          field('padre_en_eeuu', '¿Su padre está en los EUA?', 'select', yesNo),
          field('padre_estatus_migratorio', 'Estatus migratorio en Estados Unidos'),
          field('padre_observaciones', 'Observaciones del padre', 'textarea'),
          field('madre_nombre_completo', 'Nombre completo de su madre'),
          field('madre_fecha_nacimiento', 'Fecha de nacimiento de la madre'),
          field('madre_en_eeuu', '¿Su madre está en los EUA?', 'select', yesNo),
          field('madre_estatus_migratorio', 'Estatus migratorio en Estados Unidos'),
          field('madre_observaciones', 'Observaciones de la madre', 'textarea'),
          field('familiares_inmediatos_eeuu', '¿Tiene otros familiares inmediatos en los EE.UU.?', 'select', yesNo),
          field('familiares_inmediatos_detalle', 'Detalle de familiares inmediatos en EE.UU.', 'textarea'),
          field('hijo_nacido_eeuu', '¿Tuvo usted algún hijo en EE.UU.?', 'select', yesNo),
          field('hijo_nacido_eeuu_explicacion', 'Explicación (tipo de hospital y fecha)', 'textarea'),
          field('otros_familiares_eeuu', '¿Tiene otros familiares en los EUA?', 'select', yesNo),
        ],
      },
      {
        titulo: 'Información de cónyuge',
        campos: [
          field('conyuge_nombre', 'Nombre del esposo(a)'),
          field('conyuge_fecha_lugar_nacimiento', 'Fecha y lugar de nacimiento'),
          field('conyuge_numero_divorcios', 'En caso de que sí, ¿cuántos divorcios lleva?'),
          field('ultimo_matrimonio_fechas', 'Solo del último matrimonio: fechas de casamiento y divorcio'),
          field('ultimo_matrimonio_de', 'De'),
          field('ultimo_matrimonio_hasta', 'Hasta'),
          field('viven_mismo_domicilio', '¿Viven en el mismo domicilio?', 'select', yesNo),
          field('conyuge_domicilio', 'Domicilio', 'textarea'),
        ],
      },
      {
        titulo: 'Información de presente empleo / educación',
        campos: [
          field('cuenta_empleo_actualmente', '¿Cuenta con empleo actualmente?', 'select', yesNo),
          field('ocupacion_principal', 'Ocupación principal'),
          field('empleador_actual', 'Empleador'),
          field('empleo_direccion', 'Dirección', 'textarea'),
          field('empleo_localidad_colonia', 'Localidad / Colonia'),
          field('empleo_municipio', 'Municipio'),
          field('empleo_estado', 'Estado'),
          field('empleo_codigo_postal', 'Código postal'),
          field('empleo_pais', 'País'),
          field('empleo_telefono', 'Número de teléfono'),
          field('sueldo_mensual_moneda_local', 'Sueldo mensual en la moneda local'),
          field('descripcion_deberes', 'Descripción breve de sus deberes', 'textarea'),
          field('traduccion_descripcion', 'Traducción de la descripción', 'textarea'),
          field('desde_cuando_empleo', '¿Desde cuándo tiene ese empleo?'),
        ],
      },
      {
        titulo: 'Información de anterior empleo y educación',
        campos: [
          field('tuvo_empleo_anterior', '¿Anteriormente tuvo algún empleo?', 'select', yesNo),
          field('ocupacion_anterior', 'Ocupación anterior'),
          field('supervisor_anterior', 'Nombre del supervisor'),
          field('empleador_anterior', 'Empleador'),
          field('empleo_anterior_direccion', 'Dirección', 'textarea'),
          field('empleo_anterior_localidad_colonia', 'Localidad / Colonia'),
          field('empleo_anterior_municipio', 'Municipio'),
          field('empleo_anterior_codigo_postal', 'Código postal'),
          field('empleo_anterior_estado', 'Estado'),
          field('empleo_anterior_pais', 'País'),
          field('empleo_anterior_telefono', 'Número de teléfono'),
          field('empleo_anterior_descripcion_deberes', 'Descripción breve de sus deberes', 'textarea'),
          field('empleo_anterior_traduccion_descripcion', 'Traducción de la descripción', 'textarea'),
          field('empleo_anterior_desde', '¿Desde cuándo tuvo ese empleo?'),
          field('empleo_anterior_hasta', 'Hasta'),
          field('ha_tenido_estudios', '¿Ha tenido estudios?', 'select', yesNo),
          field('nivel_educativo', 'Nivel educativo'),
          field('lugar_estudio_nombre', 'Nombre del lugar de estudio'),
          field('lugar_estudio_direccion', 'Dirección', 'textarea'),
          field('lugar_estudio_telefono', 'Teléfono'),
          field('estudio_de', 'De'),
          field('estudio_a', 'A'),
          field('tuvo_educacion_anterior', '¿Tuvo educación anterior?', 'select', yesNo),
          field('nivel_educativo_anterior', 'Nivel educativo anterior'),
          field('lugar_estudio_anterior_nombre', 'Nombre del lugar de estudio anterior'),
          field('lugar_estudio_anterior_direccion', 'Dirección anterior', 'textarea'),
          field('lugar_estudio_anterior_telefono', 'Teléfono anterior'),
          field('estudio_anterior_de', 'De'),
          field('estudio_anterior_a', 'A'),
        ],
      },
      {
        titulo: 'Viajes, organizaciones, idiomas y consulados',
        campos: [
          field('viajo_otro_pais_ultimos_5_anios', '¿Ha viajado a algún otro país en los últimos 5 años?', 'select', yesNo),
          field('paises_visitados_ultimos_5_anios', '¿A dónde?', 'textarea'),
          field('participa_organizacion_social', '¿Ha participado o contribuido en alguna organización social, de caridad u ONG?', 'textarea'),
          field('idiomas_habla', '¿Qué idioma habla?'),
          field('consulados_puede_ir', 'Consulados a donde puede ir'),
        ],
      },
      {
        titulo: 'Observaciones generales',
        campos: [
          field('observaciones_generales', 'Observaciones generales del perfil', 'textarea'),
        ],
      },
    ],
    documentos_requeridos: [
      { clave: 'pasaporte', nombre: 'Pasaporte vigente', obligatorio: true },
      { clave: 'foto', nombre: 'Fotografía', obligatorio: false },
      { clave: 'documentos_viaje', nombre: 'Documentos del viaje', obligatorio: false },
      { clave: 'documentos_laborales', nombre: 'Documentos laborales', obligatorio: false },
      { clave: 'documentos_familiares', nombre: 'Documentos familiares', obligatorio: false },
      { clave: 'documento_adicional', nombre: 'Documento adicional', obligatorio: false },
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

  return {
    tipo_tramite: tipoResult.rows[0],
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
      pais: null,
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
