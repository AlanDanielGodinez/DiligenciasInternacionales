# Auditoría integral del sistema — 2026-09-23

## Alcance y método

Auditoría estática y local del estado posterior a la migración AppSheet → React + Express + PostgreSQL. No se conectó a PostgreSQL real, no se ejecutaron migraciones y no se modificó código funcional. Se revisaron el árbol de trabajo, rutas, servicios, SQL, pruebas y documentación existente.

## Dictamen

El sistema tiene una base funcional local extensa y comprobable, pero **no está listo para preproducción ni producción**. Los bloqueos principales son: autenticación efectiva ausente en casi toda la API modular, contraseña no validada durante el login, esquema real no verificado, 18 SQL cuyo estado de aplicación es desconocido, rutas heredadas o marcadores pendientes expuestos en el frontend y un árbol de trabajo de 803 entradas sin consolidar.

El ejecutable canónico declarado es `backend/src/server.js` (`npm start`). `backend/index.js` y `backend-mongo/` son implementaciones heredadas paralelas; iniciarlas produciría contratos, autenticación y esquemas distintos.

## Evidencia ejecutada

| Verificación | Resultado |
|---|---:|
| Backend, todos los `*.test.js` | PASS — 235/235 |
| Frontend Jest | PASS — 39/39, 11 suites |
| React production build | PASS con 20 advertencias ESLint |
| PostgreSQL usado por pruebas integrales | clúster aislado local, `127.0.0.1:55439`; detenido al terminar |
| PostgreSQL real | NO CONSULTADO |
| Migraciones | NO EJECUTADAS |

Algunas pruebas estáticas imprimen la configuración resuelta del `.env`; no abrieron una conexión real. La salida mostró metadatos de infraestructura que no deben publicarse.

## Árbol de trabajo

`git status --short` contiene **803 entradas: 398 modificadas, 331 eliminadas y 74 no rastreadas**. `backend/` aporta 696 entradas, principalmente por `node_modules` rastreado/alterado. También hay cambios en `backend-mongo/`, frontend, archivos de configuración y numerosos artefactos nuevos todavía sin seguimiento. La captura completa está en `backend/.tmp/auditoria-git-status-2026-09-23.txt`.

Clasificación:

- Código funcional nuevo/modificado: `backend/src`, `backend/scripts`, `backend/sql`, `backend/test`, páginas, componentes y servicios del frontend.
- Documentación de auditorías previas: `docs/ama`, `docs/dilitours`, `docs/encuestas`, `docs/informes-pagos`, `docs/legales`, `docs/negados`, `docs/perfiles`.
- Dependencias/ruido: cambios masivos dentro de `backend/node_modules`; deben salir del control de versiones mediante una consolidación deliberada.
- Heredado: `backend/index.js`, `backend-mongo/`, páginas antiguas PostgreSQL/Mongo y ZIP de respaldos.
- Temporal: `backend/.tmp`, reportes y clúster local de pruebas. No se eliminó nada.

## Hallazgos críticos

1. `backend/src/app.js` monta casi todos los routers sin middleware de autenticación. Sólo QuickBooks y dos acciones de seguimientos tienen verificaciones puntuales.
2. `backend/src/services/auth.service.js` busca al empleado por correo, pero no compara `password`; cualquier contraseña no vacía permite entrar si el correo existe.
3. El token usa un secreto fallback conocido cuando faltan `JWT_SECRET` y `AUTH_TOKEN_SECRET`.
4. `EmpleadoLayout` no protege rutas: sólo dibuja el sidebar y el `Outlet`. Varias pantallas agregan un token, pero el servidor no lo exige.
5. El login de cliente y el registro responden 501; el portal de cliente no tiene flujo PostgreSQL completo.
6. QuickBooks sí aplica autenticación y RBAC en su router (conectar/desconectar sólo para administración); su garantía queda debilitada por el login global que no valida contraseña.
7. Conviven rutas modernas, páginas heredadas, aliases y marcadores `ModuloPendiente`; hay riesgo de demostrar la pantalla equivocada.
8. Ningún SQL se verificó contra el esquema real. Algunos incluyen `DROP`, `DELETE` o DDL no plenamente idempotente y requieren revisión/backup antes de aplicarse.

## Frontend y rutas

Las rutas públicas y de marketing compilan. El bloque de rutas de empleado no tiene guard. Son funcionales localmente las bandejas nuevas de contactos, solicitudes, individuales, legales, AMA, pagos, QuickBooks y viajes, dentro de los límites de la matriz modular.

Rutas con deuda visible:

- Marcadores: estadísticas, llamadas, seguimientos, citas, perfiles directos de visa/pasaporte, participantes/familiares AMA, tours/hoteles/vehículos, catálogos y staging.
- Paralelas/transitorias: `dashboard-postgres`, `clientes-postgres`, `solicitudes-postgres`, `calendario-ama-postgres`.
- Heredadas: `/grupos/:idGrupo`, `/empleado/aerolineas`, antecedentes y varios modales/páginas antiguas; algunas contienen contratos o URL antiguas.
- Los perfiles dinámicos sí se consumen desde el flujo nuevo de solicitud aunque las rutas directas de perfil sigan como marcador.

## Clasificación consolidada

La unidad de conteo es cada fila de la matriz de módulos. Detalle y evidencia: `auditoria-integral-modulos-2026-09-23.md`.

| Clasificación | Cantidad |
|---|---:|
| LISTO_LOCAL | 0 |
| LISTO_LOCAL_SQL_PENDIENTE | 8 |
| PARCIAL_FUNCIONAL | 13 |
| BLOQUEADO_DECISIÓN | 0 |
| BLOQUEADO_FUENTE | 1 |
| BLOQUEADO_AUTH | 2 |
| LEGACY | 1 |
| NO_IMPLEMENTADO | 0 |
| **Total** | **25** |

`BLOQUEADO_DECISIÓN` y `NO_IMPLEMENTADO` valen cero porque las decisiones y pantallas pendientes pertenecen a módulos que ya tienen una fracción funcional y por ello se clasifican una sola vez como `PARCIAL_FUNCIONAL`. No se duplicaron módulos para inflar el conteo.

## Fortalezas reales

- Motor de perfiles versionado, declarativo y probado, con condiciones y repetidores sin `eval`.
- Relaciones canónicas contacto → aplicantes → solicitudes y aislamiento por solicitud.
- Históricos de pagos, actividad, notas y procesos con validaciones transaccionales probadas localmente.
- Flujos auditables para AMA, Negados, Legal, encuestas, grupos y viajes.
- Integración QuickBooks con cifrado de tokens, OAuth state, sanitización y pruebas unitarias.
- Compilación de producción exitosa.

## Bloqueos antes de preproducción

1. Resolver autenticación y autorización del backend y guards del frontend.
2. Consolidar el árbol de trabajo en cambios revisables y excluir dependencias/temporales.
3. Inventariar el esquema de una BD de staging de sólo lectura y conciliar las migraciones.
4. Corregir o retirar del menú/ruteo las rutas heredadas y los marcadores que entren en la demo.
5. Cerrar fuentes y decisiones detalladas en los documentos anexos.
6. Ejecutar pruebas de integración en staging con datos anonimizados y cuentas de rol.

## Orden recomendado para la siguiente fase

1. **Seguridad:** credenciales, middleware global, RBAC, sesión cliente, guards y pruebas negativas.
2. **Control de versión:** separar código, SQL, docs, dependencias y temporales; definir el runtime único.
3. **Base de datos:** auditoría read-only de staging, tabla de migraciones, orden/rollback y backup ensayado.
4. **Fuentes y decisiones:** resolver datos faltantes y reglas de negocio antes de ampliar esquemas.
5. **Rutas de demo:** retirar aliases peligrosos, marcar módulos no disponibles y validar navegación por rol.
6. **Integraciones:** validar Drive y QuickBooks en sandbox/staging.
7. **Aceptación:** smoke tests por rol, regresión completa, observabilidad y ensayo de despliegue/rollback.

