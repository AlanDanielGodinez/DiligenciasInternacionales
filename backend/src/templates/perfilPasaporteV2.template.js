// Generated from the audited PERFIL PASAPORTES_Schema. Do not execute database operations here.
const FIELD_DEFINITIONS = [
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
    "key": "contrasena",
    "source_column": "contrasena",
    "label": "Contraseña",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "México",
      "Guatemala",
      "Estados Unidos"
    ],
    "source_show_if": null,
    "operational": true
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
    "key": "otros_nombres",
    "source_column": "otros_nombres",
    "label": "Otros nombres",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
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
  },
  {
    "key": "color_cabello",
    "source_column": "color_cabello",
    "label": "Color de cabello",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
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
  },
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
  },
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
    "key": "numero_pasaporte_anterior",
    "source_column": "numero_pasaporte_anterior",
    "label": "Número de pasaporte anterior",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_emision_pasaporte_anterior",
    "source_column": "fecha_emision_pasaporte_anterior",
    "label": "Fecha de emisión de pasaporte anterior",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_caducidad_pasaporte_anterior",
    "source_column": "fecha_caducidad_pasaporte_anterior",
    "label": "Fecha de Vencimiento de pasporte anterior",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "nombre_pasaporte_anterior",
    "source_column": "nombre_pasaporte_anterior",
    "label": "Nombre que uso en el pasaporte anterior",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "pasaporte_perdido_robado",
    "source_column": "pasaporte_perdido_robado",
    "label": "¿Su pasaporte fue perdido o robado?",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
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
  },
  {
    "key": "pasaporte_envio_misma_direccion",
    "source_column": "pasaporte_envio_misma_direccion",
    "label": "¿Quiere que el pasaporte se envíe su dirección de residencia?",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "envio_pasaporte_calle_numero",
    "source_column": "envio_pasaporte_calle_numero",
    "label": "Domicilio calle y numero",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]=\\\"Estados Unidos\\\")\"",
    "show_if": {
      "field": "pasaporte_envio_misma_direccion",
      "operator": "eq",
      "value": "YES"
    }
  },
  {
    "key": "envio_pasaporte_colonia",
    "source_column": "envio_pasaporte_colonia",
    "label": "Colonia",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]=\\\"Estados Unidos\\\")\"",
    "show_if": {
      "field": "pasaporte_envio_misma_direccion",
      "operator": "eq",
      "value": "YES"
    }
  },
  {
    "key": "envio_pasaporte_codigo_postal",
    "source_column": "envio_pasaporte_codigo_postal",
    "label": "Código postal",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]=\\\"Estados Unidos\\\")\"",
    "show_if": {
      "field": "pasaporte_envio_misma_direccion",
      "operator": "eq",
      "value": "YES"
    }
  },
  {
    "key": "envio_pasaporte_ciudad",
    "source_column": "envio_pasaporte_ciudad",
    "label": "Ciúdad",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]=\\\"2ebd2c52\\\")\"",
    "show_if": {
      "field": "pasaporte_envio_misma_direccion",
      "operator": "eq",
      "value": "YES"
    }
  },
  {
    "key": "envio_pasaporte_estado",
    "source_column": "envio_pasaporte_estado",
    "label": "Estado",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]=\\\"Estados Unidos\\\")\"",
    "show_if": {
      "field": "pasaporte_envio_misma_direccion",
      "operator": "eq",
      "value": "YES"
    }
  },
  {
    "key": "envio_pasaporte_pais",
    "source_column": "envio_pasaporte_pais",
    "label": "País",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]=\\\"Estados Unidos\\\")\"",
    "show_if": {
      "field": "pasaporte_envio_misma_direccion",
      "operator": "eq",
      "value": "YES"
    }
  },
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
  },
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
  },
  {
    "key": "nombre_empresa_escuela",
    "source_column": "nombre_empresa_escuela",
    "label": "Nombre de empresa/escuela",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "nombre_padre",
    "source_column": "nombre_padre",
    "label": "Nombre del padre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "apellidos_padre",
    "source_column": "apellidos_padre",
    "label": "Apellidos del padre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_nacimiento_padre",
    "source_column": "fecha_nacimiento_padre",
    "label": "Fecha de nacimiento del padre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "padre_americano",
    "source_column": "padre_americano",
    "label": "¿Su padre es estadounidense?",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "lugar_nacimiento_padre",
    "source_column": "lugar_nacimiento_padre",
    "label": "Lugar de nacimiento del padre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "nombre_madre",
    "source_column": "nombre_madre",
    "label": "Nombre de la madre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "apellidos_madre",
    "source_column": "apellidos_madre",
    "label": "Apellidos de la madre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_nacimiento_madre",
    "source_column": "fecha_nacimiento_madre",
    "label": "Fecha de nacimiento de la madre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "madre_americano",
    "source_column": "madre_americano",
    "label": "¿Su madre es estadounidense?",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "lugar_nacimiento_madre",
    "source_column": "lugar_nacimiento_madre",
    "label": "Lugar de nacimiento",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "nombre_conyuge",
    "source_column": "nombre_conyuge",
    "label": "Nombre de conyugue",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "apellidos_conyuge",
    "source_column": "apellidos_conyuge",
    "label": "Apellidos de conyuge",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_nacimiento_conyuge",
    "source_column": "fecha_nacimiento_conyuge",
    "label": "Fecha de nacimiento de conyugue",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "conyuge_americano",
    "source_column": "conyuge_americano",
    "label": "Su Conyugue es estadounidense",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "lugar_nacimiento_conyuge",
    "source_column": "lugar_nacimiento_conyuge",
    "label": "Lugar de nacimiento de conyugue",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_matrimonio",
    "source_column": "fecha_matrimonio",
    "label": "Fecha de matrimonio",
    "type": "date",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "fecha_divorcio",
    "source_column": "fecha_divorcio",
    "label": "Fecha de divorcio",
    "type": "date",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_nombre",
    "source_column": "contacto_usa_nombre",
    "label": "Nombre",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_telefono",
    "source_column": "contacto_usa_telefono",
    "label": "Apellidos",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_relacion",
    "source_column": "contacto_usa_relacion",
    "label": "¿Qué relación tiene con su contacto en EUA?",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_direccion",
    "source_column": "contacto_usa_direccion",
    "label": "Dirección calle y número",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_codigo_postal",
    "source_column": "contacto_usa_codigo_postal",
    "label": "Código postal",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_ciudad",
    "source_column": "contacto_usa_ciudad",
    "label": "Ciúdad",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
  {
    "key": "contacto_usa_estado",
    "source_column": "contacto_usa_estado",
    "label": "Estado",
    "type": "text",
    "required": false,
    "applies_to_countries": [
      "Estados Unidos"
    ],
    "source_show_if": "\"=[País de residencia]=\\\"Estados Unidos\\\"\""
  },
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
];

const VIRTUAL_COLUMNS = [
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
];

const SECTION_DEFINITIONS = [
  [
    "acceso_personal",
    "Información personal",
    4,
    16
  ],
  [
    "domicilio",
    "Información de domicilio",
    17,
    24
  ],
  [
    "identificacion_mexico",
    "Acta e INE",
    25,
    30
  ],
  [
    "pasaporte",
    "Pasaporte",
    31,
    45
  ],
  [
    "cita",
    "Oficina e información de cita",
    46,
    49
  ],
  [
    "ocupacion",
    "Ocupación",
    50,
    53
  ],
  [
    "padres",
    "Información de los padres",
    54,
    63
  ],
  [
    "conyuge",
    "Cónyuge",
    64,
    70
  ],
  [
    "contacto_usa",
    "Contacto en EUA",
    71,
    77
  ],
  [
    "notas",
    "Notas",
    78,
    78
  ]
];

const COUNTRY_IDS = { 'México': 1, 'Guatemala': 2 };
const TRAMITE_IDS = { 'México': 15, 'Guatemala': 14 };

function buildPassportTemplate(country) {
  if (!['México','Guatemala','Estados Unidos'].includes(country)) throw new Error('Unsupported passport country');
  const sections = SECTION_DEFINITIONS.map(([id,label,start,end]) => ({ id, label, fields: FIELD_DEFINITIONS.filter(field => {
    const number = Number(field.source_column === 'notas_pasporte' ? 78 : FIELD_DEFINITIONS.indexOf(field) + 4);
    return number >= start && number <= end && !field.operational && field.applies_to_countries.includes(country);
  }).map(field => JSON.parse(JSON.stringify(field))) })).filter(section => section.fields.length);
  return { schema_version: 2, profile_kind: 'passport', country, source: { app: 'VISA Y PASAPORTES INDIVIDUALES', schema: 'PERFIL PASAPORTES_Schema', audited_date: '2026-09-22', columns: 89, physical: 78, virtual: 11, show_if: 64 }, activation: { applies_to: 'new_profiles_only', preserves_existing_profiles: true }, canonical_information: ['Id_formulario','Id_aplicante','País de residencia'], virtual_columns: VIRTUAL_COLUMNS, sections };
}

module.exports = { buildPassportTemplate, FIELD_DEFINITIONS, VIRTUAL_COLUMNS, COUNTRY_IDS, TRAMITE_IDS };
