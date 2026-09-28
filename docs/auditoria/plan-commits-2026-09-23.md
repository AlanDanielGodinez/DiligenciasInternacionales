# Plan de commits — 2026-09-23

No se creó ningún commit ni se hizo staging. Se proponen **14 grupos**.

| # | Nombre | Archivos/área | Depende de | Tests | SQL | Riesgo |
|---:|---|---|---|---|---|---|
| 1 | Higiene y runtime canónico | `.gitignore`, `backend/package*.json`, retiro tracked de `backend/node_modules` | Revisión humana de lock y legacy | require-check | No | Alto por 687 entradas |
| 2 | Backend modular core | `backend/src` core: config, app, contactos, clientes, solicitudes, áreas, documentos | 1 | suite completa | 06-09, 06-18, 08-18 | Alto |
| 3 | Motor de perfiles | engine, repositorio/servicio, repetibles, PDF y renderer base | 2 | perfiles engine | 08-27 | Alto |
| 4 | AMA perfiles V2/V3 | templates, generadores, tests y docs AMA perfil | 3 | AMA perfiles | 09-10 V2, 09-18 V3 | Medio |
| 5 | Visa Individual V2/V3 | templates, semillas/generador, tests y docs | 3 | Visa V2/V3 | 09-18 Visa V3 | Medio |
| 6 | Pasaporte y ETA | templates, generadores, tests y docs | 3 | Pasaporte/ETA | dos SQL 09-22 | Medio |
| 7 | Encuestas | definición, backend/frontend, tests y docs | 2 | encuesta/UI | 09-22 encuesta | Medio |
| 8 | Negados | backend, frontend, pruebas y docs | 2 | negados | 08-19/20/23 parcial | Alto |
| 9 | Legal | backend, frontend, pruebas y docs | 8 | Legal | 08-21/22/23 | Alto por solapamiento |
| 10 | Informes y Pagos | pagos, métodos, UI, contratos y docs | 2 | flow/parity/UI | 06-18 y migraciones JS | Alto |
| 11 | Operación Grupos AMA | actividad, grupos, checklist, calendario, UI y tests | 2,4,10 | PG local + contratos | 09-10 actividad + JS | Alto |
| 12 | DiliTours | viajes, vuelos, calendario, UI, tests y docs | 2,10 | DiliTours/UI | migración JS | Medio |
| 13 | QuickBooks | repositorio, OAuth, crypto, sync, UI y pruebas | 2,10 | QuickBooks/UI | 08-03 | Alto/external |
| 14 | Documentación y auditoría | `docs/**`, scripts de auditoría reproducibles | 2–13 | links/consistencia | Inventario solamente | Bajo |

## Fuera del plan hasta revisión

- `backend-mongo/**` y `backend-mongo.zip`.
- `backend/.env` y credenciales locales.
- `backend/.tmp/**`, salvo promoción posterior de scripts reproducibles.
- Builds, `.visual-audit`, ZIP, logs, DB local y CSV.
- Tres documentos raíz preexistentes hasta decidir si reflejan la arquitectura canónica.

Cada commit funcional debe incluir sus pruebas y documentación específica. Los SQL deben permanecer revisables como artefactos, sin afirmar que están aplicados.

