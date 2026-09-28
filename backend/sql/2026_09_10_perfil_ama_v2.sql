-- Solo plantillas nuevas; no cambia plantillas, respuestas o versiones hist?ricas.
BEGIN;
INSERT INTO public.perfil_plantillas (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
SELECT 'Perfil AMA '||t.nombre||' V2','perfil_ama_'||t.nombre||'_v2',2,true,t.id,NULL,
$ama${
  "schema_version": 2,
  "source": {
    "document": "Application Documentation Formularios.pdf",
    "audited_pages": "17–18; auditoría AMA 2026-09-07"
  },
  "activation": {
    "applies_to": "new_profiles_only",
    "preserves_existing_profiles": true
  },
  "sections": [
    {
      "id": "ama_1",
      "label": "Información general",
      "fields": [
        {
          "label": "¿Ha usado otros nombres o lo ha modificado?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "ha_usado_otros_nombres"
        },
        {
          "label": "¿Cuál fue su otro nombre?",
          "type": "textarea",
          "required": false,
          "key": "otros_nombres_cual",
          "show_if": {
            "field": "ha_usado_otros_nombres",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Sexo",
          "type": "select",
          "required": false,
          "options": [
            "Femenino",
            "Masculino",
            "Otro"
          ],
          "key": "sexo"
        },
        {
          "label": "Estado civil",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": "Casado/a",
              "label": "CASADO/A"
            },
            {
              "value": "Viudo/a",
              "label": "VIUDO/A"
            },
            {
              "value": "Soltero/a",
              "label": "SOLTERO/A"
            },
            {
              "value": "Divorciado/a",
              "label": "DIVORCIADO/A"
            },
            {
              "value": "Separado/a",
              "label": "LEGALMENTE SEPARADO/A"
            },
            {
              "value": "Unión libre",
              "label": "UNION LIBRE"
            }
          ],
          "key": "estado_civil"
        }
      ]
    },
    {
      "id": "ama_2",
      "label": "Información de nacimiento",
      "fields": [
        {
          "label": "¿Tiene o ha tenido alguna otra nacionalidad?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "otra_nacionalidad"
        },
        {
          "label": "¿Cuál?",
          "type": "text",
          "required": false,
          "key": "otra_nacionalidad_cual"
        },
        {
          "label": "¿Tramitó pasaporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tramito_pasaporte"
        },
        {
          "label": "¿Tiene alguna discapacidad o enfermedad que le impida hablar por él/ella misma o viajar?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "discapacidad_o_enfermedad"
        },
        {
          "label": "¿Cuál es su discapacidad?",
          "type": "textarea",
          "required": false,
          "key": "discapacidad_cual"
        },
        {
          "label": "Sabe leer",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "sabe_leer"
        },
        {
          "label": "Sabe escribir",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "sabe_escribir"
        }
      ]
    },
    {
      "id": "ama_3",
      "label": "Viajes anteriores a EE.UU.",
      "fields": [
        {
          "label": "¿Alguna vez ha estado en los EE.UU.?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "ha_estado_en_eeuu"
        },
        {
          "label": "¿Ingresó de manera ilegal o con documentos falsos?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "ingreso_ilegal_documentos_falsos"
        },
        {
          "label": "Fechas en las que ingresó a EE.UU.",
          "type": "textarea",
          "required": false,
          "key": "fechas_ingreso_eeuu"
        },
        {
          "label": "¿En el pasado cometió un acto ilícito o felonía en EE.UU. o en su país de origen?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "acto_ilicito_felonia"
        },
        {
          "label": "¿Cuál fue el delito?",
          "type": "textarea",
          "required": false,
          "key": "delito_cual"
        },
        {
          "label": "¿Hubo sentencia?",
          "type": "text",
          "required": false,
          "key": "hubo_sentencia"
        },
        {
          "label": "¿Cuánto tiempo?",
          "type": "text",
          "required": false,
          "key": "sentencia_tiempo"
        },
        {
          "label": "¿Dónde?",
          "type": "text",
          "required": false,
          "key": "sentencia_donde"
        },
        {
          "label": "¿Cuándo?",
          "type": "text",
          "required": false,
          "key": "sentencia_cuando"
        },
        {
          "label": "Explicación",
          "type": "textarea",
          "required": false,
          "key": "explicacion_viajes_anteriores"
        },
        {
          "label": "¿Alguna vez fue deportado de manera voluntaria o involuntaria?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "deportado_voluntaria_involuntariamente"
        },
        {
          "label": "En caso de una deportación voluntaria, ¿pagó los costos de su deportación?",
          "type": "text",
          "required": false,
          "key": "pago_costos_deportacion"
        }
      ]
    },
    {
      "id": "ama_4",
      "label": "Visa",
      "fields": [
        {
          "label": "¿Una vez le han otorgado una visa para viajar a los EUA?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "visa_otorgada"
        },
        {
          "label": "Tipo de visa",
          "type": "text",
          "required": false,
          "key": "tipo_visa"
        },
        {
          "label": "Fecha de cuando la visa fue emitida",
          "type": "date",
          "required": false,
          "key": "fecha_emision_visa"
        },
        {
          "label": "Fecha de vencimiento de la visa",
          "type": "date",
          "required": false,
          "key": "fecha_vencimiento_visa"
        },
        {
          "label": "Número de visa",
          "type": "text",
          "required": false,
          "key": "numero_visa"
        },
        {
          "label": "¿Está solicitando el mismo tipo de visa?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "solicita_mismo_tipo_visa"
        },
        {
          "label": "¿Está aplicando en el mismo país donde la visa le fue emitida y es su país de residencia principal?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "aplica_mismo_pais_residencia"
        },
        {
          "label": "¿Le han sacado huellas al momento de tramitar la visa?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "le_sacaron_huellas"
        },
        {
          "label": "¿Alguna vez perdió su visa o ha sido robada?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "visa_perdida_robada"
        },
        {
          "label": "Dónde",
          "type": "text",
          "required": false,
          "key": "visa_perdida_donde"
        },
        {
          "label": "Año del robo o extravío",
          "type": "text",
          "required": false,
          "key": "visa_perdida_anio"
        },
        {
          "label": "¿Hizo reporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hizo_reporte_visa_perdida"
        },
        {
          "label": "¿Alguna vez su visa ha sido cancelada o revocada?",
          "type": "textarea",
          "required": false,
          "key": "visa_cancelada_revocada"
        },
        {
          "label": "¿Alguna vez se le ha negado una visa de EE.UU.?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "visa_negada"
        },
        {
          "label": "Dónde y cuándo",
          "type": "text",
          "required": false,
          "key": "visa_negada_donde_cuando"
        },
        {
          "label": "¿Le entregaron una hoja explicando el motivo de denegación?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hoja_denegacion"
        },
        {
          "label": "¿Qué tamaño era?",
          "type": "text",
          "required": false,
          "key": "tamano_hoja_denegacion"
        },
        {
          "label": "Observaciones",
          "type": "textarea",
          "required": false,
          "key": "visa_observaciones"
        },
        {
          "label": "¿En su aplicación anterior mintió en su entrevista sobre alguna información importante?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "mintio_aplicacion_anterior"
        },
        {
          "label": "Explicación",
          "type": "textarea",
          "required": false,
          "key": "mintio_explicacion"
        },
        {
          "label": "¿Tiene algún trámite de visa activo actualmente?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tramite_visa_activo"
        },
        {
          "label": "¿Alguna vez le fue negada la admisión a EE.UU. o se le ha retirado su aplicación para admisión en el punto de entrada?",
          "type": "textarea",
          "required": false,
          "key": "negada_admision_eeuu"
        },
        {
          "label": "¿Alguna vez alguien metió una petición de inmigración por su parte con USCIS?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "peticion_inmigracion"
        },
        {
          "label": "Si su respuesta es afirmativa, ¿quién y para cuál tipo de petición?",
          "type": "textarea",
          "required": false,
          "key": "detalle_peticion_inmigracion"
        },
        {
          "label": "Y si fue rechazado, ¿por qué?",
          "type": "textarea",
          "required": false,
          "key": "peticion_rechazada_motivo"
        }
      ]
    },
    {
      "id": "ama_5",
      "label": "Dirección y teléfono",
      "fields": [
        {
          "label": "Calle",
          "type": "text",
          "required": false,
          "key": "calle"
        },
        {
          "label": "Código postal",
          "type": "text",
          "required": false,
          "key": "codigo_postal"
        },
        {
          "label": "Localidad",
          "type": "text",
          "required": false,
          "key": "localidad"
        },
        {
          "label": "Municipio",
          "type": "text",
          "required": false,
          "key": "municipio"
        },
        {
          "label": "Estado",
          "type": "text",
          "required": false,
          "key": "estado"
        },
        {
          "label": "País",
          "type": "text",
          "required": false,
          "key": "pais"
        },
        {
          "label": "Celular",
          "type": "text",
          "required": false,
          "key": "celular"
        },
        {
          "label": "¿Cuenta con redes sociales?",
          "type": "textarea",
          "required": false,
          "key": "redes_sociales"
        }
      ]
    },
    {
      "id": "ama_6",
      "label": "Pasaporte",
      "fields": [
        {
          "label": "¿Ha perdido su pasaporte o se lo han robado?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "pasaporte_perdido_robado"
        },
        {
          "label": "Fecha y año del extravío",
          "type": "text",
          "required": false,
          "key": "fecha_anio_extravio_pasaporte"
        },
        {
          "label": "¿Hizo reporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hizo_reporte_pasaporte"
        },
        {
          "label": "Lugar de emisión",
          "type": "text",
          "required": false,
          "key": "lugar_emision_pasaporte"
        }
      ]
    },
    {
      "id": "ama_7",
      "label": "Información familiar",
      "fields": [
        {
          "label": "Nombre completo de su padre",
          "type": "text",
          "required": false,
          "key": "padre_nombre_completo"
        },
        {
          "label": "¿Está vivo?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No",
            "No sabe"
          ],
          "key": "padre_esta_vivo"
        },
        {
          "label": "Fecha de nacimiento del padre",
          "type": "text",
          "required": false,
          "key": "padre_fecha_nacimiento"
        },
        {
          "label": "¿Su padre está en los EUA?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No",
            "No sabe"
          ],
          "key": "padre_en_eeuu"
        },
        {
          "label": "Estatus migratorio en Estados Unidos",
          "type": "text",
          "required": false,
          "key": "padre_estatus_migratorio"
        },
        {
          "label": "Observaciones del padre",
          "type": "textarea",
          "required": false,
          "key": "padre_observaciones"
        },
        {
          "label": "Nombre completo de su madre",
          "type": "text",
          "required": false,
          "key": "madre_nombre_completo"
        },
        {
          "label": "¿Está viva?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No",
            "No sabe"
          ],
          "key": "madre_esta_viva"
        },
        {
          "label": "Fecha de nacimiento de la madre",
          "type": "text",
          "required": false,
          "key": "madre_fecha_nacimiento"
        },
        {
          "label": "¿Su madre está en los EUA?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No",
            "No sabe"
          ],
          "key": "madre_en_eeuu"
        },
        {
          "label": "Estatus migratorio en Estados Unidos",
          "type": "text",
          "required": false,
          "key": "madre_estatus_migratorio"
        },
        {
          "label": "Observaciones de la madre",
          "type": "textarea",
          "required": false,
          "key": "madre_observaciones"
        },
        {
          "label": "¿Tiene otros familiares inmediatos en los EE.UU.?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "familiares_inmediatos_eeuu"
        },
        {
          "label": "¿Cuántos hijos tiene en su país de residencia?",
          "type": "text",
          "required": false,
          "key": "hijos_pais_residencia"
        },
        {
          "label": "Observaciones sobre hijos en país de residencia",
          "type": "textarea",
          "required": false,
          "key": "hijos_pais_residencia_observaciones"
        },
        {
          "label": "Detalle de familiares inmediatos en EE.UU. (apellidos, nombre, estatus, relación)",
          "type": "textarea",
          "required": false,
          "key": "familiares_inmediatos_detalle"
        },
        {
          "label": "¿Tuvo usted algún hijo en EE.UU.?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tuvo_hijo_eeuu"
        },
        {
          "label": "¿Tiene otros familiares en los EUA?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "otros_familiares_eeuu"
        }
      ]
    },
    {
      "id": "ama_8",
      "label": "Información de cónyuge",
      "fields": [
        {
          "label": "Nombre del esposo(a)",
          "type": "text",
          "required": false,
          "key": "conyuge_nombre"
        },
        {
          "label": "Fecha y lugar de nacimiento",
          "type": "text",
          "required": false,
          "key": "conyuge_fecha_lugar_nacimiento"
        },
        {
          "label": "¿Se ha divorciado?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "se_ha_divorciado"
        },
        {
          "label": "En caso de que sí, ¿cuántos divorcios lleva?",
          "type": "text",
          "required": false,
          "key": "numero_divorcios"
        },
        {
          "label": "Solo del último matrimonio: fechas de casamiento y divorcio",
          "type": "text",
          "required": false,
          "key": "ultimo_matrimonio_fechas"
        },
        {
          "label": "De",
          "type": "text",
          "required": false,
          "key": "ultimo_matrimonio_de"
        },
        {
          "label": "Hasta",
          "type": "text",
          "required": false,
          "key": "ultimo_matrimonio_hasta"
        },
        {
          "label": "¿Viven en el mismo domicilio?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "viven_mismo_domicilio"
        },
        {
          "label": "Domicilio",
          "type": "textarea",
          "required": false,
          "key": "conyuge_domicilio"
        }
      ]
    },
    {
      "id": "ama_9",
      "label": "Información de presente empleo / educación",
      "fields": [
        {
          "label": "Ocupación pasaporte",
          "type": "text",
          "required": false,
          "key": "ocupacion_pasaporte"
        },
        {
          "label": "¿Cuenta con empleo actualmente?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "cuenta_empleo_actualmente"
        },
        {
          "label": "Ocupación principal",
          "type": "text",
          "required": false,
          "key": "ocupacion_principal"
        },
        {
          "label": "Empleador",
          "type": "text",
          "required": false,
          "key": "empleador_actual"
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "empleo_direccion"
        },
        {
          "label": "Localidad",
          "type": "text",
          "required": false,
          "key": "empleo_localidad"
        },
        {
          "label": "Municipio",
          "type": "text",
          "required": false,
          "key": "empleo_municipio"
        },
        {
          "label": "Estado",
          "type": "text",
          "required": false,
          "key": "empleo_estado"
        },
        {
          "label": "País",
          "type": "text",
          "required": false,
          "key": "empleo_pais"
        },
        {
          "label": "Número de teléfono",
          "type": "text",
          "required": false,
          "key": "empleo_telefono"
        },
        {
          "label": "Sueldo mensual en la moneda local",
          "type": "text",
          "required": false,
          "key": "sueldo_mensual_moneda_local"
        },
        {
          "label": "Descripción breve de sus deberes",
          "type": "textarea",
          "required": false,
          "key": "descripcion_deberes"
        },
        {
          "label": "Traducción de la descripción",
          "type": "textarea",
          "required": false,
          "key": "traduccion_descripcion"
        },
        {
          "label": "¿Desde cuándo tiene ese empleo?",
          "type": "text",
          "required": false,
          "key": "desde_cuando_empleo"
        }
      ]
    },
    {
      "id": "ama_10",
      "label": "Empleo anterior",
      "fields": [
        {
          "label": "¿Anteriormente tuvo algún empleo?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tuvo_empleo_anterior"
        },
        {
          "label": "Ocupación anterior",
          "type": "text",
          "required": false,
          "key": "ocupacion_anterior"
        },
        {
          "label": "Empleador",
          "type": "text",
          "required": false,
          "key": "empleador_anterior"
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_direccion"
        },
        {
          "label": "Localidad",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_localidad"
        },
        {
          "label": "Municipio",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_municipio"
        },
        {
          "label": "Estado",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_estado"
        },
        {
          "label": "País",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_pais"
        },
        {
          "label": "Número de teléfono",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_telefono"
        },
        {
          "label": "Descripción breve de sus deberes",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_descripcion_deberes"
        },
        {
          "label": "Traducción de la descripción",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_traduccion_descripcion"
        },
        {
          "label": "¿Desde cuándo tuvo ese empleo?",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_periodo"
        }
      ]
    },
    {
      "id": "ama_11",
      "label": "Educación",
      "fields": [
        {
          "label": "Nivel educativo",
          "type": "text",
          "required": false,
          "key": "nivel_educativo"
        },
        {
          "label": "Nombre del lugar de estudio",
          "type": "text",
          "required": false,
          "key": "lugar_estudio_nombre"
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "lugar_estudio_direccion"
        },
        {
          "label": "Teléfono",
          "type": "text",
          "required": false,
          "key": "lugar_estudio_telefono"
        },
        {
          "label": "De",
          "type": "text",
          "required": false,
          "key": "estudio_de"
        },
        {
          "label": "A",
          "type": "text",
          "required": false,
          "key": "estudio_a"
        }
      ]
    },
    {
      "id": "ama_12",
      "label": "Viajes, traductor e idiomas",
      "fields": [
        {
          "label": "¿Ha viajado a algún otro país en los últimos 5 años?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "viajo_otro_pais_ultimos_5_anios"
        },
        {
          "label": "¿A dónde?",
          "type": "textarea",
          "required": false,
          "key": "paises_visitados_ultimos_5_anios"
        },
        {
          "label": "¿Necesita traductor?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "necesita_traductor"
        },
        {
          "label": "¿Qué idiomas habla?",
          "type": "text",
          "required": false,
          "key": "idiomas_habla"
        }
      ]
    },
    {
      "id": "ama_13",
      "label": "Relación y origen del contacto",
      "fields": [
        {
          "label": "¿Qué relación tiene con el aplicante?",
          "type": "text",
          "required": false,
          "key": "relacion_con_aplicante"
        },
        {
          "label": "¿De dónde nos conoció?",
          "type": "text",
          "required": false,
          "key": "de_donde_nos_conocio"
        },
        {
          "label": "Destino final del aplicante",
          "type": "textarea",
          "required": false,
          "key": "destino_final_aplicante"
        }
      ]
    },
    {
      "id": "ama_14",
      "label": "Observaciones generales",
      "fields": [
        {
          "label": "Observaciones generales del perfil",
          "type": "textarea",
          "required": false,
          "key": "observaciones_generales"
        }
      ]
    }
  ],
  "documentos_requeridos": [
    {
      "clave": "pasaporte",
      "nombre": "Pasaporte vigente",
      "obligatorio": true
    },
    {
      "clave": "acta_nacimiento",
      "nombre": "Acta o partida de nacimiento",
      "obligatorio": true
    },
    {
      "clave": "comprobante_domicilio",
      "nombre": "Comprobante de domicilio",
      "obligatorio": true
    },
    {
      "clave": "identificacion",
      "nombre": "Identificación oficial",
      "obligatorio": true
    },
    {
      "clave": "documentos_familiares",
      "nombre": "Documentos familiares",
      "obligatorio": false
    },
    {
      "clave": "documentos_laborales",
      "nombre": "Documentos laborales",
      "obligatorio": false
    },
    {
      "clave": "documento_adicional",
      "nombre": "Documento adicional",
      "obligatorio": false
    }
  ]
}$ama$::jsonb,NOW(),NOW()
FROM (VALUES (1,'costa_rica'),(2,'el_salvador'),(3,'guatemala'),(4,'honduras'),(5,'mexico'),(6,'panama')) AS t(id,nombre)
WHERE EXISTS (SELECT 1 FROM public.tipos_tramite WHERE id_tipo_tramite=t.id)
ON CONFLICT (clave) DO NOTHING;
COMMIT;
