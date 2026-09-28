# Matriz de paridad — Negados — 2026-09-22

| CAPACIDAD APPSHEET | FUENTE | IMPLEMENTACIÓN REACT | IMPLEMENTACIÓN BACKEND | POSTGRESQL | ESTADO | DIFERENCIA | ACCIÓN PROPUESTA |
|---|---|---|---|---|---|---|---|
| Dos orígenes AMA/Individual | Tablas `NEGADOS` y `negados ind` | Filtro y etiqueta de origen | Origen derivado por grupo/tipo/área | Solicitud y grupo canónicos | IMPLEMENTADA | Unificados deliberadamente | Ninguna |
| Alta del caso | Add manual en ambas tablas | Caso aparece al negar solicitud | Trigger y `ensureProcess` idempotente | `procesos_solicitud` | IMPLEMENTADA | Alta automática desde resultado, conserva intención | Mantener |
| Aplicante canónico | Ref a `INFORMES` | Abre expediente existente | Join solicitud–cliente | `clientes` | IMPLEMENTADA | No copia nombre/teléfonos | Mantener |
| Solicitud negada | Implícita por tablas de origen | Expediente de solicitud | `resultado='NEGADO'` | `solicitudes` | IMPLEMENTADA | Relación más precisa que AppSheet | Mantener |
| Mensaje enviado | Marcador `SI` | Registrar actividad | Actividades de contacto | `actividades_solicitud` | IMPLEMENTADA | Historial en vez de bandera sobrescrita | Mantener |
| Respuesta | ASISTIRA, NO ASISTIRA, LO PENSARA, SIN RESPUESTA | Modal de actividad | Enum validado y cola derivada | proceso + actividades | IMPLEMENTADA | Admite resultados adicionales explícitos | Mantener |
| Estados/colas | 8 slices operativos y 2 de navegación | Filtros modernos de cola/origen | Filtros parametrizados | Datos derivados | IMPLEMENTADA | No hay máquina lineal AppSheet | Mantener |
| Primera aplicación / 365 días | `fecha_primer_aplicacion`, `DIAS RESTANTES` | Semáforo 10/12 meses | Filtros por antigüedad | fecha en solicitud | PARCIAL | AppSheet calcula contra 365 días; sistema usa umbrales operativos 10/12 meses | Mantener diferencia documentada |
| Preguntas de consulado | EnumList de 9 opciones | Selector y preguntas libres | Catálogo + filas relacionadas | tablas de catálogo/relación | IMPLEMENTADA | Normalizadas, sin perder opciones | Mantener |
| Notas | Un campo actual | Historial visible | Agregar nota | `notas_solicitud` | IMPLEMENTADA | Mejora: no sobrescribe | Mantener |
| Notas/análisis legal | Texto y estatus Asesoría legal | Sección Legal | Derivación idempotente | proceso Legal relacionado | IMPLEMENTADA | Más estructurado que AppSheet | Mantener |
| Responsable | No hay Ref directo en tablas Negados | Asignación visible | FK a empleado | `id_responsable_proceso` | IMPLEMENTADA | Extensión del sistema nuevo | Mantener |
| Historial | No hay tabla hija propia | Actividad y notas | Seguimientos + actividades | estructuras históricas | IMPLEMENTADA | Mejora | Mantener |
| Encuesta | Lista virtual por aplicante | Indicador y tarjeta compartida | Consulta por `id_cliente` | `encuestas_satisfaccion` | IMPLEMENTADA | Corregida desde consulta por solicitud | Mantener |
| Expediente/documentos | URL sólo en Individual | Abre expediente general | Módulo de documentos existente | documentos por solicitud | IMPLEMENTADA | No duplica URL Drive | Mantener |
| Reaplicación | Sólo indicador de 365 días; sin acción creadora documentada | Acción explícita con confirmación | Crea solicitud nueva y relación | `solicitudes_relaciones` | IMPLEMENTADA | Extensión segura; no sobrescribe original | Mantener |
| Listado | Vistas card por slice | Bandeja paginada | Consulta server-side | Modelo relacional | IMPLEMENTADA | Clasificación ahora muestra análisis real | Mantener |
| Filtros | Slices por mensaje/respuesta/origen | Cola, origen, fecha, encuesta, preguntas y Legal | Filtros parametrizados | Consultas derivadas | IMPLEMENTADA | Más filtros útiles | Mantener |
| Delete genérico | Acción automática | No expuesto | No implementado | Históricos conservados | NO IMPLEMENTADA | AppSheet permite borrar fila | No migrar sin política de eliminación histórica |
| Autorización por caso | App de uso interno | Sesión general existente | Sin guard específico por caso | Sin ACL por proceso | PARCIAL | Deuda global existente | Resolver fuera de este alcance |
| Pagos | No hay campos ni acciones | No integrado en tarjeta Negados | Módulo general intacto | Pagos por solicitud | NO APLICA | Sin evidencia Negados | Ninguna |
| Bots/mensajería automática | 0 workflows; ningún Bot documentado | No automatizado | No automatizado | — | NO APLICA | `MENSAJE ENVIADO` era marcador manual | Ninguna |

Conteo de capacidades: **22**. Implementadas: **17**. Parciales: **2**. Nuevas/corregidas en esta fase: **2** (encuesta por aplicante y clasificación visible). No implementada deliberadamente: **1**. No aplica: **2**.

