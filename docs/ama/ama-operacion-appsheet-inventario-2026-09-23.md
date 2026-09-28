# Inventario AppSheet — operación Grupos AMA — 2026-09-23

## Fuente y alcance

La fuente canónica es `backend/reports/ama-audit/Application Documentation.pdf.txt`, aplicación **Grupos AMA**, appId `64b19302-fd6e-4815-9e56-0846d27d01ab`, generada el 16/8/2026. Declara **29 tablas, 599 columnas, 5 slices, 70 vistas, 8 reglas de formato, 127 actions y 0 workflow rules**. Hay 22 fuentes físicas —incluida `_Per User Settings`— y 7 tablas técnicas de proceso/salida. El perfil AMA sólo se revisó como dependencia.

## Tablas

| Grupo | Tablas | Intención |
|---|---|---|
| Núcleo | `GRUPOS AMA`, `APLICANTES AMA`, `CALENDARIO`, `REALIZADOS GRUPOS AMA` | grupo, integrantes, eventos y archivo histórico |
| Operación relacionada | `ASESORES`, `check_ds`, `NotasProtocolo`, `Fecha de asesoria` | responsables, actividad DS, notas y sesiones |
| Procesos compartidos | `NEGADOS`, `legal`, `logistica_viajes`, `Hotel`, `encuesta_satisfaccion` | destinos especializados; logística no se migró en esta fase |
| Fuentes maestras | `CONTACTO`, `INFORMES`, `PAISES`, `TRAMITES` | origen comercial y catálogos |
| Perfil, sólo integración | `APLICANTES AMA PERFILES`, `estudios`, `FAMILIARES EN EE. UU`, `PERFILES AMA` | cuestionario ya migrado |
| Configuración | `_Per User Settings` | preferencias por usuario |
| Técnicas | 2 Process Tables y 5 Outputs | estados/salidas opacas de procesos AppSheet |

## Entidad principal y cardinalidades

`GRUPOS AMA` usa `NOMBRE DE GRUPO` como PK de texto. Sus 26 columnas incluyen país de origen (`GTM`, `HON`, `MX`, `EL SALVADOR`, permitiendo otros), correo, contraseña, WhatsApp, destino, responsable de protocolo, notas, locker, indicadores derivados, estado, asesor de pago, enlace de carpeta y fechas textuales de creación/completitud. No existe un campo documentado de capacidad máxima.

`APLICANTES AMA.GRUPO` es Ref a `GRUPOS AMA`; `Related APLICANTES AMAs = REF_ROWS(...)` confirma Grupo 1:N Aplicantes. AppSheet guarda la pertenencia directamente en el aplicante y no demuestra historial de bajas/reingresos. La arquitectura nueva lo representa como solicitud 1:N membresías históricas, con una sola membresía activa por solicitud.

`CALENDARIO.GRUPO` es Ref al grupo. Grupo 1:N Eventos queda confirmado por `Related CALENDARIOs`. `check_ds.id_aplicante` es Ref al aplicante: su checklist/actividad es **por integrante**, no por grupo.

## Estados

Estados cerrados de grupo: `EN PROCESO DS`, `DERECHO DE VISA PAGADO`, `GRUPO CON CITA`, `EN PROTOCOLO`, `PROTOCOLO REALIZADO`, `TERMINADO`. Las actions `Start`, `Previous 2`, `Next 2`, `Stop` los recorren manualmente. La fuente también contiene valores históricos usados por slices/actions (`INCOMPLETO`, `YA ASISTIO`, `GRUPO TERMINADO`), incompatibles con el enum actual; se documentan como legado, no como una máquina coherente adicional.

Estados del integrante (`APLICANTES AMA.ESTATUS`): `FINADO`, `EN GRUPO`, `FALTA DE GRUPO`, `DESLINDE`, `REPROGRAMAR`, `CANCELADO`, `PROCESO ADMINISTRATIVO`. `ASISTENCIA`, `APROBADOS` y `visa_recibida` son dimensiones separadas. `ESTATUS DE PAGO` es texto sin catálogo verificable y no debe duplicarse en el grupo nuevo.

## Creación, ingreso y pago

El grupo se crea mediante el formulario estándar `GRUPOS AMA_Form`/action `Add`; no hay evidencia de creación automática. El aplicante entra seleccionando el Ref `GRUPO`. La exportación no contiene una regla de seis meses, condición de pago, cupo máximo ni bloqueo de duplicados. Esas garantías del backend nuevo son reglas locales posteriores.

El pago sólo aparece como texto del aplicante, estado grupal `DERECHO DE VISA PAGADO`, asesor `LISTO PARA PAGO` y navegación/acciones compartidas. No hay fórmula que pruebe que pagar sea precondición para ingresar. El sistema nuevo conserva pagos como fuente financiera por solicitud.

## Checklist, calendario y documentos

`check_ds` tiene PK `id_ds_chech`, referencias a aplicante y asesor, `fecha` y `actividad`: son filas históricas por integrante. AppSheet no documenta catálogo fijo ni booleanos de checklist grupal. El actual `grupo_ama_checklist` es una ayuda operativa nueva con ítems configurables y trazabilidad de fecha/usuario; su equivalencia es parcial.

`CALENDARIO` tiene PK `ID`, grupo, fecha, lugar (`GTM`, `CDMX`, `GDL`, `GLD`, permitiendo otros), hora, tipo, notas y virtuales de título/días/porcentaje. Tipos comprobados: `CITA CAS`, `CAPACITACION`, `ENTREVISTA CONSULAR`, `ENTREGAR AL ASESOR`, `FECHA LIMITE CAMBIOS EN AIS Y CEAC`.

AppSheet sólo muestra enlaces de carpeta/protocolo y relaciones a logística. No demuestra documentos grupales versionados. Los documentos personales, del trámite y comprobantes permanecen en el módulo general por solicitud; no se copiaron archivos ni se integró DiliTours.

## Actions, procesos, slices y vistas

Hay **42 actions directamente ligadas** a las cuatro tablas núcleo. Cubren CRUD estándar, navegación, asistencia/aprobación, alta de logística/Negados, cambio de estado, exportación, correo y paso a grupos terminados. Las restantes 85 pertenecen a tablas compartidas o auxiliares.

Los 2 Process Tables (`PASAR A NEGADOS`, `PASAR A GRUPOS TERMIANDOS`) y 5 Outputs prueban procesos internos, pero la exportación declara 0 workflows y no aporta definición completa de Bot/evento. Se clasifican como evidencia parcial, no como automatizaciones para copiar.

Slices: `GRUPOS TERMINADOS`, `GRUPOS EN PROCESO`, `GRUPOS CON CITA`, `GRUPOS EN PROTOCOLO`, `En protocolo`. Son filtros, no tablas.

De 70 vistas, 28 son directamente operativas al excluir las 2 vistas del perfil: 1 Calendar; cards de grupos/protocolo; y vistas Detail/Form/Inline de grupos, aplicantes, calendario, slices, notas y realizados. React conserva lista, detalle y calendario sin copiar el diseño AppSheet.
