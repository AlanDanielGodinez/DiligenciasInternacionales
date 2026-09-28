# Saneamiento previo a staging — 2026-09-24

## Cambios realizados

- Se guardó el estado anterior en `pre-staging-snapshot-2026-09-24.md`.
- `backend/.env` se retiró sólo del índice con `git rm --cached`; el archivo local permanece y ahora está ignorado.
- Los 1,313 archivos históricamente versionados bajo `backend/node_modules` se retiraron sólo del índice. El directorio local permanece.
- `.gitignore` dejó de ignorar globalmente `*.json` y `package-lock.json`; ahora usa rutas específicas para credenciales, exports, artefactos y temporales.
- `GUIA_LOGIN_COMPLETA.md` quedó sanitizada con marcadores `<REDACTED>` y `<CONFIGURAR_LOCALMENTE>`.
- No se modificó autenticación, código funcional, SQL ni bases reales.

## Archivos sensibles

| Ruta o grupo | Estado final | Decisión |
|---|---|---|
| `backend/.env` | local, no tracked, ignorado; tuvo historia Git | IGNORADA_CORRECTAMENTE; rotación de credenciales recomendada |
| `backend-mongo/.env` | local, untracked, ignorado | IGNORADA_CORRECTAMENTE |
| `backend/credentials/diligencias-drive-service-account.json` | untracked, ignorado por ruta específica | IGNORADA_CORRECTAMENTE |
| siete CSV auditados en `backend-mongo/data/` | untracked, 7/7 ignorados por el directorio concreto | IGNORADA_CORRECTAMENTE / NO_VERSIONAR |
| `GUIA_LOGIN_COMPLETA.md` | untracked, versionable, credencial eliminada | VERSIONABLE_Y_SANITIZADA |

Existe además `usuarios_ejemplo.csv` en el mismo directorio local. No pertenecía al inventario original de siete, pero queda cubierto por la misma exclusión. No se borró ningún CSV.

`backend/.env` sí aparece en commits anteriores; retirarlo del índice no limpia esa historia. Se marca `ROTACIÓN_DE_CREDENCIALES_RECOMENDADA`, sin reescribir historia ni rotar valores en esta fase. La guía nunca fue committeada, por lo que `CREDENCIAL_EN_HISTORIAL: NO`.

La revisión final de los once candidatos no detectó passwords, tokens, API keys, client secrets, claves privadas ni cadenas completas reales disponibles para el staging propuesto. Las referencias restantes son nombres de variables, código que procesa credenciales, fixtures o marcadores sanitizados.

## Política de `.gitignore`

Quedan ignorados `node_modules`, entornos reales, `backend/credentials/`, `backend-mongo/data/`, uploads, reportes locales, logs, temporales, artefactos ZIP y builds de auditoría. Siguen siendo versionables package manifests, locks, JSON seguros, SQL, tests, documentación y código.

Verificaciones representativas:

| Ruta | Resultado |
|---|---|
| `backend/.env` | IGNORADO |
| `backend/node_modules/express/package.json` | IGNORADO y no tracked |
| `backend/package.json` | TRACKED, NO IGNORADO |
| `backend/package-lock.json` | TRACKED, NO IGNORADO |
| CSV sensible | IGNORADO |
| SQL Legal | NO IGNORADO |
| test JavaScript | NO IGNORADO |
| documento de auditoría | NO IGNORADO |

## Node modules

- Históricamente tracked: 1,313.
- Tracked después del saneamiento: 0.
- Archivos locales eliminados: 0.
- Dependencias locales disponibles: sí; backend, frontend y build se ejecutaron sin `npm install`.

## SQL Legal canónico

La relación es `08-22_SUPERSEDE_08-21`.

| Papel | Archivo | Decisión |
|---|---|---|
| Canónica | `2026_08_22_fix_legales_active_schema.sql` | Incluir en un futuro ensayo controlado de staging, después de conciliar el esquema mediante lectura |
| Supersedida | `2026_08_21_modulo_legales.sql` | Conservar como antecedente; excluir del futuro staging |

La evidencia es técnica: 08-22 declara que corrige el esquema activo que no recibió 08-21, reproduce su estructura necesaria, añade guardas para claves foráneas y sustituye la unicidad del origen por un índice de trazabilidad. El backend y las pruebas Legal admiten múltiples casos relacionados con el mismo origen. No queda decisión de negocio pendiente, aunque sí queda la comprobación read-only del esquema de staging antes de ejecutar cualquier migración.

## Otros solapamientos SQL

| Grupo | Archivo A | Archivo B | Tipo | Decisión | Orden | Staging futuro |
|---|---|---|---|---|---|---|
| Negados 1 | 08-19 | 08-20 | misma función, evolución secuencial | conservar ambos | 08-19 → 08-20 | incluir en orden |
| Negados 2 | 08-20 | 08-23 | reemplazo final de función | 08-23 debe prevalecer | 08-20 → 08-23 | incluir en orden |
| Negados 3 | 08-19 | 08-23 | mismo objeto, no sustitución total | conservar base y corrección | 08-19 → 08-20 → 08-23 | incluir en orden |
| Legal estructura | 08-21 | 08-22 | alternativa/supersesión | usar sólo 08-22 | 08-22 | excluir 08-21 |
| Legal índice | 08-21 | 08-22 | definición incompatible en secuencia | prevalece índice no único de 08-22 | 08-22 | excluir 08-21 |

Resumen general: 18 pendientes; 4 sin conflicto; 9 donde importa el orden; 3 con solapamiento real; 2 alternativos/duplicados; 0 incompatibles finales; 0 decisiones documentales pendientes. Ningún SQL fue ejecutado.

## Dependencia frontend de legacy

Se encontraron 27 archivos frontend con referencias directas a `localhost:5000`. La URL también corresponde al backend modular local, por lo que la clasificación depende del contrato llamado.

| Página/componente | Servicio o endpoints principales | Actual | Legacy | Clasificación y razón |
|---|---|---|---|---|
| `src/config/api.js` | base `/api` | sí | sí | C — base compartida |
| `src/lib/api.js` | base `/api` | sí | sí | C — base compartida |
| `SolicitudesPostgresPage.jsx` | solicitudes modulares | sí | no requerido | A — reemplazo modular |
| `Login.js` | login PostgreSQL comentado | no activo | referencia histórica | D — parece no utilizado |
| `AgregarPagoModal.js` | métodos de pago; pagos por solicitud | sí | sí | A — contrato modular disponible |
| `AgregarSeguimientoModal.js` | empleados; seguimientos | sí | sí | A — contrato modular disponible |
| `Aerolineas.js` | CRUD `/aerolineas` | no equivalente | sí | B — sólo legacy |
| `Antecedentes.js` | antecedentes por cliente y delete | no | sí | B — sólo legacy |
| `SubirDocumentoModal.js` | upload de documentos | sí | sí | A — reemplazo modular disponible |
| `InicioCliente.js` | estado, solicitudes y documentos | parcial | sí | C — mezcla contratos |
| `ResumenEncuentroModal.js` | `/solicitudes/:id/completo`; uploads | no equivalente | sí | B — sólo legacy |
| `AsigancionRoles.js` | roles | no | sí | B — sólo legacy |
| `AsignarResponsable.js` | solicitudes/responsable | sí | sí | A — reemplazo modular disponible |
| `CrearAntecedente.js` | POST `/antecedentes` | no | sí | B — sólo legacy |
| `CrearCliente.js` | países/ciudades; clientes | parcial | sí | C — clientes modular, catálogos legacy |
| `CrearSolicitud.js` | clientes, empleados, trámites, solicitudes | parcial | sí | C — mezcla contratos |
| `DetallesSolicitudModal.js` | `/solicitudes/:id/completo`; uploads | no equivalente | sí | B — sólo legacy |
| `EditarAntecedente.js` | PUT `/antecedentes/:id` | no | sí | B — sólo legacy |
| `EditarArea.js` | áreas | sí | sí | A — reemplazo modular disponible |
| `EditarCliente.js` | clientes; países/ciudades | parcial | sí | C — mezcla contratos |
| `EntregarDocumentos.js` | pendientes/entrega de documentos | no equivalente probado | sí | E — requiere verificar alcance |
| `GrupoDetalle.js` | grupos/clientes; trámite/cliente | no equivalente | sí | B — sólo legacy |
| `ItinerariosPendientes.js` | pendientes, itinerario y aerolíneas | no equivalente | sí | B — sólo legacy |
| `NuevoTramite.js` | clientes, empleados, POST `/tramites` | parcial | sí | B — operación principal sólo legacy |
| `SeleccionarTramiteModal.js` | grupo AMA/agregar clientes | sí, flujo nuevo distinto | sí | A — reemplazo modular disponible |
| `VerPagoModal.js` | pagos por solicitud | sí | sí | A — reemplazo modular disponible |
| `VerSolicitudes.js` | solicitudes; entrega documentos | parcial | sí | C — mezcla contratos |

Totales: 8 con reemplazo modular; 10 sólo legacy; 7 usan ambos; 1 parece no utilizado; 1 requiere verificación.

Los dos backends legacy (`backend/index.js` y `backend-mongo/`) quedan `MANTENER_TEMPORALMENTE`, `NO_MODIFICAR`, `EXCLUIR_CAMBIOS_DEL_STAGING` y `REQUIERE_MIGRACIÓN_POSTERIOR`. Sus cambios ya existían antes de esta fase y su propósito no puede atribuirse con seguridad; no se stagedaron. El backend activo es `backend/src/server.js`.

## Validaciones

| Validación | Resultado real |
|---|---|
| Backend completo | 235/235 PASS; PostgreSQL temporal `127.0.0.1:55439`, detenido al terminar |
| Frontend | 39/39 PASS; 11 suites |
| React build | PASS |
| ESLint integrado en build | 0 errores, 23 warnings históricos |

## Estado Git final

- Working tree: 1,691 entradas con `-uall`: 41 modificadas, 336 untracked y 1,314 eliminaciones staged.
- `SANEAMIENTO_INDEX`: 1,314 eliminaciones staged, compuestas por `backend/.env` y 1,313 archivos bajo `backend/node_modules`.
- `STAGING_FUNCIONAL`: 0.
- Secretos candidatos a commit: 0/11.
- `git diff --cached --check`: limpio. El `git diff --check` global conserva cinco incidencias de whitespace preexistentes en archivos legacy/funcionales fuera del grupo recomendado; no se modificaron en esta fase.
- No se hizo commit, tag, push, deploy ni staging funcional.

## Dictamen

`LISTO_PARA_STAGING_SELECTIVO` con una condición operativa: seleccionar archivos por grupo y excluir los dos backends legacy, 08-21 y cualquier archivo fuera del grupo revisado.

Primer grupo recomendado: saneamiento del repositorio. Archivos: `.gitignore`, `GUIA_LOGIN_COMPLETA.md`, eliminaciones del índice de `backend/.env` y `backend/node_modules/**`, y los documentos de `docs/auditoria/` generados en esta revisión. Razón: elimina el riesgo de secretos/dependencias y deja explícita la política antes de introducir código funcional. Dependencias: ninguna de runtime; mantener los archivos locales ignorados. Después de stagear ese grupo, repetir revisión de secretos, `git diff --cached --check`, backend 235/235, frontend 39/39 y build.
