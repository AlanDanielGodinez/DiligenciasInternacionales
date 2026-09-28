# Encuesta de satisfacción dinámica — 2026-09-22

## Decisión de arquitectura

Se implementó como **entidad de encuesta independiente**, no como perfil dinámico. El padre canónico es `clientes`; `solicitudes` es una relación opcional para conservar el contexto desde el que se capturó. La cardinalidad es cliente 1:N encuestas.

El modelo es relacional porque los nueve campos son estables, pequeños y útiles para consulta. `version_definicion` permite evolucionar la definición sin convertir respuestas estructurales o relaciones en JSON. La definición compartida del backend centraliza etiquetas, tipos, escalas y opciones; no se modificaron `perfiles_solicitud`, `perfilesEngineV2` ni `ProfileFormRenderer`.

## Comportamiento

- Cinco calificaciones aceptan enteros 1–5.
- Recomendación acepta enteros 0–10 y no se presenta como NPS.
- Fortalezas y mejora son textos opcionales.
- Resultado acepta únicamente `Negado` o `Aprobado` y sigue siendo opcional.
- Ninguna respuesta es obligatoria, igual que en AppSheet.
- Una persona puede tener múltiples encuestas históricas.
- Las encuestas pueden editarse después de crearse.
- No existe disparador de estado: la captura está disponible desde la ficha del aplicante y desde la solicitud cuando se conoce el aplicante.
- El backend comprueba que una solicitud contextual pertenezca al cliente indicado.

## Integración

Endpoints nuevos:

- `GET /api/clientes/:idCliente/encuestas-satisfaccion`
- `POST /api/clientes/:idCliente/encuestas-satisfaccion`
- `PATCH /api/clientes/:idCliente/encuestas-satisfaccion/:idEncuesta`

Los endpoints anteriores por solicitud permanecen como compatibilidad. La interfaz `SatisfactionSurveyCard` se reutiliza en la ficha del aplicante y en el detalle de solicitud, lista el histórico y permite crear o editar.

## SQL

`backend/sql/2026_09_22_encuestas_satisfaccion.sql` crea la tabla si falta, añade columnas de compatibilidad si ya existe y crea índices no únicos por cliente y solicitud. Es aditivo, no contiene `DROP` y no se ejecutó.

## Compatibilidad y pendientes

La tabla previa era usada por Negados y por un E2E general. Se conservan su nombre, los campos de respuestas, `id_cliente`, `id_empleado`, `id_solicitud` y `creado_en`. Se elimina únicamente en código la suposición 1:1 y ya no se genera un seguimiento de Negados al registrar una encuesta, porque AppSheet no documenta ese efecto.

La autorización global del repositorio no protege actualmente la mayoría de rutas de clientes y solicitudes. La encuesta respeta ese modelo existente y aplica aislamiento estructural por `id_cliente`, pero no puede declarar control completo por rol o sesión sin rediseñar autenticación global, que quedó fuera de alcance. También queda pendiente decidir si se necesita borrado desde la interfaz; AppSheet lo permite, pero conservar históricos evita pérdida de respuestas.

## Pruebas

Las pruebas unitarias cubren definición, tipos, escalas, opcionalidad, Enum, validación backend, pertenencia solicitud–cliente, aislamiento de lectura y SQL histórico sin unicidad. El build de React valida la integración del componente. No se conectó PostgreSQL ni se ejecutó SQL.

