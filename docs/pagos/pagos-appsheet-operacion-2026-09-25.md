# Matriz AppSheet de pagos — 2026-09-25

Fuente directa: `Application Documentation Negados.pdf` (su contenido corresponde a Informes y Pagos), contrastada con los documentos de AMA, Visa Individual, Legal y Logística.

| Trámite | Tabla AppSheet | Campo | Estado | Acción/condición | Efecto histórico | Modelo nuevo | Estado actual |
|---|---|---|---|---|---|---|---|
| Informes | INFORMES | PAGO REALIZADO | Pendiente de cotización / Envío de información pendiente / Falta de pago inicial / Pago inicial realizado | Acciones manuales desde vistas de cobro | Movía el enum en la misma fila | `pagos.estado_pago` y estado de solicitud separados | Implementado |
| Visa Individual | APLICANTES VISA IND | Estatus_pago / fecha_pago_anticipo | Falta de información pago completo / Falta de pago completo / Pago completo realizado | “Información de pago enviada” y “Pago completo realizado” | Actualizaba marcadores históricos | Filas de pago, comprobante y validación | Parcial: no hay total contratado |
| AMA | APLICANTES AMA | ESTATUS DE PAGO | Falta de pago completo / Falta de información / Pago completo | Acciones manuales de cobro | Actualizaba el aplicante AMA | Misma tabla central `pagos` | Implementado sin saldo paralelo |
| Visa Canadá | VISA CANADIENSE | Estatus_pago | Falta de pago completo / Pago completo realizado | Acción manual documentada | Actualizaba estado de cobro | Pago central por solicitud | Parcial |
| Legal | legal / solicitud relacionada | estados de cobro | Pendiente/registrado/validado | Derivado de solicitud legal | Separaba cobro del análisis | Pago de la solicitud relacionada | Implementado |
| Pasaportes | solicitudes históricas | estado de pago | Variantes de anticipo y pago completo | Manual | Marcadores por trámite | Pago central por solicitud | Parcial; sin precio hardcodeado |

AppSheet usaba “anticipo” como etapa o marcador de cobro dentro de varias entidades, no como una entidad financiera independiente. El modelo nuevo lo representa mediante concepto y filas históricas de pago.
