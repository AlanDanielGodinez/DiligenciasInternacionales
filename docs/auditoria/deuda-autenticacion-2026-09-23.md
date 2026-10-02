# Deuda de autenticación y autorización — 2026-09-23

## Severidad crítica

1. **Contraseña no validada.** `auth.service.login()` exige un texto no vacío, pero consulta sólo el correo y nunca compara hash ni credencial.
2. **API modular abierta.** `app.js` monta casi todos los routers sin autenticación global ni middleware por router.
3. **Secreto fallback.** Si faltan variables de entorno, el servidor firma tokens con `diligencias-local-session-secret`.
4. **Rutas empleado sin guard.** `EmpleadoLayout` no verifica token ni rol; una URL directa muestra la aplicación.
5. **Portal cliente incompleto.** `/auth/cliente-login` responde 501, aunque el frontend ofrece el flujo.

## Severidad alta

6. **RBAC no generalizado.** QuickBooks sí tiene acceso por roles, pero ese patrón no se aplica de forma consistente a los demás módulos.
7. **Autorización por expediente inconsistente.** Dos endpoints de seguimiento validan sesión/acceso de forma local; el resto no comparte una política central.
8. **Tokens en `localStorage`.** Aumenta el impacto de XSS y convive con claves históricas (`token`, `accessToken`, `userToken`).
9. **Dos pilas de autenticación.** El backend modular y `backend/index.js` tienen lógicas, secretos y contratos distintos.
10. **Sin pruebas negativas integrales.** Las suites prueban reglas de módulos, pero no demuestran que un anónimo o un rol incorrecto sea rechazado en cada endpoint.

## Requisitos mínimos de cierre

- Almacén de credenciales con hash fuerte y proceso de alta/recuperación controlado.
- `JWT_SECRET` obligatorio y rotación documentada; eliminar fallback en entornos desplegados.
- Middleware de autenticación por defecto para `/api`, con lista pública explícita.
- Matriz de permisos por rol/área/propiedad de expediente aplicada del lado servidor.
- Guard de frontend como experiencia de usuario, manteniendo al backend como autoridad.
- Sesión cliente separada y autorización estricta a sus propios expedientes/documentos.
- Rate limiting, auditoría de accesos y pruebas 401/403 por ruta crítica.
- Retirar o impedir el arranque accidental de backends heredados.

Hasta cerrar los puntos críticos, el sistema debe permanecer clasificado como **BLOQUEADO_AUTH para preproducción con datos reales**.

## Estado 2026-10-02 (rama `semana1-seguridad`)

Resueltos: 1 (contraseña con hash scrypt), 2 (API protegida por defecto con lista pública explícita),
3 (sin secreto de respaldo; `JWT_SECRET` obligatorio), 4 (guard de rutas de empleado), 6 (matriz de permisos
por área en el servidor, pendiente de validación del negocio), 7 (política central de acceso para documentos),
9 parcial (backends heredados bloqueados para arranque) y 10 (pruebas 401/403 sobre todas las rutas).
Pendientes: 5 (portal cliente) y 8 (tokens en `localStorage`). Detalle en `docs/seguridad/semana1-seguridad.md`.
