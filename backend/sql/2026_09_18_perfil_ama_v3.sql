-- Revisar IDs de tipos_tramite contra el esquema real antes de ejecutar.
-- Sólo publica V3 para perfiles nuevos; no altera V2 ni perfiles históricos.
BEGIN;
DO $$ BEGIN
  IF (SELECT COUNT(*) FROM public.tipos_tramite WHERE id_tipo_tramite IN (1,2,3,4,5,6)) <> 6 THEN
    RAISE EXCEPTION 'Faltan tipos_tramite AMA esperados; revisar IDs antes de publicar V3';
  END IF;
END $$;
DO $check$ BEGIN
  IF EXISTS (
    SELECT 1 FROM public.perfil_plantillas p
    JOIN (VALUES (1,'costa_rica'),(2,'el_salvador'),(3,'guatemala'),(4,'honduras'),(5,'mexico'),(6,'panama')) AS t(id,nombre) ON p.clave = 'perfil_ama_'||t.nombre||'_v3'
    WHERE p.version IS DISTINCT FROM 3
       OR p.estructura_json IS DISTINCT FROM $ama${
  "schema_version": 2,
  "source": {
    "document": "Application Documentation Formularios.pdf",
    "audited_pages": "17-104",
    "audited_date": "2026-08-17"
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
          "key": "otra_nacionalidad_cual",
          "show_if": {
            "field": "otra_nacionalidad",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Tramitó pasaporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tramito_pasaporte",
          "show_if": {
            "field": "otra_nacionalidad",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "discapacidad_cual",
          "show_if": {
            "field": "discapacidad_o_enfermedad",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "ingreso_ilegal_documentos_falsos",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Fechas en las que ingresó a EE.UU.",
          "type": "textarea",
          "required": false,
          "key": "fechas_ingreso_eeuu",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "delito_cual",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Hubo sentencia?",
          "type": "text",
          "required": false,
          "key": "hubo_sentencia",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Cuánto tiempo?",
          "type": "text",
          "required": false,
          "key": "sentencia_tiempo",
          "show_if": {
            "field": "hubo_sentencia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Dónde?",
          "type": "text",
          "required": false,
          "key": "sentencia_donde",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Cuándo?",
          "type": "text",
          "required": false,
          "key": "sentencia_cuando",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Explicación",
          "type": "textarea",
          "required": false,
          "key": "explicacion_viajes_anteriores",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Alguna vez fue deportado de manera voluntaria o involuntaria?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "deportado_voluntaria_involuntariamente",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "En caso de una deportación voluntaria, ¿pagó los costos de su deportación?",
          "type": "text",
          "required": false,
          "key": "pago_costos_deportacion",
          "show_if": {
            "field": "deportado_voluntaria_involuntariamente",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "tipo_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Fecha de cuando la visa fue emitida",
          "type": "date",
          "required": false,
          "key": "fecha_emision_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Fecha de vencimiento de la visa",
          "type": "date",
          "required": false,
          "key": "fecha_vencimiento_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Número de visa",
          "type": "text",
          "required": false,
          "key": "numero_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Está solicitando el mismo tipo de visa?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "solicita_mismo_tipo_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Está aplicando en el mismo país donde la visa le fue emitida y es su país de residencia principal?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "aplica_mismo_pais_residencia",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Le han sacado huellas al momento de tramitar la visa?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "le_sacaron_huellas",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Alguna vez perdió su visa o ha sido robada?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "visa_perdida_robada",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Dónde",
          "type": "text",
          "required": false,
          "key": "visa_perdida_donde",
          "show_if": {
            "field": "visa_perdida_robada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Año del robo o extravío",
          "type": "text",
          "required": false,
          "key": "visa_perdida_anio",
          "show_if": {
            "field": "visa_perdida_robada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Hizo reporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hizo_reporte_visa_perdida",
          "show_if": {
            "field": "visa_perdida_robada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Alguna vez su visa ha sido cancelada o revocada?",
          "type": "textarea",
          "required": false,
          "key": "visa_cancelada_revocada",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "visa_negada_donde_cuando",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "key": "visa_negada_fecha",
          "label": "¿Cuándo le fue negada su visa?",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Le entregaron una hoja explicando el motivo de denegación?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hoja_denegacion",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Qué tamaño era?",
          "type": "text",
          "required": false,
          "key": "tamano_hoja_denegacion",
          "show_if": {
            "field": "hoja_denegacion",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones",
          "type": "textarea",
          "required": false,
          "key": "visa_observaciones",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿En su aplicación anterior mintió en su entrevista sobre alguna información importante?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "mintio_aplicacion_anterior",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Explicación",
          "type": "textarea",
          "required": false,
          "key": "mintio_explicacion",
          "show_if": {
            "field": "mintio_aplicacion_anterior",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "detalle_peticion_inmigracion",
          "show_if": {
            "field": "peticion_inmigracion",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Y si fue rechazado, ¿por qué?",
          "type": "textarea",
          "required": false,
          "key": "peticion_rechazada_motivo",
          "show_if": {
            "field": "peticion_inmigracion",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "fecha_anio_extravio_pasaporte",
          "show_if": {
            "field": "pasaporte_perdido_robado",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Hizo reporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hizo_reporte_pasaporte",
          "show_if": {
            "field": "pasaporte_perdido_robado",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "padre_en_eeuu",
          "show_if": {
            "field": "padre_esta_vivo",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Estatus migratorio en Estados Unidos",
          "type": "text",
          "required": false,
          "key": "padre_estatus_migratorio",
          "show_if": {
            "field": "padre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones del padre",
          "type": "textarea",
          "required": false,
          "key": "padre_observaciones",
          "show_if": {
            "field": "padre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "madre_en_eeuu",
          "show_if": {
            "field": "madre_esta_viva",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Estatus migratorio en Estados Unidos",
          "type": "text",
          "required": false,
          "key": "madre_estatus_migratorio",
          "show_if": {
            "field": "madre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones de la madre",
          "type": "textarea",
          "required": false,
          "key": "madre_observaciones",
          "show_if": {
            "field": "madre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Tienes familiares directos en Estados Unidos?",
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
          "type": "textarea",
          "required": false,
          "key": "hijos_pais_residencia",
          "show_if": {
            "field": "familiares_inmediatos_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones sobre hijos en país de residencia",
          "type": "textarea",
          "required": false,
          "key": "hijos_pais_residencia_observaciones",
          "show_if": {
            "field": "familiares_inmediatos_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Detalle libre de familiares (dato legado)",
          "type": "textarea",
          "required": false,
          "key": "familiares_inmediatos_detalle"
        },
        {
          "key": "familiares_eeuu",
          "label": "Familiares en Estados Unidos",
          "type": "repeater",
          "required": false,
          "show_if": {
            "field": "familiares_inmediatos_eeuu",
            "operator": "eq",
            "value": "Sí"
          },
          "fields": [
            {
              "key": "apellidos",
              "label": "Apellidos",
              "type": "text",
              "required": false
            },
            {
              "key": "nombre",
              "label": "Nombre",
              "type": "text",
              "required": false
            },
            {
              "key": "estatus",
              "label": "Estatus en EUA",
              "type": "text",
              "required": false
            },
            {
              "key": "relacion",
              "label": "Relación",
              "type": "text",
              "required": false
            },
            {
              "key": "edad_ingreso_eeuu",
              "label": "Edad a la que ingresó a EUA",
              "type": "text",
              "required": false
            }
          ]
        },
        {
          "label": "¿Tuvo usted algún hijo en EE.UU.?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tuvo_hijo_eeuu",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "key": "explicacion_hospital_hijo_eeuu",
          "label": "Explicación (tipo de hospital y fecha)",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "tuvo_hijo_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "conyuge_nombre",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "Fecha y lugar de nacimiento",
          "type": "text",
          "required": false,
          "key": "conyuge_fecha_lugar_nacimiento",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "key": "conyuge_lugar_nacimiento",
          "label": "Lugar de nacimiento del cónyuge",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "¿Se ha divorciado?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "se_ha_divorciado",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "En caso de que sí, ¿cuántos divorcios lleva?",
          "type": "text",
          "required": false,
          "key": "numero_divorcios",
          "show_if": {
            "field": "se_ha_divorciado",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "ultimo_matrimonio_de",
          "show_if": {
            "field": "se_ha_divorciado",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Hasta",
          "type": "text",
          "required": false,
          "key": "ultimo_matrimonio_hasta",
          "show_if": {
            "field": "se_ha_divorciado",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Viven en el mismo domicilio?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "viven_mismo_domicilio",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "Domicilio",
          "type": "textarea",
          "required": false,
          "key": "conyuge_domicilio",
          "show_if": {
            "field": "viven_mismo_domicilio",
            "operator": "eq",
            "value": "No"
          }
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
          "key": "ocupacion_principal",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Empleador",
          "type": "text",
          "required": false,
          "key": "empleador_actual",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "empleo_direccion",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "empleo_telefono",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Sueldo mensual en la moneda local",
          "type": "text",
          "required": false,
          "key": "sueldo_mensual_moneda_local",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Descripción breve de sus deberes",
          "type": "textarea",
          "required": false,
          "key": "descripcion_deberes",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Traducción de la descripción",
          "type": "textarea",
          "required": false,
          "key": "traduccion_descripcion",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Desde cuándo tiene ese empleo?",
          "type": "text",
          "required": false,
          "key": "desde_cuando_empleo",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "ocupacion_anterior",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Empleador",
          "type": "text",
          "required": false,
          "key": "empleador_anterior",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_direccion",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Localidad",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_localidad",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Municipio",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_municipio",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Estado",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_estado",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "País",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_pais",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Número de teléfono",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_telefono",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Descripción breve de sus deberes",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_descripcion_deberes",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Traducción de la descripción",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_traduccion_descripcion",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Desde cuándo tuvo ese empleo?",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_periodo",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "key": "empleo_anterior_fin",
          "label": "Fecha de finalización del empleo anterior",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        }
      ]
    },
    {
      "id": "ama_11",
      "label": "Educación",
      "fields": [
        {
          "label": "Nivel educativo",
          "type": "select",
          "required": false,
          "key": "nivel_educativo",
          "options": [
            "PRIMARIA",
            "SECUANDARIA",
            "PREPARATORIA/BACHILLERATO",
            "LICENCIATURA",
            "MAESTRIA",
            "DOCTORADO",
            "SIN ESTUDIOS"
          ]
        },
        {
          "label": "Nombre del lugar de estudio",
          "type": "text",
          "required": false,
          "key": "lugar_estudio_nombre",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "lugar_estudio_direccion",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "Teléfono",
          "type": "text",
          "required": false,
          "key": "lugar_estudio_telefono",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "De",
          "type": "text",
          "required": false,
          "key": "estudio_de",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "A",
          "type": "text",
          "required": false,
          "key": "estudio_a",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
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
          "key": "paises_visitados_ultimos_5_anios",
          "show_if": {
            "field": "viajo_otro_pais_ultimos_5_anios",
            "operator": "eq",
            "value": "Sí"
          }
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
}$ama$::jsonb
       OR p.id_tipo_tramite IS DISTINCT FROM t.id
       OR p.id_pais IS NOT NULL
       OR p.activo IS DISTINCT FROM true
  ) THEN
    RAISE EXCEPTION 'Existe una clave AMA V3 con contenido diferente; revisar sin sobrescribir';
  END IF;
END $check$;
INSERT INTO public.perfil_plantillas
  (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
SELECT 'Perfil AMA '||t.nombre||' V3','perfil_ama_'||t.nombre||'_v3',3,true,t.id,NULL,
$ama${
  "schema_version": 2,
  "source": {
    "document": "Application Documentation Formularios.pdf",
    "audited_pages": "17-104",
    "audited_date": "2026-08-17"
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
          "key": "otra_nacionalidad_cual",
          "show_if": {
            "field": "otra_nacionalidad",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Tramitó pasaporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tramito_pasaporte",
          "show_if": {
            "field": "otra_nacionalidad",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "discapacidad_cual",
          "show_if": {
            "field": "discapacidad_o_enfermedad",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "ingreso_ilegal_documentos_falsos",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Fechas en las que ingresó a EE.UU.",
          "type": "textarea",
          "required": false,
          "key": "fechas_ingreso_eeuu",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "delito_cual",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Hubo sentencia?",
          "type": "text",
          "required": false,
          "key": "hubo_sentencia",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Cuánto tiempo?",
          "type": "text",
          "required": false,
          "key": "sentencia_tiempo",
          "show_if": {
            "field": "hubo_sentencia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Dónde?",
          "type": "text",
          "required": false,
          "key": "sentencia_donde",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Cuándo?",
          "type": "text",
          "required": false,
          "key": "sentencia_cuando",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Explicación",
          "type": "textarea",
          "required": false,
          "key": "explicacion_viajes_anteriores",
          "show_if": {
            "field": "acto_ilicito_felonia",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Alguna vez fue deportado de manera voluntaria o involuntaria?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "deportado_voluntaria_involuntariamente",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "En caso de una deportación voluntaria, ¿pagó los costos de su deportación?",
          "type": "text",
          "required": false,
          "key": "pago_costos_deportacion",
          "show_if": {
            "field": "deportado_voluntaria_involuntariamente",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "tipo_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Fecha de cuando la visa fue emitida",
          "type": "date",
          "required": false,
          "key": "fecha_emision_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Fecha de vencimiento de la visa",
          "type": "date",
          "required": false,
          "key": "fecha_vencimiento_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Número de visa",
          "type": "text",
          "required": false,
          "key": "numero_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Está solicitando el mismo tipo de visa?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "solicita_mismo_tipo_visa",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Está aplicando en el mismo país donde la visa le fue emitida y es su país de residencia principal?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "aplica_mismo_pais_residencia",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Le han sacado huellas al momento de tramitar la visa?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "le_sacaron_huellas",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Alguna vez perdió su visa o ha sido robada?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "visa_perdida_robada",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Dónde",
          "type": "text",
          "required": false,
          "key": "visa_perdida_donde",
          "show_if": {
            "field": "visa_perdida_robada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Año del robo o extravío",
          "type": "text",
          "required": false,
          "key": "visa_perdida_anio",
          "show_if": {
            "field": "visa_perdida_robada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Hizo reporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hizo_reporte_visa_perdida",
          "show_if": {
            "field": "visa_perdida_robada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Alguna vez su visa ha sido cancelada o revocada?",
          "type": "textarea",
          "required": false,
          "key": "visa_cancelada_revocada",
          "show_if": {
            "field": "visa_otorgada",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "visa_negada_donde_cuando",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "key": "visa_negada_fecha",
          "label": "¿Cuándo le fue negada su visa?",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Le entregaron una hoja explicando el motivo de denegación?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hoja_denegacion",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Qué tamaño era?",
          "type": "text",
          "required": false,
          "key": "tamano_hoja_denegacion",
          "show_if": {
            "field": "hoja_denegacion",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones",
          "type": "textarea",
          "required": false,
          "key": "visa_observaciones",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿En su aplicación anterior mintió en su entrevista sobre alguna información importante?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "mintio_aplicacion_anterior",
          "show_if": {
            "field": "visa_negada",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Explicación",
          "type": "textarea",
          "required": false,
          "key": "mintio_explicacion",
          "show_if": {
            "field": "mintio_aplicacion_anterior",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "detalle_peticion_inmigracion",
          "show_if": {
            "field": "peticion_inmigracion",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Y si fue rechazado, ¿por qué?",
          "type": "textarea",
          "required": false,
          "key": "peticion_rechazada_motivo",
          "show_if": {
            "field": "peticion_inmigracion",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "fecha_anio_extravio_pasaporte",
          "show_if": {
            "field": "pasaporte_perdido_robado",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Hizo reporte?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "hizo_reporte_pasaporte",
          "show_if": {
            "field": "pasaporte_perdido_robado",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "padre_en_eeuu",
          "show_if": {
            "field": "padre_esta_vivo",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Estatus migratorio en Estados Unidos",
          "type": "text",
          "required": false,
          "key": "padre_estatus_migratorio",
          "show_if": {
            "field": "padre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones del padre",
          "type": "textarea",
          "required": false,
          "key": "padre_observaciones",
          "show_if": {
            "field": "padre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "madre_en_eeuu",
          "show_if": {
            "field": "madre_esta_viva",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Estatus migratorio en Estados Unidos",
          "type": "text",
          "required": false,
          "key": "madre_estatus_migratorio",
          "show_if": {
            "field": "madre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones de la madre",
          "type": "textarea",
          "required": false,
          "key": "madre_observaciones",
          "show_if": {
            "field": "madre_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Tienes familiares directos en Estados Unidos?",
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
          "type": "textarea",
          "required": false,
          "key": "hijos_pais_residencia",
          "show_if": {
            "field": "familiares_inmediatos_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Observaciones sobre hijos en país de residencia",
          "type": "textarea",
          "required": false,
          "key": "hijos_pais_residencia_observaciones",
          "show_if": {
            "field": "familiares_inmediatos_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Detalle libre de familiares (dato legado)",
          "type": "textarea",
          "required": false,
          "key": "familiares_inmediatos_detalle"
        },
        {
          "key": "familiares_eeuu",
          "label": "Familiares en Estados Unidos",
          "type": "repeater",
          "required": false,
          "show_if": {
            "field": "familiares_inmediatos_eeuu",
            "operator": "eq",
            "value": "Sí"
          },
          "fields": [
            {
              "key": "apellidos",
              "label": "Apellidos",
              "type": "text",
              "required": false
            },
            {
              "key": "nombre",
              "label": "Nombre",
              "type": "text",
              "required": false
            },
            {
              "key": "estatus",
              "label": "Estatus en EUA",
              "type": "text",
              "required": false
            },
            {
              "key": "relacion",
              "label": "Relación",
              "type": "text",
              "required": false
            },
            {
              "key": "edad_ingreso_eeuu",
              "label": "Edad a la que ingresó a EUA",
              "type": "text",
              "required": false
            }
          ]
        },
        {
          "label": "¿Tuvo usted algún hijo en EE.UU.?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "tuvo_hijo_eeuu",
          "show_if": {
            "field": "ha_estado_en_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "key": "explicacion_hospital_hijo_eeuu",
          "label": "Explicación (tipo de hospital y fecha)",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "tuvo_hijo_eeuu",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "conyuge_nombre",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "Fecha y lugar de nacimiento",
          "type": "text",
          "required": false,
          "key": "conyuge_fecha_lugar_nacimiento",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "key": "conyuge_lugar_nacimiento",
          "label": "Lugar de nacimiento del cónyuge",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "¿Se ha divorciado?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "se_ha_divorciado",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "En caso de que sí, ¿cuántos divorcios lleva?",
          "type": "text",
          "required": false,
          "key": "numero_divorcios",
          "show_if": {
            "field": "se_ha_divorciado",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "ultimo_matrimonio_de",
          "show_if": {
            "field": "se_ha_divorciado",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Hasta",
          "type": "text",
          "required": false,
          "key": "ultimo_matrimonio_hasta",
          "show_if": {
            "field": "se_ha_divorciado",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Viven en el mismo domicilio?",
          "type": "select",
          "required": false,
          "options": [
            "Sí",
            "No"
          ],
          "key": "viven_mismo_domicilio",
          "show_if": {
            "field": "estado_civil",
            "operator": "neq",
            "value": "Soltero/a"
          }
        },
        {
          "label": "Domicilio",
          "type": "textarea",
          "required": false,
          "key": "conyuge_domicilio",
          "show_if": {
            "field": "viven_mismo_domicilio",
            "operator": "eq",
            "value": "No"
          }
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
          "key": "ocupacion_principal",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Empleador",
          "type": "text",
          "required": false,
          "key": "empleador_actual",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "empleo_direccion",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "empleo_telefono",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Sueldo mensual en la moneda local",
          "type": "text",
          "required": false,
          "key": "sueldo_mensual_moneda_local",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Descripción breve de sus deberes",
          "type": "textarea",
          "required": false,
          "key": "descripcion_deberes",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Traducción de la descripción",
          "type": "textarea",
          "required": false,
          "key": "traduccion_descripcion",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Desde cuándo tiene ese empleo?",
          "type": "text",
          "required": false,
          "key": "desde_cuando_empleo",
          "show_if": {
            "field": "cuenta_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          }
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
          "key": "ocupacion_anterior",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Empleador",
          "type": "text",
          "required": false,
          "key": "empleador_anterior",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_direccion",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Localidad",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_localidad",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Municipio",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_municipio",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Estado",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_estado",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "País",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_pais",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Número de teléfono",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_telefono",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Descripción breve de sus deberes",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_descripcion_deberes",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "Traducción de la descripción",
          "type": "textarea",
          "required": false,
          "key": "empleo_anterior_traduccion_descripcion",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "label": "¿Desde cuándo tuvo ese empleo?",
          "type": "text",
          "required": false,
          "key": "empleo_anterior_periodo",
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        },
        {
          "key": "empleo_anterior_fin",
          "label": "Fecha de finalización del empleo anterior",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "tuvo_empleo_anterior",
            "operator": "eq",
            "value": "Sí"
          }
        }
      ]
    },
    {
      "id": "ama_11",
      "label": "Educación",
      "fields": [
        {
          "label": "Nivel educativo",
          "type": "select",
          "required": false,
          "key": "nivel_educativo",
          "options": [
            "PRIMARIA",
            "SECUANDARIA",
            "PREPARATORIA/BACHILLERATO",
            "LICENCIATURA",
            "MAESTRIA",
            "DOCTORADO",
            "SIN ESTUDIOS"
          ]
        },
        {
          "label": "Nombre del lugar de estudio",
          "type": "text",
          "required": false,
          "key": "lugar_estudio_nombre",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "Dirección",
          "type": "textarea",
          "required": false,
          "key": "lugar_estudio_direccion",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "Teléfono",
          "type": "text",
          "required": false,
          "key": "lugar_estudio_telefono",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "De",
          "type": "text",
          "required": false,
          "key": "estudio_de",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
        },
        {
          "label": "A",
          "type": "text",
          "required": false,
          "key": "estudio_a",
          "show_if": {
            "field": "nivel_educativo",
            "operator": "in",
            "value": [
              "SECUANDARIA",
              "PREPARATORIA/BACHILLERATO",
              "LICENCIATURA",
              "MAESTRIA",
              "DOCTORADO"
            ]
          }
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
          "key": "paises_visitados_ultimos_5_anios",
          "show_if": {
            "field": "viajo_otro_pais_ultimos_5_anios",
            "operator": "eq",
            "value": "Sí"
          }
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
ON CONFLICT (clave) DO NOTHING;
COMMIT;
