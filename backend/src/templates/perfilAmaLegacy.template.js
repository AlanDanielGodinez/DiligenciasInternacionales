const yesNo = ['Sí', 'No'];
const yesNoUnknown = ['Sí', 'No', 'No sabe'];

const field = (name, label, type = 'text', options) => {
  const result = { name, label, type, required: false };
  if (options) result.options = options;
  return result;
};

const estructuraJson = {
  secciones: [
    {
      titulo: 'Información general',
      campos: [
        field('ha_usado_otros_nombres', '¿Ha usado otros nombres o lo ha modificado?', 'select', yesNo),
        field('sexo', 'Sexo', 'select', ['Femenino', 'Masculino', 'Otro']),
        field('otros_nombres_cual', '¿Cuál?'),
        field('estado_civil', 'Estado civil', 'select', [
          'Soltero/a',
          'Casado/a',
          'Unión libre',
          'Divorciado/a',
          'Viudo/a',
          'Separado/a',
        ]),
      ],
    },
    {
      titulo: 'Información de nacimiento',
      campos: [
        field('otra_nacionalidad', '¿Tiene o ha tenido alguna otra nacionalidad?', 'select', yesNo),
        field('otra_nacionalidad_cual', '¿Cuál?'),
        field('tramito_pasaporte', '¿Tramitó pasaporte?', 'select', yesNo),
        field(
          'discapacidad_o_enfermedad',
          '¿Tiene alguna discapacidad o enfermedad que le impida hablar por él/ella misma o viajar?',
          'select',
          yesNo
        ),
        field('discapacidad_cual', '¿Cuál es su discapacidad?', 'textarea'),
        field('sabe_leer', 'Sabe leer', 'select', yesNo),
        field('sabe_escribir', 'Sabe escribir', 'select', yesNo),
      ],
    },
    {
      titulo: 'Viajes anteriores a EE.UU.',
      campos: [
        field('ha_estado_en_eeuu', '¿Alguna vez ha estado en los EE.UU.?', 'select', yesNo),
        field('ingreso_ilegal_documentos_falsos', '¿Ingresó de manera ilegal o con documentos falsos?', 'select', yesNo),
        field('fechas_ingreso_eeuu', 'Fechas en las que ingresó a EE.UU.', 'textarea'),
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
        field('deportado_voluntaria_involuntariamente', '¿Alguna vez fue deportado de manera voluntaria o involuntaria?', 'select', yesNo),
        field('pago_costos_deportacion', 'En caso de una deportación voluntaria, ¿pagó los costos de su deportación?'),
      ],
    },
    {
      titulo: 'Visa',
      campos: [
        field('visa_otorgada', '¿Una vez le han otorgado una visa para viajar a los EUA?', 'select', yesNo),
        field('tipo_visa', 'Tipo de visa'),
        field('fecha_emision_visa', 'Fecha de cuando la visa fue emitida', 'date'),
        field('fecha_vencimiento_visa', 'Fecha de vencimiento de la visa', 'date'),
        field('numero_visa', 'Número de visa'),
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
        field('hizo_reporte_visa_perdida', '¿Hizo reporte?', 'select', yesNo),
        field('visa_cancelada_revocada', '¿Alguna vez su visa ha sido cancelada o revocada?', 'textarea'),
        field('visa_negada', '¿Alguna vez se le ha negado una visa de EE.UU.?', 'select', yesNo),
        field('visa_negada_donde_cuando', 'Dónde y cuándo'),
        field('hoja_denegacion', '¿Le entregaron una hoja explicando el motivo de denegación?', 'select', yesNo),
        field('tamano_hoja_denegacion', '¿Qué tamaño era?'),
        field('visa_observaciones', 'Observaciones', 'textarea'),
        field(
          'mintio_aplicacion_anterior',
          '¿En su aplicación anterior mintió en su entrevista sobre alguna información importante?',
          'select',
          yesNo
        ),
        field('mintio_explicacion', 'Explicación', 'textarea'),
        field('tramite_visa_activo', '¿Tiene algún trámite de visa activo actualmente?', 'select', yesNo),
        field(
          'negada_admision_eeuu',
          '¿Alguna vez le fue negada la admisión a EE.UU. o se le ha retirado su aplicación para admisión en el punto de entrada?',
          'textarea'
        ),
        field(
          'peticion_inmigracion',
          '¿Alguna vez alguien metió una petición de inmigración por su parte con USCIS?',
          'select',
          yesNo
        ),
        field('detalle_peticion_inmigracion', 'Si su respuesta es afirmativa, ¿quién y para cuál tipo de petición?', 'textarea'),
        field('peticion_rechazada_motivo', 'Y si fue rechazado, ¿por qué?', 'textarea'),
      ],
    },
    {
      titulo: 'Dirección y teléfono',
      campos: [
        field('calle', 'Calle'),
        field('codigo_postal', 'Código postal'),
        field('localidad', 'Localidad'),
        field('municipio', 'Municipio'),
        field('estado', 'Estado'),
        field('pais', 'País'),
        field('celular', 'Celular'),
        field('redes_sociales', '¿Cuenta con redes sociales?', 'textarea'),
      ],
    },
    {
      titulo: 'Pasaporte',
      campos: [
        field('pasaporte_perdido_robado', '¿Ha perdido su pasaporte o se lo han robado?', 'select', yesNo),
        field('fecha_anio_extravio_pasaporte', 'Fecha y año del extravío'),
        field('hizo_reporte_pasaporte', '¿Hizo reporte?', 'select', yesNo),
        field('lugar_emision_pasaporte', 'Lugar de emisión'),
      ],
    },
    {
      titulo: 'Información familiar',
      campos: [
        field('padre_nombre_completo', 'Nombre completo de su padre'),
        field('padre_esta_vivo', '¿Está vivo?', 'select', yesNoUnknown),
        field('padre_fecha_nacimiento', 'Fecha de nacimiento del padre'),
        field('padre_en_eeuu', '¿Su padre está en los EUA?', 'select', yesNoUnknown),
        field('padre_estatus_migratorio', 'Estatus migratorio en Estados Unidos'),
        field('padre_observaciones', 'Observaciones del padre', 'textarea'),
        field('madre_nombre_completo', 'Nombre completo de su madre'),
        field('madre_esta_viva', '¿Está viva?', 'select', yesNoUnknown),
        field('madre_fecha_nacimiento', 'Fecha de nacimiento de la madre'),
        field('madre_en_eeuu', '¿Su madre está en los EUA?', 'select', yesNoUnknown),
        field('madre_estatus_migratorio', 'Estatus migratorio en Estados Unidos'),
        field('madre_observaciones', 'Observaciones de la madre', 'textarea'),
        field('familiares_inmediatos_eeuu', '¿Tiene otros familiares inmediatos en los EE.UU.?', 'select', yesNo),
        field('hijos_pais_residencia', '¿Cuántos hijos tiene en su país de residencia?'),
        field('hijos_pais_residencia_observaciones', 'Observaciones sobre hijos en país de residencia', 'textarea'),
        field('familiares_inmediatos_detalle', 'Detalle de familiares inmediatos en EE.UU. (apellidos, nombre, estatus, relación)', 'textarea'),
        field('tuvo_hijo_eeuu', '¿Tuvo usted algún hijo en EE.UU.?', 'select', yesNo),
        field('otros_familiares_eeuu', '¿Tiene otros familiares en los EUA?', 'select', yesNo),
      ],
    },
    {
      titulo: 'Información de cónyuge',
      campos: [
        field('conyuge_nombre', 'Nombre del esposo(a)'),
        field('conyuge_fecha_lugar_nacimiento', 'Fecha y lugar de nacimiento'),
        field('se_ha_divorciado', '¿Se ha divorciado?', 'select', yesNo),
        field('numero_divorcios', 'En caso de que sí, ¿cuántos divorcios lleva?'),
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
        field('ocupacion_pasaporte', 'Ocupación pasaporte'),
        field('cuenta_empleo_actualmente', '¿Cuenta con empleo actualmente?', 'select', yesNo),
        field('ocupacion_principal', 'Ocupación principal'),
        field('empleador_actual', 'Empleador'),
        field('empleo_direccion', 'Dirección', 'textarea'),
        field('empleo_localidad', 'Localidad'),
        field('empleo_municipio', 'Municipio'),
        field('empleo_estado', 'Estado'),
        field('empleo_pais', 'País'),
        field('empleo_telefono', 'Número de teléfono'),
        field('sueldo_mensual_moneda_local', 'Sueldo mensual en la moneda local'),
        field('descripcion_deberes', 'Descripción breve de sus deberes', 'textarea'),
        field('traduccion_descripcion', 'Traducción de la descripción', 'textarea'),
        field('desde_cuando_empleo', '¿Desde cuándo tiene ese empleo?'),
      ],
    },
    {
      titulo: 'Empleo anterior',
      campos: [
        field('tuvo_empleo_anterior', '¿Anteriormente tuvo algún empleo?', 'select', yesNo),
        field('ocupacion_anterior', 'Ocupación anterior'),
        field('empleador_anterior', 'Empleador'),
        field('empleo_anterior_direccion', 'Dirección', 'textarea'),
        field('empleo_anterior_localidad', 'Localidad'),
        field('empleo_anterior_municipio', 'Municipio'),
        field('empleo_anterior_estado', 'Estado'),
        field('empleo_anterior_pais', 'País'),
        field('empleo_anterior_telefono', 'Número de teléfono'),
        field('empleo_anterior_descripcion_deberes', 'Descripción breve de sus deberes', 'textarea'),
        field('empleo_anterior_traduccion_descripcion', 'Traducción de la descripción', 'textarea'),
        field('empleo_anterior_periodo', '¿Desde cuándo tuvo ese empleo?'),
      ],
    },
    {
      titulo: 'Educación',
      campos: [
        field('nivel_educativo', 'Nivel educativo'),
        field('lugar_estudio_nombre', 'Nombre del lugar de estudio'),
        field('lugar_estudio_direccion', 'Dirección', 'textarea'),
        field('lugar_estudio_telefono', 'Teléfono'),
        field('estudio_de', 'De'),
        field('estudio_a', 'A'),
      ],
    },
    {
      titulo: 'Viajes, traductor e idiomas',
      campos: [
        field('viajo_otro_pais_ultimos_5_anios', '¿Ha viajado a algún otro país en los últimos 5 años?', 'select', yesNo),
        field('paises_visitados_ultimos_5_anios', '¿A dónde?', 'textarea'),
        field('necesita_traductor', '¿Necesita traductor?', 'select', yesNo),
        field('idiomas_habla', '¿Qué idiomas habla?'),
      ],
    },
    {
      titulo: 'Relación y origen del contacto',
      campos: [
        field('relacion_con_aplicante', '¿Qué relación tiene con el aplicante?'),
        field('de_donde_nos_conocio', '¿De dónde nos conoció?'),
        field('destino_final_aplicante', 'Destino final del aplicante', 'textarea'),
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
    { clave: 'acta_nacimiento', nombre: 'Acta o partida de nacimiento', obligatorio: true },
    { clave: 'comprobante_domicilio', nombre: 'Comprobante de domicilio', obligatorio: true },
    { clave: 'identificacion', nombre: 'Identificación oficial', obligatorio: true },
    { clave: 'documentos_familiares', nombre: 'Documentos familiares', obligatorio: false },
    { clave: 'documentos_laborales', nombre: 'Documentos laborales', obligatorio: false },
    { clave: 'documento_adicional', nombre: 'Documento adicional', obligatorio: false },
  ],
};

module.exports=estructuraJson;
