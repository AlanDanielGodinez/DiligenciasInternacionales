# Consolidación segura del working tree — 2026-09-23

## Alcance

Auditoría de sólo lectura. No se ejecutaron `git add`, `git reset`, `git restore`, `git clean`, `git stash`, `git rm` ni commits. No se movió, restauró o eliminó ningún archivo. Sólo se crearon los documentos solicitados.

## Estado exacto de Git

| Estado | Entradas |
|---|---:|
| Total (`git status --short`) | 803 |
| Modificadas | 398 |
| Eliminadas | 331 |
| Nuevas/untracked | 74 |
| Renombradas | 0 |
| Staged | 0 |
| Unstaged tracked | 729 |

`git diff --cached --name-status` está vacío. Todo el cambio está unstaged. Los 74 elementos untracked se muestran colapsados por directorio; contienen **2,765 archivos físicos**.

## Reconciliación del volumen

`backend/node_modules` representa **687 de 803 entradas (85.6%)**: 331 eliminadas y 356 marcadas modificadas. Sólo 17 de las 356 muestran diferencia de contenido en `git diff`; las 339 restantes son ruido de metadatos/estado del directorio de dependencias. Git ya tiene `node_modules/` en `.gitignore`, pero esos archivos fueron rastreados en el pasado.

| Categoría | Entradas | Regla aplicada |
|---|---:|---|
| DEPENDENCIA | 687 | Todo `backend/node_modules/**` |
| FUNCIONAL_FRONTEND | 66 | 28 archivos tracked y 38 entradas nuevas bajo `diligenciasinternacionalesinc/src` |
| FUNCIONAL_BACKEND | 1 | Directorio nuevo `backend/src/` (96 archivos físicos) |
| TEST | 1 | `backend/test/` (25 archivos); pruebas frontend viven dentro de entradas funcionales |
| SQL | 1 | `backend/sql/` (18 archivos) |
| SCRIPT_TEMPORAL/REPRODUCIBLE | 2 | `backend/.tmp/` y `backend/scripts/` |
| DOCUMENTACIÓN/AUDITORÍA | 4 | `docs/` y tres documentos raíz |
| CONFIGURACIÓN | 8 | `.gitignore`, manifests/locks, `.env`, `.env.example` |
| LEGACY | 17 | Entradas `backend-mongo` que no son config, data ni ZIP |
| GENERADO | 15 | Builds, capturas/visual audit, ZIP y texto de revisión |
| LOCAL/SENSIBLE | 1 | `backend-mongo/data/` |
| ASSET independiente | 0 | Los assets cambiados están incluidos en frontend/generados |
| DESCONOCIDO | 0 | Todas las entradas tienen clasificación de auditoría |
| **Total** | **803** | |

La clasificación por directorio no implica que cada archivo de una entrada untracked deba agregarse en bloque. Antes de staging debe expandirse cada grupo con `git ls-files --others --exclude-standard`.

## Untracked

| Disposición | Entradas Git | Archivos físicos conocidos | Criterio |
|---|---:|---:|---|
| DEBE_VERSIONARSE | 44 | 314 como mínimo | Backend modular, frontend fuente, tests, SQL, scripts reproducibles, `.env.example` y docs |
| NO_VERSIONAR | 17 | 2,428 aprox. | DB local, logs/temporales, builds, auditoría visual, ZIP, datos/exportaciones |
| REVISIÓN_HUMANA | 13 | 23 aprox. | Backend Mongo y tres documentos raíz preexistentes |
| **Total** | **74** | **2,765** | |

Las 44 entradas propuestas contienen directorios completos. El conteo físico mínimo excluye elementos legacy sujetos a revisión y artefactos generados.

## `backend/.tmp`

Contiene 2,117 archivos: 2,094 del clúster PostgreSQL local y 23 archivos de nivel superior.

| Clase | Elementos |
|---|---|
| ÚTIL_REPRODUCIBLE | 13 scripts JS de extracción/inventario/generación |
| AUDITORÍA_HISTÓRICA | 8 JSON de reglas/filas/inventario y `auditoria-git-status-2026-09-23.txt` |
| DESECHABLE | `ama-postgres-test/` y `ama-postgres-test.log` |
| DESCONOCIDO | 0 |

Los 13 scripts tienen valor metodológico, pero su ubicación `.tmp` impide tratarlos como permanentes. Deben revisarse y, en una fase posterior, decidir si se promueven a `backend/scripts`; no se movieron.

## Scripts permanentes

`backend/scripts/` contiene 42 scripts. Deben versionarse por grupos:

- Migraciones: 13 scripts `migrate-*`.
- Plantillas/perfiles: 12 scripts `seed-*` y `generate-*`.
- Auditoría/verificación: 7 scripts `audit-*`, `verify-*`, `require-check.js`.
- Drive: 10 scripts de dry-run, enlace y prueba; los que escriben deben quedar claramente separados de los dry-run en el plan operativo.

## Documentación

Hay 45 documentos bajo `docs`: 7 PDFs fuente y 38 Markdown. Distribución Markdown: perfiles 15, auditoría 6 antes de esta consolidación, AMA 3, DiliTours 3, Informes/Pagos 3, Legales 3, Negados 3 y Encuestas 2. Las fechas concuerdan con las rondas 2026-09-07 a 2026-09-23. No se detectaron nombres idénticos ni enlaces Markdown internos rotos evidentes. Los pares `*-appsheet-*`, `*-dinamico-*` y `*-paridad-*` son capas distintas, no duplicados.

## Tests inventariados

| Módulo | Lado | Suite(s) | Qué valida | DB | Externa | Estado |
|---|---|---|---|---|---|---|
| AMA/actividad | Backend | `amaActividad.test.js` | seis meses, actividad, notas, grupos y concurrencia | PG local 55439 | No | 20 PASS |
| DiliTours | Backend | `dilitoursOperacionFlow.test.js` | cotización, itinerario y brechas | Mock/estático | No | 15 PASS |
| Encuestas | Backend | `encuestaSatisfaccion.test.js` | escalas, padres, aislamiento y SQL | Mock/estático | No | 11 PASS |
| Grupos AMA | Backend | `gruposAmaOperacionFlow.test.js` | 18 contratos operativos | Mock/estático | No | 18 PASS |
| Informes/Pagos | Backend | dos suites | flujo canónico, histórico, pagos y QB | Mock/estático | No | 34 PASS |
| Legal | Backend | `legalesParity.test.js` | proceso, estados, notas, documentos | Mock/estático | No | 16 PASS |
| Negados | Backend | `negadosParity.test.js` | inventario y contrato operativo | Mock/estático | No | incluido en 235 |
| Perfiles | Backend | 10 suites | motor V2, AMA V2/V3, Visa V2/V3, ETA, Pasaporte, aislamiento | Mock/estático | No | incluido en 235 |
| QuickBooks | Backend | `quickbooks.test.js` | payload, cifrado, OAuth, retry, RBAC | Mock | Intuit simulada | incluido en 235 |
| Visa Canadá | Backend | `visaCanadienseAudit.test.js` | contrato de auditoría, no formulario | Estático | No | 7 PASS |
| UI y contratos | Frontend | 11 suites | App, renderer, notas, AMA, Legal, Negados, QB y contratos | No | No | 39 PASS |

Cuatro archivos `e2e-*.js` no forman parte del patrón consolidado `*.test.js`; dependen de configuración/BD y no se ejecutaron para evitar tocar una BD real.

## Plantillas y servicios

- AMA conserva Legacy, V2 y V3; Visa Individual conserva V2 y V3 y sus semillas V1; Pasaporte conserva semillas históricas V1 y plantilla V2; ETA nace en V1. Ninguna plantilla histórica aparece eliminada.
- Los servicios con el mismo nombre en `backend/src/services` y `frontend/src/services` son capas servidor/cliente, no duplicados.
- `backend-mongo/src/services/syncSheets.js` pertenece al backend heredado.
- `pagos.service.js` y `pagosResumen.sql.js`, así como `drive.service.js` y `driveExpedientes.service.js`, tienen responsabilidades distintas y ambos son usados.

## Rutas y componentes legacy

El runtime declarado ahora es `backend/src/server.js`. `backend/index.js` y `backend-mongo/` forman dos ramas legacy. El frontend mantiene rutas modernas junto con aliases PostgreSQL y páginas antiguas. Son especialmente riesgosas `GrupoDetalle.js`, `Aerolineas.js` e `ItinerariosPendientes.js` por contratos directos/antiguos; los componentes `*-postgres` siguen accesibles. El build pasa porque `backend/index.js` no es el entrypoint, `backend-mongo` está fuera del frontend y las 331 eliminaciones pertenecen a dependencias del backend heredado.

## Cambios por módulo

| Grupo | Evidencia principal |
|---|---|
| CORE | backend modular, contactos, clientes, solicitudes, documentos, áreas y UI común |
| PERFILES | motor, templates Legacy/V1/V2/V3, SQL, generadores y renderer |
| ENCUESTAS | definición, servicio, rutas, UI y SQL |
| NEGADOS | servicio/rutas/UI, SQL compartido y pruebas |
| LEGALES | servicio/rutas/UI, SQL compartido y pruebas |
| INFORMES_PAGOS | pagos, métodos, ficha, contratos y documentación |
| AMA | actividad, grupos, checklist, calendario y perfil AMA |
| DILITOURS | cotizaciones, itinerarios, vuelos y calendario |
| QUICKBOOKS | OAuth, cifrado, repositorio, sync, UI y migración |
| AUTH | sólo cambios preexistentes/deuda; no se implementó nada en esta fase |
| OTRO | backend Mongo, builds, ZIP, exports y documentos raíz |

## Validación final

- Backend: **235/235 PASS**.
- Require check: **95/95 módulos PASS**.
- Frontend: **39/39 PASS**, 11 suites.
- React build: **PASS**.
- Lint disponible: ESLint integrado al build, **PASS con 20 warnings y 0 errores**.
- Warnings nuevos: 0 respecto a la auditoría integral inmediatamente anterior.
- Deuda histórica/actual: 20 warnings (hooks, variables no usadas y exports anónimos) más aviso de `caniuse-lite` desactualizado.

## Revisión humana obligatoria

1. `backend/.env` está tracked y modificado.
2. Credencial local ignorada bajo `backend/credentials/`.
3. Siete CSV en `backend-mongo/data/` con posibles datos personales/exportados.
4. Los 331 borrados de dependencias y el cambio de entrypoint deben aprobarse juntos.
5. Los cambios y archivos nuevos de `backend-mongo` no están explicados por la migración modular.
6. Los 18 SQL deben ordenarse y revisarse antes de cualquier ejecución.
7. Los 13 scripts en `.tmp` requieren decisión sobre promoción o descarte.
8. Los ZIP, builds y auditoría visual no deben entrar en commits funcionales.

## Dictamen

**WORKING TREE: REQUIERE REVISIÓN.** El código probado está estable, pero no es seguro consolidar en bloque mientras dependencias rastreadas, secretos/configuración local, legacy y artefactos generados estén mezclados.

## Cifras de cierre

| Métrica solicitada | Resultado |
|---|---:|
| Working tree total | 803 |
| Modificados | 398 |
| Eliminados | 331 |
| Nuevos | 74 entradas / 2,765 archivos físicos |
| Renombrados | 0 |
| Eliminaciones confirmadas | 331 |
| Eliminaciones sospechosas | 0 |
| Archivos fuente con referencias rotas | 1 |
| Untracked que deben versionarse | 44 entradas |
| Untracked que no deben versionarse | 17 entradas |
| Untracked sujetos a revisión | 13 entradas |
| Archivos sensibles detectados | 9 rutas |
| SQL pendientes | 18 |
| SQL con posible conflicto | 5 |
| Scripts temporales | 13 |
| Legacy identificado | 3 conjuntos (`backend/index.js`, `backend-mongo`, frontend antiguo/paralelo) |
| Cambios no explicados | 23 entradas |
| Grupos de commit propuestos | 14 |

