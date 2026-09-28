# Backend legacy — 2026-09-24

## Backends detectados

| Backend | Entry point | Manifiesto/script | Base | Referencias | Clasificación |
|---|---|---|---|---|---|
| Modular actual | `backend/src/server.js` | `backend/package.json`: `npm start` | PostgreSQL mediante `pg` | Consumido por servicios nuevos; 95 módulos cargan | ACTIVO |
| Monolito PostgreSQL | `backend/index.js` | Ya no es `main`; sin script actual | PostgreSQL, esquema/contratos antiguos | Numerosas páginas antiguas aún llaman sus endpoints | LEGACY_REFERENCIADO y LEGACY_PELIGROSO |
| `backend-mongo` híbrido | `backend-mongo/server.js` | Manifiesto propio con `npm start` | Sequelize/PostgreSQL al iniciar; conserva Mongoose/Mongo y mensajes contradictorios | Documentación y comentarios de login; no importado por backend actual | LEGACY_CONFIRMADO, REFERENCIADO y PELIGROSO |

No se detectaron `backend-old`, `deprecated` ni otra carpeta servidor equivalente. Los ZIP son respaldos, no backends ejecutables adicionales.

## Evidencia de actividad

- El runtime canónico es inequívoco: `backend/package.json` apunta a `src/server.js`.
- El backend modular no importa `backend/index.js` ni `backend-mongo`.
- No hay CI/CD o despliegue activo encontrado que arranque explícitamente los legados.
- `DOCUMENTO_TECNICO.md` y `GUIA_LOGIN_COMPLETA.md` describen MongoDB/backend-mongo y están obsoletos respecto al runtime actual.
- `backend-mongo/server.js` ejecuta `sequelize.authenticate()` y `sequelize.sync()` al arrancar. Su nombre, mensajes y dependencias Mongo no coinciden con la conexión efectiva; iniciarlo accidentalmente puede alterar esquema.
- `backend/index.js` no arranca con el manifiesto actual porque requiere paquetes retirados (`bcrypt`, `jsonwebtoken`). Aun así, el frontend conserva consumidores de sus contratos.

## Endpoints duplicados

Se extrajeron contratos literales y se normalizaron nombres de parámetros (`:id`, `:idCliente`, etc.). Resultado: backend actual 112 contratos, monolito 86 y backend-mongo 13.

Hay **17 contratos método+ruta duplicados** entre el actual y al menos un legado.

### Actual ↔ monolito: 13

| Método/ruta normalizada | Consumidor frontend | Estado |
|---|---|---|
| `GET/POST /api/clientes` | Sí | AMBOS; respuesta puede diferir |
| `GET /api/clientes/:id` | Sí | AMBOS |
| `GET /api/empleados` | Sí | AMBOS |
| `GET /api/solicitudes` | Sí | AMBOS |
| `POST /api/solicitudes` | Sí | AMBOS |
| `POST /api/solicitudes/:id/pagos` | Sí | AMBOS |
| `POST /api/solicitudes/:id/seguimientos` | Sí | AMBOS |
| `GET /api/documentos/solicitud/:id` | Sí | AMBOS |
| `GET /api/pagos/solicitud/:id` | Sí | AMBOS |
| `GET/POST /api/metodos-pago` | Sí | AMBOS |
| `DELETE /api/metodos-pago/:id` | Sí | AMBOS; actual hace baja lógica |

Las filas compactas `GET/POST` representan dos contratos cada una; el total es 13.

### Actual ↔ backend-mongo: 5

| Método/ruta | Consumidor frontend | Estado |
|---|---|---|
| `POST /api/auth/login` | Sí | AMBOS; semántica de credenciales distinta |
| `POST /api/auth/register` | Sí | AMBOS; actual responde 501 |
| `POST /api/auth/cliente-login` | Sí | AMBOS; actual responde 501 |
| `GET /api/auth/verify` | Sí | AMBOS |
| `GET /api/clientes` | Sí | Coincide también con monolito |

La unión es 17 porque `GET /api/clientes` aparece en los tres.

## Contratos sólo legacy todavía consumidos

Páginas accesibles o componentes todavía referenciados llaman rutas que el backend modular no ofrece con el mismo contrato: antecedentes, países/ciudades CRUD, roles, aerolíneas, grupo detalle, itinerario antiguo, pendientes de documentos, entrega de documentos, `solicitudes/:id/completo` y variantes antiguas de trámites/pagos. Se encontraron 28 archivos frontend con `localhost:5000`; no todos son legacy porque esa es también la URL local del backend actual, pero los contratos anteriores sí lo son.

El frontend es **PARCIALMENTE dependiente de legacy**: los flujos nuevos usan `src/lib/api.js`/servicios modulares, mientras rutas antiguas siguen montadas en `App.js` y llaman el monolito directamente.

## Uploads e información no migrada

- Monolito sirve `backend/uploads/documentos`; backend-mongo tiene su propio patrón `backend-mongo/uploads`. No comparten físicamente la misma carpeta.
- El monolito conserva CRUD que no existe en forma equivalente en el modular: roles, ciudades, antecedentes y aerolíneas.
- Backend-mongo conserva sync de hojas y dashboard específicos. Su existencia no demuestra que deban migrarse; requiere decisión de producto/datos.

## Resumen

| Métrica | Resultado |
|---|---:|
| BACKENDS DETECTADOS | 3 |
| ACTIVOS | 1 |
| LEGACY CONFIRMADOS | 2 |
| LEGACY REFERENCIADOS | 2 |
| LEGACY PELIGROSOS | 2 |
| ENDPOINTS DUPLICADOS | 17 |
| FRONTEND AÚN DEPENDIENTE DE LEGACY | PARCIAL |

Antes del staging debe definirse explícitamente qué páginas legacy permanecen en alcance. No se debe retirar ningún backend hasta cerrar esos consumidores.

## Validación y dictamen de staging

- Backend: 235/235 PASS con PostgreSQL local aislado; servidor detenido al terminar.
- Frontend: 39/39 PASS, 11 suites.
- Build React: PASS.
- Lint integrado: PASS con 20 warnings y 0 errores; mismos warnings conocidos.

Dictamen: **NO_LISTO_PARA_STAGING_SELECTIVO**. Los bloqueadores son `backend/.env` tracked, siete CSV y una guía con credencial literal no ignorados, la decisión 08-21 frente a 08-22 y consumidores frontend que aún dependen de contratos legacy. La identificación está completa, pero todavía faltan decisiones/acciones de saneamiento autorizadas.

