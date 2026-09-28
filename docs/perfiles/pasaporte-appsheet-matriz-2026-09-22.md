# Pasaporte — matriz AppSheet 2026-09-22

Fuente: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `PERFIL PASAPORTES_Schema`. Los bloques partidos entre páginas se reconstruyeron antes de contar o interpretar reglas.

Conteo: 89 columnas; 78 físicas; 11 virtuales; 64 Show_If; 0 Required_If; 0 Valid_If; 0 Editable_If; 0 Reset_If; 0 Suggested Values; 2 Ref; 0 listas virtuales; 0 repetibles.

| AppSheet | Display name | Tipo | Sección | Show_If | Required_If | Valid_If | Editable_If | Reset_If | Virtual | Ref | Clave React actual | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _RowNumber | — | Number | Técnico | — | — | — | — | — | No | — | — | REQUIERE_DECISIÓN |
| Id_formulario | — | Text | Técnico | — | — | — | — | — | No | — | — | REQUIERE_DECISIÓN |
| Id_aplicante | ="Nombre del aplicante" | Ref | Técnico | — | — | — | — | — | No | APLICANTES PASAPORTES | — | RELACIONAL |
| correo_electronico | =Correo electronico | Email | Información personal | — | — | — | — | — | No | — | correo_electronico | COINCIDE |
| contrasena | ="Contraseña" | Text | Información personal | — | — | — | — | — | No | — | contrasena | REQUIERE_DECISIÓN |
| numero_identificacion_principal | ="Numero de identificación" | Text | Información personal | — | — | — | — | — | No | — | numero_identificacion_principal | COINCIDE |
| fecha_nacimiento | ="Fecha de nacimiento" | Date | Información personal | — | — | — | — | — | No | — | fecha_nacimiento | COINCIDE |
| edad | ="Edad" | Number | Información personal | =[País de residencia]<> "Estados Unidos" | — | — | — | — | No | — | edad | COINCIDE |
| idioma_hablado | ="Idioma hablado" | Text | Información personal | =[País de residencia]="Guatemala" | — | — | — | — | No | — | idioma_hablado | COINCIDE |
| estado_civil | =Estado Civil | Text | Información personal | =[País de residencia]<> "Guatemala" | — | — | — | — | No | — | estado_civil | COINCIDE |
| lugar_nacimiento | =Lugar de nacimiento | Text | Información personal | =[País de residencia]<> "Guatemala" | — | — | — | — | No | — | lugar_nacimiento | COINCIDE |
| otros_nombres | =Otros nombres | Text | Información personal | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| estatura_cm | =Altura | Text | Información personal | =[País de residencia]<> "México" | — | — | — | — | No | — | estatura_cm | COINCIDE |
| tez | — | Text | Información personal | — | — | — | — | — | No | — | tez | COINCIDE |
| color_ojos | ="Color de ojos" | Text | Información personal | =[País de residencia]<> "México" | — | — | — | — | No | — | color_ojos | COINCIDE |
| color_cabello | ="Color de cabello" | Text | Información personal | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| domicilio_calle_numero | ="Domicilio Calle y numero" | Text | Domicilio | — | — | — | — | — | No | — | calle_numero | DIFERENTE |
| colonia | ="Colonia" | Text | Domicilio | — | — | — | — | — | No | — | colonia | COINCIDE |
| codigo_postal | ="Código postal" | Text | Domicilio | =[País de residencia]<> "Guatemala" | — | — | — | — | No | — | codigo_postal | COINCIDE |
| municipio | ="Municipio" | Text | Domicilio | — | — | — | — | — | No | — | municipio | COINCIDE |
| estado_departamento | ="Estado/Departamento" | Text | Domicilio | — | — | — | — | — | No | — | estado_departamento | COINCIDE |
| pais | ="País" | Text | Domicilio | — | — | — | — | — | No | — | pais | COINCIDE |
| numero_telefono | ="Número de télefono" | Text | Domicilio | — | — | — | — | — | No | — | numero_telefono | COINCIDE |
| telefono_adicional | ="Número adicional" | Text | Domicilio | =[País de residencia]<> "Guatemala" | — | — | — | — | No | — | telefono_adicional_emergencia | DIFERENTE |
| folio_acta_nacimiento | ="folio de acta de nacimiento" | Text | Acta e INE | =[País de residencia]="México" | — | — | — | — | No | — | folio_acta_nacimiento | COINCIDE |
| fecha_registro_nacimiento | ="Registro de nacimiento" | Text | Acta e INE | =[País de residencia]="México" | — | — | — | — | No | — | fecha_registro_nacimiento | COINCIDE |
| libro_registro_nacimiento | ="Libro de registro de nacimiento" | Text | Acta e INE | =[País de residencia]="México" | — | — | — | — | No | — | libro_registro_nacimiento | COINCIDE |
| numero_ine | ="Número de INE" | Text | Acta e INE | =[País de residencia]="México" | — | — | — | — | No | — | numero_ine | COINCIDE |
| anio_ine | ="Año de INE" | Text | Acta e INE | =[País de residencia]="México" | — | — | — | — | No | — | anio_ine | COINCIDE |
| clave_ine | ="Clave de INE" | Text | Acta e INE | =[País de residencia]="México" | — | — | — | — | No | — | clave_ine | COINCIDE |
| tipo_pasaporte | ="Tipo de pasaporte" | Enum | Pasaporte | — | — | — | — | — | No | — | tipo_pasaporte | COINCIDE |
| numero_pasaporte_anterior | ="Número de pasaporte anterior" | Text | Pasaporte | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | numero_pasaporte_anterior | COINCIDE |
| fecha_emision_pasaporte_anterior | ="Fecha de emisión de pasaporte anterior" | Text | Pasaporte | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | fecha_emision_pasaporte_anterior | COINCIDE |
| fecha_caducidad_pasaporte_anterior | ="Fecha de Vencimiento de pasporte anterior" | Text | Pasaporte | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | fecha_caducidad_pasaporte_anterior | COINCIDE |
| nombre_pasaporte_anterior | ="Nombre que uso en el pasaporte anterior" | Text | Pasaporte | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| pasaporte_perdido_robado | ="¿Su pasaporte fue perdido o robado?" | Text | Pasaporte | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| pais_solicitud_pasaporte | ="País donde realiza su solicitud de pasaporte" | Text | Pasaporte | — | — | — | — | — | No | — | — | DIFERENTE |
| vigencia_pasaporte_solicitado | ="Vigencia de pasaporte solicitado" | Text | Pasaporte | — | — | — | — | — | No | — | vigencia_pasaporte_solicitado | COINCIDE |
| pasaporte_envio_misma_direccion | ="¿Quiere que el pasaporte se envíe su dirección de residencia?" | Text | Pasaporte | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| envio_pasaporte_calle_numero | ="Domicilio calle y numero" | Text | Pasaporte | =and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]="Estados Unidos") | — | — | — | — | No | — | — | DIFERENTE |
| envio_pasaporte_colonia | ="Colonia" | Text | Pasaporte | =and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]="Estados Unidos") | — | — | — | — | No | — | — | DIFERENTE |
| envio_pasaporte_codigo_postal | ="Código postal" | Text | Pasaporte | =and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]="Estados Unidos") | — | — | — | — | No | — | — | DIFERENTE |
| envio_pasaporte_ciudad | ="Ciúdad" | Text | Pasaporte | =and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]="2ebd2c52") | — | — | — | — | No | — | — | DIFERENTE |
| envio_pasaporte_estado | ="Estado" | Text | Pasaporte | =and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]="Estados Unidos") | — | — | — | — | No | — | — | DIFERENTE |
| envio_pasaporte_pais | ="País" | Text | Pasaporte | =and([pasaporte_envio_misma_direccion]=Y ES,[País de residencia]="Estados Unidos") | — | — | — | — | No | — | — | DIFERENTE |
| preferencia_cita_oficina_consulado | ="¿Qué oficina/Cónsulado prefiere?" | Text | Cita | — | — | — | — | — | No | — | preferencia_cita_oficina | DIFERENTE |
| numero_boleta | ="Número de boleta" | Text | Cita | =[País de residencia]="Guatemala" | — | — | — | — | No | — | numero_boleta | COINCIDE |
| numero_correlativo | ="Número corelativo" | Text | Cita | =[País de residencia]="Guatemala" | — | — | — | — | No | — | numero_correlativo | COINCIDE |
| fecha_pago_boleta | ="Fecha de pago de boleta" | Text | Cita | =[País de residencia]="Guatemala" | — | — | — | — | No | — | fecha_pago_boleta | COINCIDE |
| ocupacion | ="Ocupación actual" | Text | Ocupación | =[País de residencia]<> "México" | — | — | — | — | No | — | ocupacion_actual | DIFERENTE |
| ocupacion_dpi | ="Ocupación en DPI" | Text | Ocupación | =[País de residencia]="Guatemala" | — | — | — | — | No | — | ocupacion_dpi | COINCIDE |
| dpi_ocupacion_registrada | ="Ocupación registrada" | Text | Ocupación | =[País de residencia]="Guatemala" | — | — | — | — | No | — | ocupacion_registrada | DIFERENTE |
| nombre_empresa_escuela | ="Nombre de empresa/escuela" | Text | Ocupación | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| nombre_padre | ="Nombre del padre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| apellidos_padre | ="Apellidos del padre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| fecha_nacimiento_padre | ="Fecha de nacimiento del padre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| padre_americano | ="¿Su padre es estadounidense?" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| lugar_nacimiento_padre | ="Lugar de nacimiento del padre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| nombre_madre | ="Nombre de la madre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| apellidos_madre | ="Apellidos de la madre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| fecha_nacimiento_madre | ="Fecha de nacimiento de la madre" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| madre_americano | ="¿Su madre es estadounidense?" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| lugar_nacimiento_madre | ="Lugar de nacimiento" | Text | Padres | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| nombre_conyuge | ="Nombre de conyugue" | Text | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| apellidos_conyuge | ="Apellidos de conyuge" | Text | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| fecha_nacimiento_conyuge | ="Fecha de nacimiento de conyugue" | Text | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| conyuge_americano | ="Su Conyugue es estadounidense" | Text | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| lugar_nacimiento_conyuge | ="Lugar de nacimiento de conyugue" | Text | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| fecha_matrimonio | ="Fecha de matrimonio" | Date | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| fecha_divorcio | ="Fecha de divorcio" | Date | Cónyuge | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_nombre | ="Nombre" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_telefono | ="Apellidos" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_relacion | ="¿Qué relación tiene con su contacto en EUA?" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_direccion | ="Dirección calle y número" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_codigo_postal | ="Código postal" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_ciudad | ="Ciúdad" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| contacto_usa_estado | ="Estado" | Text | Contacto EUA | =[País de residencia]="Estados Unidos" | — | — | — | — | No | — | — | DIFERENTE |
| notas_pasporte | — | LongText | Notas | — | — | — | — | — | No | — | observaciones | DIFERENTE |
| País de residencia | — | Ref | Virtual / navegación | — | — | — | — | — | Sí | TRAMITES | — | VIRTUAL_NO_CAPTURA |
| Información de los padres | — | Show | Virtual / navegación | = [País de residencia]="Estados Unidos" | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Información personal | — | Show | Virtual / navegación | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Información de domicilio | — | Show | Virtual / navegación | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Características físicas | — | Show | Virtual / navegación | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Ocupación | — | Show | Virtual / navegación | =[País de residencia] <>"México" | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Contacto en EUA | — | Show | Virtual / navegación | = [País de residencia]="Estados Unidos" | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Cónyuge | — | Show | Virtual / navegación | =[País de residencia]="Estados Unidos" | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Pasaporte | — | Show | Virtual / navegación | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Oficina de preferencia | — | Show | Virtual / navegación | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Información de cita | — | Show | Virtual / navegación | = [País de residencia]="Guatemala" | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |

V2 contabiliza las columnas 4–78: representa 74 como captura y clasifica `contrasena` como información operativa de acceso, fuera del perfil. Las columnas 1–3 son técnicas/canónicas y las 11 virtuales se clasifican sin convertirse en inputs.
