# Pagos / Finanzas — operación transversal (2026-09-25)

## Modelo real

La bandeja financiera consulta la tabla central `pagos` y sus relaciones con solicitud, aplicante, trámite, área, responsable, empleado validador y documento comprobante. Registro, comprobante, validación y rechazo conservan dominios independientes del estado de la solicitud. El rechazo repetido es idempotente y no agrega otro seguimiento.

Los filtros operativos incluyen búsqueda, trámite, área, responsable, estado de pago, método y periodo. Los indicadores de pagos por validar, rechazados, validados y total validado se calculan en consulta; no se persisten.

## Precio y saldo

`tipos_tramite.costo` es un precio de catálogo modificable. No existe una instantánea contractual inequívoca por solicitud que demuestre monto contratado, descuentos, servicios adicionales y moneda acordada. Por ello el monto contratado se clasifica **PARCIAL** y el saldo matemático queda **BLOQUEADO**. “Pago completo realizado” se conserva como concepto histórico, no como prueba de `suma(pagos) >= total`.

## Comprobantes e historial

El comprobante reutiliza `documentos`, vinculado desde `pagos.id_documento_comprobante`. Se muestran fecha civil de pago, fecha de registro, fecha de validación, método, monto, estado, responsable y validador cuando existen. Las acciones disponibles dependen del estado y de que exista comprobante.

Individual, AMA, Legal, Visa Canadá y Pasaportes consultan la misma fuente financiera. No mantienen saldos paralelos.

## QuickBooks y permisos

No se modificó OAuth ni se agregó sincronización. Un futuro adaptador puede escuchar una validación de pago después del `COMMIT`; no debe formar parte de la transacción financiera. AppSheet restringía acciones a áreas como Pagos/Admin, pero el enforcement queda pendiente hasta resolver roles y autenticación.

No fue necesaria una migración SQL.
