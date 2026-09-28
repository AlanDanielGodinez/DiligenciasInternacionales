# ETA dinámico — auditoría e implementación V1

Fuente: `docs/appsheet/Application Documentation Visas inv.pdf`, esquema `PERFIL ETA_Schema`. Fecha: 2026-09-22. No se consultó PostgreSQL ni se ejecutó SQL.

## Estado anterior y arquitectura

No existía plantilla, semilla, versión Legacy/V1/V2 ni lógica React específica para ETA. Se creó `perfil_eta_v1` con `schema_version: 2`, destinada únicamente a perfiles nuevos. Usa los endpoints y servicios compartidos de perfiles; la selección existente filtra por trámite, prefiere país específico y elige la mayor versión activa. Como el formulario ETA auditado no varía por país, el SQL propone `id_pais = NULL`.

## Conteos documentales

| Concepto | Conteo |
|---|---:|
| Columnas | 45 |
| Físicas | 39 |
| Virtuales | 6 |
| Show_If | 2 |
| Required_If | 0 |
| Valid_If | 0 |
| Editable_If | 0 |
| Reset_If | 0 |
| Suggested Values | 0 |
| Ref | 1 |
| IsAPartOf | 1 |
| Listas virtuales | 0 |
| Repetibles | 0 |

La matriz completa está en `docs/perfiles/eta-appsheet-matriz-2026-09-22.md`.

## Clasificación

- 36 campos físicos de captura, columnas 4–39.
- 3 columnas técnicas: `_RowNumber`, `Id_formulario` e `Id_aplicante`.
- `Id_aplicante` es Ref a `ETA` con `IsAPartOf=true`. Se clasifica como referencia al padre; el perfil local ya pertenece a una solicitud/aplicante y no necesita un repetible ni una tabla nueva.
- 6 virtuales de navegación/sección: Información del pasaporte, Datos de la visa, Datos personales, Información del empleo, Información del viaje y Antecedentes. No se convierten en inputs.
- No hay listas relacionadas, fórmulas calculadas de datos, resúmenes ni repetibles.

Las 45/45 columnas están representadas o clasificadas.

## Tipos y reglas

- Pasaporte: número Text y fechas de emisión/expiración Date.
- Visa: número Text y fechas Date.
- `sexo` es Enum cerrado: Masculino/Femenino.
- `estado_civil` es Enum cerrado con seis opciones documentadas.
- Las cuatro preguntas Yes/No se modelan como boolean.
- Código postal y números documentales permanecen como Text.
- `fecha_viaje` permanece Text porque ese es el tipo AppSheet, aunque otras fechas sean Date.
- `hora_salida_vuelo` usa el nuevo tipo genérico `time`, con entrada HTML de hora y validación civil `HH:mm`/`HH:mm:ss`.
- Los dos `Show_If` corresponden a las explicaciones de negativa migratoria y delito penal. Solo aparecen cuando su padre es verdadero.
- No hay `Reset_If`: ocultar una explicación conserva el valor y la excluye de completitud.
- No hay Required/Required_If; no se inventó obligatoriedad.
- No hay Suggested Values. Los dos Enum usan `options` cerradas.

El PDF no documenta condiciones para `numero_visa_eta_permiso_anterior_canada` después de la pregunta sobre solicitudes previas, ni para `fecha_viaje` después de preguntar si conoce la fecha. Ambos permanecen visibles, tal como indica la evidencia. Tampoco contiene email, teléfono, viajes repetibles, otras ciudadanías condicionales ni campos separados de deportación/inadmisibilidad; no se inventaron.

## Cambio genérico del motor

ETA fue el primer formulario auditado con tipo AppSheet `Time`. Se añadió `time` a los tipos soportados del motor y renderer. La validación rechaza horas fuera de 00:00–23:59 y el renderer usa `<input type="time">`. No existe lógica basada en claves ETA o nombre de trámite.

## SQL

`backend/scripts/generate-perfil-eta-v1-sql.js` genera `backend/sql/2026_09_22_perfil_eta_v1.sql` para revisión. El SQL:

- no contiene un ID fijo de trámite;
- exige exactamente un trámite activo cuyo nombre normalizado sea `ETA`, `E.T.A.` o `E-T-A`;
- crea únicamente `perfil_eta_v1`, versión 1, con país NULL;
- acepta una repetición idéntica y rechaza contenido o mapeo diferente bajo la misma clave;
- no actualiza perfiles históricos.

El SQL fue generado y no ejecutado.

## Pendiente

El repositorio no contiene una plantilla ETA anterior ni un mapeo comprobado al catálogo real de `tipos_tramite`. Antes de instalar el SQL debe verificarse localmente que existe exactamente un trámite activo con uno de los nombres admitidos. Hasta confirmar ese vínculo no puede certificarse que los perfiles nuevos resolverán la plantilla en el catálogo real.

**Estado: PARIDAD ETA PARCIAL.**
