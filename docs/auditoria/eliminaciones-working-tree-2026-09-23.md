# Eliminaciones del working tree — 2026-09-23

## Resultado

Las **331 eliminaciones** están exclusivamente bajo `backend/node_modules`. No hay eliminaciones de código fuente, tests, SQL, documentación, plantillas ni assets propios.

| Clasificación | Cantidad |
|---|---:|
| ELIMINACIÓN_CONFIRMADA | 331 |
| REEMPLAZADO | 0 |
| LEGACY_PROBABLE | 0 |
| ELIMINACIÓN_SOSPECHOSA | 0 |
| REQUIERE_REVISIÓN | 0 |

“Confirmada” significa que son copias instaladas de dependencias que no deben versionarse y ya están cubiertas por `node_modules/` en `.gitignore`. La confirmación no autoriza borrarlas ni hacer staging; el cambio de manifiesto y lock necesita revisión humana.

## Inventario completo por paquete

| Paquete/ruta | Archivos eliminados | Referenciado | Reemplazo/evidencia |
|---|---:|---|---|
| `.bin` | 12 | Indirecto | Ejecutables de paquetes retirados |
| `asynckit` | 20 | Transitivo | Retirado con axios/form-data |
| `axios` | 85 | No por runtime modular | Backend modular usa `fetch`; manifiesto lo retira |
| `bcrypt` | 38 | Sí, sólo `backend/index.js` | Backend modular no usa credenciales hash todavía |
| `bcryptjs` | 11 | No | Retirado del manifiesto |
| `combined-stream` | 5 | Transitivo | Retirado con form-data |
| `delayed-stream` | 6 | Transitivo | Retirado con form-data |
| `es-set-tostringtag` | 10 | Transitivo | Retirado con cadena anterior |
| `follow-redirects` | 7 | Transitivo | Retirado con axios |
| `form-data` | 7 | Transitivo | Retirado con axios |
| `has-tostringtag` | 16 | Transitivo | Retirado con cadena anterior |
| `jsonwebtoken` | 19 | Sí, sólo `backend/index.js` | Backend modular usa firma HMAC propia |
| siete paquetes `lodash.*` | 28 | Transitivo | Retirados con jsonwebtoken |
| `minimist` | 24 | Transitivo | Retirado con tooling anterior |
| `multer` | 9 | Sí | Reinstalado/actualizado; archivos actuales aparecen modificados, no desaparece la dependencia |
| `node-addon-api` | 18 | Transitivo | Retirado con bcrypt |
| `node-gyp-build` | 9 | Transitivo | Retirado con bcrypt |
| `proxy-from-env` | 7 | Transitivo | Retirado con axios |
| **Total** | **331** | | |

## Referencias y riesgo

No hay imports por ruta a ninguno de los 331 archivos individuales. Sí existe **un archivo fuente con imports de paquetes ya ausentes**: `backend/index.js` requiere `bcrypt` y `jsonwebtoken`. Se marca `RIESGO_IMPORT_ROTO` si alguien arranca `node backend/index.js`.

El comando canónico `npm start` usa `src/server.js`; `npm run require-check` cargó 95 módulos del backend modular sin error. Esto explica por qué pruebas y build pasan a pesar de las eliminaciones.

## Plantillas históricas

Siguen presentes `perfilAmaLegacy`, AMA V2/V3, Visa Individual V2/V3, Pasaporte V2 y ETA V1, además de semillas históricas V1. Ninguna forma histórica necesaria está en las eliminaciones.

