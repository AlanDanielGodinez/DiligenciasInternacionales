# Matriz AppSheet — Encuesta de satisfacción — 2026-09-22

## Fuente real

La tabla exacta es `encuesta_satisfaccion`, esquema `encuesta_satisfaccion_Schema`. La copia tipada más completa está en la documentación de **Informes y Pagos** (`Application Documentation Informes.pdf`, appId `d6afd592-8609-4ce2-813e-af17c9f3c714`). La hoja física se reporta bajo `Source Path: cotizaciones y vuelos`, `Worksheet: encuesta_satisfaccion`, Google, locale `es-MX`, `ALL_CHANGES`.

La misma hoja está incorporada en las aplicaciones AMA, Visas individuales y Logística. Las referencias se regeneran contra el maestro de aplicantes disponible en cada app. Esto confirma que el padre lógico es el **aplicante**, no una solicitud concreta.

Vistas: `encuesta_satisfaccion_Form` (form, posición ref, guardado manual, sin acción especial al guardar) y `encuesta_satisfaccion_Detail` (detail, posición ref). Acciones automáticas sobre la tabla: Add, Edit y Delete. Existen acciones `Encuesta de satisfacción` desde `APLICANTES AMA` y `APLICANTES PASAPORTES`; ambas ejecutan `LINKTOFORM`, generan `id_respuesta` y precargan `id_aplicante`. Su condición es `true`.

No se encontró slice, bot, fórmula o condición que limite la encuesta a aprobado, negado, cierre o finalización. Tampoco hay cálculo de promedios, NPS ni dashboards específicos documentados.

## Conteos exactos

| Concepto | Total |
|---|---:|
| Columnas | 13 |
| Físicas | 13 |
| Virtuales | 0 |
| Show_If | 0 |
| Required_If | 0 |
| Valid_If | 0 |
| Editable_If | 0 |
| Reset_If | 0 |
| Suggested Values | 0 |
| Ref | 2 |
| Relaciones directas | 2 |
| Listas virtuales dentro de encuesta | 0 |
| Campos visibles de captura | 9 |

Los mínimos y máximos de Number son calificadores de tipo, no expresiones `Valid_If`. Cinco escalas son 1–5 y `probabilidad_recomendacion` es 0–10. Esta última es compatible con la pregunta habitual de recomendación, pero AppSheet no la denomina ni calcula como NPS; por ello no se etiqueta como NPS.

## Matriz de columnas

| APPSHEET | DISPLAY NAME | TIPO | FÍSICA/VIRTUAL | SECCIÓN | SHOW_IF | REQUIRED_IF | VALID_IF | EDITABLE_IF | RESET_IF | SUGGESTED_VALUES | INITIAL_VALUE | APP_FORMULA | REF | RELACIÓN | IMPLEMENTACIÓN ACTUAL | ESTADO |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `_RowNumber` | Number of this row | Number | Física, sistema, oculta | — | — | — | — | — | — | — | — | — | — | — | PK propia sustituye número de hoja | OPERATIVO |
| `id_respuesta` | `id_respuesta` | Text, key | Física, visible | General | — | — | — | — | — | — | `UNIQUEID()` | — | — | Identidad | `id_encuesta BIGSERIAL` | DIFERENTE |
| `satisfaccion_general` | En general, ¿cómo calificaría su experiencia con nuestro servicio? Escala: 1 a 5 | Number 1–5, paso 1 | Física | Evaluación | — | — | — | — | — | — | — | — | — | — | SMALLINT 1–5 | COINCIDE |
| `claridad_informacion` | ¿Qué tan clara fue la información que recibió durante su proceso? Escala: 1 a 5 | Number 1–5 | Física | Evaluación | — | — | — | — | — | — | — | — | — | — | SMALLINT 1–5 | COINCIDE |
| `calidad_atencion` | ¿Cómo calificaría la atención y el trato de nuestro equipo? Escala: 1 a 5 | Number 1–5 | Física | Evaluación | — | — | — | — | — | — | — | — | — | — | SMALLINT 1–5 | COINCIDE |
| `tiempo_respuesta` | ¿Qué tan oportuno fue nuestro seguimiento y la respuesta a sus dudas? Escala: 1 a 5 | Number 1–5 | Física | Evaluación | — | — | — | — | — | — | — | — | — | — | SMALLINT 1–5 | COINCIDE |
| `utilidad_asesoria` | ¿Considera que nuestra asesoría le brindó herramientas claras para su entrevista? Escala: 1 a 5 | Number 1–5 | Física | Evaluación | — | — | — | — | — | — | — | — | — | — | SMALLINT 1–5 | COINCIDE |
| `fortalezas_servicio` | ¿Qué parte de nuestro servicio considera que hicimos mejor? | LongText | Física | Comentarios | — | — | — | — | — | — | — | — | — | — | TEXT opcional | COINCIDE |
| `punto_mejora` | ¿Qué podemos mejorar en nuestro servicio? | LongText | Física | Comentarios | — | — | — | — | — | — | — | — | — | — | TEXT opcional | COINCIDE |
| `probabilidad_recomendacion` | ¿Qué tan probable es que recomiende a Diligencias Internacionales a un familiar o amigo? Escala: 0 a 10 | Number 0–10 | Física | Recomendación | — | — | — | — | — | — | — | — | — | — | SMALLINT 0–10 | COINCIDE |
| `id_aplicante` | Aplicante | Ref oculta | Física | Contexto | — | — | — | — | — | — | — | — | `INFORMES.ID DEL APLICANTE` en fuente tipada | Aplicante 1:N encuestas; `IsAPartOf=false` | FK `id_cliente` | RELACIONAL |
| `id_asesor` | Asesor | Ref oculta | Física | Contexto | — | — | — | — | — | — | — | — | `ASESORES.Id_asesor` | Asesor 1:N encuestas; `IsAPartOf=false` | FK opcional `id_empleado` | RELACIONAL |
| `aprobado_negado` | `aprobado_negado` | Enum cerrado | Física | Resultado | — | — | — | — | — | — | — | — | — | — | `Negado` / `Aprobado` | COINCIDE |

## Cardinalidad, autor y momento

- **Padre:** aplicante (`id_aplicante`); en PostgreSQL, `clientes.id_cliente`.
- **Cardinalidad:** aplicante 1:N encuestas. No existe `IsAPartOf`, `UNIQUE`, `Valid_If` ni condición que limite a una sola.
- **Solicitud:** AppSheet no almacena Ref a solicitud. El sistema nuevo la conserva opcionalmente como contexto para compatibilidad y trazabilidad.
- **Quién captura:** personal operativo desde registros de aplicantes. No hay evidencia de portal público o captura anónima.
- **Privacidad:** identificada; siempre contiene referencia al aplicante y puede contener asesor.
- **Habilitación:** siempre disponible en las acciones documentadas (`Only if: true`).
- **Edición:** permitida (`ALL_CHANGES` y acción Edit). AppSheet también expone Delete; la implementación nueva omite borrado porque no es necesario para capturar o corregir respuestas y preserva históricos.

