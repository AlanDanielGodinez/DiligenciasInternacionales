# Matriz de paridad LEGALES — 2026-09-23

| Capacidad AppSheet | Fuente | Frontend actual | Backend actual | PostgreSQL | Estado | Diferencia | Acción propuesta |
|---|---|---|---|---|---|---|---|
| Registro Legal | tabla `legal` | Lista y tarjeta Legal | `/api/legales` | `procesos_solicitud` + `casos_legales` | IMPLEMENTADO | Modelo normalizado | Mantener |
| PK del caso | `id_tramite` | usa `id_proceso` | valida entero | PK de proceso | IMPLEMENTADO | Identidad numérica canónica | Mantener |
| Aplicante | Ref a INFORMES | ficha de solicitud | join solicitud→cliente | FK solicitud/cliente | IMPLEMENTADO | Evita duplicar persona | Mantener |
| Solicitud padre | implícita por aplicante | expediente canónico | `id_solicitud` | FK obligatoria | IMPLEMENTADO | Más explícito | Mantener |
| Origen manual | `tipo de contacto` | etiqueta de origen | expresión `ORIGIN` | solicitud/proceso padre | IMPLEMENTADO | Derivado de fuente canónica | Mantener |
| Origen Negados | dos slices | tarjeta Negados | `sendLegal` idempotente | proceso hijo + detalle | IMPLEMENTADO | AppSheet sólo cambia estatus | Mantener |
| Tipos legales | EnumList de 20 | muestra servicio/tipo | conserva `tipo_caso` o trámite | detalle/catálogo trámite | PARCIAL | UI no ofrece alta manual multiselección | No inventar alta hasta definir origen contractual |
| Responsable | Ref ASESORES/LEGALES | selector de empleado | FK validada | `id_responsable_proceso` | IMPLEMENTADO | Reutiliza empleado | Mantener |
| Estado principal | enum de 9 | seis etapas operativas | transiciones cerradas | check Legal | IMPLEMENTADO | Cobro separado del flujo Legal | Mantener separación |
| FOIA | dos slices y seis actions | etiquetas y filtros FOIA | detección y resultados | tipo/resultado | IMPLEMENTADO | Resultado separado de estado | Mantener |
| Nuevos | slice llamada pendiente | vista Nuevos | `IS_NEW` | actividad/último contacto | IMPLEMENTADO | Derivado de historial | Mantener |
| En proceso | slice | vista En proceso | filtro activo gestionado | estado/actividad | IMPLEMENTADO | Semántica más precisa | Mantener |
| Terminados | slice + action | vista y cierre | cierre conserva fila | fecha_salida/resultado | IMPLEMENTADO | Sin borrado físico | Mantener |
| Falta de cobro | estado/slice | métrica y filtro | consulta pagos relacionados | pagos | IMPLEMENTADO | Usa fuente financiera canónica | Mantener |
| Fechas de pago | dos fechas manuales | estado de pago | consulta pagos | tabla pagos | IMPLEMENTADO | No duplica finanzas | Mantener |
| Primer/segundo mensaje | virtuales + flags | actividad y próxima gestión | actividad histórica | actividades | PARCIAL | No replica automáticamente los 120 días | Mantener como pendiente verificable |
| Contacto cliente | email y teléfono | ficha/actividad | tipos llamada, correo, WhatsApp, reunión | actividad histórica | IMPLEMENTADO | Acciones externas siguen manuales | Mantener |
| Notas | un LongText | feed de notas | alta y consulta por proceso | `notas_solicitud` | IMPLEMENTADO | Ahora hay historial | Mantener |
| Análisis/conclusión | FOIA y estatus | resultado + resolución | catálogo cerrado | proceso | IMPLEMENTADO | Extensión trazable | Mantener |
| Historial | no hay tabla propia | actividades/notas/procesos previos | consulta por proceso | actividades, notas, seguimientos | IMPLEMENTADO | Más trazabilidad | Mantener |
| Expediente URL | action Open URL | expediente de solicitud | módulo documentos | `documentos` | PARCIAL | Documentos se aíslan por solicitud, no por caso Legal histórico | Documentar; no crear almacén paralelo |
| Documentos requeridos | no documentados | módulo general | plantilla de solicitud | requisitos/documentos | NO APLICA | No hay checklist Legal en la fuente | No inventar |
| Nueva solicitud contratada | `area_continuacion` | acción explícita | crea solicitud y relación | `solicitudes_relaciones` | IMPLEMENTADO | Extensión segura | Mantener |
| Regreso a Negados | action completa Legal | acción explícita | cierra Legal y conserva padre | procesos padre/hijo | IMPLEMENTADO | Más trazabilidad | Mantener |
| Delete | action estándar | no expuesto | no endpoint | conserva registros | PARCIAL | Diferencia deliberada | Mantener hasta política global |
| Autorización | Show If por área | navegación existente | rutas sin middleware específico | sin política por caso | PARCIAL | Deuda global | No ampliar alcance |
| Bots/workflows | 0 | no aplica | no aplica | no aplica | NO APLICA | Ninguno documentado | Ninguna |
| Filtros origen/resultado | vistas/slices | filtros | catálogos cerrados | consultas parametrizadas | IMPLEMENTADO | Se aceptaban valores ajenos | **Corregido 2026-09-23** |

## Resultado de la comparación

Se compararon **28 capacidades**: 21 implementadas, 5 parciales y 2 no aplicables. La corrección nueva cierra los filtros de origen y resultado a valores soportados. No se requiere SQL nuevo.

Las diferencias deliberadas son la ausencia de DELETE físico y la separación entre estado Legal, pago y solicitud contratada. Permanecen pendientes la regla automática de 120 días, el vínculo de documentos a un caso Legal histórico concreto, el alta manual con los 20 tipos AppSheet y la autorización por caso. La fuente no aporta cuestionarios por tipo, audiencias, checklist documental ni automatizaciones externas.
