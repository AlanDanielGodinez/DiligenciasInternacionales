# Matriz de estados del Área Individual

| TRÁMITE | ESTADO APPSHEET | SIGNIFICADO / CAMPO ORIGEN | ESTADO NUEVO | TRANSICIÓN |
|---|---|---|---|---|
| Visa Individual | Completo | resultado/cierre en `APLICANTES VISA IND.Estatus` | resultado de solicitud | Manual |
| Visa Individual | Negado | resultado en `Estatus` | proceso Negados relacionado con solicitud | Manual |
| Visa Individual | Detenido | suspensión en `Estatus`; slices lo excluyen | estado de solicitud, sin borrado | Manual |
| Visa Individual | Proceso administrativo | valor documentado en operación; no equivale a negado | resultado separado | Manual |
| Visa Individual | Cita programada | acción agrupada después de agendar; no es estado de la cita | derivado por existencia de cita | La creación es manual |
| Perfil | porcentaje / completo | perfil versionado y su completitud | `perfiles_solicitud` | Motor existente |
| Pago | registrado, validado, rechazado | `pagos.estado_pago` canónico | sin duplicado en solicitud | Flujo financiero existente |
| CAS / Consulado | fecha futura o pasada | tablas de cita; sin enum propio verificado | derivado por fecha | Manual |
| DS | texto de actividad | `check_ds.actividad` | historial de actividades DS | Manual |
| Pasaporte | Estatus, Completo | campos distintos de `APLICANTES PASAPORTES` | no mezclado con Visa | Manual |
| ETA | GCKEY=completo; estatus libre | acción comprobada `Enviar información 2` | perfil y solicitud existentes | Manual |
| Visa Canadá | estatus | enum operativo con biométricos separados | operación pendiente de mapeo completo | Manual |

`Aprobado`, `Negado`, `Proceso administrativo`, `Completo` y `Detenido` no se normalizan entre dimensiones distintas sin una regla explícita.
