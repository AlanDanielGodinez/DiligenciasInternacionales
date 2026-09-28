# ETA — matriz AppSheet 2026-09-22

Fuente: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `PERFIL ETA_Schema`. Las expresiones partidas entre páginas se reconstruyeron antes del conteo.

Conteo: 45 columnas; 39 físicas; 6 virtuales; 2 Show_If; 0 Required_If; 0 Valid_If; 0 Editable_If; 0 Reset_If; 0 Suggested Values; 1 Ref; 0 listas virtuales; 0 repetibles.

| AppSheet | Display name | Tipo | Sección | Show_If | Required_If | Valid_If | Editable_If | Reset_If | Suggestions | Virtual | Ref | Clave React actual | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _RowNumber | — | Number | Técnico | — | — | — | — | — | — | No | — | — | REQUIERE_DECISIÓN |
| Id_formulario | — | Text | Técnico | — | — | — | — | — | — | No | — | — | REQUIERE_DECISIÓN |
| Id_aplicante | =Id aplicante | Ref | Técnico | — | — | — | — | — | — | No | ETA | — | RELACIONAL |
| numero_pasaporte | ="Número de pasaporte" | Text | Pasaporte | — | — | — | — | — | — | No | — | — | FALTA |
| fecha_emision_pasaporte | ="Fecha de emisión del pasaporte" | Date | Pasaporte | — | — | — | — | — | — | No | — | — | FALTA |
| fecha_expiracion_pasaporte | ="Fecha en que expira el pasaporte" | Date | Pasaporte | — | — | — | — | — | — | No | — | — | FALTA |
| numero_visa | ="Número de visa" | Text | Visa | — | — | — | — | — | — | No | — | — | FALTA |
| fecha_emision_visa | ="Fecha de emisión de la visa" | Date | Visa | — | — | — | — | — | — | No | — | — | FALTA |
| fecha_expiracion_visa | ="Fecha en que expira la visa" | Date | Visa | — | — | — | — | — | — | No | — | — | FALTA |
| sexo | =Sexo | Enum | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| fecha_nacimiento | ="Fecha de Nacimiento" | Date | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| ciudad_nacimiento | ="Ciudad de nacimiento" | Text | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| estado_nacimiento | ="Estado" | Text | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| pais_nacimiento | ="País de nacimiento" | Text | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| nacionalidad | ="Nacionalidad" | Text | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| nacionalidad_otra | — | Text | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| estado_civil | ="Estado civil" | Enum | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| ha_aplicado_anteriormente_canada | ="¿Ha aplicado anteriormente para una Visa, una eTA o permiso para visitar, vivir, trabajar o estudiar en Canadá?" | Yes/No | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| numero_visa_eta_permiso_anterior_canada | ="Indique su Visa Canadiense anterior, eTA o número de permiso" | Text | Datos personales | — | — | — | — | — | — | No | — | — | FALTA |
| ocupacion_actual | ="Ocupación actual" | Text | Empleo | — | — | — | — | — | — | No | — | — | FALTA |
| empleador | ="Empleador" | Text | Empleo | — | — | — | — | — | — | No | — | — | FALTA |
| empleo_desde_ano | ="¿Desde qué año?" | Text | Empleo | — | — | — | — | — | — | No | — | — | FALTA |
| empleo_ciudad | ="Ciudad del empleo" | Text | Empleo | — | — | — | — | — | — | No | — | — | FALTA |
| empleo_pais | ="País del empleo" | Text | Empleo | — | — | — | — | — | — | No | — | — | FALTA |
| domicilio | ="Direccción" | Text | Domicilio | — | — | — | — | — | — | No | — | — | FALTA |
| colonia_aplicante | ="Colonia" | Text | Domicilio | — | — | — | — | — | — | No | — | — | FALTA |
| ciudad_aplicante | ="Ciudad" | Text | Domicilio | — | — | — | — | — | — | No | — | — | FALTA |
| estado_aplicante | ="Estado" | Text | Domicilio | — | — | — | — | — | — | No | — | — | FALTA |
| pais_aplicante | ="País" | Text | Domicilio | — | — | — | — | — | — | No | — | — | FALTA |
| codigo_postal_aplicante | ="Codigo Postal" | Text | Domicilio | — | — | — | — | — | — | No | — | — | FALTA |
| sabe_cuando_viajara_canada | ="¿Sabe cuándo viajará a Canadá?" | Yes/No | Viaje | — | — | — | — | — | — | No | — | — | FALTA |
| fecha_viaje | ="Fecha de viaje" | Text | Viaje | — | — | — | — | — | — | No | — | — | FALTA |
| hora_salida_vuelo | ="Por favor indique la hora de salida de su vuelo" | Time | Viaje | — | — | — | — | — | — | No | — | — | FALTA |
| negacion_visa_entrada_salida_canada_otros | — | Yes/No | Antecedentes | — | — | — | — | — | — | No | — | — | FALTA |
| explicacion_negacion_visa_entrada_salida | ="Explicación" | Text | Antecedentes | = [negacion_visa_entrada_salida_canada_otros]=YES | — | — | — | — | — | No | — | — | FALTA |
| delito_penal_antecedentes | ="¿Alguna vez ha cometido, ha sido arrestado, acusado o condenado por algún delito penal en algún país/territorio?" | Yes/No | Antecedentes | — | — | — | — | — | — | No | — | — | FALTA |
| explicacion_delito_penal | ="Explicación (Ciudad, año y sentencia)" | LongText | Antecedentes | = [delito_penal_antecedentes]=YES | — | — | — | — | — | No | — | — | FALTA |
| detalles_adicionales_solicitud | ="Detalles adicionales de su solicitud" | Text | Antecedentes | — | — | — | — | — | — | No | — | — | FALTA |
| detalles_relevantes_demoras_eta_cancelada | =Proporcione detalles relevantes para evitar demoras en el procesamiento de su solicitud | Text | Antecedentes | — | — | — | — | — | — | No | — | — | FALTA |
| Información del pasaporte | =Información del pasaporte | Show | Virtual / navegación | — | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Datos de la visa | =Datos de la visa | Show | Virtual / navegación | — | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Datos personales del aplicante | =Datos personales del aplicante | Show | Virtual / navegación | — | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Información del empleo | — | Show | Virtual / navegación | — | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Información del viaje | =Información del viaje | Show | Virtual / navegación | — | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |
| Antecedentes | =Antecedentes | Show | Virtual / navegación | — | — | — | — | — | — | Sí | — | — | VIRTUAL_NO_CAPTURA |

No existía plantilla React/JSON para ETA. `FALTA` describe el estado anterior; los 36 campos de captura están representados por la nueva plantilla V1. Las tres primeras columnas son técnicas/relacionales y las seis virtuales no se convierten en inputs.
