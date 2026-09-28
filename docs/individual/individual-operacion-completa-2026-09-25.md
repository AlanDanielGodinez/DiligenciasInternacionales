# Cierre funcional del Área Individual

Se revisó directamente `Application Documentation Visas inv.pdf`: tablas, esquemas, slices, vistas y acciones. La bandeja existente ya resolvía asignación, búsqueda, estado, completitud de perfil, documentos e historial. Se corrigió el acceso a Perfil para solicitudes Individuales y se agregó el último estado financiero derivado del módulo central de pagos.

Se añadió un calendario operativo compartido para CAS, Consulado y Pasaporte. Los eventos usan `OperationalCalendar`; la próxima cita y los días restantes se calculan desde fecha/hora. CAS, Consulado y Pasaporte conservan tipos separados. El formulario sólo incluye los campos comprobados: solicitud, tipo, fecha, hora, lugar y responsable. La fecha de registro es automática.

DS se representa como historial de actividades por solicitud porque AppSheet documenta filas con fecha, asesor y actividad. No se inventó un catálogo, booleanos ni una máquina de estados.

Visa Individual V3, pagos, documentos, Negados e historial se reutilizan. No se copian respuestas o estados financieros a `solicitudes`. Las transiciones finales permanecen manuales porque la fuente no demuestra una automatización única y segura hacia Logística, encuesta o cierre.

Pasaporte México y Guatemala conservan sus perfiles verificados y comparten únicamente la entidad documentada de cita de pasaporte. Pasaporte Estados Unidos sigue `BLOQUEADO_FUENTE` para mapeo de perfil. ETA conserva su perfil y el cierre documentado `GCKEY=completo`; no se agregaron citas o pagos sin evidencia. Visa Canadiense conserva el perfil `BLOQUEADO_FUENTE`; la fuente sí prueba biométricos, responsable y pago operativo, pero su conexión completa queda pendiente para no almacenar credenciales históricas de AppSheet.

La migración `backend/sql/2026_09_25_individual_operacion.sql` es aditiva e idempotente en creación. No fue ejecutada.

## CIERRE DE WORKSPACE OPERATIVO

La ficha única incorpora un workspace compacto con Resumen, Perfil, Pagos, Citas, DS, Documentos, Historial y Resultado según el trámite. Las etapas son visuales y derivadas; no forman una máquina de estados nueva. Pasaporte no muestra CAS, Consulado ni DS; ETA conserva Perfil y Cierre; Visa Canadiense muestra únicamente Pago, Biométricos y Resultado y mantiene el perfil bloqueado por fuente.

La próxima acción se calcula en frontend a partir de completitud de perfil, último pago, citas existentes, actividad DS, documentos y resultado. No se guarda `proxima_accion`. El historial visual combina las fuentes existentes sin crear filas duplicadas. El archivo DS permanece en Documentos y las actividades DS se consultan y registran por separado.

Los resultados de Visa se registran manualmente con historial. `NEGADO` crea o reutiliza el proceso Negados por solicitud. `APROBADO` no envía automáticamente a Logística. `PROCESO ADMINISTRATIVO` y `DETENIDO` permanecen resultados independientes; no se implementó reactivación porque no se comprobó una acción inversa equivalente en el PDF.
