-- Review only. Resolve the active ETA catalog row by name; do not guess an ID.
-- The country is NULL because ETA's audited form is not country-specific.
BEGIN;
DO $eta_v1$
DECLARE
  eta_type_id integer;
  eta_type_count integer;
  current_template public.perfil_plantillas%ROWTYPE;
  expected_json jsonb := $eta_json${
  "schema_version": 2,
  "profile_kind": "eta",
  "source": {
    "app": "VISA Y PASAPORTES INDIVIDUALES",
    "schema": "PERFIL ETA_Schema",
    "audited_date": "2026-09-22",
    "columns": 45,
    "physical": 39,
    "virtual": 6,
    "show_if": 2
  },
  "activation": {
    "applies_to": "new_profiles_only",
    "preserves_existing_profiles": true
  },
  "canonical_information": [
    "Id_formulario",
    "Id_aplicante"
  ],
  "relation_metadata": [
    {
      "source_column": "Id_aplicante",
      "referenced_table": "ETA",
      "is_part_of": true,
      "classification": "parent_reference"
    }
  ],
  "virtual_columns": [
    {
      "source_column": "Información del pasaporte",
      "type": "Show",
      "formula": "=Información del pasaporte",
      "classification": "section_navigation"
    },
    {
      "source_column": "Datos de la visa",
      "type": "Show",
      "formula": "=Datos de la visa",
      "classification": "section_navigation"
    },
    {
      "source_column": "Datos personales del aplicante",
      "type": "Show",
      "formula": "=Datos personales del aplicante",
      "classification": "section_navigation"
    },
    {
      "source_column": "Información del empleo",
      "type": "Show",
      "formula": "=Información del empleo",
      "classification": "section_navigation"
    },
    {
      "source_column": "Información del viaje",
      "type": "Show",
      "formula": "=Información del viaje",
      "classification": "section_navigation"
    },
    {
      "source_column": "Antecedentes",
      "type": "Show",
      "formula": "=Antecedentes",
      "classification": "section_navigation"
    }
  ],
  "sections": [
    {
      "id": "pasaporte",
      "label": "Información del pasaporte",
      "fields": [
        {
          "key": "numero_pasaporte",
          "source_column": "numero_pasaporte",
          "label": "Número de pasaporte",
          "type": "text",
          "required": false
        },
        {
          "key": "fecha_emision_pasaporte",
          "source_column": "fecha_emision_pasaporte",
          "label": "Fecha de emisión del pasaporte",
          "type": "date",
          "required": false
        },
        {
          "key": "fecha_expiracion_pasaporte",
          "source_column": "fecha_expiracion_pasaporte",
          "label": "Fecha en que expira el pasaporte",
          "type": "date",
          "required": false
        }
      ]
    },
    {
      "id": "visa",
      "label": "Datos de la visa",
      "fields": [
        {
          "key": "numero_visa",
          "source_column": "numero_visa",
          "label": "Número de visa",
          "type": "text",
          "required": false
        },
        {
          "key": "fecha_emision_visa",
          "source_column": "fecha_emision_visa",
          "label": "Fecha de emisión de la visa",
          "type": "date",
          "required": false
        },
        {
          "key": "fecha_expiracion_visa",
          "source_column": "fecha_expiracion_visa",
          "label": "Fecha en que expira la visa",
          "type": "date",
          "required": false
        }
      ]
    },
    {
      "id": "personales",
      "label": "Datos personales del aplicante",
      "fields": [
        {
          "key": "sexo",
          "source_column": "sexo",
          "label": "Sexo",
          "type": "select",
          "required": false,
          "options": [
            "Masculino",
            "Femenino"
          ]
        },
        {
          "key": "fecha_nacimiento",
          "source_column": "fecha_nacimiento",
          "label": "Fecha de Nacimiento",
          "type": "date",
          "required": false
        },
        {
          "key": "ciudad_nacimiento",
          "source_column": "ciudad_nacimiento",
          "label": "Ciudad de nacimiento",
          "type": "text",
          "required": false
        },
        {
          "key": "estado_nacimiento",
          "source_column": "estado_nacimiento",
          "label": "Estado",
          "type": "text",
          "required": false
        },
        {
          "key": "pais_nacimiento",
          "source_column": "pais_nacimiento",
          "label": "País de nacimiento",
          "type": "text",
          "required": false
        },
        {
          "key": "nacionalidad",
          "source_column": "nacionalidad",
          "label": "Nacionalidad",
          "type": "text",
          "required": false
        },
        {
          "key": "nacionalidad_otra",
          "source_column": "nacionalidad_otra",
          "label": "nacionalidad_otra",
          "type": "text",
          "required": false
        },
        {
          "key": "estado_civil",
          "source_column": "estado_civil",
          "label": "Estado civil",
          "type": "select",
          "required": false,
          "options": [
            "Casado",
            "Soltero",
            "Viudo",
            "Divorciado",
            "Legalmente Separado",
            "Unión Libre"
          ]
        },
        {
          "key": "ha_aplicado_anteriormente_canada",
          "source_column": "ha_aplicado_anteriormente_canada",
          "label": "¿Ha aplicado anteriormente para una Visa, una eTA o permiso para visitar, vivir, trabajar o estudiar en Canadá?",
          "type": "boolean",
          "required": false
        },
        {
          "key": "numero_visa_eta_permiso_anterior_canada",
          "source_column": "numero_visa_eta_permiso_anterior_canada",
          "label": "Indique su Visa Canadiense anterior, eTA o número de permiso",
          "type": "text",
          "required": false
        }
      ]
    },
    {
      "id": "empleo",
      "label": "Información del empleo",
      "fields": [
        {
          "key": "ocupacion_actual",
          "source_column": "ocupacion_actual",
          "label": "Ocupación actual",
          "type": "text",
          "required": false
        },
        {
          "key": "empleador",
          "source_column": "empleador",
          "label": "Empleador",
          "type": "text",
          "required": false
        },
        {
          "key": "empleo_desde_ano",
          "source_column": "empleo_desde_ano",
          "label": "¿Desde qué año?",
          "type": "text",
          "required": false
        },
        {
          "key": "empleo_ciudad",
          "source_column": "empleo_ciudad",
          "label": "Ciudad del empleo",
          "type": "text",
          "required": false
        },
        {
          "key": "empleo_pais",
          "source_column": "empleo_pais",
          "label": "País del empleo",
          "type": "text",
          "required": false
        }
      ]
    },
    {
      "id": "domicilio",
      "label": "Domicilio",
      "fields": [
        {
          "key": "domicilio",
          "source_column": "domicilio",
          "label": "Direccción",
          "type": "text",
          "required": false
        },
        {
          "key": "colonia_aplicante",
          "source_column": "colonia_aplicante",
          "label": "Colonia",
          "type": "text",
          "required": false
        },
        {
          "key": "ciudad_aplicante",
          "source_column": "ciudad_aplicante",
          "label": "Ciudad",
          "type": "text",
          "required": false
        },
        {
          "key": "estado_aplicante",
          "source_column": "estado_aplicante",
          "label": "Estado",
          "type": "text",
          "required": false
        },
        {
          "key": "pais_aplicante",
          "source_column": "pais_aplicante",
          "label": "País",
          "type": "text",
          "required": false
        },
        {
          "key": "codigo_postal_aplicante",
          "source_column": "codigo_postal_aplicante",
          "label": "Codigo Postal",
          "type": "text",
          "required": false
        }
      ]
    },
    {
      "id": "viaje",
      "label": "Información del viaje",
      "fields": [
        {
          "key": "sabe_cuando_viajara_canada",
          "source_column": "sabe_cuando_viajara_canada",
          "label": "¿Sabe cuándo viajará a Canadá?",
          "type": "boolean",
          "required": false
        },
        {
          "key": "fecha_viaje",
          "source_column": "fecha_viaje",
          "label": "Fecha de viaje",
          "type": "text",
          "required": false
        },
        {
          "key": "hora_salida_vuelo",
          "source_column": "hora_salida_vuelo",
          "label": "Por favor indique la hora de salida de su vuelo",
          "type": "time",
          "required": false
        }
      ]
    },
    {
      "id": "antecedentes",
      "label": "Antecedentes",
      "fields": [
        {
          "key": "negacion_visa_entrada_salida_canada_otros",
          "source_column": "negacion_visa_entrada_salida_canada_otros",
          "label": "negacion_visa_entrada_salida_canada_otros",
          "type": "boolean",
          "required": false
        },
        {
          "key": "explicacion_negacion_visa_entrada_salida",
          "source_column": "explicacion_negacion_visa_entrada_salida",
          "label": "Explicación",
          "type": "text",
          "required": false,
          "show_if": {
            "field": "negacion_visa_entrada_salida_canada_otros",
            "operator": "eq",
            "value": true
          },
          "source_show_if": "\"= [negacion_visa_entrada_salida_canada_otros]=YES\""
        },
        {
          "key": "delito_penal_antecedentes",
          "source_column": "delito_penal_antecedentes",
          "label": "¿Alguna vez ha cometido, ha sido arrestado, acusado o condenado por algún delito penal en algún país/territorio?",
          "type": "boolean",
          "required": false
        },
        {
          "key": "explicacion_delito_penal",
          "source_column": "explicacion_delito_penal",
          "label": "Explicación (Ciudad, año y sentencia)",
          "type": "textarea",
          "required": false,
          "show_if": {
            "field": "delito_penal_antecedentes",
            "operator": "eq",
            "value": true
          },
          "source_show_if": "\"= [delito_penal_antecedentes]=YES\""
        },
        {
          "key": "detalles_adicionales_solicitud",
          "source_column": "detalles_adicionales_solicitud",
          "label": "Detalles adicionales de su solicitud",
          "type": "text",
          "required": false
        },
        {
          "key": "detalles_relevantes_demoras_eta_cancelada",
          "source_column": "detalles_relevantes_demoras_eta_cancelada",
          "label": "Proporcione detalles relevantes para evitar demoras en el procesamiento de su solicitud",
          "type": "text",
          "required": false
        }
      ]
    }
  ]
}$eta_json$::jsonb;
BEGIN
  SELECT count(*), min(id_tipo_tramite) INTO eta_type_count, eta_type_id
  FROM public.tipos_tramite
  WHERE activo=true AND lower(trim(nombre_tramite)) IN ('eta','e.t.a.','e-t-a');
  IF eta_type_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active ETA tipo_tramite; found %', eta_type_count;
  END IF;
  SELECT * INTO current_template FROM public.perfil_plantillas
  WHERE clave='perfil_eta_v1' LIMIT 1;
  IF current_template.id_plantilla IS NOT NULL THEN
    IF current_template.version IS DISTINCT FROM 1
      OR current_template.id_tipo_tramite IS DISTINCT FROM eta_type_id
      OR current_template.id_pais IS NOT NULL
      OR current_template.activo IS DISTINCT FROM true
      OR current_template.estructura_json IS DISTINCT FROM expected_json THEN
      RAISE EXCEPTION 'Existing perfil_eta_v1 differs; inspect without overwriting';
    END IF;
  ELSE
    INSERT INTO public.perfil_plantillas
      (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
    VALUES ('Perfil ETA V1','perfil_eta_v1',1,true,eta_type_id,NULL,expected_json,NOW(),NOW());
  END IF;
END $eta_v1$;
COMMIT;
