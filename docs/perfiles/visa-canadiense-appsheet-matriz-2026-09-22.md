# Visa Canadiense — matriz AppSheet 2026-09-22

Fuente autoritativa: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `VISA CANADIENSE_Schema`. La copia de `Application Documentation Negados.pdf` se auditó como contraste: conserva 25 columnas físicas, sin virtuales ni Ref tipados, y degrada la mayoría de tipos a Text.

Conteo principal: 26 columnas; 25 físicas; 1 virtual; 0 Show_If; 0 Required_If; 0 Valid_If; 0 Editable_If; 0 Reset_If; 0 Suggested Values; 3 Ref; 0 listas virtuales; 0 repetibles.

| AppSheet | Display name | Tipo | Sección | Show_If | Required_If | Valid_If | Editable_If | Reset_If | Suggested Values | Virtual | Ref | Relación | Clave React actual | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _RowNumber | — | Number | Técnico | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| id_tramite_vc | =Id tramite | Text | Técnico | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| id_aplicante | ="Id aplicante" | Text | Técnico | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| nombre_aplicante | ="Nombre del aplicante" | Text | Datos canónicos del cliente | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| apellidos_aplicante | ="Apellidos del aplicante" | Text | Datos canónicos del cliente | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| tramite | ="Tramite" | Ref | Operación del trámite | — | — | — | — | — | — | No | TRAMITES | Ref a TRAMITES | — | RELACIONAL |
| fecha_limite_biometricos | ="Fecha limite de biometricos" | Date | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| fecha_cita_biometrios | ="Fecha" | Date | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| hora_cita_b | ="Hora" | Time | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| lugar_cita_b | ="Lugar" | Enum | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| correo | ="Correo" | Email | Datos canónicos del cliente | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| contrana_correo | ="Contraseña de correo" | Text | Credenciales / acceso | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| contrasena_portal_ircc | ="Contraseña de protal IRCC" | Text | Credenciales / acceso | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| contrasena_ttservices | ="Contraseña de TTservices" | Text | Credenciales / acceso | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| no.ircc | ="Numero IRCC" | Number | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| estatus | ="Estatus" | Enum | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| estado_residencia | ="Estados de residencia" | Text | Datos canónicos del cliente | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| contacto | ="Contacto" | Ref | Operación del trámite | — | — | — | — | — | — | No | CONTACTO | Ref a CONTACTO | — | RELACIONAL |
| telefono | ="Telefono" | Phone | Datos canónicos del cliente | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| documentos | ="Documentos" | Url | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| encargado | ="Encargado" | Ref | Operación del trámite | — | — | — | — | — | — | No | ASESORES | Ref a ASESORES | — | RELACIONAL |
| link_rrcc | ="Link de RRCC" | Url | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| estatus_pago_completo | — | Enum | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| fecha_pago_completo | — | Text | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| fecha_fin_tramite | — | Text | Operación del trámite | — | — | — | — | — | — | No | — | — | — | REQUIERE_DECISIÓN |
| Nombre completo del aplicante | — | Text | Cálculo | — | — | — | — | — | — | Sí | — | — | — | VIRTUAL_NO_CAPTURA |

Contraste Negados: 25 columnas, 25 físicas, 0 virtuales, 0 Ref tipados. No se usa como contrato del formulario porque es una copia operativa con pérdida de tipos.

No existe una tabla documental de perfil/cuestionario de Visa Canadiense con preguntas de pasaporte, ciudadanía, familiares, viajes, empleo, educación, finanzas o antecedentes. Por ello no se genera una plantilla dinámica a partir de esta tabla operativa.
