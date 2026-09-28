# Matriz integral de módulos — 2026-09-23

La clasificación describe el estado comprobable del repositorio; no afirma que el esquema exista en producción.

| # | Módulo | Clasificación | Evidencia y brecha principal |
|---:|---|---|---|
| 1 | Contactos | PARCIAL_FUNCIONAL | CRUD y relación con aplicantes; API sin auth global y sin validación en staging. |
| 2 | Clientes/aplicantes | PARCIAL_FUNCIONAL | Ficha y relaciones disponibles; portal cliente/login sigue incompleto. |
| 3 | Solicitudes/core workflow | PARCIAL_FUNCIONAL | Altas, estados, áreas y responsable; coexistencia con pantallas antiguas y esquema real no conciliado. |
| 4 | Catálogos/áreas/empleados | PARCIAL_FUNCIONAL | Lecturas y parte de administración; permisos y varias pantallas heredadas. |
| 5 | Seguimientos, notas y actividad | LISTO_LOCAL_SQL_PENDIENTE | Reglas de actividad y aislamiento probadas; migración real no confirmada. |
| 6 | Documentos/Drive | PARCIAL_FUNCIONAL | Contrato por solicitud y metadata; integración externa y autorización sin cierre. |
| 7 | Pagos y métodos | LISTO_LOCAL_SQL_PENDIENTE | Histórico e idempotencia probados; instalación de tablas y control de acceso pendientes. |
| 8 | Dashboard/calendarios generales | PARCIAL_FUNCIONAL | Endpoints y vistas parciales; conviven rutas PostgreSQL/transitorias y citas pendientes. |
| 9 | Perfil AMA V3 | LISTO_LOCAL_SQL_PENDIENTE | Definición y reglas probadas; semillas SQL no verificadas en entorno real. |
| 10 | Visa Individual V3 | LISTO_LOCAL_SQL_PENDIENTE | Motor y contrato probados; migración/semilla real no confirmada. |
| 11 | Pasaportes V2 (MX/GT/US) | LISTO_LOCAL_SQL_PENDIENTE | Contrato auditado y probado; fuente US tiene limitaciones registradas. |
| 12 | ETA V1 | LISTO_LOCAL_SQL_PENDIENTE | Contrato y persistencia JSON probados; semilla real pendiente. |
| 13 | Visa Canadiense | BLOQUEADO_FUENTE | Sólo auditoría de 26 columnas; credenciales/operación no permiten inferir un formulario completo. |
| 14 | Encuesta de satisfacción | LISTO_LOCAL_SQL_PENDIENTE | Escalas, aislamiento e histórico probados; tabla real no confirmada. |
| 15 | Negados | LISTO_LOCAL_SQL_PENDIENTE | Bandeja, actividad, preguntas, Legal, cierre/reaplicación; SQL real y regla temporal pendientes. |
| 16 | Legal | PARCIAL_FUNCIONAL | Proceso, notas, estados y cierre; decisiones sobre alta manual, documentos y reapertura. |
| 17 | Informes y pagos AppSheet | PARCIAL_FUNCIONAL | Flujo normalizado y probado; precio/saldo, proceso opaco y alcance fiscal no resueltos. |
| 18 | QuickBooks | PARCIAL_FUNCIONAL | OAuth/sync local robusto; RBAC incompleto y sandbox no validado en esta auditoría. |
| 19 | Grupos AMA | PARCIAL_FUNCIONAL | Grupos, miembros, checklist y calendario; estados y granularidad de checklist pendientes. |
| 20 | DiliTours/logística | PARCIAL_FUNCIONAL | Cotizaciones e itinerario plano; faltan reservas 1:N, pasajeros externos y catálogos. |
| 21 | Sitio público DiliTours/servicios | PARCIAL_FUNCIONAL | Marketing compila; solicitud de servicio depende de login/portal incompletos. |
| 22 | Autenticación y sesiones | BLOQUEADO_AUTH | Password no se verifica, secreto fallback y login cliente 501. |
| 23 | Roles y permisos | BLOQUEADO_AUTH | Sin middleware global/RBAC integral ni guard de rutas empleado. |
| 24 | Backend/páginas heredadas | LEGACY | `backend/index.js`, `backend-mongo` y pantallas antiguas contradicen el runtime modular. |
| 25 | Calendarios AMA/viajes | PARCIAL_FUNCIONAL | Vistas derivadas disponibles; modelo canónico y alcance de citas/eventos requieren decisión. |

## Totales

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

