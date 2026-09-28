-- Source for id_tipo_tramite=20: scripts/seed-perfil-visa-individual-v2.js.
-- Verify this mapping against the real catalog before executing this file.
-- V3 is for new profiles; V2 and existing profile links remain untouched.
BEGIN;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tipos_tramite WHERE id_tipo_tramite=20 AND activo=true) THEN
    RAISE EXCEPTION 'Visa Individual tipo_tramite 20 is absent or inactive';
  END IF;
END $$;
DO $check$ BEGIN
  IF EXISTS (
    SELECT 1 FROM public.perfil_plantillas p WHERE p.clave='perfil_visa_individual_v3'
      AND (p.version IS DISTINCT FROM 3
        OR p.id_tipo_tramite IS DISTINCT FROM 20
        OR p.id_pais IS NOT NULL
        OR p.activo IS DISTINCT FROM true
        OR p.estructura_json IS DISTINCT FROM $visa${
  "schema_version": 2,
  "source": {
    "document": "docs/appsheet/Application Documentation Visas inv.pdf",
    "table": "PERFIL VISA INDIVIDUAL",
    "related_tables": [
      "FAMILIARES EN EEUU",
      "REDES SOCIALES",
      "INGRESOS A ESTADOS UNIDOS"
    ],
    "audited_pages": {
      "perfil": "266-390",
      "familiares": "159-164",
      "redes": "399-403",
      "ingresos": "404-408"
    },
    "audited_date": "2026-08-17",
    "rules_audit": "docs/perfiles/visa-individual-appsheet-matriz-2026-09-18.md"
  },
  "activation": {
    "strategy": "highest_active_template_version_for_tipo_tramite",
    "applies_to": "new_profiles_only",
    "preserves_existing_profiles": true
  },
  "canonical_information": [
    {
      "source": "clientes.nombre_completo",
      "label": "Nombre del aplicante"
    },
    {
      "source": "clientes.fecha_nacimiento",
      "label": "Fecha de nacimiento"
    },
    {
      "source": "clientes.telefono",
      "label": "Teléfono del aplicante"
    },
    {
      "source": "clientes.correo",
      "label": "Correo del aplicante"
    },
    {
      "source": "clientes.pais",
      "label": "País del aplicante"
    },
    {
      "source": "clientes.direccion",
      "label": "Domicilio registrado"
    }
  ],
  "sections": [
    {
      "id": "informacion_general",
      "label": "Información general",
      "fields": [
        {
          "key": "ha_usado_otro_nombre_o_lo_ha_modificado",
          "label": "¿Ha usado otro nombre o lo ha modificado?",
          "type": "boolean",
          "source_column": "ha_usado_otro_nombre_o_lo_ha_modificado",
          "required": false
        },
        {
          "key": "cual_fue_su_otro_nombre",
          "label": "¿Cuál fue su otro nombre?",
          "type": "text",
          "source_column": "cual_fue_su_otro_nombre",
          "show_if": {
            "field": "ha_usado_otro_nombre_o_lo_ha_modificado",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "estado_civil",
          "label": "Estado civil",
          "type": "select",
          "source_column": "estado_civil",
          "required": false,
          "options": [
            "Casado",
            "Soltero",
            "Viudo",
            "Divorciado",
            "Legalmente separado",
            "Unión libre"
          ]
        },
        {
          "key": "tiene_alguna_otra_nacionalidad",
          "label": "¿Tiene alguna otra nacionalidad?",
          "type": "boolean",
          "source_column": "tiene_alguna_otra_nacionalidad",
          "required": false
        },
        {
          "key": "cual_es_su_otra_nacionalidad",
          "label": "¿Cuál es su otra nacionalidad?",
          "type": "text",
          "source_column": "cual_es_su_otra_nacionalidad",
          "show_if": {
            "field": "tiene_alguna_otra_nacionalidad",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tiene_alguna_discapacidad",
          "label": "¿Tiene alguna discapacidad?",
          "type": "boolean",
          "source_column": "tiene_alguna_discapacidad",
          "required": false
        },
        {
          "key": "cual_es_su_discapacidad",
          "label": "¿Cuál es su discapacidad?",
          "type": "text",
          "source_column": "cual_es_su_discapacidad",
          "show_if": {
            "field": "tiene_alguna_discapacidad",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "datos_viaje",
      "label": "Datos del viaje",
      "fields": [
        {
          "key": "fecha_tentativa_de_llegada",
          "label": "Fecha tentativa de viaje",
          "type": "text",
          "source_column": "fecha_tentativa_de_llegada",
          "required": false
        },
        {
          "key": "duracion",
          "label": "Duración",
          "type": "text",
          "source_column": "duracion",
          "required": false
        },
        {
          "key": "cual_es_el_motivo_de_su_viaje",
          "label": "¿Cuál es el motivo de su viaje?",
          "type": "text",
          "source_column": "cual_es_el_motivo_de_su_viaje",
          "required": false
        },
        {
          "key": "domicilio_donde_va_a_llegar_a_estados_unidos",
          "label": "Domicilio donde llegará en Estados Unidos",
          "type": "text",
          "source_column": "domicilio_donde_va_a_llegar_a_estados_unidos",
          "required": false
        },
        {
          "key": "parentesco",
          "label": "Parentesco",
          "type": "text",
          "source_column": "parentesco",
          "required": false
        },
        {
          "key": "con_quienes_viaja_a_estados_unidos_y_cual_es_su_parentesco",
          "label": "¿Con quiénes viajará y cuál es su parentesco?",
          "type": "textarea",
          "source_column": "con_quienes_viaja_a_estados_unidos_y_cual_es_su_parentesco",
          "required": false
        }
      ]
    },
    {
      "id": "pagador_viaje",
      "label": "Pagador del viaje",
      "fields": [
        {
          "key": "usted_pagara_por_su_viaje",
          "label": "¿Usted pagará por su viaje?",
          "type": "boolean",
          "source_column": "usted_pagara_por_su_viaje",
          "required": false
        },
        {
          "key": "quien_pagaria_su_viaje",
          "label": "Nombre de quien pagará su viaje",
          "type": "text",
          "source_column": "quien_pagaria_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_de_quien_pagaria_por_su_viaje",
          "label": "Número de teléfono",
          "type": "text",
          "source_column": "numero_de_telefono_de_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "correo_electronico_quien_pagaria_por_su_viaje",
          "label": "Correo electrónico",
          "type": "email",
          "source_column": "correo_electronico_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "parentesco_quien_pagaria_por_su_viaje",
          "label": "Parentesco",
          "type": "text",
          "source_column": "parentesco_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "domicilio_quien_pagaria_por_su_viaje",
          "label": "Domicilio",
          "type": "text",
          "source_column": "domicilio_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        }
      ]
    },
    {
      "id": "entradas_eeuu",
      "label": "Entradas y viajes anteriores a EE. UU.",
      "fields": [
        {
          "key": "ha_entrado_a_estados_unidos",
          "label": "¿Ha entrado o intentado entrar a Estados Unidos?",
          "type": "boolean",
          "source_column": "ha_entrado_a_estados_unidos",
          "required": false
        },
        {
          "key": "ingresos_estados_unidos",
          "label": "Fechas de ingreso a Estados Unidos",
          "type": "repeater",
          "source_column": "ingresos_estados_unidos",
          "show_if": {
            "field": "ha_entrado_a_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "source_table": "INGRESOS A ESTADOS UNIDOS",
          "fields": [
            {
              "key": "fecha_ingreso",
              "label": "Fecha de ingreso",
              "type": "text",
              "source_column": "feha_ingreso",
              "required": false
            },
            {
              "key": "duracion",
              "label": "Cantidad",
              "type": "number",
              "source_column": "duracion",
              "required": false
            },
            {
              "key": "tiempo",
              "label": "Tiempo",
              "type": "select",
              "source_column": "tiempo",
              "required": false,
              "options": [
                "Días",
                "Semanas",
                "Meses",
                "Años",
                "Menos de 24 horas"
              ]
            }
          ],
          "required": false
        },
        {
          "key": "entro_de_manera_ilegal_o_con_documentos_falsos",
          "label": "¿Ingresó o intentó ingresar de manera ilegal o con documentos falsos? Explique.",
          "type": "text",
          "source_column": "entro_de_manera_ilegal_o_con_documentos_falsos",
          "show_if": {
            "field": "ha_entrado_a_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria",
          "label": "¿Alguna vez le han deportado de manera voluntaria o involuntaria?",
          "type": "boolean",
          "source_column": "alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria",
          "show_if": {
            "field": "ha_entrado_a_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "pago_por_los_costos_de_su_deportacion_explique",
          "label": "¿Pagó los costos de la deportación? Explique.",
          "type": "text",
          "source_column": "pago_por_los_costos_de_su_deportacion_explique",
          "show_if": {
            "field": "alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "peticiones_migratorias",
      "label": "Peticiones migratorias",
      "fields": [
        {
          "key": "alguna_vez_alguien_metio_una_peticion_de_migracion",
          "label": "¿Alguna vez alguien presentó una petición de inmigración por usted?",
          "type": "boolean",
          "source_column": "alguna_vez_alguien_metio_una_peticion_de_migracion",
          "required": false
        },
        {
          "key": "quien_y_para_que_tipo_de_peticion",
          "label": "¿Quién y para qué tipo de petición?",
          "type": "text",
          "source_column": "quien_y_para_que_tipo_de_peticion",
          "show_if": {
            "field": "alguna_vez_alguien_metio_una_peticion_de_migracion",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "por_que_fue_rechazada",
          "label": "¿Por qué fue rechazada?",
          "type": "text",
          "source_column": "por_que_fue_rechazada",
          "show_if": {
            "field": "alguna_vez_alguien_metio_una_peticion_de_migracion",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "delitos_sentencias",
      "label": "Delitos y sentencias",
      "fields": [
        {
          "key": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
          "label": "¿En el pasado ha cometido un acto ilícito o felonía en EE. UU. o en su país de origen?",
          "type": "boolean",
          "source_column": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
          "required": false
        },
        {
          "key": "cual_fue_el_delito",
          "label": "¿Cuál fue el delito?",
          "type": "text",
          "source_column": "cual_fue_el_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "hubo_sentencia",
          "label": "¿Tuvo una sentencia?",
          "type": "boolean",
          "source_column": "hubo_sentencia",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "por_cuanto_tiempo_fue_la_sentencia",
          "label": "¿Por cuánto tiempo fue la sentencia?",
          "type": "text",
          "source_column": "por_cuanto_tiempo_fue_la_sentencia",
          "show_if": {
            "field": "hubo_sentencia",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "donde_fue_el_delito",
          "label": "¿Dónde fue el delito?",
          "type": "text",
          "source_column": "donde_fue_el_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "cuando_fue_su_delito",
          "label": "¿Cuándo fue el delito?",
          "type": "text",
          "source_column": "cuando_fue_su_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "explique_su_delito",
          "label": "Explique el delito",
          "type": "textarea",
          "source_column": "explique_su_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "visa_anterior",
      "label": "Visa anterior",
      "fields": [
        {
          "key": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
          "label": "¿Alguna vez le han otorgado visa para viajar a Estados Unidos?",
          "type": "boolean",
          "source_column": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
          "required": false
        },
        {
          "key": "fecha_de_emision",
          "label": "Fecha de emisión",
          "type": "text",
          "source_column": "fecha_de_emision",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_de_vencimiento",
          "label": "Fecha de vencimiento",
          "type": "text",
          "source_column": "fecha_de_vencimiento",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tipo_de_visa",
          "label": "Tipo de visa",
          "type": "text",
          "source_column": "tipo_de_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_visa",
          "label": "Número de visa",
          "type": "text",
          "source_column": "numero_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "en_que_consulado_fue",
          "label": "Consulado",
          "type": "text",
          "source_column": "en_que_consulado_fue",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "esta_solicitando_el_mismo_tipo_de_visa",
          "label": "¿Está solicitando el mismo tipo de visa?",
          "type": "boolean",
          "source_column": "esta_solicitando_el_mismo_tipo_de_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "esta_aplicando_en_el_mismo_pais_donde_la_visa_fue_emitida_y_en_su_pais_de_residencia_principal",
          "label": "¿Está aplicando en el mismo país donde la visa fue emitida y es su residencia principal?",
          "type": "boolean",
          "source_column": "esta_aplicando_en_el_mismo_pais_donde_la_visa_fue_emitida_y_en_su_pais_de_residencia_principal",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "le_han_sacado_huellas_al_momento_de_tramitar_su_visa",
          "label": "¿Le sacaron huellas en su visa anterior?",
          "type": "boolean",
          "source_column": "le_han_sacado_huellas_al_momento_de_tramitar_su_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
          "label": "¿Alguna vez perdió su visa o fue robada?",
          "type": "boolean",
          "source_column": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "donde_fue_robada",
          "label": "¿Dónde fue robada?",
          "type": "text",
          "source_column": "donde_fue_robada",
          "show_if": {
            "field": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "ano_del_robo_o_extravio",
          "label": "Año del robo o extravío",
          "type": "text",
          "source_column": "ano_del_robo_o_extravio",
          "show_if": {
            "field": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "explicacion_perdida_visa",
          "label": "Explique la pérdida o robo",
          "type": "textarea",
          "source_column": "explicacion_perdida_visa",
          "show_if": {
            "field": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "alguna_vez_su_visa_ha_sido_cancelada_o_revocada_explique",
          "label": "¿Alguna vez su visa fue cancelada o revocada? Explique.",
          "type": "text",
          "source_column": "alguna_vez_su_visa_ha_sido_cancelada_o_revocada_explique",
          "required": false
        },
        {
          "key": "alguna_vez_le_fue_negada_la_admision_a_los_eua_o_se_le_ha_retirado_su_aplicacion_para_admision_en_el_punto_de_entrada_explique",
          "label": "¿Alguna vez le negaron la entrada a EE. UU. o retiró su solicitud de admisión? Explique.",
          "type": "text",
          "source_column": "alguna_vez_le_fue_negada_la_admision_a_los_eua_o_se_le_ha_retirado_su_aplicacion_para_admision_en_el_punto_de_entrada_explique",
          "required": false
        }
      ]
    },
    {
      "id": "visa_negada",
      "label": "Visa negada",
      "fields": [
        {
          "key": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
          "label": "¿Alguna vez le negaron una visa de EE. UU.?",
          "type": "boolean",
          "source_column": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
          "required": false
        },
        {
          "key": "donde_le_fue_negada_su_visa",
          "label": "¿Dónde le fue negada?",
          "type": "text",
          "source_column": "donde_le_fue_negada_su_visa",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "cuando_le_fue_negada_su_visa",
          "label": "¿Cuándo le fue negada?",
          "type": "text",
          "source_column": "cuando_le_fue_negada_su_visa",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "observaciones",
          "label": "Observaciones",
          "type": "text",
          "source_column": "observaciones",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante",
          "label": "¿En la aplicación anterior mintió sobre información importante?",
          "type": "boolean",
          "source_column": "en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "explique_cual_fue_esa_informacion",
          "label": "Explique cuál fue esa información",
          "type": "text",
          "source_column": "explique_cual_fue_esa_informacion",
          "show_if": {
            "field": "en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "domicilio_telefonos",
      "label": "Domicilio y teléfonos",
      "fields": [
        {
          "key": "localidad",
          "label": "Localidad/colonia",
          "type": "text",
          "source_column": "localidad",
          "required": false
        },
        {
          "key": "municipio",
          "label": "Municipio",
          "type": "text",
          "source_column": "municipio",
          "required": false
        },
        {
          "key": "codigo_postal",
          "label": "Código postal",
          "type": "text",
          "source_column": "codigo_postal",
          "required": false
        },
        {
          "key": "numero_del_hogar",
          "label": "Número del hogar",
          "type": "phone",
          "source_column": "numero_del_hogar",
          "required": false
        },
        {
          "key": "numero_del_empleo",
          "label": "Número del empleo",
          "type": "phone",
          "source_column": "numero_del_empleo",
          "required": false
        }
      ]
    },
    {
      "id": "redes_sociales",
      "label": "Redes sociales",
      "fields": [
        {
          "key": "redes_sociales",
          "label": "¿Cuenta con redes sociales?",
          "type": "boolean",
          "source_column": "redes_sociales",
          "required": false
        },
        {
          "key": "redes_sociales_detalle",
          "label": "Redes sociales",
          "type": "repeater",
          "source_column": "redes_sociales_detalle",
          "show_if": {
            "field": "redes_sociales",
            "operator": "eq",
            "value": true
          },
          "source_table": "REDES SOCIALES",
          "fields": [
            {
              "key": "red_social",
              "label": "Red social",
              "type": "select",
              "source_column": "red_social",
              "required": false,
              "suggestions": [
                "Facebook",
                "X",
                "Instagram",
                "Tik Tok"
              ],
              "allow_custom_value": true
            },
            {
              "key": "nombre_usuario",
              "label": "Nombre dentro de la red social",
              "type": "text",
              "source_column": "Nombre_dentro_red social",
              "required": false
            }
          ],
          "required": false
        }
      ]
    },
    {
      "id": "pasaporte",
      "label": "Pasaporte",
      "fields": [
        {
          "key": "donde_fue_tramitado_el_pasaporte",
          "label": "¿Dónde fue tramitado el pasaporte?",
          "type": "text",
          "source_column": "donde_fue_tramitado_el_pasaporte",
          "required": false
        },
        {
          "key": "ha_perdido_su_pasaporte_o_se_lo_han_robado",
          "label": "¿Ha perdido su pasaporte o se lo han robado?",
          "type": "boolean",
          "source_column": "ha_perdido_su_pasaporte_o_se_lo_han_robado",
          "required": false
        },
        {
          "key": "fecha_y_ano_del_extravio_o_robo",
          "label": "Fecha y año del extravío o robo",
          "type": "text",
          "source_column": "fecha_y_ano_del_extravio_o_robo",
          "show_if": {
            "field": "ha_perdido_su_pasaporte_o_se_lo_han_robado",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "contacto_eeuu",
      "label": "Contacto en EE. UU.",
      "fields": [
        {
          "key": "nombre_de_familiar_o_contacto_en_estados_unidos_de_america",
          "label": "Nombre del contacto",
          "type": "text",
          "source_column": "nombre_de_familiar_o_contacto_en_estados_unidos_de_america",
          "required": false
        },
        {
          "key": "parentesco_de_contacto",
          "label": "Parentesco",
          "type": "select",
          "source_column": "parentesco_de_contacto",
          "options": [
            "Relative",
            "Spouse",
            "Friend",
            "Business associate",
            "Employer",
            "School official",
            "Other"
          ],
          "required": false
        },
        {
          "key": "telefono_del_contacto",
          "label": "Teléfono del contacto",
          "type": "phone",
          "source_column": "telefono_del_contacto",
          "required": false
        },
        {
          "key": "domicilio_del_contacto",
          "label": "Domicilio del contacto",
          "type": "text",
          "source_column": "domicilio_del_contacto",
          "required": false
        },
        {
          "key": "correo_electronico_del_contacto",
          "label": "Correo electrónico del contacto",
          "type": "text",
          "source_column": "correo_electronico_del_contacto",
          "required": false
        },
        {
          "key": "estatus_del_contacto",
          "label": "Estatus del contacto",
          "type": "text",
          "source_column": "estatus_del_contacto",
          "required": false
        }
      ]
    },
    {
      "id": "padres_familiares",
      "label": "Padres y familiares",
      "fields": [
        {
          "key": "nombre_del_padre_del_aplicante",
          "label": "Nombre del padre",
          "type": "text",
          "source_column": "nombre_del_padre_del_aplicante",
          "required": false
        },
        {
          "key": "fecha_de_nacimiento_del_padre",
          "label": "Fecha de nacimiento del padre",
          "type": "text",
          "source_column": "fecha_de_nacimiento_del_padre",
          "required": false
        },
        {
          "key": "el_padre_se_encuentra_en_los_eua",
          "label": "¿Su padre está en EE. UU.?",
          "type": "boolean",
          "source_column": "el_padre_se_encuentra_en_los_eua",
          "required": false
        },
        {
          "key": "estatus_del_padre",
          "label": "Estatus del padre",
          "type": "select",
          "source_column": "estatus_del_padre",
          "show_if": {
            "field": "el_padre_se_encuentra_en_los_eua",
            "operator": "eq",
            "value": true
          },
          "options": [
            "Residente",
            "Ciudadano",
            "Otro",
            "No inmigrante"
          ],
          "required": false
        },
        {
          "key": "notas_sobre_el_estatus_del_padre",
          "label": "Notas sobre el estatus del padre",
          "type": "text",
          "source_column": "notas_sobre_el_estatus_del_padre",
          "show_if": {
            "field": "el_padre_se_encuentra_en_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_la_madre_del_aplicante",
          "label": "Nombre de la madre",
          "type": "text",
          "source_column": "nombre_de_la_madre_del_aplicante",
          "required": false
        },
        {
          "key": "fecha_de_nacimiento_de_la_madre",
          "label": "Fecha de nacimiento de la madre",
          "type": "text",
          "source_column": "fecha_de_nacimiento_de_la_madre",
          "required": false
        },
        {
          "key": "la_madre_se_encuentra_en_eeuu",
          "label": "¿La madre se encuentra en EE. UU.?",
          "type": "boolean",
          "source_column": "la_madre_se_encuentra_en_eeuu",
          "required": false
        },
        {
          "key": "estatus_de_la_madre",
          "label": "Estatus de la madre",
          "type": "select",
          "source_column": "estatus_de_la_madre",
          "show_if": {
            "field": "la_madre_se_encuentra_en_eeuu",
            "operator": "eq",
            "value": true
          },
          "options": [
            "Residencia",
            "Ciudadanía",
            "Otro",
            "No inmigrante"
          ],
          "required": false
        },
        {
          "key": "notas_sobre_el_estatus_de_la_madre",
          "label": "Notas sobre el estatus de la madre",
          "type": "text",
          "source_column": "notas_sobre_el_estatus_de_la_madre",
          "show_if": {
            "field": "la_madre_se_encuentra_en_eeuu",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tiene_familiares_directos_en_estados_unidos",
          "label": "¿Tiene familiares en EE. UU.?",
          "type": "boolean",
          "source_column": "tiene_familiares_directos_en_estados_unidos",
          "required": false
        },
        {
          "key": "familiares_eeuu",
          "label": "Familiares en EE. UU.",
          "type": "repeater",
          "source_column": "familiares_eeuu",
          "show_if": {
            "field": "tiene_familiares_directos_en_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "source_table": "FAMILIARES EN EEUU",
          "fields": [
            {
              "key": "apellidos",
              "label": "Apellidos",
              "type": "text",
              "source_column": "apellidos",
              "required": false
            },
            {
              "key": "nombre",
              "label": "Nombres",
              "type": "text",
              "source_column": "nombre",
              "required": false
            },
            {
              "key": "estatus",
              "label": "Estatus en EE. UU.",
              "type": "select",
              "source_column": "estatus",
              "required": false,
              "options": [
                "Residente",
                "Ciudadano",
                "No inmigrante",
                "Otro"
              ]
            },
            {
              "key": "relacion",
              "label": "Relación con el aplicante",
              "type": "select",
              "source_column": "realcion",
              "required": false,
              "options": [
                "Hijo",
                "Hermano"
              ]
            }
          ],
          "required": false
        },
        {
          "key": "tiene_mas_familiares_en_eua",
          "label": "¿Tiene otros familiares en EE. UU.?",
          "type": "boolean",
          "source_column": "tiene_mas_familiares_en_eua",
          "required": false
        },
        {
          "key": "tuvo_usted_algun_hijo_en_los_eua",
          "label": "¿Tuvo algún hijo en EE. UU.?",
          "type": "boolean",
          "source_column": "tuvo_usted_algun_hijo_en_los_eua",
          "required": false
        },
        {
          "key": "explicacion_tipo_de_hospital_y_fecha",
          "label": "Explicación: tipo de hospital, fecha, etc.",
          "type": "text",
          "source_column": "explicacion_tipo_de_hospital_y_fecha",
          "show_if": {
            "field": "tuvo_usted_algun_hijo_en_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "conyuge_divorcios",
      "label": "Cónyuge y divorcios",
      "fields": [
        {
          "key": "nombre_del_conyuge",
          "label": "Nombre del esposo(a)",
          "type": "text",
          "source_column": "nombre_del_conyuge",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "fecha_de_nacimiento_del_conyuge",
          "label": "Fecha de nacimiento del cónyuge",
          "type": "text",
          "source_column": "fecha_de_nacimiento_del_conyuge",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "lugar_de_nacimiento",
          "label": "Lugar de nacimiento del cónyuge",
          "type": "text",
          "source_column": "lugar_de_nacimiento",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "cuantos_divorcios_lleva",
          "label": "¿Cuántos divorcios lleva?",
          "type": "text",
          "source_column": "cuantos_divorcios_lleva",
          "show_if": {
            "field": "estado_civil",
            "operator": "eq",
            "value": "Divorciado"
          },
          "required": false
        },
        {
          "key": "inicio_de_ultimo_matrimonio",
          "label": "Fecha de inicio del último matrimonio",
          "type": "text",
          "source_column": "inicio_de_ultimo_matrimonio",
          "show_if": {
            "field": "estado_civil",
            "operator": "eq",
            "value": "Divorciado"
          },
          "required": false
        },
        {
          "key": "fin_de_ultimo_matrimonio",
          "label": "Fecha de finalización del último matrimonio",
          "type": "text",
          "source_column": "fin_de_ultimo_matrimonio",
          "show_if": {
            "field": "estado_civil",
            "operator": "eq",
            "value": "Divorciado"
          },
          "required": false
        },
        {
          "key": "viven_en_el_mismo_domicilio",
          "label": "¿Viven en el mismo domicilio?",
          "type": "boolean",
          "source_column": "viven_en_el_mismo_domicilio",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "domicilio_del_esposo_a",
          "label": "Domicilio del esposo(a)",
          "type": "text",
          "source_column": "domicilio_del_esposo_a",
          "show_if": {
            "field": "viven_en_el_mismo_domicilio",
            "operator": "eq",
            "value": false
          },
          "required": false
        }
      ]
    },
    {
      "id": "empleo_actual",
      "label": "Empleo actual",
      "fields": [
        {
          "key": "cuenta_con_empleo_actualmente",
          "label": "¿Cuenta con empleo actualmente?",
          "type": "select",
          "source_column": "cuenta_con_empleo_actualmente",
          "required": false,
          "options": [
            "Sí",
            "No",
            "Ama de casa",
            "Estudiante"
          ]
        },
        {
          "key": "ocupacion",
          "label": "Ocupación",
          "type": "text",
          "source_column": "ocupacion",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          },
          "required": false
        },
        {
          "key": "empleador",
          "label": "Empleador/Escuela/Institución",
          "type": "text",
          "source_column": "empleador",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "direccion_de_empleador",
          "label": "Dirección del empleador",
          "type": "text",
          "source_column": "direccion_de_empleador",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "localidad_del_empleo_actual",
          "label": "Localidad/colonia",
          "type": "text",
          "source_column": "localidad_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "municipio_del_empleo_actual",
          "label": "Municipio",
          "type": "text",
          "source_column": "municipio_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "estado_del_empleo_actual",
          "label": "Estado",
          "type": "text",
          "source_column": "estado_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "codigo_postal_de_empleo_actual",
          "label": "Código postal",
          "type": "text",
          "source_column": "codigo_postal_de_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "pais_del_empleo_actual",
          "label": "País",
          "type": "text",
          "source_column": "pais_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_del_empleo",
          "label": "Número de teléfono",
          "type": "phone",
          "source_column": "numero_de_telefono_del_empleo",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "sueldo_mensual",
          "label": "Sueldo mensual",
          "type": "number",
          "source_column": "sueldo_mensual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          },
          "required": false
        },
        {
          "key": "descripcion_del_empleo_actual",
          "label": "Descripción del empleo",
          "type": "textarea",
          "source_column": "descripcion_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "traduccion_de_la_descripcion_del_empleo_actual",
          "label": "Traducción",
          "type": "textarea",
          "source_column": "traduccion_de_la_descripcion_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "desde_cuando_tiene_ese_empleo",
          "label": "Fecha de inicio",
          "type": "text",
          "source_column": "desde_cuando_tiene_ese_empleo",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        }
      ]
    },
    {
      "id": "empleos_anteriores",
      "label": "Empleos anteriores",
      "fields": [
        {
          "key": "anteriormente_tuvo_algun_empleo",
          "label": "¿Anteriormente tuvo algún empleo?",
          "type": "boolean",
          "source_column": "anteriormente_tuvo_algun_empleo",
          "required": false
        },
        {
          "key": "ocupacion_anterior",
          "label": "Ocupación anterior",
          "type": "text",
          "source_column": "ocupacion_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_supervisor",
          "label": "Nombre del supervisor",
          "type": "text",
          "source_column": "nombre_de_supervisor",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "empleador_anterior",
          "label": "Empleador anterior",
          "type": "text",
          "source_column": "empleador_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "direccion_del_empleo_anterior",
          "label": "Dirección del empleador anterior",
          "type": "text",
          "source_column": "direccion_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "localidad_del_empleo_anterior",
          "label": "Localidad/colonia",
          "type": "text",
          "source_column": "localidad_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "municipio_del_empleo_anterior",
          "label": "Municipio",
          "type": "text",
          "source_column": "municipio_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "codigo_postal_empleo_anterior",
          "label": "Código postal",
          "type": "text",
          "source_column": "codigo_postal_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "estado_del_empleo_anterior",
          "label": "Estado",
          "type": "text",
          "source_column": "estado_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "pais_del_empleo_anterior",
          "label": "País",
          "type": "text",
          "source_column": "pais_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_del_empleo_anterior",
          "label": "Número de teléfono",
          "type": "text",
          "source_column": "numero_de_telefono_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "descripcion_breve_del_empleo_anterior",
          "label": "Descripción del empleo anterior",
          "type": "text",
          "source_column": "descripcion_breve_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "traduccion_de_la_descripcion_del_empleo_anterior",
          "label": "Traducción",
          "type": "text",
          "source_column": "traduccion_de_la_descripcion_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_inicio_de_empleo_anterior",
          "label": "Fecha de inicio",
          "type": "text",
          "source_column": "fecha_inicio_de_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_de_finalizacion_de_empleo_anterior",
          "label": "Fecha de finalización",
          "type": "text",
          "source_column": "fecha_de_finalizacion_de_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "estudios",
      "label": "Estudios",
      "fields": [
        {
          "key": "tuvo_estudios",
          "label": "¿Tuvo algún nivel de estudios?",
          "type": "boolean",
          "source_column": "tuvo_estudios",
          "required": false
        },
        {
          "key": "nivel_educativo",
          "label": "Nivel educativo",
          "type": "text",
          "source_column": "nivel_educativo",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_la_escuela",
          "label": "Nombre de la escuela",
          "type": "text",
          "source_column": "nombre_de_la_escuela",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "direccion_de_la_escuela",
          "label": "Domicilio de la escuela",
          "type": "text",
          "source_column": "direccion_de_la_escuela",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_de_la_escuela",
          "label": "Teléfono de la escuela",
          "type": "phone",
          "source_column": "numero_de_telefono_de_la_escuela",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_inicio_escolar",
          "label": "Fecha de inicio escolar",
          "type": "text",
          "source_column": "fecha_inicio_escolar",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_finalizacion_escolar",
          "label": "Fecha de finalización escolar",
          "type": "text",
          "source_column": "fecha_finalizacion_escolar",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tuvo_educacion_antes",
          "label": "¿Tuvo nivel educativo anterior?",
          "type": "boolean",
          "source_column": "tuvo_educacion_antes",
          "required": false
        },
        {
          "key": "nivel_educativo_anterior",
          "label": "Nivel educativo anterior",
          "type": "text",
          "source_column": "nivel_educativo_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_la_escuela_anterior",
          "label": "Nombre de la escuela anterior",
          "type": "text",
          "source_column": "nombre_de_la_escuela_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "direccion_de_la_escuela_anterior",
          "label": "Dirección de la escuela anterior",
          "type": "text",
          "source_column": "direccion_de_la_escuela_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_de_la_escuela_anterior",
          "label": "Teléfono de la escuela anterior",
          "type": "text",
          "source_column": "numero_de_telefono_de_la_escuela_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_inicio_escolar_anterior",
          "label": "Fecha de inicio",
          "type": "text",
          "source_column": "fecha_inicio_escolar_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_finalizacion_escolar_anterior",
          "label": "Fecha de finalización",
          "type": "text",
          "source_column": "fecha_finalizacion_escolar_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "viajes_otros_paises",
      "label": "Viajes a otros países",
      "fields": [
        {
          "key": "ha_viajado_a_algun_pais_en_los_ultimos_5_anos",
          "label": "¿Ha viajado a algún país en los últimos 5 años?",
          "type": "boolean",
          "source_column": "ha_viajado_a_algun_pais_en_los_ultimos_5_anos",
          "required": false
        },
        {
          "key": "cuales",
          "label": "¿Cuáles países?",
          "type": "multiselect",
          "source_column": "cuales",
          "show_if": {
            "field": "ha_viajado_a_algun_pais_en_los_ultimos_5_anos",
            "operator": "eq",
            "value": true
          },
          "source_type": "EnumList",
          "confirmed_values": [
            "México",
            "Colombia"
          ],
          "required": false,
          "suggestions": [
            "México",
            "Colombia"
          ],
          "allow_custom_value": true
        }
      ]
    },
    {
      "id": "organizaciones_idiomas",
      "label": "Organizaciones e idiomas",
      "fields": [
        {
          "key": "ha_participado_o_contribuido_en_alguna_organizacion_social_de_caridad_u_ong",
          "label": "¿Ha participado o contribuido en alguna organización social, de caridad u ONG?",
          "type": "text",
          "source_column": "ha_participado_o_contribuido_en_alguna_organizacion_social_de_caridad_u_ong",
          "required": false
        },
        {
          "key": "que_idioma_habla",
          "label": "¿Qué idiomas habla?",
          "type": "multiselect",
          "source_column": "que_idioma_habla",
          "required": false,
          "suggestions": [
            "Español",
            "Mam",
            "Ingles"
          ],
          "allow_custom_value": true
        }
      ]
    },
    {
      "id": "consulados",
      "label": "Consulados disponibles",
      "fields": [
        {
          "key": "conuslados_a_donde_puede_ir",
          "label": "Consulados a donde puede ir",
          "type": "multiselect",
          "source_column": "conuslados_a_donde_puede_ir",
          "source_type": "EnumList",
          "enum_status": "NO PUDE CONFIRMARLO",
          "required": false,
          "suggestions": [],
          "allow_custom_value": true
        }
      ]
    }
  ]
}$visa$::jsonb)
  ) THEN
    RAISE EXCEPTION 'Existing Visa Individual V3 differs; inspect without overwriting';
  END IF;
END $check$;
INSERT INTO public.perfil_plantillas
  (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
VALUES ('Perfil Visa Individual V3','perfil_visa_individual_v3',3,true,20,NULL,
  $visa${
  "schema_version": 2,
  "source": {
    "document": "docs/appsheet/Application Documentation Visas inv.pdf",
    "table": "PERFIL VISA INDIVIDUAL",
    "related_tables": [
      "FAMILIARES EN EEUU",
      "REDES SOCIALES",
      "INGRESOS A ESTADOS UNIDOS"
    ],
    "audited_pages": {
      "perfil": "266-390",
      "familiares": "159-164",
      "redes": "399-403",
      "ingresos": "404-408"
    },
    "audited_date": "2026-08-17",
    "rules_audit": "docs/perfiles/visa-individual-appsheet-matriz-2026-09-18.md"
  },
  "activation": {
    "strategy": "highest_active_template_version_for_tipo_tramite",
    "applies_to": "new_profiles_only",
    "preserves_existing_profiles": true
  },
  "canonical_information": [
    {
      "source": "clientes.nombre_completo",
      "label": "Nombre del aplicante"
    },
    {
      "source": "clientes.fecha_nacimiento",
      "label": "Fecha de nacimiento"
    },
    {
      "source": "clientes.telefono",
      "label": "Teléfono del aplicante"
    },
    {
      "source": "clientes.correo",
      "label": "Correo del aplicante"
    },
    {
      "source": "clientes.pais",
      "label": "País del aplicante"
    },
    {
      "source": "clientes.direccion",
      "label": "Domicilio registrado"
    }
  ],
  "sections": [
    {
      "id": "informacion_general",
      "label": "Información general",
      "fields": [
        {
          "key": "ha_usado_otro_nombre_o_lo_ha_modificado",
          "label": "¿Ha usado otro nombre o lo ha modificado?",
          "type": "boolean",
          "source_column": "ha_usado_otro_nombre_o_lo_ha_modificado",
          "required": false
        },
        {
          "key": "cual_fue_su_otro_nombre",
          "label": "¿Cuál fue su otro nombre?",
          "type": "text",
          "source_column": "cual_fue_su_otro_nombre",
          "show_if": {
            "field": "ha_usado_otro_nombre_o_lo_ha_modificado",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "estado_civil",
          "label": "Estado civil",
          "type": "select",
          "source_column": "estado_civil",
          "required": false,
          "options": [
            "Casado",
            "Soltero",
            "Viudo",
            "Divorciado",
            "Legalmente separado",
            "Unión libre"
          ]
        },
        {
          "key": "tiene_alguna_otra_nacionalidad",
          "label": "¿Tiene alguna otra nacionalidad?",
          "type": "boolean",
          "source_column": "tiene_alguna_otra_nacionalidad",
          "required": false
        },
        {
          "key": "cual_es_su_otra_nacionalidad",
          "label": "¿Cuál es su otra nacionalidad?",
          "type": "text",
          "source_column": "cual_es_su_otra_nacionalidad",
          "show_if": {
            "field": "tiene_alguna_otra_nacionalidad",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tiene_alguna_discapacidad",
          "label": "¿Tiene alguna discapacidad?",
          "type": "boolean",
          "source_column": "tiene_alguna_discapacidad",
          "required": false
        },
        {
          "key": "cual_es_su_discapacidad",
          "label": "¿Cuál es su discapacidad?",
          "type": "text",
          "source_column": "cual_es_su_discapacidad",
          "show_if": {
            "field": "tiene_alguna_discapacidad",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "datos_viaje",
      "label": "Datos del viaje",
      "fields": [
        {
          "key": "fecha_tentativa_de_llegada",
          "label": "Fecha tentativa de viaje",
          "type": "text",
          "source_column": "fecha_tentativa_de_llegada",
          "required": false
        },
        {
          "key": "duracion",
          "label": "Duración",
          "type": "text",
          "source_column": "duracion",
          "required": false
        },
        {
          "key": "cual_es_el_motivo_de_su_viaje",
          "label": "¿Cuál es el motivo de su viaje?",
          "type": "text",
          "source_column": "cual_es_el_motivo_de_su_viaje",
          "required": false
        },
        {
          "key": "domicilio_donde_va_a_llegar_a_estados_unidos",
          "label": "Domicilio donde llegará en Estados Unidos",
          "type": "text",
          "source_column": "domicilio_donde_va_a_llegar_a_estados_unidos",
          "required": false
        },
        {
          "key": "parentesco",
          "label": "Parentesco",
          "type": "text",
          "source_column": "parentesco",
          "required": false
        },
        {
          "key": "con_quienes_viaja_a_estados_unidos_y_cual_es_su_parentesco",
          "label": "¿Con quiénes viajará y cuál es su parentesco?",
          "type": "textarea",
          "source_column": "con_quienes_viaja_a_estados_unidos_y_cual_es_su_parentesco",
          "required": false
        }
      ]
    },
    {
      "id": "pagador_viaje",
      "label": "Pagador del viaje",
      "fields": [
        {
          "key": "usted_pagara_por_su_viaje",
          "label": "¿Usted pagará por su viaje?",
          "type": "boolean",
          "source_column": "usted_pagara_por_su_viaje",
          "required": false
        },
        {
          "key": "quien_pagaria_su_viaje",
          "label": "Nombre de quien pagará su viaje",
          "type": "text",
          "source_column": "quien_pagaria_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_de_quien_pagaria_por_su_viaje",
          "label": "Número de teléfono",
          "type": "text",
          "source_column": "numero_de_telefono_de_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "correo_electronico_quien_pagaria_por_su_viaje",
          "label": "Correo electrónico",
          "type": "email",
          "source_column": "correo_electronico_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "parentesco_quien_pagaria_por_su_viaje",
          "label": "Parentesco",
          "type": "text",
          "source_column": "parentesco_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        },
        {
          "key": "domicilio_quien_pagaria_por_su_viaje",
          "label": "Domicilio",
          "type": "text",
          "source_column": "domicilio_quien_pagaria_por_su_viaje",
          "show_if": {
            "field": "usted_pagara_por_su_viaje",
            "operator": "eq",
            "value": false
          },
          "required": false
        }
      ]
    },
    {
      "id": "entradas_eeuu",
      "label": "Entradas y viajes anteriores a EE. UU.",
      "fields": [
        {
          "key": "ha_entrado_a_estados_unidos",
          "label": "¿Ha entrado o intentado entrar a Estados Unidos?",
          "type": "boolean",
          "source_column": "ha_entrado_a_estados_unidos",
          "required": false
        },
        {
          "key": "ingresos_estados_unidos",
          "label": "Fechas de ingreso a Estados Unidos",
          "type": "repeater",
          "source_column": "ingresos_estados_unidos",
          "show_if": {
            "field": "ha_entrado_a_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "source_table": "INGRESOS A ESTADOS UNIDOS",
          "fields": [
            {
              "key": "fecha_ingreso",
              "label": "Fecha de ingreso",
              "type": "text",
              "source_column": "feha_ingreso",
              "required": false
            },
            {
              "key": "duracion",
              "label": "Cantidad",
              "type": "number",
              "source_column": "duracion",
              "required": false
            },
            {
              "key": "tiempo",
              "label": "Tiempo",
              "type": "select",
              "source_column": "tiempo",
              "required": false,
              "options": [
                "Días",
                "Semanas",
                "Meses",
                "Años",
                "Menos de 24 horas"
              ]
            }
          ],
          "required": false
        },
        {
          "key": "entro_de_manera_ilegal_o_con_documentos_falsos",
          "label": "¿Ingresó o intentó ingresar de manera ilegal o con documentos falsos? Explique.",
          "type": "text",
          "source_column": "entro_de_manera_ilegal_o_con_documentos_falsos",
          "show_if": {
            "field": "ha_entrado_a_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria",
          "label": "¿Alguna vez le han deportado de manera voluntaria o involuntaria?",
          "type": "boolean",
          "source_column": "alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria",
          "show_if": {
            "field": "ha_entrado_a_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "pago_por_los_costos_de_su_deportacion_explique",
          "label": "¿Pagó los costos de la deportación? Explique.",
          "type": "text",
          "source_column": "pago_por_los_costos_de_su_deportacion_explique",
          "show_if": {
            "field": "alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "peticiones_migratorias",
      "label": "Peticiones migratorias",
      "fields": [
        {
          "key": "alguna_vez_alguien_metio_una_peticion_de_migracion",
          "label": "¿Alguna vez alguien presentó una petición de inmigración por usted?",
          "type": "boolean",
          "source_column": "alguna_vez_alguien_metio_una_peticion_de_migracion",
          "required": false
        },
        {
          "key": "quien_y_para_que_tipo_de_peticion",
          "label": "¿Quién y para qué tipo de petición?",
          "type": "text",
          "source_column": "quien_y_para_que_tipo_de_peticion",
          "show_if": {
            "field": "alguna_vez_alguien_metio_una_peticion_de_migracion",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "por_que_fue_rechazada",
          "label": "¿Por qué fue rechazada?",
          "type": "text",
          "source_column": "por_que_fue_rechazada",
          "show_if": {
            "field": "alguna_vez_alguien_metio_una_peticion_de_migracion",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "delitos_sentencias",
      "label": "Delitos y sentencias",
      "fields": [
        {
          "key": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
          "label": "¿En el pasado ha cometido un acto ilícito o felonía en EE. UU. o en su país de origen?",
          "type": "boolean",
          "source_column": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
          "required": false
        },
        {
          "key": "cual_fue_el_delito",
          "label": "¿Cuál fue el delito?",
          "type": "text",
          "source_column": "cual_fue_el_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "hubo_sentencia",
          "label": "¿Tuvo una sentencia?",
          "type": "boolean",
          "source_column": "hubo_sentencia",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "por_cuanto_tiempo_fue_la_sentencia",
          "label": "¿Por cuánto tiempo fue la sentencia?",
          "type": "text",
          "source_column": "por_cuanto_tiempo_fue_la_sentencia",
          "show_if": {
            "field": "hubo_sentencia",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "donde_fue_el_delito",
          "label": "¿Dónde fue el delito?",
          "type": "text",
          "source_column": "donde_fue_el_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "cuando_fue_su_delito",
          "label": "¿Cuándo fue el delito?",
          "type": "text",
          "source_column": "cuando_fue_su_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "explique_su_delito",
          "label": "Explique el delito",
          "type": "textarea",
          "source_column": "explique_su_delito",
          "show_if": {
            "field": "en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "visa_anterior",
      "label": "Visa anterior",
      "fields": [
        {
          "key": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
          "label": "¿Alguna vez le han otorgado visa para viajar a Estados Unidos?",
          "type": "boolean",
          "source_column": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
          "required": false
        },
        {
          "key": "fecha_de_emision",
          "label": "Fecha de emisión",
          "type": "text",
          "source_column": "fecha_de_emision",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_de_vencimiento",
          "label": "Fecha de vencimiento",
          "type": "text",
          "source_column": "fecha_de_vencimiento",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tipo_de_visa",
          "label": "Tipo de visa",
          "type": "text",
          "source_column": "tipo_de_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_visa",
          "label": "Número de visa",
          "type": "text",
          "source_column": "numero_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "en_que_consulado_fue",
          "label": "Consulado",
          "type": "text",
          "source_column": "en_que_consulado_fue",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "esta_solicitando_el_mismo_tipo_de_visa",
          "label": "¿Está solicitando el mismo tipo de visa?",
          "type": "boolean",
          "source_column": "esta_solicitando_el_mismo_tipo_de_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "esta_aplicando_en_el_mismo_pais_donde_la_visa_fue_emitida_y_en_su_pais_de_residencia_principal",
          "label": "¿Está aplicando en el mismo país donde la visa fue emitida y es su residencia principal?",
          "type": "boolean",
          "source_column": "esta_aplicando_en_el_mismo_pais_donde_la_visa_fue_emitida_y_en_su_pais_de_residencia_principal",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "le_han_sacado_huellas_al_momento_de_tramitar_su_visa",
          "label": "¿Le sacaron huellas en su visa anterior?",
          "type": "boolean",
          "source_column": "le_han_sacado_huellas_al_momento_de_tramitar_su_visa",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
          "label": "¿Alguna vez perdió su visa o fue robada?",
          "type": "boolean",
          "source_column": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
          "show_if": {
            "field": "alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "donde_fue_robada",
          "label": "¿Dónde fue robada?",
          "type": "text",
          "source_column": "donde_fue_robada",
          "show_if": {
            "field": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "ano_del_robo_o_extravio",
          "label": "Año del robo o extravío",
          "type": "text",
          "source_column": "ano_del_robo_o_extravio",
          "show_if": {
            "field": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "explicacion_perdida_visa",
          "label": "Explique la pérdida o robo",
          "type": "textarea",
          "source_column": "explicacion_perdida_visa",
          "show_if": {
            "field": "alguna_vez_ha_perdido_su_visa_o_ha_sido_robada",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "alguna_vez_su_visa_ha_sido_cancelada_o_revocada_explique",
          "label": "¿Alguna vez su visa fue cancelada o revocada? Explique.",
          "type": "text",
          "source_column": "alguna_vez_su_visa_ha_sido_cancelada_o_revocada_explique",
          "required": false
        },
        {
          "key": "alguna_vez_le_fue_negada_la_admision_a_los_eua_o_se_le_ha_retirado_su_aplicacion_para_admision_en_el_punto_de_entrada_explique",
          "label": "¿Alguna vez le negaron la entrada a EE. UU. o retiró su solicitud de admisión? Explique.",
          "type": "text",
          "source_column": "alguna_vez_le_fue_negada_la_admision_a_los_eua_o_se_le_ha_retirado_su_aplicacion_para_admision_en_el_punto_de_entrada_explique",
          "required": false
        }
      ]
    },
    {
      "id": "visa_negada",
      "label": "Visa negada",
      "fields": [
        {
          "key": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
          "label": "¿Alguna vez le negaron una visa de EE. UU.?",
          "type": "boolean",
          "source_column": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
          "required": false
        },
        {
          "key": "donde_le_fue_negada_su_visa",
          "label": "¿Dónde le fue negada?",
          "type": "text",
          "source_column": "donde_le_fue_negada_su_visa",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "cuando_le_fue_negada_su_visa",
          "label": "¿Cuándo le fue negada?",
          "type": "text",
          "source_column": "cuando_le_fue_negada_su_visa",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "observaciones",
          "label": "Observaciones",
          "type": "text",
          "source_column": "observaciones",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante",
          "label": "¿En la aplicación anterior mintió sobre información importante?",
          "type": "boolean",
          "source_column": "en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante",
          "show_if": {
            "field": "alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "explique_cual_fue_esa_informacion",
          "label": "Explique cuál fue esa información",
          "type": "text",
          "source_column": "explique_cual_fue_esa_informacion",
          "show_if": {
            "field": "en_su_aplicacion_anterior_mintio_en_su_entrevista_sobre_alguna_informacion_importante",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "domicilio_telefonos",
      "label": "Domicilio y teléfonos",
      "fields": [
        {
          "key": "localidad",
          "label": "Localidad/colonia",
          "type": "text",
          "source_column": "localidad",
          "required": false
        },
        {
          "key": "municipio",
          "label": "Municipio",
          "type": "text",
          "source_column": "municipio",
          "required": false
        },
        {
          "key": "codigo_postal",
          "label": "Código postal",
          "type": "text",
          "source_column": "codigo_postal",
          "required": false
        },
        {
          "key": "numero_del_hogar",
          "label": "Número del hogar",
          "type": "phone",
          "source_column": "numero_del_hogar",
          "required": false
        },
        {
          "key": "numero_del_empleo",
          "label": "Número del empleo",
          "type": "phone",
          "source_column": "numero_del_empleo",
          "required": false
        }
      ]
    },
    {
      "id": "redes_sociales",
      "label": "Redes sociales",
      "fields": [
        {
          "key": "redes_sociales",
          "label": "¿Cuenta con redes sociales?",
          "type": "boolean",
          "source_column": "redes_sociales",
          "required": false
        },
        {
          "key": "redes_sociales_detalle",
          "label": "Redes sociales",
          "type": "repeater",
          "source_column": "redes_sociales_detalle",
          "show_if": {
            "field": "redes_sociales",
            "operator": "eq",
            "value": true
          },
          "source_table": "REDES SOCIALES",
          "fields": [
            {
              "key": "red_social",
              "label": "Red social",
              "type": "select",
              "source_column": "red_social",
              "required": false,
              "suggestions": [
                "Facebook",
                "X",
                "Instagram",
                "Tik Tok"
              ],
              "allow_custom_value": true
            },
            {
              "key": "nombre_usuario",
              "label": "Nombre dentro de la red social",
              "type": "text",
              "source_column": "Nombre_dentro_red social",
              "required": false
            }
          ],
          "required": false
        }
      ]
    },
    {
      "id": "pasaporte",
      "label": "Pasaporte",
      "fields": [
        {
          "key": "donde_fue_tramitado_el_pasaporte",
          "label": "¿Dónde fue tramitado el pasaporte?",
          "type": "text",
          "source_column": "donde_fue_tramitado_el_pasaporte",
          "required": false
        },
        {
          "key": "ha_perdido_su_pasaporte_o_se_lo_han_robado",
          "label": "¿Ha perdido su pasaporte o se lo han robado?",
          "type": "boolean",
          "source_column": "ha_perdido_su_pasaporte_o_se_lo_han_robado",
          "required": false
        },
        {
          "key": "fecha_y_ano_del_extravio_o_robo",
          "label": "Fecha y año del extravío o robo",
          "type": "text",
          "source_column": "fecha_y_ano_del_extravio_o_robo",
          "show_if": {
            "field": "ha_perdido_su_pasaporte_o_se_lo_han_robado",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "contacto_eeuu",
      "label": "Contacto en EE. UU.",
      "fields": [
        {
          "key": "nombre_de_familiar_o_contacto_en_estados_unidos_de_america",
          "label": "Nombre del contacto",
          "type": "text",
          "source_column": "nombre_de_familiar_o_contacto_en_estados_unidos_de_america",
          "required": false
        },
        {
          "key": "parentesco_de_contacto",
          "label": "Parentesco",
          "type": "select",
          "source_column": "parentesco_de_contacto",
          "options": [
            "Relative",
            "Spouse",
            "Friend",
            "Business associate",
            "Employer",
            "School official",
            "Other"
          ],
          "required": false
        },
        {
          "key": "telefono_del_contacto",
          "label": "Teléfono del contacto",
          "type": "phone",
          "source_column": "telefono_del_contacto",
          "required": false
        },
        {
          "key": "domicilio_del_contacto",
          "label": "Domicilio del contacto",
          "type": "text",
          "source_column": "domicilio_del_contacto",
          "required": false
        },
        {
          "key": "correo_electronico_del_contacto",
          "label": "Correo electrónico del contacto",
          "type": "text",
          "source_column": "correo_electronico_del_contacto",
          "required": false
        },
        {
          "key": "estatus_del_contacto",
          "label": "Estatus del contacto",
          "type": "text",
          "source_column": "estatus_del_contacto",
          "required": false
        }
      ]
    },
    {
      "id": "padres_familiares",
      "label": "Padres y familiares",
      "fields": [
        {
          "key": "nombre_del_padre_del_aplicante",
          "label": "Nombre del padre",
          "type": "text",
          "source_column": "nombre_del_padre_del_aplicante",
          "required": false
        },
        {
          "key": "fecha_de_nacimiento_del_padre",
          "label": "Fecha de nacimiento del padre",
          "type": "text",
          "source_column": "fecha_de_nacimiento_del_padre",
          "required": false
        },
        {
          "key": "el_padre_se_encuentra_en_los_eua",
          "label": "¿Su padre está en EE. UU.?",
          "type": "boolean",
          "source_column": "el_padre_se_encuentra_en_los_eua",
          "required": false
        },
        {
          "key": "estatus_del_padre",
          "label": "Estatus del padre",
          "type": "select",
          "source_column": "estatus_del_padre",
          "show_if": {
            "field": "el_padre_se_encuentra_en_los_eua",
            "operator": "eq",
            "value": true
          },
          "options": [
            "Residente",
            "Ciudadano",
            "Otro",
            "No inmigrante"
          ],
          "required": false
        },
        {
          "key": "notas_sobre_el_estatus_del_padre",
          "label": "Notas sobre el estatus del padre",
          "type": "text",
          "source_column": "notas_sobre_el_estatus_del_padre",
          "show_if": {
            "field": "el_padre_se_encuentra_en_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_la_madre_del_aplicante",
          "label": "Nombre de la madre",
          "type": "text",
          "source_column": "nombre_de_la_madre_del_aplicante",
          "required": false
        },
        {
          "key": "fecha_de_nacimiento_de_la_madre",
          "label": "Fecha de nacimiento de la madre",
          "type": "text",
          "source_column": "fecha_de_nacimiento_de_la_madre",
          "required": false
        },
        {
          "key": "la_madre_se_encuentra_en_eeuu",
          "label": "¿La madre se encuentra en EE. UU.?",
          "type": "boolean",
          "source_column": "la_madre_se_encuentra_en_eeuu",
          "required": false
        },
        {
          "key": "estatus_de_la_madre",
          "label": "Estatus de la madre",
          "type": "select",
          "source_column": "estatus_de_la_madre",
          "show_if": {
            "field": "la_madre_se_encuentra_en_eeuu",
            "operator": "eq",
            "value": true
          },
          "options": [
            "Residencia",
            "Ciudadanía",
            "Otro",
            "No inmigrante"
          ],
          "required": false
        },
        {
          "key": "notas_sobre_el_estatus_de_la_madre",
          "label": "Notas sobre el estatus de la madre",
          "type": "text",
          "source_column": "notas_sobre_el_estatus_de_la_madre",
          "show_if": {
            "field": "la_madre_se_encuentra_en_eeuu",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tiene_familiares_directos_en_estados_unidos",
          "label": "¿Tiene familiares en EE. UU.?",
          "type": "boolean",
          "source_column": "tiene_familiares_directos_en_estados_unidos",
          "required": false
        },
        {
          "key": "familiares_eeuu",
          "label": "Familiares en EE. UU.",
          "type": "repeater",
          "source_column": "familiares_eeuu",
          "show_if": {
            "field": "tiene_familiares_directos_en_estados_unidos",
            "operator": "eq",
            "value": true
          },
          "source_table": "FAMILIARES EN EEUU",
          "fields": [
            {
              "key": "apellidos",
              "label": "Apellidos",
              "type": "text",
              "source_column": "apellidos",
              "required": false
            },
            {
              "key": "nombre",
              "label": "Nombres",
              "type": "text",
              "source_column": "nombre",
              "required": false
            },
            {
              "key": "estatus",
              "label": "Estatus en EE. UU.",
              "type": "select",
              "source_column": "estatus",
              "required": false,
              "options": [
                "Residente",
                "Ciudadano",
                "No inmigrante",
                "Otro"
              ]
            },
            {
              "key": "relacion",
              "label": "Relación con el aplicante",
              "type": "select",
              "source_column": "realcion",
              "required": false,
              "options": [
                "Hijo",
                "Hermano"
              ]
            }
          ],
          "required": false
        },
        {
          "key": "tiene_mas_familiares_en_eua",
          "label": "¿Tiene otros familiares en EE. UU.?",
          "type": "boolean",
          "source_column": "tiene_mas_familiares_en_eua",
          "required": false
        },
        {
          "key": "tuvo_usted_algun_hijo_en_los_eua",
          "label": "¿Tuvo algún hijo en EE. UU.?",
          "type": "boolean",
          "source_column": "tuvo_usted_algun_hijo_en_los_eua",
          "required": false
        },
        {
          "key": "explicacion_tipo_de_hospital_y_fecha",
          "label": "Explicación: tipo de hospital, fecha, etc.",
          "type": "text",
          "source_column": "explicacion_tipo_de_hospital_y_fecha",
          "show_if": {
            "field": "tuvo_usted_algun_hijo_en_los_eua",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "conyuge_divorcios",
      "label": "Cónyuge y divorcios",
      "fields": [
        {
          "key": "nombre_del_conyuge",
          "label": "Nombre del esposo(a)",
          "type": "text",
          "source_column": "nombre_del_conyuge",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "fecha_de_nacimiento_del_conyuge",
          "label": "Fecha de nacimiento del cónyuge",
          "type": "text",
          "source_column": "fecha_de_nacimiento_del_conyuge",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "lugar_de_nacimiento",
          "label": "Lugar de nacimiento del cónyuge",
          "type": "text",
          "source_column": "lugar_de_nacimiento",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "cuantos_divorcios_lleva",
          "label": "¿Cuántos divorcios lleva?",
          "type": "text",
          "source_column": "cuantos_divorcios_lleva",
          "show_if": {
            "field": "estado_civil",
            "operator": "eq",
            "value": "Divorciado"
          },
          "required": false
        },
        {
          "key": "inicio_de_ultimo_matrimonio",
          "label": "Fecha de inicio del último matrimonio",
          "type": "text",
          "source_column": "inicio_de_ultimo_matrimonio",
          "show_if": {
            "field": "estado_civil",
            "operator": "eq",
            "value": "Divorciado"
          },
          "required": false
        },
        {
          "key": "fin_de_ultimo_matrimonio",
          "label": "Fecha de finalización del último matrimonio",
          "type": "text",
          "source_column": "fin_de_ultimo_matrimonio",
          "show_if": {
            "field": "estado_civil",
            "operator": "eq",
            "value": "Divorciado"
          },
          "required": false
        },
        {
          "key": "viven_en_el_mismo_domicilio",
          "label": "¿Viven en el mismo domicilio?",
          "type": "boolean",
          "source_column": "viven_en_el_mismo_domicilio",
          "show_if": {
            "not": {
              "field": "estado_civil",
              "operator": "eq",
              "value": "Soltero"
            }
          },
          "required": false
        },
        {
          "key": "domicilio_del_esposo_a",
          "label": "Domicilio del esposo(a)",
          "type": "text",
          "source_column": "domicilio_del_esposo_a",
          "show_if": {
            "field": "viven_en_el_mismo_domicilio",
            "operator": "eq",
            "value": false
          },
          "required": false
        }
      ]
    },
    {
      "id": "empleo_actual",
      "label": "Empleo actual",
      "fields": [
        {
          "key": "cuenta_con_empleo_actualmente",
          "label": "¿Cuenta con empleo actualmente?",
          "type": "select",
          "source_column": "cuenta_con_empleo_actualmente",
          "required": false,
          "options": [
            "Sí",
            "No",
            "Ama de casa",
            "Estudiante"
          ]
        },
        {
          "key": "ocupacion",
          "label": "Ocupación",
          "type": "text",
          "source_column": "ocupacion",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          },
          "required": false
        },
        {
          "key": "empleador",
          "label": "Empleador/Escuela/Institución",
          "type": "text",
          "source_column": "empleador",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "direccion_de_empleador",
          "label": "Dirección del empleador",
          "type": "text",
          "source_column": "direccion_de_empleador",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "localidad_del_empleo_actual",
          "label": "Localidad/colonia",
          "type": "text",
          "source_column": "localidad_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "municipio_del_empleo_actual",
          "label": "Municipio",
          "type": "text",
          "source_column": "municipio_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "estado_del_empleo_actual",
          "label": "Estado",
          "type": "text",
          "source_column": "estado_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "codigo_postal_de_empleo_actual",
          "label": "Código postal",
          "type": "text",
          "source_column": "codigo_postal_de_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "pais_del_empleo_actual",
          "label": "País",
          "type": "text",
          "source_column": "pais_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_del_empleo",
          "label": "Número de teléfono",
          "type": "phone",
          "source_column": "numero_de_telefono_del_empleo",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "sueldo_mensual",
          "label": "Sueldo mensual",
          "type": "number",
          "source_column": "sueldo_mensual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "eq",
            "value": "Sí"
          },
          "required": false
        },
        {
          "key": "descripcion_del_empleo_actual",
          "label": "Descripción del empleo",
          "type": "textarea",
          "source_column": "descripcion_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "traduccion_de_la_descripcion_del_empleo_actual",
          "label": "Traducción",
          "type": "textarea",
          "source_column": "traduccion_de_la_descripcion_del_empleo_actual",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        },
        {
          "key": "desde_cuando_tiene_ese_empleo",
          "label": "Fecha de inicio",
          "type": "text",
          "source_column": "desde_cuando_tiene_ese_empleo",
          "show_if": {
            "field": "cuenta_con_empleo_actualmente",
            "operator": "in",
            "value": [
              "Sí",
              "Estudiante"
            ]
          },
          "required": false
        }
      ]
    },
    {
      "id": "empleos_anteriores",
      "label": "Empleos anteriores",
      "fields": [
        {
          "key": "anteriormente_tuvo_algun_empleo",
          "label": "¿Anteriormente tuvo algún empleo?",
          "type": "boolean",
          "source_column": "anteriormente_tuvo_algun_empleo",
          "required": false
        },
        {
          "key": "ocupacion_anterior",
          "label": "Ocupación anterior",
          "type": "text",
          "source_column": "ocupacion_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_supervisor",
          "label": "Nombre del supervisor",
          "type": "text",
          "source_column": "nombre_de_supervisor",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "empleador_anterior",
          "label": "Empleador anterior",
          "type": "text",
          "source_column": "empleador_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "direccion_del_empleo_anterior",
          "label": "Dirección del empleador anterior",
          "type": "text",
          "source_column": "direccion_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "localidad_del_empleo_anterior",
          "label": "Localidad/colonia",
          "type": "text",
          "source_column": "localidad_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "municipio_del_empleo_anterior",
          "label": "Municipio",
          "type": "text",
          "source_column": "municipio_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "codigo_postal_empleo_anterior",
          "label": "Código postal",
          "type": "text",
          "source_column": "codigo_postal_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "estado_del_empleo_anterior",
          "label": "Estado",
          "type": "text",
          "source_column": "estado_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "pais_del_empleo_anterior",
          "label": "País",
          "type": "text",
          "source_column": "pais_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_del_empleo_anterior",
          "label": "Número de teléfono",
          "type": "text",
          "source_column": "numero_de_telefono_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "descripcion_breve_del_empleo_anterior",
          "label": "Descripción del empleo anterior",
          "type": "text",
          "source_column": "descripcion_breve_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "traduccion_de_la_descripcion_del_empleo_anterior",
          "label": "Traducción",
          "type": "text",
          "source_column": "traduccion_de_la_descripcion_del_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_inicio_de_empleo_anterior",
          "label": "Fecha de inicio",
          "type": "text",
          "source_column": "fecha_inicio_de_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_de_finalizacion_de_empleo_anterior",
          "label": "Fecha de finalización",
          "type": "text",
          "source_column": "fecha_de_finalizacion_de_empleo_anterior",
          "show_if": {
            "field": "anteriormente_tuvo_algun_empleo",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "estudios",
      "label": "Estudios",
      "fields": [
        {
          "key": "tuvo_estudios",
          "label": "¿Tuvo algún nivel de estudios?",
          "type": "boolean",
          "source_column": "tuvo_estudios",
          "required": false
        },
        {
          "key": "nivel_educativo",
          "label": "Nivel educativo",
          "type": "text",
          "source_column": "nivel_educativo",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_la_escuela",
          "label": "Nombre de la escuela",
          "type": "text",
          "source_column": "nombre_de_la_escuela",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "direccion_de_la_escuela",
          "label": "Domicilio de la escuela",
          "type": "text",
          "source_column": "direccion_de_la_escuela",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_de_la_escuela",
          "label": "Teléfono de la escuela",
          "type": "phone",
          "source_column": "numero_de_telefono_de_la_escuela",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_inicio_escolar",
          "label": "Fecha de inicio escolar",
          "type": "text",
          "source_column": "fecha_inicio_escolar",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_finalizacion_escolar",
          "label": "Fecha de finalización escolar",
          "type": "text",
          "source_column": "fecha_finalizacion_escolar",
          "show_if": {
            "field": "tuvo_estudios",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "tuvo_educacion_antes",
          "label": "¿Tuvo nivel educativo anterior?",
          "type": "boolean",
          "source_column": "tuvo_educacion_antes",
          "required": false
        },
        {
          "key": "nivel_educativo_anterior",
          "label": "Nivel educativo anterior",
          "type": "text",
          "source_column": "nivel_educativo_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "nombre_de_la_escuela_anterior",
          "label": "Nombre de la escuela anterior",
          "type": "text",
          "source_column": "nombre_de_la_escuela_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "direccion_de_la_escuela_anterior",
          "label": "Dirección de la escuela anterior",
          "type": "text",
          "source_column": "direccion_de_la_escuela_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "numero_de_telefono_de_la_escuela_anterior",
          "label": "Teléfono de la escuela anterior",
          "type": "text",
          "source_column": "numero_de_telefono_de_la_escuela_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_inicio_escolar_anterior",
          "label": "Fecha de inicio",
          "type": "text",
          "source_column": "fecha_inicio_escolar_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        },
        {
          "key": "fecha_finalizacion_escolar_anterior",
          "label": "Fecha de finalización",
          "type": "text",
          "source_column": "fecha_finalizacion_escolar_anterior",
          "show_if": {
            "field": "tuvo_educacion_antes",
            "operator": "eq",
            "value": true
          },
          "required": false
        }
      ]
    },
    {
      "id": "viajes_otros_paises",
      "label": "Viajes a otros países",
      "fields": [
        {
          "key": "ha_viajado_a_algun_pais_en_los_ultimos_5_anos",
          "label": "¿Ha viajado a algún país en los últimos 5 años?",
          "type": "boolean",
          "source_column": "ha_viajado_a_algun_pais_en_los_ultimos_5_anos",
          "required": false
        },
        {
          "key": "cuales",
          "label": "¿Cuáles países?",
          "type": "multiselect",
          "source_column": "cuales",
          "show_if": {
            "field": "ha_viajado_a_algun_pais_en_los_ultimos_5_anos",
            "operator": "eq",
            "value": true
          },
          "source_type": "EnumList",
          "confirmed_values": [
            "México",
            "Colombia"
          ],
          "required": false,
          "suggestions": [
            "México",
            "Colombia"
          ],
          "allow_custom_value": true
        }
      ]
    },
    {
      "id": "organizaciones_idiomas",
      "label": "Organizaciones e idiomas",
      "fields": [
        {
          "key": "ha_participado_o_contribuido_en_alguna_organizacion_social_de_caridad_u_ong",
          "label": "¿Ha participado o contribuido en alguna organización social, de caridad u ONG?",
          "type": "text",
          "source_column": "ha_participado_o_contribuido_en_alguna_organizacion_social_de_caridad_u_ong",
          "required": false
        },
        {
          "key": "que_idioma_habla",
          "label": "¿Qué idiomas habla?",
          "type": "multiselect",
          "source_column": "que_idioma_habla",
          "required": false,
          "suggestions": [
            "Español",
            "Mam",
            "Ingles"
          ],
          "allow_custom_value": true
        }
      ]
    },
    {
      "id": "consulados",
      "label": "Consulados disponibles",
      "fields": [
        {
          "key": "conuslados_a_donde_puede_ir",
          "label": "Consulados a donde puede ir",
          "type": "multiselect",
          "source_column": "conuslados_a_donde_puede_ir",
          "source_type": "EnumList",
          "enum_status": "NO PUDE CONFIRMARLO",
          "required": false,
          "suggestions": [],
          "allow_custom_value": true
        }
      ]
    }
  ]
}$visa$::jsonb,NOW(),NOW())
ON CONFLICT (clave) DO NOTHING;
COMMIT;
