# SQL pendiente — 2026-09-23

## Estado verificable

Hay **18 archivos SQL**. Su presencia en el repositorio no demuestra ejecución. No existe evidencia consolidada de una tabla de migraciones ni se consultó PostgreSQL real. Por tanto, el estado de los 18 es **NO VERIFICADO**.

| Fecha/archivo | Área | Riesgo estático |
|---|---|---|
| `2026_06_09_add_drive_metadata_to_documentos.sql` | Drive/documentos | ALTER; parcialmente idempotente |
| `2026_06_18_appsheet_informes_contacto_solicitudes.sql` | Informes | ALTER; parcialmente idempotente |
| `2026_06_18_catalogo_areas_solicitudes_area.sql` | Core | CREATE/ALTER/INSERT/UPDATE |
| `2026_08_03_quickbooks_integration.sql` | QuickBooks | CREATE/ALTER y DROP condicional |
| `2026_08_18_solicitudes_fecha_primera_aplicacion.sql` | Solicitudes | ALTER |
| `2026_08_19_proceso_negados_integral.sql` | Negados | CREATE/INSERT/UPDATE/DROP |
| `2026_08_20_negados_trazabilidad.sql` | Negados | CREATE/ALTER/INSERT |
| `2026_08_21_modulo_legales.sql` | Legal | CREATE/ALTER/INSERT/UPDATE/DROP |
| `2026_08_22_fix_legales_active_schema.sql` | Legal | CREATE/ALTER/INSERT/UPDATE/DROP |
| `2026_08_23_negados_legales_operational_corrections.sql` | Negados/Legal | CREATE/INSERT; idempotencia incompleta |
| `2026_08_27_perfiles_formularios_v2.sql` | Perfiles | CREATE/ALTER y DELETE |
| `2026_09_10_ama_actividad_notas.sql` | AMA | CREATE/ALTER/INSERT/UPDATE |
| `2026_09_10_perfil_ama_v2.sql` | Perfil AMA | INSERT; idempotencia no evidente |
| `2026_09_18_perfil_ama_v3.sql` | Perfil AMA | INSERT; idempotencia no evidente |
| `2026_09_18_perfil_visa_individual_v3.sql` | Visa individual | INSERT; guardas parciales |
| `2026_09_22_encuestas_satisfaccion.sql` | Encuestas | CREATE/ALTER |
| `2026_09_22_perfil_eta_v1.sql` | ETA | INSERT; idempotencia no evidente |
| `2026_09_22_perfil_pasaporte_v2.sql` | Pasaportes | INSERT; idempotencia no evidente |

Además existen migraciones JavaScript para perfiles, Drive, documentos requeridos, pagos, métodos, estados, grupos AMA, checklist, viajes y QuickBooks. Tampoco se verificó su ejecución real.

## Condiciones antes de ejecutar

1. Crear una BD de staging restaurada/anonimizada y registrar identidad de servidor, base y usuario.
2. Obtener inventario read-only de tablas, columnas, constraints, índices y versiones actualmente instaladas.
3. Definir un ledger único de migraciones y mapear SQL/JS a una secuencia sin duplicidades.
4. Revisar manualmente todos los `DROP`, `DELETE` y backfills; ensayar backup y rollback.
5. Ejecutar en una transacción cuando PostgreSQL y la operación lo permitan; validar conteos e invariantes.
6. Sólo después preparar un runbook de producción con ventana, responsable y criterios de abortar.

Ninguno de estos archivos es una auditoría read-only: son migraciones y contienen DDL/DML. No deben ejecutarse como mecanismo para “comprobar” el estado actual.

