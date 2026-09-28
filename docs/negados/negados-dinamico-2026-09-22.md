# Negados dinámico — 2026-09-22

## Modelo conceptual

Un caso Negados representa el seguimiento operativo posterior al resultado negativo de una solicitud. La cadena canónica es:

`cliente → solicitud con resultado NEGADO → proceso NEGADOS`

La persona no se duplica. `procesos_solicitud` conserva una relación 1:1 entre solicitud y proceso Negados mediante el índice parcial existente. Una persona puede tener varias solicitudes históricas y, por tanto, varios procesos Negados.

## Origen

AppSheet admite Add manual en las dos tablas y no documenta un Bot de creación. En el sistema nuevo, el caso nace cuando `solicitudes.resultado` cambia a `NEGADO`; el trigger crea el proceso de forma idempotente. `ensureProcess` cubre registros anteriores cuya solicitud ya era negativa. Esta traducción conserva la intención y evita otra copia de aplicante.

## Flujo y estados

AppSheet no define una máquina formal. Sus acciones asignan marcadores de mensaje y una de cuatro respuestas: ASISTIRA, NO ASISTIRA, LO PENSARA o SIN RESPUESTA. Los slices producen colas operativas.

El sistema nuevo deriva las colas `PENDIENTE_CONTACTO`, `PENDIENTE_RESPUESTA`, `REACTIVO`, `NO_CONTINUA`, `LEGAL` y `CERRADO`. Las actividades conservan cada contacto; `respuesta_cliente` conserva la última clasificación operativa. Cierre y análisis son extensiones explícitas, no estados atribuidos a AppSheet.

## Relaciones e integraciones

- Aplicante: `solicitudes.id_cliente → clientes`.
- Solicitud original: permanece inmutable como expediente histórico.
- Responsable: FK a `empleados`; no se crea otro catálogo.
- Grupo AMA: se deriva de `grupo_ama_solicitudes` y del contexto del trámite.
- Notas: `notas_solicitud`, contexto NEGADOS.
- Historial: `seguimientos` y `actividades_solicitud`.
- Preguntas consulares: catálogo normalizado y relación por solicitud/proceso.
- Documentos: módulo general del expediente; no hay almacenamiento paralelo.
- Encuesta: entidad compartida `encuestas_satisfaccion`, vinculada por cliente como en AppSheet.
- Legal: proceso hijo relacionado; no se sobrescribe el proceso Negados.
- Pagos: sin integración específica porque AppSheet Negados no documenta información financiera.

## Reaplicación

AppSheet sólo muestra antigüedad respecto de la primera aplicación; no documenta una acción que cree otra aplicación. La función nueva crea una solicitud distinta para el mismo cliente, registra `solicitudes_relaciones(tipo_relacion='REAPLICACION')`, no copia pagos, documentos ni perfiles y cierra el proceso original con trazabilidad. Nunca actualiza la solicitud negada para convertirla en una nueva.

## Cambios de esta fase

1. El indicador de encuesta de la bandeja consulta por `id_cliente`, coherente con la relación AppSheet y con la nueva entidad 1:N por aplicante.
2. La columna Clasificación muestra `resultado_analisis` o `Sin evaluar`, en vez de un guion permanente.
3. Se agregó extracción reproducible y pruebas de paridad documental/arquitectónica.

No se generó SQL: las tablas e índices necesarios ya existen en las migraciones del módulo. No se ejecutó ninguna migración ni conexión a PostgreSQL.

## Diferencias y pendientes

- AppSheet permite Delete genérico. Se omite para conservar el caso y su historia hasta que exista una política explícita de eliminación.
- El indicador AppSheet usa una cuenta de 365 días. El sistema muestra ventanas operativas de menos de 10, 10–12 y 12 o más meses; es una diferencia funcional documentada.
- La autorización global no ofrece ACL por proceso. Negados conserva las restricciones existentes, pero no puede asegurar acceso por caso sin cambiar autenticación global.
- No hay evidencia documental de Bots, mensajería automática, carta de negativa, causal consular estructurada, archivos específicos o pagos propios de Negados.

## Verificación

Las pruebas backend verifican conteos exactos de esquemas, relaciones, preguntas, slices, 24 acciones, origen idempotente, reutilización histórica, joins, filtros, estados y reaplicación sin sobrescritura. Las pruebas frontend verifican las tres ventanas del indicador de reaplicación. El build comprueba la bandeja y el detalle integrados.

