# Matriz de campos Legal prioritaria — 2026-09-24

Fuente: inventario y export AppSheet Legal ya auditados. La tabla fuente contiene 25 columnas físicas y 5 virtuales. No se infirieron cuestionarios diferentes por tipo Legal.

| Campo AppSheet | Tipo AppSheet | Condición | Formulario/proceso | Frontend | Backend | DB | Estado |
|---|---|---|---|---|---|---|---|
| _RowNumber | Number/System | siempre | interno AppSheet | no | no | no | TÉCNICO |
| id_tramite | Text/Key | siempre | caso | sí | sí | sí, `id_proceso` | TÉCNICO |
| id_aplicante | Ref | siempre | caso | sí | sí | sí, solicitud→cliente | IMPLEMENTADO |
| contacto | Ref | opcional | ficha | sí | sí | sí, relación contacto | IMPLEMENTADO |
| asesor | Ref | opcional | gestión | sí | sí | sí | IMPLEMENTADO |
| nombre_prospecto | Text | siempre | ficha | sí | sí | derivado de cliente | IMPLEMENTADO |
| apellidos_prospecto | Text | opcional | ficha | sí | sí | derivado de cliente | IMPLEMENTADO |
| telefono | Phone | opcional | ficha | sí | sí | derivado de cliente | IMPLEMENTADO |
| tipo de contacto | Enum | opcional | origen | sí | sí | derivado | IMPLEMENTADO |
| tramite | EnumList | opcional | gestión | sí, multiselección | sí, catálogo cerrado | `tipos_legales[]` | IMPLEMENTADO |
| fecha_de_contacto | Date | opcional | actividad | sí | sí | actividad | IMPLEMENTADO |
| estatus | Enum | inicial `LLAMADA PENDIENTE` | proceso | sí | sí | estado normalizado | IMPLEMENTADO |
| fecha_de_llamada | Date | opcional | actividad | sí | sí | actividad | IMPLEMENTADO |
| pais | Ref | opcional | ficha | sí | sí | cliente/solicitud | IMPLEMENTADO |
| correo | Email | opcional | ficha | sí | sí | cliente/contacto | IMPLEMENTADO |
| contrasena | Text | opcional | acceso histórico | no | no | no | NO_APLICA |
| contrasena_alterna | Text | opcional | acceso histórico | no | no | no | NO_APLICA |
| expediente | URL | opcional | documentos | módulo general | módulo general | documentos por solicitud | PARCIAL |
| fecha_envio_solicitud | Date | opcional | seguimiento | sí | sí | sí | IMPLEMENTADO |
| primer_mensaje_seg | Yes/No | después del envío | seguimiento | sí | sí | sí | IMPLEMENTADO |
| segundo_mensaje_seg | Yes/No | después del envío | seguimiento | sí | sí | sí | IMPLEMENTADO |
| notas | LongText | opcional | notas | sí | sí | historial de notas | IMPLEMENTADO |
| area_continuacion | Text/Ref | cuando continúa | cierre | sí | sí | solicitud relacionada | IMPLEMENTADO |
| fecha_pago_inicial | Date | opcional | cobro | sí | sí | pagos canónicos | IMPLEMENTADO |
| fecha_pago_tramite_int | Date | opcional | cobro | sí | sí | pagos canónicos | IMPLEMENTADO |
| Primer mensaje de seguimiento | Virtual Date | fecha envío + 120 días | seguimiento | campo base visible | fecha base disponible | derivable | PARCIAL |
| Segundo mensaje de seguimiento | Virtual Date | fecha envío + 120 días | seguimiento | campo base visible | fecha base disponible | derivable | PARCIAL |
| REALIZAR MENSAJE | Virtual Text | según marcas | seguimiento | estado visible | derivable | no requiere columna | IMPLEMENTADO |
| Nombre completo | Virtual Text | siempre | ficha | sí | sí | derivado | IMPLEMENTADO |
| Id de aplicante | Virtual Ref | siempre | ficha | sí | sí | derivado | IMPLEMENTADO |

## Decisiones

- Se añadieron cuatro capacidades faltantes verificables: EnumList de 20 tipos, fecha de envío y dos marcas de seguimiento.
- FOIA usa los mismos campos comunes, tipo `FOIA`, resultado y actividades. La fuente no prueba agencia, número de caso, documentos propios ni cuestionario FOIA adicional.
- Las contraseñas AppSheet no se copian al caso Legal. El expediente sigue en el módulo documental para evitar duplicados.
- Los recordatorios automáticos de 120 días siguen pendientes porque AppSheet muestra la misma expresión para ambos y no prueba automatización. Se conserva la fecha y las marcas para una decisión posterior.
