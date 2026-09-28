const eq = (field, value = true) => ({ field, operator: 'eq', value });
const inValues = (field, value) => ({ field, operator: 'in', value });
const f = (key, label, type = 'text', extra = {}) => ({ key, label, type, source_column: key, ...extra });
const gate = (key, label, type = 'boolean', extra = {}) => f(key, label, type, { required: true, ...extra });
const conditional = (key, label, type, condition, extra = {}) => f(key, label, type, {
  show_if: condition,
  required_if: condition,
  ...extra,
});

const yes = (field) => eq(field, true);
const no = (field) => eq(field, false);

const TEMPLATE = {
  schema_version: 2,
  source: {
    document: 'docs/appsheet/Application Documentation Visas inv.pdf',
    table: 'PERFIL VISA INDIVIDUAL',
    related_tables: ['FAMILIARES EN EEUU', 'REDES SOCIALES', 'INGRESOS A ESTADOS UNIDOS'],
    audited_pages: { perfil: '266-390', familiares: '159-164', redes: '399-403', ingresos: '404-408' },
  },
  activation: {
    strategy: 'highest_active_template_version_for_tipo_tramite',
    applies_to: 'new_profiles_only',
    preserves_existing_profiles: true,
  },
  documentos_requeridos: [
    { clave: 'curp', nombre: 'CURP', obligatorio: true },
    { clave: 'respaldo', nombre: 'Respaldo', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
    { clave: 'ds', nombre: 'DS', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
  ],
  canonical_information: [
    { source: 'clientes.nombre_completo', label: 'Nombre del aplicante' },
    { source: 'clientes.fecha_nacimiento', label: 'Fecha de nacimiento' },
    { source: 'clientes.telefono', label: 'Teléfono del aplicante' },
    { source: 'clientes.correo', label: 'Correo del aplicante' },
    { source: 'clientes.pais', label: 'País del aplicante' },
    { source: 'clientes.direccion', label: 'Domicilio registrado' },
  ],
  sections: [
    {
      id: 'informacion_general', label: 'Información general', fields: [
        gate('ha_usado_otro_nombre_o_lo_ha_modificado', '¿Ha usado otro nombre o lo ha modificado?'),
        conditional('cual_fue_su_otro_nombre', '¿Cuál fue su otro nombre?', 'text', yes('ha_usado_otro_nombre_o_lo_ha_modificado')),
        gate('estado_civil', 'Estado civil', 'select', { options: ['Casado', 'Soltero', 'Viudo', 'Divorciado', 'Legalmente separado', 'Unión libre'] }),
        gate('tiene_alguna_otra_nacionalidad', '¿Tiene alguna otra nacionalidad?'),
        conditional('cual_es_su_otra_nacionalidad', '¿Cuál es su otra nacionalidad?', 'text', yes('tiene_alguna_otra_nacionalidad')),
        gate('tiene_alguna_discapacidad', '¿Tiene alguna discapacidad?'),
        conditional('cual_es_su_discapacidad', '¿Cuál es su discapacidad?', 'textarea', yes('tiene_alguna_discapacidad')),
      ],
    },
    {
      id: 'datos_viaje', label: 'Datos del viaje', fields: [
        f('fecha_tentativa_de_llegada', 'Fecha tentativa de viaje'),
        f('duracion', 'Duración'),
        f('cual_es_el_motivo_de_su_viaje', '¿Cuál es el motivo de su viaje?', 'textarea'),
        f('domicilio_donde_va_a_llegar_a_estados_unidos', 'Domicilio donde llegará en Estados Unidos', 'textarea'),
        f('parentesco', 'Parentesco'),
        f('con_quienes_viaja_a_estados_unidos_y_cual_es_su_parentesco', '¿Con quiénes viajará y cuál es su parentesco?', 'textarea'),
      ],
    },
    {
      id: 'pagador_viaje', label: 'Pagador del viaje', fields: [
        gate('usted_pagara_por_su_viaje', '¿Usted pagará por su viaje?'),
        conditional('quien_pagaria_su_viaje', 'Nombre de quien pagará su viaje', 'text', no('usted_pagara_por_su_viaje')),
        conditional('numero_de_telefono_de_quien_pagaria_por_su_viaje', 'Número de teléfono', 'phone', no('usted_pagara_por_su_viaje')),
        conditional('correo_electronico_quien_pagaria_por_su_viaje', 'Correo electrónico', 'email', no('usted_pagara_por_su_viaje')),
        conditional('parentesco_quien_pagaria_por_su_viaje', 'Parentesco', 'text', no('usted_pagara_por_su_viaje')),
        conditional('domicilio_quien_pagaria_por_su_viaje', 'Domicilio', 'textarea', no('usted_pagara_por_su_viaje')),
      ],
    },
    {
      id: 'entradas_eeuu', label: 'Entradas y viajes anteriores a EE. UU.', fields: [
        gate('ha_entrado_a_estados_unidos', '¿Ha entrado o intentado entrar a Estados Unidos?'),
        f('ingresos_estados_unidos', 'Fechas de ingreso a Estados Unidos', 'repeater', {
          show_if: yes('ha_entrado_a_estados_unidos'), min_items: 1, max_items: 30,
          source_table: 'INGRESOS A ESTADOS UNIDOS',
          fields: [
            f('fecha_ingreso', 'Fecha de ingreso', 'text', { source_column: 'feha_ingreso', required: true }),
            f('duracion', 'Cantidad', 'number', { required: true, min: 0 }),
            f('tiempo', 'Tiempo', 'select', { required: true, options: ['Días', 'Semanas', 'Meses', 'Años', 'Menos de 24 horas'] }),
          ],
        }),
        conditional('entro_de_manera_ilegal_o_con_documentos_falsos', '¿Ingresó o intentó ingresar de manera ilegal o con documentos falsos? Explique.', 'textarea', yes('ha_entrado_a_estados_unidos')),
        conditional('alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria', '¿Alguna vez le han deportado de manera voluntaria o involuntaria?', 'boolean', yes('ha_entrado_a_estados_unidos')),
        conditional('pago_por_los_costos_de_su_deportacion_explique', '¿Pagó los costos de la deportación? Explique.', 'textarea', yes('alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria')),
      ],
    },
    {
      id: 'peticiones_migratorias', label: 'Peticiones migratorias', fields: [
        gate('alguna_vez_alguien_metio_una_peticion_de_migracion', '¿Alguna vez alguien presentó una petición de inmigración por usted?'),
        conditional('quien_y_para_que_tipo_de_peticion', '¿Quién y para qué tipo de petición?', 'textarea', yes('alguna_vez_alguien_metio_una_peticion_de_migracion')),
        conditional('por_que_fue_rechazada', '¿Por qué fue rechazada?', 'textarea', yes('alguna_vez_alguien_metio_una_peticion_de_migracion')),
      ],
    },
    {
      id: 'delitos_sentencias', label: 'Delitos y sentencias', fields: [
        gate('en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen', '¿En el pasado ha cometido un acto ilícito o felonía en EE. UU. o en su país de origen?'),
        conditional('cual_fue_el_delito', '¿Cuál fue el delito?', 'text', yes('en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen')),
        conditional('hubo_sentencia', '¿Tuvo una sentencia?', 'boolean', yes('en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen')),
        conditional('por_cuanto_tiempo_fue_la_sentencia', '¿Por cuánto tiempo fue la sentencia?', 'text', yes('hubo_sentencia')),
        conditional('donde_fue_el_delito', '¿Dónde fue el delito?', 'text', yes('en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen')),
        conditional('cuando_fue_su_delito', '¿Cuándo fue el delito?', 'text', yes('en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen')),
        conditional('explique_su_delito', 'Explique el delito', 'textarea', yes('en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen')),
      ],
    },
    {
      id: 'visa_anterior', label: 'Visa anterior', fields: [
        gate('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua', '¿Alguna vez le han otorgado visa para viajar a Estados Unidos?'),
        conditional('fecha_de_emision', 'Fecha de emisión', 'text', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('fecha_de_vencimiento', 'Fecha de vencimiento', 'text', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('tipo_de_visa', 'Tipo de visa', 'text', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('numero_visa', 'Número de visa', 'text', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('en_que_consulado_fue', 'Consulado', 'text', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('esta_solicitando_el_mismo_tipo_de_visa', '¿Está solicitando el mismo tipo de visa?', 'boolean', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('esta_aplicando_en_el_mismo_pais_donde_la_visa_fue_emitida_y_en_su_pais_de_residencia_principal', '¿Está aplicando en el mismo país donde la visa fue emitida y es su residencia principal?', 'boolean', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('le_han_sacado_huellas_al_momento_de_tramitar_su_visa', '¿Le sacaron huellas en su visa anterior?', 'boolean', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('alguna_vez_ha_perdido_su_visa_o_ha_sido_robada', '¿Alguna vez perdió su visa o fue robada?', 'boolean', yes('alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua')),
        conditional('donde_fue_robada', '¿Dónde fue robada?', 'text', yes('alguna_vez_ha_perdido_su_visa_o_ha_sido_robada')),
        conditional('ano_del_robo_o_extravio', 'Año del robo o extravío', 'text', yes('alguna_vez_ha_perdido_su_visa_o_ha_sido_robada')),
        conditional('explicacion_perdida_visa', 'Explique la pérdida o robo', 'textarea', yes('alguna_vez_ha_perdido_su_visa_o_ha_sido_robada')),
        f('alguna_vez_su_visa_ha_sido_cancelada_o_revocada_explique', '¿Alguna vez su visa fue cancelada o revocada? Explique.', 'textarea'),
        f('alguna_vez_le_fue_negada_la_admision_a_los_eua_o_se_le_ha_retirado_su_aplicacion_para_admision_en_el_punto_de_entrada_explique', '¿Alguna vez le negaron la entrada a EE. UU. o retiró su solicitud de admisión? Explique.', 'textarea'),
      ],
    },
    {
      id: 'visa_negada', label: 'Visa negada', fields: [
        gate('alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua', '¿Alguna vez le negaron una visa de EE. UU.?'),
        conditional('donde_le_fue_negada_su_visa', '¿Dónde le fue negada?', 'text', yes('alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua')),
        conditional('cuando_le_fue_negada_su_visa', '¿Cuándo le fue negada?', 'text', yes('alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua')),
        conditional('observaciones', 'Observaciones', 'textarea', yes('alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua')),
        conditional('en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante', '¿En la aplicación anterior mintió sobre información importante?', 'boolean', yes('alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua')),
        conditional('explique_cual_fue_esa_informacion', 'Explique cuál fue esa información', 'textarea', yes('en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante')),
      ],
    },
    {
      id: 'domicilio_telefonos', label: 'Domicilio y teléfonos', fields: [
        f('localidad', 'Localidad/colonia'),
        f('municipio', 'Municipio'),
        f('codigo_postal', 'Código postal', 'text'),
        f('numero_del_hogar', 'Número del hogar', 'phone'),
        f('numero_del_empleo', 'Número del empleo', 'phone'),
      ],
    },
    {
      id: 'redes_sociales', label: 'Redes sociales', fields: [
        gate('redes_sociales', '¿Cuenta con redes sociales?'),
        f('redes_sociales_detalle', 'Redes sociales', 'repeater', {
          show_if: yes('redes_sociales'), min_items: 1, max_items: 20, source_table: 'REDES SOCIALES',
          fields: [
            f('red_social', 'Red social', 'select', { required: true, options: ['Facebook', 'X', 'Instagram', 'Tik Tok'] }),
            f('nombre_usuario', 'Nombre dentro de la red social', 'text', { required: true, source_column: 'Nombre_dentro_red social' }),
          ],
        }),
      ],
    },
    {
      id: 'pasaporte', label: 'Pasaporte', fields: [
        f('donde_fue_tramitado_el_pasaporte', '¿Dónde fue tramitado el pasaporte?'),
        gate('ha_perdido_su_pasaporte_o_se_lo_han_robado', '¿Ha perdido su pasaporte o se lo han robado?'),
        conditional('fecha_y_ano_del_extravio_o_robo', 'Fecha y año del extravío o robo', 'textarea', yes('ha_perdido_su_pasaporte_o_se_lo_han_robado')),
      ],
    },
    {
      id: 'contacto_eeuu', label: 'Contacto en EE. UU.', fields: [
        f('nombre_de_familiar_o_contacto_en_estados_unidos_de_america', 'Nombre del contacto'),
        f('parentesco_de_contacto', 'Parentesco', 'select', { options: ['Relative', 'Spouse', 'Friend', 'Business associate', 'Employer', 'School official', 'Other'] }),
        f('telefono_del_contacto', 'Teléfono del contacto', 'phone'),
        f('domicilio_del_contacto', 'Domicilio del contacto', 'textarea'),
        f('correo_electronico_del_contacto', 'Correo electrónico del contacto', 'email'),
        f('estatus_del_contacto', 'Estatus del contacto'),
      ],
    },
    {
      id: 'padres_familiares', label: 'Padres y familiares', fields: [
        f('nombre_del_padre_del_aplicante', 'Nombre del padre'),
        f('fecha_de_nacimiento_del_padre', 'Fecha de nacimiento del padre'),
        gate('el_padre_se_encuentra_en_los_eua', '¿Su padre está en EE. UU.?'),
        conditional('estatus_del_padre', 'Estatus del padre', 'select', yes('el_padre_se_encuentra_en_los_eua'), { options: ['Residente', 'Ciudadano', 'Otro', 'No inmigrante'] }),
        conditional('notas_sobre_el_estatus_del_padre', 'Notas sobre el estatus del padre', 'textarea', yes('el_padre_se_encuentra_en_los_eua')),
        f('nombre_de_la_madre_del_aplicante', 'Nombre de la madre'),
        f('fecha_de_nacimiento_de_la_madre', 'Fecha de nacimiento de la madre'),
        gate('la_madre_se_encuentra_en_eeuu', '¿La madre se encuentra en EE. UU.?'),
        conditional('estatus_de_la_madre', 'Estatus de la madre', 'select', yes('la_madre_se_encuentra_en_eeuu'), { options: ['Residencia', 'Ciudadanía', 'Otro', 'No inmigrante'] }),
        conditional('notas_sobre_el_estatus_de_la_madre', 'Notas sobre el estatus de la madre', 'textarea', yes('la_madre_se_encuentra_en_eeuu')),
        gate('tiene_familiares_directos_en_estados_unidos', '¿Tiene familiares en EE. UU.?'),
        f('familiares_eeuu', 'Familiares en EE. UU.', 'repeater', {
          show_if: yes('tiene_familiares_directos_en_estados_unidos'), min_items: 1, max_items: 30, source_table: 'FAMILIARES EN EEUU',
          fields: [
            f('apellidos', 'Apellidos', 'text', { required: true }),
            f('nombre', 'Nombres', 'text', { required: true }),
            f('estatus', 'Estatus en EE. UU.', 'select', { required: true, options: ['Residente', 'Ciudadano', 'No inmigrante', 'Otro'] }),
            f('relacion', 'Relación con el aplicante', 'select', { required: true, source_column: 'realcion', options: ['Hijo', 'Hermano'] }),
          ],
        }),
        gate('tiene_mas_familiares_en_eua', '¿Tiene otros familiares en EE. UU.?'),
        gate('tuvo_usted_algun_hijo_en_los_eua', '¿Tuvo algún hijo en EE. UU.?'),
        conditional('explicacion_tipo_de_hospital_y_fecha', 'Explicación: tipo de hospital, fecha, etc.', 'textarea', yes('tuvo_usted_algun_hijo_en_los_eua')),
      ],
    },
    {
      id: 'conyuge_divorcios', label: 'Cónyuge y divorcios', fields: [
        conditional('nombre_del_conyuge', 'Nombre del esposo(a)', 'text', { not: eq('estado_civil', 'Soltero') }),
        conditional('fecha_de_nacimiento_del_conyuge', 'Fecha de nacimiento del cónyuge', 'text', { not: eq('estado_civil', 'Soltero') }),
        conditional('lugar_de_nacimiento', 'Lugar de nacimiento del cónyuge', 'text', { not: eq('estado_civil', 'Soltero') }),
        conditional('cuantos_divorcios_lleva', '¿Cuántos divorcios lleva?', 'text', eq('estado_civil', 'Divorciado')),
        conditional('inicio_de_ultimo_matrimonio', 'Fecha de inicio del último matrimonio', 'text', eq('estado_civil', 'Divorciado')),
        conditional('fin_de_ultimo_matrimonio', 'Fecha de finalización del último matrimonio', 'text', eq('estado_civil', 'Divorciado')),
        conditional('viven_en_el_mismo_domicilio', '¿Viven en el mismo domicilio?', 'boolean', { not: eq('estado_civil', 'Soltero') }),
        conditional('domicilio_del_esposo_a', 'Domicilio del esposo(a)', 'textarea', no('viven_en_el_mismo_domicilio')),
      ],
    },
    {
      id: 'empleo_actual', label: 'Empleo actual', fields: [
        gate('cuenta_con_empleo_actualmente', '¿Cuenta con empleo actualmente?', 'select', { options: ['Sí', 'No', 'Ama de casa', 'Estudiante'] }),
        conditional('ocupacion', 'Ocupación', 'text', eq('cuenta_con_empleo_actualmente', 'Sí')),
        conditional('empleador', 'Empleador/Escuela/Institución', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('direccion_de_empleador', 'Dirección del empleador', 'textarea', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('localidad_del_empleo_actual', 'Localidad/colonia', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('municipio_del_empleo_actual', 'Municipio', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('estado_del_empleo_actual', 'Estado', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('codigo_postal_de_empleo_actual', 'Código postal', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('pais_del_empleo_actual', 'País', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('numero_de_telefono_del_empleo', 'Número de teléfono', 'phone', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('sueldo_mensual', 'Sueldo mensual', 'number', eq('cuenta_con_empleo_actualmente', 'Sí'), { min: 0 }),
        conditional('descripcion_del_empleo_actual', 'Descripción del empleo', 'textarea', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('traduccion_de_la_descripcion_del_empleo_actual', 'Traducción', 'textarea', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
        conditional('desde_cuando_tiene_ese_empleo', 'Fecha de inicio', 'text', inValues('cuenta_con_empleo_actualmente', ['Sí', 'Estudiante'])),
      ],
    },
    {
      id: 'empleos_anteriores', label: 'Empleos anteriores', fields: [
        gate('anteriormente_tuvo_algun_empleo', '¿Anteriormente tuvo algún empleo?'),
        ...[
          ['ocupacion_anterior', 'Ocupación anterior', 'text'], ['nombre_de_supervisor', 'Nombre del supervisor', 'text'],
          ['empleador_anterior', 'Empleador anterior', 'text'], ['direccion_del_empleo_anterior', 'Dirección del empleador anterior', 'textarea'],
          ['localidad_del_empleo_anterior', 'Localidad/colonia', 'text'], ['municipio_del_empleo_anterior', 'Municipio', 'text'],
          ['codigo_postal_empleo_anterior', 'Código postal', 'text'], ['estado_del_empleo_anterior', 'Estado', 'text'],
          ['pais_del_empleo_anterior', 'País', 'text'], ['numero_de_telefono_del_empleo_anterior', 'Número de teléfono', 'phone'],
          ['descripcion_breve_del_empleo_anterior', 'Descripción del empleo anterior', 'textarea'],
          ['traduccion_de_la_descripcion_del_empleo_anterior', 'Traducción', 'textarea'],
          ['fecha_inicio_de_empleo_anterior', 'Fecha de inicio', 'text'], ['fecha_de_finalizacion_de_empleo_anterior', 'Fecha de finalización', 'text'],
        ].map(([key, label, type]) => conditional(key, label, type, yes('anteriormente_tuvo_algun_empleo'))),
      ],
    },
    {
      id: 'estudios', label: 'Estudios', fields: [
        gate('tuvo_estudios', '¿Tuvo algún nivel de estudios?'),
        ...[
          ['nivel_educativo', 'Nivel educativo', 'text'], ['nombre_de_la_escuela', 'Nombre de la escuela', 'text'],
          ['direccion_de_la_escuela', 'Domicilio de la escuela', 'textarea'], ['numero_de_telefono_de_la_escuela', 'Teléfono de la escuela', 'phone'],
          ['fecha_inicio_escolar', 'Fecha de inicio escolar', 'text'], ['fecha_finalizacion_escolar', 'Fecha de finalización escolar', 'text'],
        ].map(([key, label, type]) => conditional(key, label, type, yes('tuvo_estudios'))),
        gate('tuvo_educacion_antes', '¿Tuvo nivel educativo anterior?'),
        ...[
          ['nivel_educativo_anterior', 'Nivel educativo anterior', 'text'], ['nombre_de_la_escuela_anterior', 'Nombre de la escuela anterior', 'text'],
          ['direccion_de_la_escuela_anterior', 'Dirección de la escuela anterior', 'textarea'], ['numero_de_telefono_de_la_escuela_anterior', 'Teléfono de la escuela anterior', 'phone'],
          ['fecha_inicio_escolar_anterior', 'Fecha de inicio', 'text'], ['fecha_finalizacion_escolar_anterior', 'Fecha de finalización', 'text'],
        ].map(([key, label, type]) => conditional(key, label, type, yes('tuvo_educacion_antes'))),
      ],
    },
    {
      id: 'viajes_otros_paises', label: 'Viajes a otros países', fields: [
        gate('ha_viajado_a_algun_pais_en_los_ultimos_5_anos', '¿Ha viajado a algún país en los últimos 5 años?'),
        conditional('cuales', '¿Cuáles países?', 'textarea', yes('ha_viajado_a_algun_pais_en_los_ultimos_5_anos'), { source_type: 'EnumList', confirmed_values: ['México', 'Colombia'], allow_other_values: true }),
      ],
    },
    {
      id: 'organizaciones_idiomas', label: 'Organizaciones e idiomas', fields: [
        f('ha_participado_o_contribuido_en_alguna_organizacion_social_de_caridad_u_ong', '¿Ha participado o contribuido en alguna organización social, de caridad u ONG?', 'textarea'),
        f('que_idioma_habla', '¿Qué idiomas habla?', 'multiselect', { options: ['Español', 'Mam', 'Ingles'] }),
      ],
    },
    {
      id: 'consulados', label: 'Consulados disponibles', fields: [
        f('conuslados_a_donde_puede_ir', 'Consulados a donde puede ir', 'textarea', { source_type: 'EnumList', enum_status: 'NO PUDE CONFIRMARLO' }),
      ],
    },
  ],
};

module.exports = TEMPLATE;
