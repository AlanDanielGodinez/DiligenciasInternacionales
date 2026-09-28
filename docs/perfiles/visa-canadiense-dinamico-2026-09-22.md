# Visa Canadiense — auditoría de fuente 2026-09-22

Se auditó la documentación disponible sin conectarse a PostgreSQL y sin ejecutar SQL. No existía en el repositorio una plantilla Legacy/V1/V2, semilla ni formulario dinámico de perfil para Visa Canadiense.

## Fuente documental real

La documentación contiene `VISA CANADIENSE_Schema` en dos aplicaciones:

1. `Application Documentation Visas inv.pdf`: fuente principal, con 25 columnas físicas, una virtual y tipos enriquecidos.
2. `Application Documentation Negados.pdf`: copia operativa de 25 columnas, sin virtual ni Ref tipados y con la mayoría de los tipos degradados a Text.

La fuente principal se usa como contrato de auditoría. La tabla no es un cuestionario migratorio del aplicante; es un registro operativo del trámite.

## Conteos exactos de la fuente principal

| Concepto | Conteo |
|---|---:|
| Columnas | 26 |
| Físicas | 25 |
| Virtuales | 1 |
| Show_If | 0 |
| Required_If | 0 |
| Valid_If | 0 |
| Editable_If | 0 |
| Reset_If | 0 |
| Suggested Values | 0 |
| Ref | 3 |
| Listas virtuales | 0 |
| Relaciones | 3 |
| Repetibles | 0 |

La matriz completa está en `docs/perfiles/visa-canadiense-appsheet-matriz-2026-09-22.md`.

## Clasificación 26/26

- 3 técnicas: `_RowNumber`, `id_tramite_vc`, `id_aplicante`.
- 5 datos canónicos duplicados del cliente: nombre, apellidos, correo, estado de residencia y teléfono.
- 3 credenciales sensibles: contraseña del correo, contraseña del portal IRCC y contraseña de TTservices. No pertenecen a un perfil ni deben trasladarse al motor dinámico o a autenticación.
- 14 campos operativos: trámite, fechas/hora/lugar de biométricos, número IRCC, estatus, contacto, documentos, encargado, enlace RRCC, estatus/fecha de pago completo y fecha fin del trámite.
- 1 virtual calculada: nombre completo del aplicante mediante concatenación. Es un valor de presentación y no un input.

Los tres Ref son relaciones operativas con `TRAMITES`, `CONTACTO` y `ASESORES`. No hay `REF_ROWS`, listas virtuales ni `IsAPartOf`; por ello no existen repetibles documentados.

## Por qué no se creó una plantilla

La tabla auditada no contiene el formulario solicitado de Visa Canadiense. No aparecen preguntas de:

- pasaporte o documento de viaje;
- nacionalidad o ciudadanía;
- estado civil o cónyuge;
- familiares;
- viajes;
- negativas o antecedentes migratorios;
- salud, delitos u otros antecedentes personales;
- empleo o educación;
- recursos financieros o pagador del viaje;
- domicilio detallado del perfil.

Convertir la tabla encontrada en plantilla habría expuesto credenciales, duplicado información canónica y mezclado biométricos, pagos internos, documentos, responsables y estatus con las respuestas del aplicante. Tampoco existe evidencia para inventar las preguntas ausentes.

El campo `lugar_cita_b` es un Enum operativo con valores CDMX/GDL y valores personalizados permitidos; `estatus` y `estatus_pago_completo` son catálogos operativos cerrados. No se trasladan al perfil. `documentos` es una URL operacional y no sustituye el módulo general de documentos requeridos.

## Motor, versionado y SQL

No se modificó el motor ni el renderer: la tabla no demuestra una capacidad genérica faltante. No se asignó versión de plantilla porque no existe un contrato de perfil documentado. No se generó SQL, ya que instalar una plantilla con esta tabla sería funcionalmente incorrecto y no existe un tipo de trámite/mapeo histórico comprobado para una plantilla de perfil.

## Pendientes exactos

1. Falta la fuente AppSheet o especificación funcional del cuestionario de perfil de Visa Canadiense.
2. Sin esa fuente no se pueden definir preguntas, secciones, condiciones, opciones, relaciones de captura ni completitud.
3. No puede probarse aislamiento de perfiles Visa Canadiense por solicitud porque no existe una plantilla válida que guardar; el aislamiento genérico del servicio permanece cubierto por los demás perfiles.
4. No puede generarse SQL de plantilla sin inventar el contenido y el vínculo de catálogo.

**Estado: PARIDAD VISA CANADIENSE PARCIAL.**
