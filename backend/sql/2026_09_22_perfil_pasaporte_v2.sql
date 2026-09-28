-- Review only. V1 mappings supply catalog IDs; no IDs are guessed.
-- V2 is selected only for new profiles. Existing profiles keep id_plantilla V1.
BEGIN;
DO $passport_1$
DECLARE
  source_template public.perfil_plantillas%ROWTYPE;
  current_template public.perfil_plantillas%ROWTYPE;
  expected_json jsonb := $json_1${
  "schema_version": 2,
  "profile_kind": "passport",
  "country": "México",
  "source": {
    "app": "VISA Y PASAPORTES INDIVIDUALES",
    "schema": "PERFIL PASAPORTES_Schema",
    "audited_date": "2026-09-22",
    "columns": 89,
    "physical": 78,
    "virtual": 11,
    "show_if": 64
  },
  "activation": {
    "applies_to": "new_profiles_only",
    "preserves_existing_profiles": true
  },
  "canonical_information": [
    "Id_formulario",
    "Id_aplicante",
    "País de residencia"
  ],
  "virtual_columns": [
    {
      "source_column": "País de residencia",
      "type": "Ref",
      "formula": "=[Id_aplicante].[PaisGestion]",
      "show_if": null,
      "classification": "reference_auxiliary"
    },
    {
      "source_column": "Información de los padres",
      "type": "Show",
      "formula": "=\"Información familiar\"",
      "show_if": "\"= [País de residencia]=\\\"Estados Unidos\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Información personal",
      "type": "Show",
      "formula": "=\"Información personal\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Información de domicilio",
      "type": "Show",
      "formula": "=\"Información de domicilio\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Características físicas",
      "type": "Show",
      "formula": "=\"Características físicas\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Ocupación",
      "type": "Show",
      "formula": "=\"Ocupación\"",
      "show_if": "\"=[País de residencia] <>\\\"México\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Contacto en EUA",
      "type": "Show",
      "formula": "=\"Contacto en EUA\"",
      "show_if": "\"= [País de residencia]=\\\"Estados Unidos\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Cónyuge",
      "type": "Show",
      "formula": "=\"Cónyuge\"",
      "show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Pasaporte",
      "type": "Show",
      "formula": "=\"Pasaporte\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Oficina de preferencia",
      "type": "Show",
      "formula": "=\"Oficina de preferencia\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Información de cita",
      "type": "Show",
      "formula": "=\"Información de cita\"",
      "show_if": "\"= [País de residencia]=\\\"Guatemala\\\"\"",
      "classification": "section_navigation"
    }
  ],
  "sections": [
    {
      "id": "acceso_personal",
      "label": "Información personal",
      "fields": [
        {
          "key": "correo_electronico",
          "source_column": "correo_electronico",
          "label": "Correo electronico",
          "type": "email",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "numero_identificacion_principal",
          "source_column": "numero_identificacion_principal",
          "label": "Numero de identificación",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "fecha_nacimiento",
          "source_column": "fecha_nacimiento",
          "label": "Fecha de nacimiento",
          "type": "date",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "edad",
          "source_column": "edad",
          "label": "Edad",
          "type": "number",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"Estados Unidos\\\"\""
        },
        {
          "key": "estado_civil",
          "source_column": "estado_civil",
          "label": "Estado Civil",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"Guatemala\\\"\""
        },
        {
          "key": "lugar_nacimiento",
          "source_column": "lugar_nacimiento",
          "label": "Lugar de nacimiento",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"Guatemala\\\"\""
        },
        {
          "key": "tez",
          "source_column": "tez",
          "label": "tez",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    },
    {
      "id": "domicilio",
      "label": "Información de domicilio",
      "fields": [
        {
          "key": "domicilio_calle_numero",
          "source_column": "domicilio_calle_numero",
          "label": "Domicilio Calle y numero",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "colonia",
          "source_column": "colonia",
          "label": "Colonia",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "codigo_postal",
          "source_column": "codigo_postal",
          "label": "Código postal",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"Guatemala\\\"\""
        },
        {
          "key": "municipio",
          "source_column": "municipio",
          "label": "Municipio",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "estado_departamento",
          "source_column": "estado_departamento",
          "label": "Estado/Departamento",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "pais",
          "source_column": "pais",
          "label": "País",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null,
          "source_initial_value": "=[Id_aplicante].[Pais]"
        },
        {
          "key": "numero_telefono",
          "source_column": "numero_telefono",
          "label": "Número de télefono",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "telefono_adicional",
          "source_column": "telefono_adicional",
          "label": "Número adicional",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"Guatemala\\\"\""
        }
      ]
    },
    {
      "id": "identificacion_mexico",
      "label": "Acta e INE",
      "fields": [
        {
          "key": "folio_acta_nacimiento",
          "source_column": "folio_acta_nacimiento",
          "label": "folio de acta de nacimiento",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"México\\\"\""
        },
        {
          "key": "fecha_registro_nacimiento",
          "source_column": "fecha_registro_nacimiento",
          "label": "Registro de nacimiento",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"México\\\"\""
        },
        {
          "key": "libro_registro_nacimiento",
          "source_column": "libro_registro_nacimiento",
          "label": "Libro de registro de nacimiento",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"México\\\"\""
        },
        {
          "key": "numero_ine",
          "source_column": "numero_ine",
          "label": "Número de INE",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"México\\\"\""
        },
        {
          "key": "anio_ine",
          "source_column": "anio_ine",
          "label": "Año de INE",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"México\\\"\""
        },
        {
          "key": "clave_ine",
          "source_column": "clave_ine",
          "label": "Clave de INE",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"México\\\"\""
        }
      ]
    },
    {
      "id": "pasaporte",
      "label": "Pasaporte",
      "fields": [
        {
          "key": "tipo_pasaporte",
          "source_column": "tipo_pasaporte",
          "label": "Tipo de pasaporte",
          "type": "select",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null,
          "options": [
            "Adulto nuevo",
            "Adulto renovación",
            "Adulto renovación por extravió",
            "Menor de edad nuevo",
            "Menor de edad renovación",
            "Menor de edad renovación por extravió"
          ]
        },
        {
          "key": "pais_solicitud_pasaporte",
          "source_column": "pais_solicitud_pasaporte",
          "label": "País donde realiza su solicitud de pasaporte",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "vigencia_pasaporte_solicitado",
          "source_column": "vigencia_pasaporte_solicitado",
          "label": "Vigencia de pasaporte solicitado",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    },
    {
      "id": "cita",
      "label": "Oficina e información de cita",
      "fields": [
        {
          "key": "preferencia_cita_oficina_consulado",
          "source_column": "preferencia_cita_oficina_consulado",
          "label": "¿Qué oficina/Cónsulado prefiere?",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    },
    {
      "id": "notas",
      "label": "Notas",
      "fields": [
        {
          "key": "notas_pasporte",
          "source_column": "notas_pasporte",
          "label": "notas_pasporte",
          "type": "textarea",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    }
  ]
}$json_1$::jsonb;
BEGIN
  SELECT * INTO source_template FROM public.perfil_plantillas
  WHERE clave='perfil_pasaporte_mexico' AND activo=true LIMIT 1;
  IF source_template.id_plantilla IS NULL THEN
    RAISE EXCEPTION 'Active legacy mapping perfil_pasaporte_mexico is required; catalog IDs were not guessed';
  END IF;
  SELECT * INTO current_template FROM public.perfil_plantillas
  WHERE clave='perfil_pasaporte_mexico_v2' LIMIT 1;
  IF current_template.id_plantilla IS NOT NULL THEN
    IF current_template.version IS DISTINCT FROM 2
      OR current_template.id_tipo_tramite IS DISTINCT FROM source_template.id_tipo_tramite
      OR current_template.id_pais IS DISTINCT FROM source_template.id_pais
      OR current_template.activo IS DISTINCT FROM true
      OR current_template.estructura_json IS DISTINCT FROM expected_json THEN
      RAISE EXCEPTION 'Existing perfil_pasaporte_mexico_v2 differs; inspect without overwriting';
    END IF;
  ELSE
    INSERT INTO public.perfil_plantillas
      (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
    VALUES ('Perfil Pasaporte México V2','perfil_pasaporte_mexico_v2',2,true,source_template.id_tipo_tramite,
      source_template.id_pais,expected_json,NOW(),NOW());
  END IF;
END $passport_1$;

DO $passport_2$
DECLARE
  source_template public.perfil_plantillas%ROWTYPE;
  current_template public.perfil_plantillas%ROWTYPE;
  expected_json jsonb := $json_2${
  "schema_version": 2,
  "profile_kind": "passport",
  "country": "Guatemala",
  "source": {
    "app": "VISA Y PASAPORTES INDIVIDUALES",
    "schema": "PERFIL PASAPORTES_Schema",
    "audited_date": "2026-09-22",
    "columns": 89,
    "physical": 78,
    "virtual": 11,
    "show_if": 64
  },
  "activation": {
    "applies_to": "new_profiles_only",
    "preserves_existing_profiles": true
  },
  "canonical_information": [
    "Id_formulario",
    "Id_aplicante",
    "País de residencia"
  ],
  "virtual_columns": [
    {
      "source_column": "País de residencia",
      "type": "Ref",
      "formula": "=[Id_aplicante].[PaisGestion]",
      "show_if": null,
      "classification": "reference_auxiliary"
    },
    {
      "source_column": "Información de los padres",
      "type": "Show",
      "formula": "=\"Información familiar\"",
      "show_if": "\"= [País de residencia]=\\\"Estados Unidos\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Información personal",
      "type": "Show",
      "formula": "=\"Información personal\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Información de domicilio",
      "type": "Show",
      "formula": "=\"Información de domicilio\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Características físicas",
      "type": "Show",
      "formula": "=\"Características físicas\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Ocupación",
      "type": "Show",
      "formula": "=\"Ocupación\"",
      "show_if": "\"=[País de residencia] <>\\\"México\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Contacto en EUA",
      "type": "Show",
      "formula": "=\"Contacto en EUA\"",
      "show_if": "\"= [País de residencia]=\\\"Estados Unidos\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Cónyuge",
      "type": "Show",
      "formula": "=\"Cónyuge\"",
      "show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\"",
      "classification": "section_navigation"
    },
    {
      "source_column": "Pasaporte",
      "type": "Show",
      "formula": "=\"Pasaporte\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Oficina de preferencia",
      "type": "Show",
      "formula": "=\"Oficina de preferencia\"",
      "show_if": null,
      "classification": "section_navigation"
    },
    {
      "source_column": "Información de cita",
      "type": "Show",
      "formula": "=\"Información de cita\"",
      "show_if": "\"= [País de residencia]=\\\"Guatemala\\\"\"",
      "classification": "section_navigation"
    }
  ],
  "sections": [
    {
      "id": "acceso_personal",
      "label": "Información personal",
      "fields": [
        {
          "key": "correo_electronico",
          "source_column": "correo_electronico",
          "label": "Correo electronico",
          "type": "email",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "numero_identificacion_principal",
          "source_column": "numero_identificacion_principal",
          "label": "Numero de identificación",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "fecha_nacimiento",
          "source_column": "fecha_nacimiento",
          "label": "Fecha de nacimiento",
          "type": "date",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "edad",
          "source_column": "edad",
          "label": "Edad",
          "type": "number",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"Estados Unidos\\\"\""
        },
        {
          "key": "idioma_hablado",
          "source_column": "idioma_hablado",
          "label": "Idioma hablado",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"Guatemala\\\"\""
        },
        {
          "key": "estatura_cm",
          "source_column": "estatura_cm",
          "label": "Altura",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"México\\\"\""
        },
        {
          "key": "tez",
          "source_column": "tez",
          "label": "tez",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "color_ojos",
          "source_column": "color_ojos",
          "label": "Color de ojos",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"México\\\"\""
        }
      ]
    },
    {
      "id": "domicilio",
      "label": "Información de domicilio",
      "fields": [
        {
          "key": "domicilio_calle_numero",
          "source_column": "domicilio_calle_numero",
          "label": "Domicilio Calle y numero",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "colonia",
          "source_column": "colonia",
          "label": "Colonia",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "municipio",
          "source_column": "municipio",
          "label": "Municipio",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "estado_departamento",
          "source_column": "estado_departamento",
          "label": "Estado/Departamento",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "pais",
          "source_column": "pais",
          "label": "País",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null,
          "source_initial_value": "=[Id_aplicante].[Pais]"
        },
        {
          "key": "numero_telefono",
          "source_column": "numero_telefono",
          "label": "Número de télefono",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    },
    {
      "id": "pasaporte",
      "label": "Pasaporte",
      "fields": [
        {
          "key": "tipo_pasaporte",
          "source_column": "tipo_pasaporte",
          "label": "Tipo de pasaporte",
          "type": "select",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null,
          "options": [
            "Adulto nuevo",
            "Adulto renovación",
            "Adulto renovación por extravió",
            "Menor de edad nuevo",
            "Menor de edad renovación",
            "Menor de edad renovación por extravió"
          ]
        },
        {
          "key": "pais_solicitud_pasaporte",
          "source_column": "pais_solicitud_pasaporte",
          "label": "País donde realiza su solicitud de pasaporte",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "vigencia_pasaporte_solicitado",
          "source_column": "vigencia_pasaporte_solicitado",
          "label": "Vigencia de pasaporte solicitado",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    },
    {
      "id": "cita",
      "label": "Oficina e información de cita",
      "fields": [
        {
          "key": "preferencia_cita_oficina_consulado",
          "source_column": "preferencia_cita_oficina_consulado",
          "label": "¿Qué oficina/Cónsulado prefiere?",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        },
        {
          "key": "numero_boleta",
          "source_column": "numero_boleta",
          "label": "Número de boleta",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"Guatemala\\\"\""
        },
        {
          "key": "numero_correlativo",
          "source_column": "numero_correlativo",
          "label": "Número corelativo",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"Guatemala\\\"\""
        },
        {
          "key": "fecha_pago_boleta",
          "source_column": "fecha_pago_boleta",
          "label": "Fecha de pago de boleta",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"Guatemala\\\"\""
        }
      ]
    },
    {
      "id": "ocupacion",
      "label": "Ocupación",
      "fields": [
        {
          "key": "ocupacion",
          "source_column": "ocupacion",
          "label": "Ocupación actual",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": "\"=[País de residencia]<> \\\"México\\\"\""
        },
        {
          "key": "ocupacion_dpi",
          "source_column": "ocupacion_dpi",
          "label": "Ocupación en DPI",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"Guatemala\\\"\""
        },
        {
          "key": "dpi_ocupacion_registrada",
          "source_column": "dpi_ocupacion_registrada",
          "label": "Ocupación registrada",
          "type": "text",
          "required": false,
          "applies_to_countries": [
            "Guatemala"
          ],
          "source_show_if": "\"=[País de residencia]=\\\"Guatemala\\\"\""
        }
      ]
    },
    {
      "id": "notas",
      "label": "Notas",
      "fields": [
        {
          "key": "notas_pasporte",
          "source_column": "notas_pasporte",
          "label": "notas_pasporte",
          "type": "textarea",
          "required": false,
          "applies_to_countries": [
            "México",
            "Guatemala",
            "Estados Unidos"
          ],
          "source_show_if": null
        }
      ]
    }
  ]
}$json_2$::jsonb;
BEGIN
  SELECT * INTO source_template FROM public.perfil_plantillas
  WHERE clave='perfil_pasaporte_guatemala' AND activo=true LIMIT 1;
  IF source_template.id_plantilla IS NULL THEN
    RAISE EXCEPTION 'Active legacy mapping perfil_pasaporte_guatemala is required; catalog IDs were not guessed';
  END IF;
  SELECT * INTO current_template FROM public.perfil_plantillas
  WHERE clave='perfil_pasaporte_guatemala_v2' LIMIT 1;
  IF current_template.id_plantilla IS NOT NULL THEN
    IF current_template.version IS DISTINCT FROM 2
      OR current_template.id_tipo_tramite IS DISTINCT FROM source_template.id_tipo_tramite
      OR current_template.id_pais IS DISTINCT FROM source_template.id_pais
      OR current_template.activo IS DISTINCT FROM true
      OR current_template.estructura_json IS DISTINCT FROM expected_json THEN
      RAISE EXCEPTION 'Existing perfil_pasaporte_guatemala_v2 differs; inspect without overwriting';
    END IF;
  ELSE
    INSERT INTO public.perfil_plantillas
      (nombre,clave,version,activo,id_tipo_tramite,id_pais,estructura_json,creado_en,actualizado_en)
    VALUES ('Perfil Pasaporte Guatemala V2','perfil_pasaporte_guatemala_v2',2,true,source_template.id_tipo_tramite,
      source_template.id_pais,expected_json,NOW(),NOW());
  END IF;
END $passport_2$;
COMMIT;
