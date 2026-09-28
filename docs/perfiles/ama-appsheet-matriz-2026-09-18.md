# Matriz AppSheet AMA — 17/08/2026

Fuente: `docs/appsheet/Application Documentation Formularios.pdf`, esquema `PERFILES AMA_Schema`, columnas 1–139. Las columnas técnicas y virtuales se incluyen para trazabilidad; no equivalen a preguntas capturables.

En el PDF se detectan 83 `Show_If` no nulos y ningún `Required_If`, `Valid_If`, `Editable_If` o `Reset_If` no nulo en este esquema. Ocho condiciones se partían en saltos de página y se recuperaron en la segunda lectura.

| Nº | Campo / clave AppSheet | Sección | Tipo AppSheet | Condición Show_If | Depende de | Valor esperado | Acción |
|---:|---|---|---|---|---|---|---|
| 1 | _RowNumber | Información general | Number | — | — | — | Sin Show_If documentado |
| 2 | ID FORMULARIO | Información general | Text | — | — | — | Sin Show_If documentado |
| 3 | ID APLICANTE | Información general | Ref | — | — | — | Sin Show_If documentado |
| 4 | ¿HA USADO OTRO NOMBRE O LO HA MODIFICADO? | Información general | Yes/No | — | — | — | Sin Show_If documentado |
| 5 | ¿CUAL FUE SU OTRO NOMBRE? | Información general | LongText | [¿HA USADO OTRO NOMBRE O LO HA MODIFICADO?]="YES" | ¿HA USADO OTRO NOMBRE O LO HA MODIFICADO? | ="YES" | V3: regla declarativa |
| 6 | ESTADO CIVIL | Información general | Enum | — | — | — | Sin Show_If documentado |
| 7 | ¿TIENE ALGUNA OTRA NACIONALIDAD? | Nacimiento | Yes/No | — | — | — | Sin Show_If documentado |
| 8 | ¿CUAL ES SU OTRA NACIONALIDAD? | Nacimiento | LongText | [¿TIENE ALGUNA OTRA NACIONALIDAD?]="YES" | ¿TIENE ALGUNA OTRA NACIONALIDAD? | ="YES" | V3: regla declarativa |
| 9 | ¿TRAMITO SU PASAPORTE? | Nacimiento | Yes/No | [¿TIENE ALGUNA OTRA NACIONALIDAD?]="YES" | ¿TIENE ALGUNA OTRA NACIONALIDAD? | ="YES" | V3: regla añadida en cierre |
| 10 | ¿TIENE ALGUNA DISCAPACIDAD? | Nacimiento | Yes/No | — | — | — | Sin Show_If documentado |
| 11 | ¿CUAL ES SU DISCAPACIDAD? | Nacimiento | LongText | [¿TIENE ALGUNA DISCAPACIDAD?]="YES" | ¿TIENE ALGUNA DISCAPACIDAD? | ="YES" | V3: regla declarativa |
| 12 | ¿SABE LEER? | Nacimiento | Yes/No | — | — | — | Sin Show_If documentado |
| 13 | ¿SABE ESCRIBIR? | Nacimiento | Yes/No | — | — | — | Sin Show_If documentado |
| 14 | ¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS? | Viajes anteriores | Yes/No | — | — | — | Sin Show_If documentado |
| 15 | ¿ENTRO DE MANERA ILEGAL O CON DOCUMENTOS FALSOS? | Viajes anteriores | Yes/No | [¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS?]="YES" | ¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS? | ="YES" | V3: regla declarativa |
| 16 | ¿CUANDO A ESTADO EN ESTADOS UNIDOS? | Viajes anteriores | LongText | [¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS?]="YES" | ¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS? | ="YES" | V3: regla añadida en cierre |
| 17 | ¿ALGUNA VEZ O HAN DEPORTADO DE MANERA VOLUNTARIA O INVOLUNTARIA? | Viajes anteriores | Yes/No | [¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS?]="YES" | ¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS? | ="YES" | V3: regla declarativa |
| 18 | ¿PAGO POR LOS COSTOS DE SU DEPORTACION? EXPLIQUE | Viajes anteriores | LongText | [¿ALGUNA VEZ O HAN DEPORTADO DE MANERA VOLUNTARIA O INVOLUNTARIA?]="YES" | ¿ALGUNA VEZ O HAN DEPORTADO DE MANERA VOLUNTARIA O INVOLUNTARIA? | ="YES" | V3: regla declarativa |
| 19 | ¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN? | Viajes anteriores | Yes/No | — | — | — | Sin Show_If documentado |
| 20 | ¿CUAL FUE EL DELITO? | Viajes anteriores | LongText | [¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN?]="YES" | ¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN? | ="YES" | V3: regla declarativa |
| 21 | ¿HUBO SENTENCIA? | Viajes anteriores | Yes/No | [¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN?]="YES" | ¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN? | ="YES" | V3: regla declarativa |
| 22 | ¿POR CUANTO TIEMPO FUE LA SENTENCIA? | Viajes anteriores | LongText | [¿HUBO SENTENCIA?]="YES" | ¿HUBO SENTENCIA? | ="YES" | V3: regla declarativa |
| 23 | ¿DONDE FUE EL DELITO? | Viajes anteriores | LongText | [¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN?]="YES" | ¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN? | ="YES" | V3: regla declarativa |
| 24 | ¿CUANDO FUE SU DELITO? | Viajes anteriores | Date | [¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN?]="YES" | ¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN? | ="YES" | V3: regla declarativa |
| 25 | EXPLIQUE SU DELITO | Viajes anteriores | LongText | [¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN?]="YES" | ¿EN EL PASADO COMETIO UN ACTO ILICITO O FELONIAL EN EEUU O EN SU PAIS DE ORIGEN? | ="YES" | V3: regla declarativa |
| 26 | TUVO USTED ALGUN HIJO EN LOS EUA | Viajes anteriores | Yes/No | [¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS?]="YES" | ¿ALGUNA VEZ A ENTRADO A ESTADOS UNIDOS? | ="YES" | V3: regla declarativa |
| 27 | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | Visa | Yes/No | — | — | — | Sin Show_If documentado |
| 28 | TIPO DE VISA | Visa | LongText | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 29 | FECHA DE EMISION | Visa | Date | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 30 | FECHA DE VENCIMIENTO | Visa | Date | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 31 | NUMERO DE VISA | Visa | Text | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 32 | ¿ESTA SOLICITANDO EL MISMO TIPO DE VISA? | Visa | Yes/No | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 33 | ¿ESTA APLICANDO EN EL MISMO PAIS DONDE LA VISA FUE EMITIDA Y EN SU PAIS DE RESIDENCIA PRINCIPAL? | Visa | Yes/No | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla añadida en cierre |
| 34 | ¿LE HAN SACADO HUELLAS AL MOMENTO DE TRAMITAR SU VISA? | Visa | Yes/No | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 35 | ¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA? | Visa | Yes/No | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 36 | ¿DONDE FUE ROBADA? | Visa | LongText | [¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA?]="YES" | ¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA? | ="YES" | V3: regla declarativa |
| 37 | AÑO DEL ROBO O EXTRAVIO | Visa | Number | [¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA?]="YES" | ¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA? | ="YES" | V3: regla declarativa |
| 38 | ¿HIZO SU REPORTE DE ROBO? | Visa | Yes/No | [¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA?]="YES" | ¿ALGUNA VEZ A PERDIDO SU VISA O A SIDO ROBADA? | ="YES" | V3: regla declarativa |
| 39 | ¿ALGUNA VEZ SU VISA A SIDO CANCELADA O REVOCADA? EXPLIQUE | Visa | LongText | [¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN OTORGADO VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 40 | ¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA? | Visa | Yes/No | — | — | — | Sin Show_If documentado |
| 41 | ¿DONDE LE FUE NEGADA SU VISA? | Visa | LongText | [¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 42 | ¿CUANDO LE FUE NEGADA SU VISA? | Visa | LongText | [¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla añadida en cierre |
| 43 | ¿LE ENTREGARON ALGUNA HOJA EXPLICANDO EL MOTIVO DE NEGACION? | Visa | Yes/No | [¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 44 | ¿DE QUE TAMAÑO FUE LA HOJA? | Visa | Enum | [¿LE ENTREGARON ALGUNA HOJA EXPLICANDO EL MOTIVO DE NEGACION?]="YES" | ¿LE ENTREGARON ALGUNA HOJA EXPLICANDO EL MOTIVO DE NEGACION? | ="YES" | V3: regla declarativa |
| 45 | OBSERVACIONES | Visa | LongText | [¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 46 | ¿EN SU APLICACION ANTERIOR MINTIO EN SU ENTREVISTA SOBRE ALGUNA INFORMACION IMPORTANTE? | Visa | Yes/No | [¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA?]="YES" | ¿ALGUNA VEZ LE HAN NEGADO UNA VISA PARA VIAJAR A LOS EUA? | ="YES" | V3: regla declarativa |
| 47 | EXPLIQUE CUAL FUE ESA INFORMACION | Visa | LongText | [¿EN SU APLICACION ANTERIOR MINTIO EN SU ENTREVISTA SOBRE ALGUNA INFORMACION IMPORTANTE?]="YES" | ¿EN SU APLICACION ANTERIOR MINTIO EN SU ENTREVISTA SOBRE ALGUNA INFORMACION IMPORTANTE? | ="YES" | V3: regla añadida en cierre |
| 48 | ¿TIENES ALGUN TRAMITE DE VISA ACTIVO? | Visa | Yes/No | — | — | — | Sin Show_If documentado |
| 49 | ¿ALGUNA VEZ LE FUE NEGADA LA ADMISION A LOS EUA O SE LE HA RETIRADO SU APLICACION PARA ADMISION EN EL PUNTO DE ENTRADA? EXPLIQUE | Visa | LongText | — | — | — | Sin Show_If documentado |
| 50 | ¿ALGUNA VEZ ALGUIEN METIO UNA PETICION DE MIGRACION POR SU PARTE CON EL SERVICIO DE CIUDADANIA E INMIGRACION EN EEUU? | Visa | Yes/No | — | — | — | Sin Show_If documentado |
| 51 | ¿QUIEN Y PARA QUE TIPO DE PETICION? | Visa | LongText | [¿ALGUNA VEZ ALGUIEN METIO UNA PETICION DE MIGRACION POR SU PARTE CON EL SERVICIO DE CIUDADANIA E INMIGRACION EN EEUU?]="YES" | ¿ALGUNA VEZ ALGUIEN METIO UNA PETICION DE MIGRACION POR SU PARTE CON EL SERVICIO DE CIUDADANIA E INMIGRACION EN EEUU? | ="YES" | V3: regla declarativa |
| 52 | ¿PORQUE FUE RECHAZADA? | Visa | LongText | [¿ALGUNA VEZ ALGUIEN METIO UNA PETICION DE MIGRACION POR SU PARTE CON EL SERVICIO DE CIUDADANIA E INMIGRACION EN EEUU?]="YES" | ¿ALGUNA VEZ ALGUIEN METIO UNA PETICION DE MIGRACION POR SU PARTE CON EL SERVICIO DE CIUDADANIA E INMIGRACION EN EEUU? | ="YES" | V3: regla añadida en cierre |
| 53 | CALLE, NUEMRO Y COLONIA | Dirección y teléfono | LongText | — | — | — | Sin Show_If documentado |
| 54 | CP | Dirección y teléfono | LongText | — | — | — | Sin Show_If documentado |
| 55 | LOCALIDAD | Dirección y teléfono | LongText | — | — | — | Sin Show_If documentado |
| 56 | MUNICIPIO | Dirección y teléfono | LongText | — | — | — | Sin Show_If documentado |
| 57 | ESTADO | Dirección y teléfono | LongText | — | — | — | Sin Show_If documentado |
| 58 | PAIS | Dirección y teléfono | LongText | — | — | — | Sin Show_If documentado |
| 59 | NO TEL APLICANTE | Dirección y teléfono | Phone | — | — | — | Sin Show_If documentado |
| 60 | REDES SOCIALES | Pasaporte | LongText | — | — | — | Sin Show_If documentado |
| 61 | ¿DONDE FUE TRAMITADO? | Pasaporte | LongText | — | — | — | Sin Show_If documentado |
| 62 | ¿HA PERDIDO SU PASAPORTE O SE LO HAN ROBADO? | Pasaporte | Yes/No | — | — | — | Sin Show_If documentado |
| 63 | FECHA Y AÑO DEL EXTRAVIO O ROBO | Pasaporte | LongText | [¿HA PERDIDO SU PASAPORTE O SE LO HAN ROBADO?]="YES" | ¿HA PERDIDO SU PASAPORTE O SE LO HAN ROBADO? | ="YES" | V3: regla declarativa |
| 64 | ¿HIZO SU REPORTE? | Pasaporte | Yes/No | [¿HA PERDIDO SU PASAPORTE O SE LO HAN ROBADO?]="YES" | ¿HA PERDIDO SU PASAPORTE O SE LO HAN ROBADO? | ="YES" | V3: regla declarativa |
| 65 | NOM PADRE DE APLICANTE | Pasaporte | LongText | — | — | — | Sin Show_If documentado |
| 66 | ¿ESTA VIVO? | Información familiar | Yes/No | — | — | — | Sin Show_If documentado |
| 67 | FECHA DE NACIMIENTO DEL PADRE | Información familiar | LongText | — | — | — | Sin Show_If documentado |
| 68 | ¿EL PADRE SE ENCUENTRA EN LOS EUA? | Información familiar | Yes/No | [¿ESTA VIVO?]="YES" | ¿ESTA VIVO? | ="YES" | V3: regla declarativa |
| 69 | ESTATUS DEL PADRE | Información familiar | Enum | [¿EL PADRE SE ENCUENTRA EN LOS EUA?]="YES" | ¿EL PADRE SE ENCUENTRA EN LOS EUA? | ="YES" | V3: regla declarativa |
| 70 | NOTAS SOBRE ESTATUS DE PADRE | Información familiar | LongText | [¿EL PADRE SE ENCUENTRA EN LOS EUA?]="YES" | ¿EL PADRE SE ENCUENTRA EN LOS EUA? | ="YES" | V3: regla añadida en cierre |
| 71 | NOM MADRE DE APLICANTE | Información familiar | LongText | — | — | — | Sin Show_If documentado |
| 72 | ¿ESTA VIVA? | Información familiar | Yes/No | — | — | — | Sin Show_If documentado |
| 73 | FECHA DE NACIMIENTO DE LA MADRE | Información familiar | LongText | — | — | — | Sin Show_If documentado |
| 74 | ¿LA MADRE SE ENCUENTRA EN EEUU? | Información familiar | Yes/No | [¿ESTA VIVA?]="YES" | ¿ESTA VIVA? | ="YES" | V3: regla declarativa |
| 75 | ESTATUS DE LA MADRE | Información familiar | Enum | [¿LA MADRE SE ENCUENTRA EN EEUU?]="YES" | ¿LA MADRE SE ENCUENTRA EN EEUU? | ="YES" | V3: regla declarativa |
| 76 | NOTAS SOBRE ESTATUS DE MADRE | Información familiar | LongText | [¿LA MADRE SE ENCUENTRA EN EEUU?]="YES" | ¿LA MADRE SE ENCUENTRA EN EEUU? | ="YES" | V3: regla declarativa |
| 77 | ¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS? | Información familiar | Yes/No | — | — | — | Sin Show_If documentado |
| 78 | observaciones_hijos | Información familiar | LongText | [¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS?]="yes" | ¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS? | ="yes" | V3: regla añadida en cierre |
| 79 | hijos_guatemala_mexico | Información familiar | LongText | [¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS?]="yes" | ¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS? | ="yes" | V3: regla añadida en cierre |
| 80 | EXPLICACION (TIPO DE HOSPITAL Y FECHA) | Información familiar | LongText | [TUVO USTED ALGUN HIJO EN LOS EUA]="YES" | TUVO USTED ALGUN HIJO EN LOS EUA | ="YES" | V3: regla añadida en cierre |
| 81 | ¿TIENES MAS FAMILIARES EN EUA? | Cónyuge | Yes/No | — | — | — | Sin Show_If documentado |
| 82 | NOMBRE DEL CONYUGE | Cónyuge | LongText | [ESTADO CIVIL] <>"SOLTERO/A" | ESTADO CIVIL | <>"SOLTERO/A" | V3: regla añadida en cierre |
| 83 | FECHA DE NACIMIENTO DE CONYUGE | Cónyuge | LongText | [ESTADO CIVIL] <>"SOLTERO/A" | ESTADO CIVIL | <>"SOLTERO/A" | V3: regla declarativa |
| 84 | LUGAR DE NACIMIENTO | Cónyuge | LongText | [ESTADO CIVIL] <>"SOLTERO/A" | ESTADO CIVIL | <>"SOLTERO/A" | V3: regla añadida en cierre |
| 85 | ¿SE HAN DIVORCIADO? | Cónyuge | Yes/No | [ESTADO CIVIL] <>"SOLTERO/A" | ESTADO CIVIL | <>"SOLTERO/A" | V3: regla declarativa |
| 86 | ¿CUATOS DIVORCIOS LLEVA? | Cónyuge | Number | [¿SE HAN DIVORCIADO?]="YES" | ¿SE HAN DIVORCIADO? | ="YES" | V3: regla declarativa |
| 87 | INICIO DE ULTIMO MATRIMONIO | Cónyuge | LongText | [¿SE HAN DIVORCIADO?]="YES" | ¿SE HAN DIVORCIADO? | ="YES" | V3: regla declarativa |
| 88 | FIN DE ULTIMO MATRIMONIO | Cónyuge | LongText | [¿SE HAN DIVORCIADO?]="YES" | ¿SE HAN DIVORCIADO? | ="YES" | V3: regla declarativa |
| 89 | ¿VIVEN EN EL MISMO DOMICILIO? | Cónyuge | Yes/No | [ESTADO CIVIL] <>"SOLTERO/A" | ESTADO CIVIL | <>"SOLTERO/A" | V3: regla declarativa |
| 90 | DOMICILIO DE ESPOSO(A) | Cónyuge | LongText | [¿VIVEN EN EL MISMO DOMICILIO?]="NO" | ¿VIVEN EN EL MISMO DOMICILIO? | ="NO" | V3: regla declarativa |
| 91 | OCUPACION DE PASAPORTE | Empleo actual | LongText | — | — | — | Sin Show_If documentado |
| 92 | ¿CUENTA CON EMPLEO ACTUALMENTE? | Empleo actual | Enum | — | — | — | Sin Show_If documentado |
| 93 | OCUPACION | Empleo actual | LongText | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 94 | EMPLEADOR | Empleo actual | LongText | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 95 | DIRECCION | Empleo actual | LongText | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 96 | LOCALIDAD DE EMPLEO ACTUAL | Empleo actual | LongText | — | — | — | Sin Show_If documentado |
| 97 | MUNICIPIO DE EMPLEO ACTUAL | Empleo actual | LongText | — | — | — | Sin Show_If documentado |
| 98 | ESTADO DE EMPLEO ACTUAL | Empleo actual | LongText | — | — | — | Sin Show_If documentado |
| 99 | PAIS DE EMPLEO ACTUAL | Empleo actual | LongText | — | — | — | Sin Show_If documentado |
| 100 | NO TELEFONO EMPLEO | Empleo actual | Phone | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 101 | SUELDO MENSUAL | Empleo actual | Number | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 102 | DESCRIPCION DEL EMPLEO ACTUAL | Empleo actual | LongText | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 103 | TRADUCCION DE EMPLEO ACTUAL | Empleo actual | LongText | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 104 | ¿DESDE CUANDO TIENE ESE EMPLEO? | Empleo actual | LongText | [¿CUENTA CON EMPLEO ACTUALMENTE?]="SI" | ¿CUENTA CON EMPLEO ACTUALMENTE? | ="SI" | V3: regla declarativa |
| 105 | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | Empleo anterior | Yes/No | — | — | — | Sin Show_If documentado |
| 106 | OCUPACION ATERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 107 | EMPLEADOR ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 108 | LOCALIDAD EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 109 | DIRECCION EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 110 | MUNICIPIO EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 111 | ESTADO EMPLEO ATERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 112 | PAIS DEL EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 113 | NO TEL EMPLEO ANTERIOR | Empleo anterior | Phone | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 114 | DESCRIPCION BREVE DE EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 115 | TRADUCCION EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 116 | FECHA INICIO DE EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla declarativa |
| 117 | FECHA DE FINALIZACION EMPLEO ANTERIOR | Empleo anterior | LongText | [¿ANTERIORMENTE TUVO ALGUN EMPLEO?]="YES" | ¿ANTERIORMENTE TUVO ALGUN EMPLEO? | ="YES" | V3: regla añadida en cierre |
| 118 | NIVEL EDUCATIVO | Educación | Enum | — | — | — | Sin Show_If documentado |
| 119 | NOMBRE DE LA ESCUELA | Educación | LongText | OR([NIVEL EDUCATIVO]="LICENCIATURA", [NIVEL EDUCATIVO]="DOCTORADO",[NIVEL EDUCATIVO]="MAESTRIA",[NIVEL EDUCATIVO]="PREPARATORIA/BACHILLERATO",[NIVEL EDUCATIVO]="SECUANDARIA") | NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO | ="LICENCIATURA"; ="DOCTORADO"; ="MAESTRIA"; ="PREPARATORIA/BACHILLERATO"; ="SECUANDARIA" | V3: regla declarativa |
| 120 | DIRECCION DE ESCUELA | Educación | LongText | OR([NIVEL EDUCATIVO]="LICENCIATURA", [NIVEL EDUCATIVO]="DOCTORADO",[NIVEL EDUCATIVO]="MAESTRIA",[NIVEL EDUCATIVO]="PREPARATORIA/BACHILLERATO",[NIVEL EDUCATIVO]="SECUANDARIA") | NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO | ="LICENCIATURA"; ="DOCTORADO"; ="MAESTRIA"; ="PREPARATORIA/BACHILLERATO"; ="SECUANDARIA" | V3: regla declarativa |
| 121 | NO TEL ESCUELA | Educación | Phone | OR([NIVEL EDUCATIVO]="LICENCIATURA", [NIVEL EDUCATIVO]="DOCTORADO",[NIVEL EDUCATIVO]="MAESTRIA",[NIVEL EDUCATIVO]="PREPARATORIA/BACHILLERATO",[NIVEL EDUCATIVO]="SECUANDARIA") | NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO | ="LICENCIATURA"; ="DOCTORADO"; ="MAESTRIA"; ="PREPARATORIA/BACHILLERATO"; ="SECUANDARIA" | V3: regla declarativa |
| 122 | FECHA INICIO ESCOLAR | Educación | LongText | OR([NIVEL EDUCATIVO]="LICENCIATURA", [NIVEL EDUCATIVO]="DOCTORADO",[NIVEL EDUCATIVO]="MAESTRIA",[NIVEL EDUCATIVO]="PREPARATORIA/BACHILLERATO",[NIVEL EDUCATIVO]="SECUANDARIA") | NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO | ="LICENCIATURA"; ="DOCTORADO"; ="MAESTRIA"; ="PREPARATORIA/BACHILLERATO"; ="SECUANDARIA" | V3: regla declarativa |
| 123 | FECHA FINALIZACION ESCOLAR | Educación | LongText | OR([NIVEL EDUCATIVO]="LICENCIATURA", [NIVEL EDUCATIVO]="DOCTORADO",[NIVEL EDUCATIVO]="MAESTRIA",[NIVEL EDUCATIVO]="PREPARATORIA/BACHILLERATO",[NIVEL EDUCATIVO]="SECUANDARIA") | NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO; NIVEL EDUCATIVO | ="LICENCIATURA"; ="DOCTORADO"; ="MAESTRIA"; ="PREPARATORIA/BACHILLERATO"; ="SECUANDARIA" | V3: regla declarativa |
| 124 | ¿A VIAJADO A ALGUN PAIS EN LOS ULTIMOS 5 AÑOS? | Viajes e idiomas | Yes/No | — | — | — | Sin Show_If documentado |
| 125 | ¿CUALES? | Viajes e idiomas | LongText | [¿A VIAJADO A ALGUN PAIS EN LOS ULTIMOS 5 AÑOS?]="yes" | ¿A VIAJADO A ALGUN PAIS EN LOS ULTIMOS 5 AÑOS? | ="yes" | V3: regla declarativa |
| 126 | ¿HABLA ESPAÑOL? | Viajes e idiomas | Yes/No | — | — | — | Sin Show_If documentado |
| 127 | ¿QUE IDIOMA HABLA? | Viajes e idiomas | EnumList | — | — | — | Sin Show_If documentado |
| 128 | QUE RELACION TIENE CON EL APLICANTE | Relaciones y columnas virtuales | LongText | — | — | — | Sin Show_If documentado |
| 129 | ¿DONDE NOS CONOCIO? | Relaciones y columnas virtuales | LongText | — | — | — | Sin Show_If documentado |
| 130 | ¿NECESITA VUELOS DE CONEXION? | Relaciones y columnas virtuales | Enum | — | — | — | Sin Show_If documentado |
| 131 | FAMILIA | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 132 | INFORMACION GENERAL | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 133 | INFORMACION DE VIAJES ANTERIORES | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 134 | Related FAMILIARES EN EE. UUs | Relaciones y columnas virtuales | List | [¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS?]="yes" | ¿TIENES FAMILIARES DIRECTOS EN ESTADOS UNIDOS? | ="yes" | V3: regla añadida en cierre |
| 135 | VISA | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 136 | DIRECCION Y TELEFONO | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 137 | PASAPORTE | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 138 | INFORMACION DE PRESENTE EMPLEO/EDUCACION | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |
| 139 | INFORMACION FINAL | Relaciones y columnas virtuales | Show | — | — | — | Sin Show_If documentado |

Las columnas 42, 84 y 117 tenían datos combinados en claves existentes: se añadieron claves V3 independientes sin dividir respuestas anteriores. La columna 134 se representó como grupo repetible ligado al perfil; no se copió `REF_ROWS` literalmente. No se borran ni transforman respuestas anteriores.
