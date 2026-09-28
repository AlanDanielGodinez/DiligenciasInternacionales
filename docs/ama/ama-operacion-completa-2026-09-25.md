# AMA — operación completa (2026-09-25)

## Fuente AppSheet directa

Se revisaron `Application Documentation.pdf` y `Application Documentation Formularios.pdf` extraídos directamente. AppSheet registraba `DS TERMINADA` en `check_ds` con aplicante, asesor, fecha y actividad, evitando una segunda terminación. `NotasProtocolo` era una relación independiente por aplicante. La llamada de protocolo creaba una `Fecha de asesoria` con tipo `Protocolo`. `visa_recibida` era una acción manual limitada históricamente a admin/DS. `GRUPO TERMINADO` establecía ese valor cuando existía fecha de cita. El envío a Logística era una acción manual que copiaba aplicante, referencia AMA y destino.

## Normalización

- DS reutiliza `actividades_solicitud` con `tipo='DS'`; no se creó otra tabla.
- Protocolo reutiliza `notas_solicitud` con `contexto='PROTOCOLO'`, separado de notas generales.
- Llamadas, protocolo y entrevista consular reutilizan `ama_llamadas_agendadas` mediante tipos.
- Resultados viven en la solicitud canónica. Negado reutiliza el proceso Negados e impide duplicados.
- Los grupos terminados conservan el mismo grupo y su historial; no se copia a una tabla de realizados.
- Legal y Logística se presentan como pasos manuales hacia los módulos existentes. No se copia la identidad.

## SQL y bloqueos

La agenda sigue dependiendo de `2026_09_25_ama_agenda_llamadas.sql`. `2026_09_25_ama_operacion_cierre.sql` añade únicamente la marca auditable de visa recibida, ausente en el modelo actual. Ningún SQL fue ejecutado.

El catálogo de hoteles permanece `BLOQUEADO_FUENTE`. La transferencia definitiva a un grupo de viaje requiere que el operador seleccione el grupo real. El envío Legal requiere definir el tipo/motivo concreto del caso; los accesos contextuales no inventan esos valores.

## Permisos

AppSheet restringía agendar protocolo a `protocolo/admin` y visa recibida a `admin/DS`. La funcionalidad queda implementada sin afirmar enforcement. La autorización por rol permanece pendiente de resolver en autenticación.
