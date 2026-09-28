# Pasaporte dinámico — auditoría e implementación V2

Fuente auditada: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `PERFIL PASAPORTES_Schema`. Fecha de cierre: 2026-09-22. No se consultó PostgreSQL ni se ejecutó SQL.

## Implementación anterior

El repositorio contenía dos plantillas Legacy/V1 en semillas independientes:

- `perfil_pasaporte_mexico`, versión 1, con el mapeo documental existente trámite 15 / país 1.
- `perfil_pasaporte_guatemala`, versión 1, con el mapeo documental existente trámite 14 / país 2.

Ambas usan `estructura_json.secciones[].campos[]`, no `schema_version: 2`, carecen de `Show_If` y solo contienen subconjuntos de 25 claves declaradas por semilla. No se modificaron. Los endpoints compartidos son `/perfiles/plantillas`, `/perfiles/plantillas/resolver`, `/solicitudes/:idSolicitud/perfil` y `/perfiles/:idPerfil`; `resolverPlantilla` prioriza país específico, luego mayor versión y finalmente el identificador de plantilla.

## Conteos AppSheet

| Concepto | Conteo |
|---|---:|
| Columnas totales | 89 |
| Físicas | 78 |
| Virtuales | 11 |
| Show_If | 64 |
| Required_If | 0 |
| Valid_If | 0 |
| Editable_If | 0 |
| Reset_If | 0 |
| Suggested Values | 0 |
| Ref | 2 |
| Listas virtuales | 0 |
| Repetibles | 0 |

La matriz completa está en `docs/perfiles/pasaporte-appsheet-matriz-2026-09-22.md`.

## Clasificación de las 89 columnas

- 74 campos físicos de captura se representan en el contrato V2 común.
- 3 columnas físicas son técnicas/canónicas: `_RowNumber`, `Id_formulario` e `Id_aplicante`. `Id_aplicante` es la relación Ref a `APLICANTES PASAPORTES`.
- `contrasena` es información operativa de acceso. Se contabiliza pero no se convierte en input ni se almacena en el perfil, para mantenerla fuera de autenticación global.
- 11 columnas virtuales: una referencia auxiliar calculada (`País de residencia`) y diez encabezados de sección/navegación. No existen virtuales de resumen, listas relacionadas ni cálculos de edad.
- No hay `REF_ROWS`, `IsAPartOf` ni tablas hijas; por tanto, padres, cónyuge y contacto son campos simples y no repetibles.

## País y versión

AppSheet usa una tabla única y aplica reglas mediante la referencia virtual `País de residencia`, calculada desde el aplicante. La arquitectura local ya selecciona plantillas por trámite y país. V2 traduce esas reglas a variantes específicas generadas desde un contrato común:

- `perfil_pasaporte_mexico_v2`, versión 2.
- `perfil_pasaporte_guatemala_v2`, versión 2.
- El contrato puede construir Estados Unidos para pruebas y revisión, pero no se instala porque el repositorio no contiene un mapeo de trámite/país comprobado para esa variante.

Las 64 expresiones originales se preservan como evidencia (`source_show_if`). Las reglas exclusivamente de país se resuelven al construir cada variante. Las seis dependencias internas de domicilio de envío permanecen como `show_if` declarativo sobre `pasaporte_envio_misma_direccion`. No fue necesario cambiar el motor ni añadir lógica específica en JSX.

## Reglas funcionales comprobadas

- México: acta de nacimiento e INE.
- Guatemala: idioma, boleta, correlativo, fecha de pago y ocupación DPI.
- Estados Unidos: pasaporte anterior, pregunta de pérdida/robo, envío, padres, cónyuge y contacto.
- `tipo_pasaporte` es el único Enum cerrado, con seis opciones documentadas para adulto/menor, nuevo/renovación/extravío.
- No existe regla calculada `edad < 18`; adulto/menor se expresa en el Enum. No se inventó lógica por edad.
- AppSheet contiene únicamente `pasaporte_perdido_robado` como Text. No documenta campos separados para fecha, lugar, explicación o número vinculados a esa respuesta.
- Código postal permanece Text. `fecha_nacimiento`, `fecha_matrimonio` y `fecha_divorcio` son Date; las fechas del pasaporte anterior y de pago de boleta son Text porque así aparecen en AppSheet.
- No hay `Required_If`: un campo visible no se vuelve obligatorio.
- No hay `Reset_If`: ocultar conserva el valor y lo excluye de completitud.
- No hay Suggested Values. El Enum de tipo de pasaporte usa `options` cerradas.

## Documentos

La semilla Legacy de Guatemala contiene `documentos_requeridos`, pero el esquema auditado `PERFIL PASAPORTES` no contiene columnas File/Image. V2 no convierte DPI, boleto de ornato, boleta o pasaporte anterior en campos de archivo; permanecen bajo el módulo general de documentos requeridos.

## SQL y compatibilidad

`backend/scripts/generate-perfil-pasaporte-v2-sql.js` genera `backend/sql/2026_09_22_perfil_pasaporte_v2.sql`. El SQL:

- obtiene trámite y país de las plantillas V1 activas, sin inventar IDs;
- crea únicamente las claves V2;
- conserva V1 y los perfiles ligados a sus `id_plantilla`;
- acepta repetición cuando el contenido es idéntico;
- falla si una clave V2 existente tiene versión, mapeo, estado o JSON diferente.

El SQL fue generado y no ejecutado.

## Pendientes verificables

1. No existe en el repositorio un mapeo comprobado de trámite y país para Pasaporte Estados Unidos. Su contrato está modelado y probado, pero no se genera una fila instalable.
2. La regla AppSheet de `envio_pasaporte_ciudad` compara la referencia de país con el identificador literal `2ebd2c52`, mientras sus campos hermanos comparan con `Estados Unidos`. V2 la agrupa con Estados Unidos por contexto, pero falta confirmar ese identificador contra el catálogo real.
3. AppSheet muestra `contacto_usa_telefono` con Display Name `Apellidos`, contradicción entre clave y etiqueta que requiere confirmación funcional.
4. La condición documentada muestra los campos de envío cuando `pasaporte_envio_misma_direccion = YES`, aunque el texto de la pregunta puede sugerir la conducta inversa. V2 conserva literalmente la condición; falta validarla con el formulario vivo.

**Estado: PARIDAD PASAPORTE PARCIAL.**
