# Semana 1 (Fase 0) — Seguridad: cambios, despliegue y pendientes — 2026-10-02

Rama: `semana1-seguridad` (sobre `main` e5dd4a0). Cierra los puntos críticos 1–4 de
`docs/auditoria/deuda-autenticacion-2026-09-23.md` y los altos 6, 7, 9 (parcial) y 10.

## 1. Qué cambió

### Inicio de sesión con contraseña
- `empleados` gana `password_hash` (scrypt, sal aleatoria), `password_actualizado_en`,
  `debe_cambiar_password` y `ultimo_login_en` (`backend/sql/2026_10_02_auth_credenciales.sql`).
- `POST /api/auth/login` compara la contraseña. Correo inexistente, empleado sin contraseña o contraseña
  incorrecta devuelven el mismo `401 INVALID_CREDENTIALS` (sin revelar cuál fue).
- Límite de intentos: 8 fallidos por cuenta+IP y 50 por IP cada 15 min (`429`).
- `POST /api/auth/cambiar-password` (requiere la actual; mínimo 10 caracteres con letras y números).
- Contraseñas temporales: el empleado sólo puede consultar su sesión y cambiarla (`403 PASSWORD_CHANGE_REQUIRED`).
- Cambiar o restablecer la contraseña revoca todas las sesiones previas (versión de contraseña en el token).
- `JWT_SECRET` obligatorio (>= 32 caracteres); se eliminó el secreto de respaldo. El servidor no arranca sin él.
- Altas y restablecimientos los hace un administrador: `npm run auth:set-password -- --email <correo> --generar`
  (contraseña temporal mostrada una sola vez) y `npm run auth:pendientes` (quién no tiene contraseña).
- `POST /api/auth/register` sigue deshabilitado (ahora además exige sesión).

### API protegida por defecto
- `app.use('/api', authenticateApi)`: toda ruta exige sesión salvo la lista pública explícita
  (`backend/src/middlewares/auth.js`): `POST /auth/login`, `POST /auth/cliente-login` (501),
  `GET /health`, `GET /noticias-migratorias` (noticias oficiales de la landing) y el callback OAuth de QuickBooks.
- El token se valida y el empleado se recarga en cada petición (rol, área y estado activo vigentes).
- La autoría (`id_empleado`, `validado_por`, `registrado_por`, `subido_por`) se toma de la sesión, no del cuerpo.
- `helmet`, CORS restringido por `CORS_ORIGINS`/`FRONTEND_URL`, límite global de peticiones, y los errores 5xx
  no exponen detalles en producción.
- `/api/health/db` y `/api/health/tables` sólo Admin.

### Permisos por área (propuesta inicial — requiere validación del negocio)
Grupos derivados de `empleados.rol` y `empleados.area` (`backend/src/security/permissions.js`).
Un rol/área no reconocido no recibe permisos especiales (antes el menú lo trataba como Admin).

| Acción | Grupos autorizados |
|---|---|
| Validar/rechazar pagos, bandeja de Finanzas (`/api/finanzas/*`, `GET /api/pagos`) | Admin, Finanzas/Pagos |
| Alta/edición de métodos de pago | Admin, Finanzas/Pagos |
| Registrar protocolo AMA | Admin, Protocolo |
| Operación AMA (DS, resultado, visa recibida) | Admin, AMA, Protocolo, DS |
| Editar grupos AMA / agenda de llamadas AMA | Admin, AMA, Protocolo |
| Operación Individual (citas, DS, resultado) | Admin, Individuales, DS |
| Editar Legales | Admin, Legales |
| Editar Negados | Admin, Negados, Legales, Individuales, AMA |
| Logística (tours, grupos de viaje, cotizaciones, itinerarios) | Admin, Logística/Vuelos |
| Listado global de documentos | Admin |
| Lectura de catálogos, clientes, contactos, expedientes | Cualquier empleado con sesión |

### Documentos de clientes
- `GET /api/documentos/:id/descargar`, `GET /api/documentos/solicitud/:id` y
  `GET|POST /api/solicitudes/:id/documentos-requeridos` exigen sesión **y** acceso al expediente:
  Admin, responsable del expediente, empleado del área donde está el expediente, o Finanzas para comprobantes de pago
  (`backend/src/security/expedienteAccess.js`).
- Cada descarga y cada rechazo queda en `auditoria_accesos` (junto con logins, cambios de contraseña y permisos denegados).
- `DOCUMENT_ACCESS_POLICY=authenticated` relaja la regla a "cualquier empleado con sesión" (sólo temporal).
- Frontend: las descargas ya no son enlaces directos; se descargan con el token (`utils/downloadDocumento.js`).

### Frontend
- Todas las llamadas al backend (axios y fetch) llevan el token (`utils/apiAuth.js`); nunca se envía a otros dominios.
- `EmpleadoLayout` verifica la sesión con `/api/auth/me`; sin sesión redirige a `/login`.
- Login muestra el mensaje del backend (antes intentaba renderizar un objeto) y redirige a `/cambiar-password` con contraseña temporal.
- Nueva pantalla `/cambiar-password`.

### Secretos y servidores heredados
- Se vaciaron secretos y datos reales de `backend/.env.example`, `backend-mongo/.env.example`,
  `GUIA_LOGIN_COMPLETA.md`, `DOCUMENTO_TECNICO.md` y `backend-mongo/README.md`.
- `backend/index.js` y `backend-mongo/server.js` (heredados) ya no arrancan por accidente; se quitaron
  contraseñas fijas de `backend-mongo/create-admin.js` y `backend-mongo/src/config/env.js`.
- **Los valores siguen en el historial de Git: hay que rotarlos** (sección 3).

### Dependencias
- Backend: `npm audit` 7 vulnerabilidades (5 altas) → 0. Nuevas: `helmet`, `express-rate-limit`; dev: `supertest`.
- Frontend: 71 (5 críticas) → 28 (0 críticas). Se quitaron dependencias de servidor que no usa el navegador
  (`bcrypt`, `jsonwebtoken`, `pg`, `express`, `cors`, `dotenv`) y `swiper` (sin uso), y se forzó `underscore` >= 1.13.8.
  Las 28 restantes están dentro de `react-scripts` 5 (herramientas de compilación/desarrollo); se resuelven al migrar a Vite (Fase 1).

## 2. Despliegue (orden)
1. Respaldo de la base.
2. Generar un `JWT_SECRET` nuevo (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   y definirlo en el entorno del servidor. Definir `CORS_ORIGINS` (y `TRUST_PROXY=1` detrás de un proxy).
3. Revisar correos duplicados: `SELECT lower(correo), count(*) FROM empleados GROUP BY 1 HAVING count(*) > 1;`
4. Aplicar `backend/sql/2026_10_02_auth_credenciales.sql` (idempotente).
5. Revisar `SELECT DISTINCT area, rol FROM empleados WHERE activo` contra la tabla de permisos.
6. `npm run auth:set-password -- --email <correo> --generar` para cada empleado activo; entregar la contraseña
   temporal por un canal seguro (no correo). `npm run auth:pendientes` para verificar.
7. Desplegar backend y frontend juntos (el frontend anterior no envía token y dejaría de funcionar).

## 3. Secretos a rotar (sólo nombres y ubicaciones; nunca copiar valores)
Ver la lista completa en el reporte de entrega. Resumen: `JWT_SECRET` de `backend/.env.example` (crítico),
`JWT_SECRET`/`PGHOST` (IP pública) de `backend-mongo/.env.example`, credenciales de `GUIA_LOGIN_COMPLETA.md`,
`backend/.env` y `backend-mongo/.env` del historial, contraseñas fijas de los backends heredados, y lo que tiene el
proveedor fuera de Git (llave de la cuenta de servicio de Drive, contraseña de Cloud SQL, QuickBooks).
Recomendación: rotar primero; después, al crear el repositorio de la empresa, depurar el historial con `git filter-repo`.

## 4. Pruebas
- `cd backend && npm test` (incluye `test/authLogin.test.js`, `test/securityRoutes.test.js` y
  `test/authPostgres.test.js`; este último usa el cluster local de pruebas en el puerto 55439 y se omite si no existe).
- `securityRoutes.test.js` recorre **todas** las rutas montadas y exige 401 sin sesión (una ruta nueva sin protección rompe la prueba).
- `cd diligenciasinternacionalesinc && CI=true npx react-scripts test --watchAll=false`.

## 5. Pendiente / decisiones
- Recuperación de contraseña por correo (hoy: restablecimiento por administrador).
- Portal de clientes (`/auth/cliente-login` sigue en 501).
- Tokens en `localStorage` → cookie `httpOnly` (requiere CSRF).
- Autorización por expediente en el resto de endpoints (hoy sólo documentos y notas).
- Confirmar la matriz de permisos, los nombres reales de áreas/roles y la regla de acceso a documentos.
- Revisar el uso compartido de carpetas de Drive (los enlaces `web_view_link` y la vista previa dependen de los permisos de Google).
