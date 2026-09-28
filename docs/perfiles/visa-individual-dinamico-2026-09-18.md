# Visa Individual V3 dinámica — cierre de implementación

Fecha documental: 2026-09-18. Este cierre usa la auditoría ya consolidada; no reinterpreta el PDF ni consulta PostgreSQL.

## Contrato confirmado

- AppSheet: 160 columnas, 147 físicas y 13 virtuales.
- Reglas: 93 `Show_If`; no hay valores documentados en `Required_If`, `Valid_If`, `Editable_If` ni `Reset_If`.
- V3 representa 93/93 condiciones: 90 campos y 3 relaciones repetibles.
- Los repetibles son `familiares_eeuu`, `redes_sociales_detalle` e `ingresos_estados_unidos` (3/3). Cada fila conserva sus atributos y queda bajo el perfil de su solicitud.
- V2 y sus perfiles históricos permanecen sin cambios. V3 aplica solo a perfiles nuevos.
- V3 no hereda los `required`, `required_if` ni mínimos de repetibles inferidos por V2, porque no se encontró otra regla documental que los sustente.

El motor evalúa la visibilidad de los ancestros. Si A oculta B, un valor retenido en B no puede hacer visible C. Ocultar no borra la respuesta y los campos ocultos no participan en validación ni completitud, de acuerdo con la ausencia de `Reset_If`.

## Suggestions y catálogos

`options` representa un catálogo cerrado y rechaza valores externos. `suggestions` con `allow_custom_value: true` representa un catálogo abierto: muestra recomendaciones y admite valores escritos por el usuario. El contrato es genérico en backend y renderer para select y multiselect.

V3 lo usa para red social, idiomas, países visitados y consulados. Las redes siguen siendo filas repetibles; Facebook, Instagram y TikTok pueden coexistir como tres registros aunque TikTok no estuviera entre las sugerencias originales.

## Diferencias de tipo V2 frente a AppSheet

Se confirmaron 32 diferencias. A-D describe su efecto; E indica el resultado de corrección.

| Clase | Cantidad | Campos | Resultado V3 |
|---|---:|---|---|
| A. Solo visual (`textarea` V2 frente a `Text`) | 25 | discapacidad; motivo; domicilio de llegada; domicilio del pagador; entrada ilegal/documentos falsos; costos de deportación; petición; rechazo; cancelación; admisión; observaciones; información falsa; fecha de pérdida/robo; domicilio del contacto; notas de padre; notas de madre; hospital; domicilio del cónyuge; dirección del empleador; dirección del empleo anterior; descripción y traducción del empleo anterior; dirección de escuela y escuela anterior; organización/ONG | 25 corregidas |
| B. Afecta validación | 2 | `duracion` (`number` → `text`); `conuslados_a_donde_puede_ir` (`textarea` → `multiselect` abierto) | 2 corregidas |
| C. Afecta formato | 4 | teléfono del pagador, correo del contacto, teléfono del empleo anterior y teléfono de la escuela anterior (`phone`/`email` V2 → `text` documentado) | 4 corregidas |
| D. Conservada por compatibilidad | 1 | `codigo_postal`: AppSheet exporta `Number`, pero V3 conserva `text` para ceros iniciales, letras y formatos internacionales | 1 conservada |
| E. Error real corregido en V3 | 31 | Todas las filas A-C | 31 corregidas |

No hay conversiones destructivas. Duración conserva el texto documentado y los teléfonos admiten `+`, espacios y guiones. Código postal es la única diferencia conservada justificadamente.

## Columnas virtuales

Las 13/13 quedaron clasificadas y ninguna se convierte en input:

- 3 listas relacionadas: `Related FAMILIARES EN EEUUs`, `Related REDES SOCIALESs` y `Related INGRESOS A ESTADOS UNIDOSs`, representadas por los tres repetibles.
- 10 elementos `Show` de sección/navegación: INFORMACION GENERAL, DATOS DEL VIAJE, ENTRADAS A EUA, DIRECCION Y TELEFONO, PASAPORTE, CONTACTO EUA, INFORMACION FAMILIAR, INFORMACION DE EMPLEO ACTUAL EDUCACION, EMPLEO ANTERIOR Y EDUCACION e INFORMACION ADICIONAL.
- Cálculo, resumen o referencia capturable: 0.

## Persistencia y aislamiento

La persistencia identifica el perfil por `id_solicitud`; los repetibles se vinculan mediante `id_perfil`. La prueba de aislamiento usa el mismo aplicante con dos solicitudes y verifica perfiles distintos. El renderer conserva los valores personalizados en su estado para edición y recarga.

## SQL

`backend/scripts/generate-perfil-visa-individual-v3-sql.js` genera `backend/sql/2026_09_18_perfil_visa_individual_v3.sql` para revisión. Valida que el trámite 20 exista y esté activo, crea solo `perfil_visa_individual_v3`, tolera una repetición idéntica y lanza una excepción si la misma clave tiene versión, trámite, país, estado o JSON diferente. No actualiza V2 ni perfiles existentes. No fue ejecutado.

## Límites verificables

La paridad es parcial por dos puntos:

1. `codigo_postal` se conserva como texto aunque AppSheet indique `Number`, para evitar pérdida de datos.
2. La definición final de `INGRESOS A ESTADOS UNIDOS.ilega_legal` está truncada en el PDF disponible y no puede trasladarse con seguridad.

La lista completa de consulados tampoco aparece como catálogo cerrado; V3 la representa abierta para no inventar valores.

**Estado: PARIDAD VISA INDIVIDUAL PARCIAL.**
