# Inventario AppSheet LEGALES — 2026-09-23

## Fuente y alcance

Fuente canónica revisada: `backend/reports/ama-audit/Application Documentation Legales.pdf.txt`, exportada el 16 de agosto de 2026. La aplicación es **LEGALES**, app id `ed3e4ce3-23e2-43f3-871f-c3ef815a6c39`, versión `1.000186` y versión estable `1.000180`.

El resumen de AppSheet declara **16 tablas, 354 columnas, 8 slices, 57 vistas, 82 actions, 0 format rules y 0 workflow rules**. No se documentan Bots. Sólo una tabla es el registro operativo propio de Legal; las demás son fuentes compartidas de Informes, perfiles, AMA y Negados.

## Entidad principal

La entidad principal comprobada es una **gestión o trámite legal** en la tabla `legal`. Su PK es `id_tramite`, un texto con `UNIQUEID()`. Su padre operativo es el aplicante de `INFORMES`, enlazado por `legal.id_aplicante`; además referencia `CONTACTO` mediante `contacto` y `ASESORES` mediante `asesor`.

AppSheet mezcla en la misma fila captación, seguimiento, cobro y continuidad. No contiene una entidad histórica de análisis, una tabla de audiencias, un checklist documental ni una tabla propia de pagos. `expediente` es sólo una URL y `notas` es un único LongText.

## Tablas

| Tabla | Fuente | Uso en LEGALES |
|---|---|---|
| `legal` | BD legales | Entidad operativa principal; permite altas, cambios y bajas |
| `ASESORES` | Visa y Pasaportes Individuales | Responsable; `asesor` se limita a filas con área LEGALES |
| `CONTACTO` | Informes y Pagos | Contacto referido por la fila Legal |
| `INFORMES` | Informes y Pagos | Aplicante padre y documentos generales |
| `NEGADOS` | Gestión AMA | Cola de grupos enviados a asesoría legal |
| `negados ind` | Visa y Pasaportes Individuales | Cola individual enviada a asesoría legal |
| `APLICANTES AMA` | Gestión AMA | Subflujo FOIA de grupo |
| `APLICANTES AMA PERFILES` | Formulario Perfiles AMA | Subflujo FOIA especial/individual |
| `_Per User Settings`, `estudios`, `FAMILIARES EN EE. UU`, `PERFILES AMA`, `PAISES`, `TRAMITES`, `GRUPOS AMA`, `NotasProtocolo` | Fuentes compartidas | Referencia o soporte; no son entidad Legal |

## Columnas de `legal`

La tabla tiene **30 columnas: 25 físicas y 5 virtuales**.

- Identidad y relaciones: `id_tramite` (PK), `id_aplicante` (Ref a `INFORMES`), `contacto` (Ref a `CONTACTO`), `asesor` (Ref a `ASESORES`).
- Datos copiados/operativos: `nombre_prospecto`, `apellidos_prospecto`, `telefono`, `tipo de contacto`, `tramite`, `fecha_de_contacto`, `estatus`, `fecha_de_llamada`, `pais`, `correo`.
- Expediente y seguimiento: `contrasena`, `contrasena_alterna`, `expediente`, `fecha_envio_solicitud`, `primer_mensaje_seg`, `segundo_mensaje_seg`, `notas`, `area_continuacion`.
- Pago: `fecha_pago_inicial`, `fecha_pago_tramite_int`.
- Virtuales: `Primer mensaje de seguimiento`, `Segundo mensaje de seguimiento`, `REALIZAR MENSAJE`, `Nombre completo`, `Id de aplicante`.

Los dos cálculos de seguimiento documentados suman **120 días** a `fecha_envio_solicitud`. `REALIZAR MENSAJE` pide el primer o segundo mensaje cuando la marca correspondiente aún no es `SI`. La exportación muestra la misma expresión base para ambos plazos; no permite inferir un segundo intervalo distinto.

## Tipos legales

`tramite` es un EnumList cerrado con estos 20 valores: `FOIA`, `PETICIÓN FAMILIAR (I-130)`, `VISA K-1`, `AJUSTE DE ESTATUS (I-485)`, `ASILO`, `REN GREEN CARD`, `PERMISO DE TRABAJO`, `CIUDADANÍA (N-400)`, `PETICIONES MIGRATORIAS`, `PERMISOS HUMANITARIOS`, `VISA DE TRABAJO CANADIENSE`, `TRADUCCIONES`, `APOSTILLA`, `VISA EMPLEADO DOMÉSTICO (B1)`, `DOBLE NACIONALIDAD`, `PERDÓN MIGRATORIO`, `SEGUIMIENTO`, `VISA U`, `VISA H2B`, `OTROS`.

No hay formularios ni cuestionarios específicos por tipo. La evidencia sólo autoriza un catálogo multiselección y un mismo conjunto de campos comunes.

## Estados y transiciones comprobadas

El estado principal admite 9 valores: `ENVIO DE INFORMACION PENDIENTE PARA PAGO COMPLETO`, `LLAMADA PENDIENTE`, `RESPUESTAS PENDIENTES`, `PAGADO`, `EN FIRMA`, `EN PROCESO`, `TERMINADO`, `EN ADMIN`, `PAGO DE TRAMITE COMPLETO`. El valor inicial es `LLAMADA PENDIENTE`.

| Estado actual | Acción | Estado siguiente | Tipo |
|---|---|---|---|
| Cualquiera | `Terminado` | `TERMINADO` | Manual |
| Cualquiera | `Necesita Pago` | `ENVIO DE INFORMACION PENDIENTE PARA PAGO COMPLETO` | Manual |
| `Tramite nuevo` FOIA | `Next` / `Next_en_proceso` | `En proceso` | Manual |
| `En proceso` FOIA | `si_es_candidato*` | `Es candidato` | Manual |
| `En proceso` FOIA | `no_candidato*` | `No es candidato` | Manual |
| `Asesoría legal` en Negados | `SE COMPLETO LEGAL*` | `NEGADO` | Manual |

AppSheet no impone una máquina lineal para los otros valores del estado principal. Los estados FOIA documentados son `Tramite nuevo`, `En proceso`, `Es candidato`, `No es candidato` y `Terminado`.

## Slices

| Slice | Fuente | Intención |
|---|---|---|
| `TERMINADOS` | legal | Estado terminado |
| `TRAMITES EN PROCESO` | legal | Excluye terminado, pagos completos, `PAGO 50 DLS` y llamada pendiente |
| `NUEVOS APLICANTES` | legal | Llamada pendiente |
| `PROCESO DE PAGO` | legal | Pago completo o información pendiente para pago |
| `Negados_legales` | NEGADOS | Grupos con estatus Asesoría legal |
| `NEGADOS INDIVIDUALES` | negados ind | Individuales con estatus Asesoría legal |
| `Estatus_foia is not blank` | APLICANTES AMA PERFILES | FOIA con pago realizado |
| `APLICANTES AMA Estatus_foia is not blank` | APLICANTES AMA | FOIA de grupo con estatus no vacío |

Los slices expresan filtros; no representan tablas nuevas.

## Vistas

Hay 8 vistas de menú relevantes: `FALTA DE COBRO`, `FOIA`, `FOIA ESPECIAL AMA`, `NEGADOS GRUPOS`, `NEGADOS INDIVIDUALES`, `NUEVOS`, `EN PROCESO` y `TERMINADOS`. Todas son cards. Las otras **19 vistas relevantes** son Detail/Form/Inline generadas para `legal` y sus siete fuentes/slices operativos. El resto de las 57 vistas pertenece a tablas compartidas.

## Actions relevantes

Se identificaron **20 actions funcionalmente relevantes**:

- 12 de `legal`: Delete, Edit, Add, correo, abrir expediente, primer mensaje, segundo mensaje, navegar a asesor, contacto y aplicante, Terminado y Necesita Pago.
- 2 de integración Negados: `SE COMPLETO LEGAL` y `SE COMPLETO LEGAL ind`.
- 6 de FOIA: candidato/no candidato para grupo y especial, y avance a En proceso para ambos orígenes.

Las acciones de correo, URL y navegación no modifican datos. Las marcas de mensaje sólo cambian una columna; no demuestran envío automatizado. AppSheet permite DELETE físico, pero la migración conserva historial deliberadamente.

## Origen, documentos, pagos y automatización

Un registro `legal` puede capturarse manualmente y su `tipo de contacto` declara seis orígenes: `PERFILES AMA`, `VISAS INDIVIDUALES`, `NEGADOS`, `INFORMES`, `VISA CANADIENSE`, `DIRECTO`. Las colas prueban además el envío lógico desde Negados cuando su estatus es `Asesoría legal`; no existe una action que copie esa fila a `legal`.

Los documentos aparecen por referencias a `INFORMES` y una URL `expediente`; no hay documentos requeridos por tipo. Las dos fechas de pago son referencias operativas, no un libro financiero. No hay audiencias ni citas. No hay Bots, format rules ni workflow rules. La visibilidad de las vistas de menú consulta el área del usuario (`admin` o `LEGALES`), pero esto es visibilidad de AppSheet y no autorización por caso.
