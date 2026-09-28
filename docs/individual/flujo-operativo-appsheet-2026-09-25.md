# Inventario del flujo operativo Individual en AppSheet

Fuente directa: `docs/appsheet/Application Documentation Visas inv.pdf` y su extracción local verificable. AppSheet es referencia funcional; las entidades nuevas conservan la solicitud como identidad canónica.

| ETAPA | TABLA APPSHEET | CAMPO ESTADO | ACTION / FORM | REF | SIGUIENTE ETAPA | IMPLEMENTACIÓN ACTUAL | ESTADO |
|---|---|---|---|---|---|---|---|
| Alta | INFORMES / CONTACTO | estatus | envío a trámite | aplicante | solicitud | contacto → cliente → solicitud | PASS |
| Asignación | APLICANTES VISA IND | Encargado | asesoría / asignación | ASESORES | perfil o cita | `solicitudes.id_empleado_responsable` e historial existente | PASS |
| Perfil | PERFIL VISA INDIVIDUAL | completitud propia | formulario perfil | Id_aplicante | perfil completo | motor Visa Individual V3 por solicitud | PASS |
| Perfil completo | APLICANTES VISA IND | fecha_perfil_completo | acción no certificada como automática | perfil | pago/cita | completitud derivada; fecha histórica no se inventa | PARCIAL |
| Pago | APLICANTES VISA IND | Estatus_pago, fechas de pago | recepción | aplicante | operación | módulo central `pagos`; estado derivado en bandeja | PASS |
| CAS | CITAS CAS | sin catálogo de estado | AGENDAR CITA | Id_aplicante | consulado | cita separada CAS por solicitud | PASS pendiente SQL |
| Consulado | CITAS CONSULADO | sin catálogo de estado | Agregar cita Consulado | Id_aplicante | resultado | cita separada Consulado por solicitud | PASS pendiente SQL |
| DS / check | check_ds | actividad libre | registro de actividad | id_aplicante, id_asesor | revisión | historial DS por solicitud | PASS pendiente SQL |
| Documentos | enlaces y documentos | sin máquina única | carga/consulta | aplicante | resultado | documentos requeridos existentes; CURP y Respaldo/DS conservados | PASS |
| Resultado | APLICANTES VISA IND | Estatus | acciones manuales | aplicante | Negados/Logística/cierre | solicitud, Negados e historial existentes | PARCIAL |
| Pasaporte | APLICANTES PASAPORTES | Estatus, Completo | AGENDAR CITA PASAPORTE | CITAS PASAPORTES | cierre/siguiente trámite | perfil y cita diferenciada | PARCIAL pendiente SQL |
| ETA | ETA | estatus, GCKEY | Enviar información 2 (`GCKEY=completo`) | PERFIL ETA | cierre | perfil ETA existente; no se inventa pago/cita | PARCIAL |
| Visa Canadá | VISA CANADIENSE | estatus | formularios operativos | trámite, contacto, encargado | biométricos/cierre | perfil bloqueado; operación documentada aún no conectada | PARCIAL |

Los filtros documentados para Visa Individual se basan en asignación, presencia de CAS/Consulado y exclusión de `Completo`, `Negado`, `Detenido`. No se convirtió esta combinación en una máquina automática.
