# Consolidación SQL — 2026-09-23

Las 18 migraciones están untracked, no fueron ejecutadas contra PostgreSQL real y su estado real es `NO_VERIFICADO`.

| Archivo | Módulo/tablas principales | Cambio | Dependencia/solapamiento | Idempotencia | Probado local | Real |
|---|---|---|---|---|---|---|
| `2026_06_09_add_drive_metadata_to_documentos.sql` | `documentos` | ALTER columnas Drive | SIN_CONFLICTO | Parcial | No directo | No verificado |
| `2026_06_18_appsheet_informes_contacto_solicitudes.sql` | `contacto`, `solicitudes` | ALTER | ORDEN_IMPORTA antes de servicios nuevos | Parcial | Contratos | No verificado |
| `2026_06_18_catalogo_areas_solicitudes_area.sql` | `catalogo_areas`, `solicitudes` | CREATE/seed/ALTER/backfill | ORDEN_IMPORTA | Parcial | Contratos | No verificado |
| `2026_08_03_quickbooks_integration.sql` | tres tablas QB | CREATE/ALTER/index | SIN_CONFLICTO | Alta, contiene DROP condicional | Unitario | No verificado |
| `2026_08_18_solicitudes_fecha_primera_aplicacion.sql` | `solicitudes` | ALTER | ORDEN_IMPORTA con core/AMA | Alta | Indirecto | No verificado |
| `2026_08_19_proceso_negados_integral.sql` | procesos, actividades, notas, preguntas, relaciones | CREATE/seed/trigger | SOLAPAMIENTO base de Negados/Legal | Parcial | Contratos | No verificado |
| `2026_08_20_negados_trazabilidad.sql` | `casos_legales`, `seguimientos`, función Negados | ALTER/INSERT/function | SOLAPAMIENTO con 08-19 y 08-23 | Parcial | Contratos | No verificado |
| `2026_08_21_modulo_legales.sql` | `procesos_solicitud`, `casos_legales` | constraints/index/backfill | POSIBLE_DUPLICADO con 08-22 | Parcial | Contratos | No verificado |
| `2026_08_22_fix_legales_active_schema.sql` | mismas tablas Legal | corrección/constraints/backfill | POSIBLE_DUPLICADO de 08-21 | Parcial | Contratos | No verificado |
| `2026_08_23_negados_legales_operational_corrections.sql` | función/trigger Negados-Legal | corrección | SOLAPAMIENTO con 08-19/20 | Baja-parcial | Contratos | No verificado |
| `2026_08_27_perfiles_formularios_v2.sql` | repetibles, perfiles/versiones | CREATE/ALTER/limpieza | ORDEN_IMPORTA antes de plantillas | Parcial; contiene DELETE acotado | Motor | No verificado |
| `2026_09_10_ama_actividad_notas.sql` | `solicitudes`, `notas_solicitud`, trigger | ALTER/backfill/trigger | ORDEN_IMPORTA después de Negados/core | Parcial | PG local | No verificado |
| `2026_09_10_perfil_ama_v2.sql` | `perfil_plantillas` | INSERT V2 | ORDEN_IMPORTA después de motor V2 | Baja-parcial | PG local | No verificado |
| `2026_09_18_perfil_ama_v3.sql` | `perfil_plantillas` | INSERT V3 | ORDEN_IMPORTA después de AMA V2 | Alta por validación de contenido | PG local | No verificado |
| `2026_09_18_perfil_visa_individual_v3.sql` | `perfil_plantillas` | INSERT V3 | ORDEN_IMPORTA después de motor V2 | Alta | Unitario | No verificado |
| `2026_09_22_encuestas_satisfaccion.sql` | `encuestas_satisfaccion` | CREATE/ALTER/index | SIN_CONFLICTO | Alta | Unitario | No verificado |
| `2026_09_22_perfil_eta_v1.sql` | `perfil_plantillas` | INSERT V1 | ORDEN_IMPORTA después de motor V2 | Alta | Unitario | No verificado |
| `2026_09_22_perfil_pasaporte_v2.sql` | `perfil_plantillas` | INSERT V2 MX/GT | ORDEN_IMPORTA después de motor V2 | Alta | Unitario | No verificado |

## Resultado de solapamientos

- SIN_CONFLICTO: 4 archivos.
- ORDEN_IMPORTA: 9 archivos.
- SOLAPAMIENTO/POSIBLE_DUPLICADO: **5 archivos** (`08_19`, `08_20`, `08_21`, `08_22`, `08_23`).
- El conflicto más serio es `08_21` frente a `08_22`: ambos recrean constraints y hacen backfill sobre las mismas tablas; debe decidirse si el segundo sustituye al primero o es estrictamente incremental.
- Las plantillas comparten `perfil_plantillas`, pero usan claves/versiones diferentes y comprobaciones explícitas; se considera dependencia de orden, no duplicado.

## Orden candidato, sujeto a staging

1. Core/áreas/informes/primera aplicación.
2. Motor de perfiles V2.
3. Negados base y trazabilidad.
4. Legal, resolviendo antes la relación 08-21/08-22.
5. Correcciones conjuntas 08-23.
6. AMA actividad/notas.
7. Plantillas AMA V2/V3, Visa V3, ETA V1 y Pasaporte V2.
8. Encuestas.
9. QuickBooks y Drive según dependencias de despliegue.

No debe usarse este orden en producción hasta conciliar el esquema real read-only y ensayarlo en staging.

