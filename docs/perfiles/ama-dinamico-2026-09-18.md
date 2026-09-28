# AMA: auditoría de reglas y V3 preparada

Fuente revisada: `Application Documentation Formularios.pdf` fechado 17/08/2026, esquema `PERFILES AMA_Schema`. La matriz de 139 columnas (incluye técnicas y virtuales) está en `ama-appsheet-matriz-2026-09-18.md`. No se verificó el AppSheet vigente ni la base de producción.

## Motor anterior

`perfil_plantillas.estructura_json` almacena secciones/campos y reglas V2. `perfiles_solicitud` vincula cada solicitud a una plantilla; `perfiles_solicitud_versiones` conserva respuestas y snapshots. `perfilesEngineV2.js` valida tipos, opciones estáticas, `show_if`, `required_if`, `editable_if` y completitud visible. El renderer React evalúa las mismas condiciones localmente. Las respuestas ocultas se conservan. No existía propagación de visibilidad a descendientes cuando una respuesta oculta permanecía guardada.

## Comparación por sección

| Sección | Show_If PDF | V2 | V3 preparada | Pendiente |
|---|---:|---:|---:|---|
| Información general | 1 | 1 | 1 | — |
| Nacimiento | 3 | 0 | 3 | — |
| Viajes anteriores | 11 | 0 | 10 | `tuvo_hijo_eeuu` está ubicado en Información familiar |
| Visa | 21 | 0 | 21 | Fecha de negativa conserva el campo combinado y tiene clave nueva |
| Dirección y teléfono | 0 | 0 | 0 | — |
| Pasaporte | 2 | 0 | 2 | — |
| Información familiar | 9 | 0 | 11 | Incluye `tuvo_hijo_eeuu` y el repetible de la columna virtual 134 |
| Cónyuge | 9 | 0 | 9 | Lugar de nacimiento conserva el campo combinado y tiene clave nueva |
| Empleo actual | 8 | 0 | 8 | — |
| Empleo anterior | 12 | 0 | 12 | Fin de empleo conserva el campo combinado y tiene clave nueva |
| Educación | 5 | 0 | 5 | — |
| Viajes e idiomas | 1 | 0 | 1 | — |
| Relación virtual | 1 | 0 | 0 | Representada en Información familiar como repetible |
| **Total** | **83** | **1** | **83** | **0 reglas sin representación** |

La extracción inicial omitió ocho condiciones partidas por saltos de página. El PDF no documenta `Required_If`, `Valid_If`, `Editable_If` ni `Reset_If` no nulos en este esquema. Por eso V3 no inventa ninguna de esas reglas. `Valid_If` no debe confundirse con los valores de `Enum`: V3 añade las opciones de `NIVEL EDUCATIVO`, que el backend valida como select. No hay evidencia de select dependiente. La lista virtual de familiares se representa mediante `perfil_respuestas_repetibles`; el texto legado permanece separado.

Las reglas V3 viven en la plantilla y se evalúan sin peticiones adicionales al backend para mostrar campos. El renderer oculta campos y conserva respuestas. El backend excluye de validación y completitud los descendientes de campos ocultos. `required_if` y `editable_if` genéricos siguen disponibles y probados; no se activaron en AMA sin documentación. Se añadió una transición breve de opacidad, desactivada con preferencia de movimiento reducido.

V3 conserva las 127 claves de respuesta de V2 y sus documentos. V2 y Legacy no se alteran; perfiles existentes permanecen ligados a sus plantillas. El SQL de publicación V3 es un artefacto para revisión: no se ejecutó. La selección de nuevas plantillas favorece la versión más alta, pero antes de publicar deben verificarse los seis IDs de trámite y el esquema real. El SQL falla si una clave V3 existente tiene contenido diferente, en vez de sobrescribirla silenciosamente.

Riesgos residuales: diferencias entre las 139 columnas PDF y las claves capturables actuales, datos históricos combinados que no pueden dividirse automáticamente, valores históricos de `nivel_educativo` escritos como texto, disponibilidad real de la tabla de repetibles y posible divergencia del AppSheet vigente respecto del PDF de agosto. Todas las 83 condiciones detectadas tienen representación, pero no se afirma paridad funcional completa sin una verificación visual y de esquema real.
