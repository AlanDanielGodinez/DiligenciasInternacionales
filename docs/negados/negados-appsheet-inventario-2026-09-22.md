# Inventario AppSheet — Negados — 2026-09-22

## Fuente

Fuente autoritativa: `backend/reports/ama-audit/Application Documentation Informes.pdf.txt`, aplicación **NEGADOS**, appId `d6afd592-8609-4ce2-813e-af17c9f3c714`, versión `1.000185`, generada el 17 de agosto de 2026.

La exportación titulada `Application Documentation Negados.pdf.txt` corresponde en realidad a la aplicación **INFORMES Y PAGOS**. Se usó sólo para referencias cruzadas; no define el contrato principal de Negados.

Resumen declarado por AppSheet: **11 tablas, 129 columnas, 10 slices, 45 vistas, 2 reglas de formato, 54 acciones y 0 Workflow Rules**.

## Tablas

| Tabla | Función en Negados | Relación |
|---|---|---|
| `NEGADOS` | Seguimiento de personas negadas provenientes de grupos AMA | PK y Ref `ID APLICANTE` → `INFORMES`; Ref `GRUPO` → `REALIZADOS GRUPOS AMA` |
| `negados ind` | Seguimiento de personas negadas de trámites individuales | PK y Ref `id_aplicante` → `INFORMES` |
| `REALIZADOS GRUPOS AMA` | Grupo AMA concluido y control de llamada | Padre de `NEGADOS` mediante `REF_ROWS` |
| `INFORMES` | Maestro canónico de aplicantes | Padre lógico de ambas tablas Negados |
| `encuesta_satisfaccion` | Encuesta identificada del aplicante | Relación virtual mostrada desde ambas tablas |
| `ASESORES` | Catálogo compartido | Auxiliar; Negados no contiene Ref directo a asesor |
| `CONTACTO` | Datos canónicos de contacto | Auxiliar mediante el aplicante |
| `PAISES` | Catálogo | Auxiliar |
| `TRAMITES` | Catálogo | Auxiliar |
| `VISTAS` | Menú/configuración | Técnica |
| `_Per User Settings` | Configuración AppSheet | Técnica |

## Entidad principal y cardinalidades

Las entidades principales son dos colas de **seguimiento posterior a una negativa**, separadas por origen AMA e Individual. No representan clientes nuevos ni contienen un análisis consular estructurado.

- PK AppSheet AMA: `NEGADOS.ID APLICANTE`; también es Ref a `INFORMES`.
- PK AppSheet Individual: `negados ind.id_aplicante`; también es Ref a `INFORMES`.
- `INFORMES` 1:0..1 `NEGADOS` y 1:0..1 `negados ind`, por el uso del mismo Ref como key.
- `REALIZADOS GRUPOS AMA` 1:N `NEGADOS`.
- Aplicante 1:N encuestas; se presenta como lista virtual, no `IsAPartOf`.

El modelo nuevo mejora la identidad sin duplicar personas: `clientes → solicitudes → procesos_solicitud(NEGADOS)`. Cada solicitud negada conserva su proceso, incluso si la misma persona reaplica después.

## Esquemas principales

`NEGADOS`: **14 columnas**, 13 físicas, 1 virtual, 2 Ref, 1 List virtual y 1 `Show_If`. Sus campos operativos son mensaje enviado, segundo intento, estatus, nota, preguntas consulares y notas legales. `ESTATUS` ofrece exactamente `Asesoría legal` y `NEGADO`.

`negados ind`: **16 columnas**, 14 físicas, 2 virtuales, 1 Ref, 1 List virtual y 1 `Show_If`. Añade URL de expediente, fecha de primera aplicación y `DIAS RESTANTES = -(HOUR(TODAY()-([fecha_primer_aplicacion]+365))/24)`.

Ambas contienen exactamente nueve opciones de `preguntas_consulado`:

1. ¿Cuál es el motivo de su viaje?
2. ¿A dónde va a viajar?
3. ¿Cuánto tiempo planea quedarse?
4. ¿Dónde se va a hospedar?
5. ¿Cuándo piensa viajar?
6. ¿Ha viajado antes a Estados Unidos?
7. ¿En qué trabaja?
8. ¿Desde cuándo trabaja ahí?
9. ¿Tiene familia aquí?

No se documentan causal legal, sección migratoria, oficial, consulado, carta de negativa, archivo consular, pago ni importe.

## Slices

| Slice | Tabla | Regla |
|---|---|---|
| `LLAMADA PENDIENTE` | `REALIZADOS GRUPOS AMA` | llamada `NO` o vacía |
| `LLAMADAS REALIZADAS` | `REALIZADOS GRUPOS AMA` | llamada `SI` |
| `ASISTIRAN` | `NEGADOS` | segundo intento `ASISTIRA` |
| `PENDIENTES` | `NEGADOS` | segundo intento `LO PENSARA` |
| `GRUPOS` | `VISTAS` | trámite `GRUPOS AMA` |
| `INDIVIDUALES` | `VISTAS` | trámite `INDIVIDUALES` |
| `Negados pendiente` | `negados ind` | mensaje distinto de `SI` |
| `Pendientes de respuesta` | `negados ind` | mensaje `SI` y respuesta vacía o `LO PENSARA` |
| `REACTIVOS` | `negados ind` | respuesta `ASISTIRA` |
| `NO ASISTIRAN` | `negados ind` | mensaje no vacío y respuesta `NO ASISTIRA` |

La intención se traduce en filtros de cola, origen, llamada y respuesta; no se reproducen las vistas una por una.

## Vistas relevantes

Se identificaron **18 vistas relevantes**: seis vistas de sistema Detail/Form/Inline para las dos tablas y doce vistas de trabajo o referencia: `APLICANTES PENDIENTES DE RESPUESTA`, `ASISTIRAN_Detail`, `ASISTIRAN_Form`, `GRUPOS PENDIENTES DE LLAMADA O MENSAJE`, `LLAMADA PENDIENTE_Detail`, `LLAMADA PENDIENTE_Form`, `LLAMADAS REALIZADAS_Detail`, `LLAMADAS REALIZADAS_Form`, `PENDIENTES DE MENSAJE`, `PENDIENTES DE RESPUESTA`, `PENDIENTES_Detail` y `PENDIENTES_Form`.

## Acciones propias auditadas

Se auditaron **24 acciones**:

- `NEGADOS`: Delete, Edit, Add, View Ref (GRUPO), MENSAJE ENVIADO, ASISTIRA, NO ASISTIRA, LO PENSARA y SIN RESPUESTA.
- `negados ind`: Delete, Edit, Open Url (expediente), Add, SI ASISTIRA IND, LO PENSARA_ind, MENSAJE ENVIADO IND, NO ASISTIRA IND y SIN RESPUESTA IND.
- Compartidas por intención: Encuesta/Encuesta_ind, View Ref del aplicante en ambas tablas y asesoria_legal/asesoria_legal_ind.

Las acciones de respuesta sólo asignan valores a columnas. `MENSAJE ENVIADO` sólo marca `SI`; no envía un mensaje. Encuesta abre el formulario con aplicante y resultado `Negado`. Asesoría legal cambia el estatus a `Asesoría legal`; no contiene un expediente legal estructurado.

## Automatizaciones

La fuente declara **0 Workflow Rules** y no documenta Bots. No existe evidencia de recordatorios automáticos, mensajería externa, generación de documentos, pagos o creación automática de reaplicaciones.

