# Matriz de paridad — operación Grupos AMA — 2026-09-23

| Capacidad AppSheet | Fuente | Frontend actual | Backend actual | PostgreSQL | Estado | Diferencia | Acción propuesta |
|---|---|---|---|---|---|---|---|
| Crear grupo manual | Form/Add | modal | `createGrupo` | `grupos_ama` | IMPLEMENTADO | equivalente | mantener |
| Listar/buscar grupos | cards/slices | lista y búsqueda | filtros | `grupos_ama` | IMPLEMENTADO | más filtros | mantener |
| País de origen | enum | catálogo país | FK validada | `id_pais` | REDISEÑADO_CORRECTAMENTE | catálogo normalizado | mantener |
| Tipo/programa | contexto AMA | tipo trámite | FK validada | `id_tipo_tramite` | REDISEÑADO_CORRECTAMENTE | normalizado | mantener |
| Estado de grupo | enum 6 valores | selector abierto | texto libre | `estado_grupo` | PARCIAL | backend no cierra catálogo ni transiciones | decidir catálogo compatible |
| Responsable protocolo/pago | refs ASESORES | responsable | empleado activo | `id_empleado_responsable` | REDISEÑADO_CORRECTAMENTE | un responsable canónico | mantener |
| Correo/WhatsApp/credencial grupal | columnas grupo | ausente | ausente | ausente | REQUIERE_DECISIÓN | incluye contraseña sensible legacy | definir necesidad y custodia |
| Locker/destino/enlaces | columnas grupo | observaciones/fechas | parcial | parcial | PARCIAL | no hay equivalencia exacta | modelar sólo con regla vigente |
| Grupo 1:N integrantes | Ref/REF_ROWS | detalle | membresías | `grupo_ama_solicitudes` | IMPLEMENTADO | usa solicitud canónica | mantener |
| No duplicar cliente | fila APLICANTES | reutiliza expediente | usa `id_solicitud` | FK | REDISEÑADO_CORRECTAMENTE | sin copia de persona | mantener |
| Bloquear duplicado activo | no impuesto | selección excluye activo | validación transaccional corregida | índice/activo | IMPLEMENTADO | ahora rechaza mismo grupo | mantener prueba |
| Una membresía activa | un Ref por aplicante | candidato excluido | bloqueo y transacción | índice activo | REDISEÑADO_CORRECTAMENTE | conserva historial | mantener |
| Retirar integrante | edición/Delete | quitar | baja lógica | `activo=false` | REDISEÑADO_CORRECTAMENTE | no borra físicamente | mantener |
| Reingreso | no documentado | admite tras baja | reactiva fila previa | membresía histórica limitada | PARCIAL | reinicia `agregado_en` y no guarda actor/motivo | ampliar sólo con política |
| Cupo máximo | no existe | campo cupo | lock de grupo | `cupo_estimado` | REDISEÑADO_CORRECTAMENTE | regla local más fuerte | mantener |
| Regla seis meses | no existe | muestra elegibilidad | fuente de verdad | consulta de actividad | REDISEÑADO_CORRECTAMENTE | regla local definida | mantener |
| SIN_FECHA_BASE | no existe | muestra bloqueo | HTTP 409 | cálculo | IMPLEMENTADO | conducta segura | mantener |
| Actividad sustantiva | no existe | resumen | eventos cerrados | fuentes canónicas | REDISEÑADO_CORRECTAMENTE | evita timestamps triviales | mantener |
| Nota revisor | NotasProtocolo | expediente | notas append-only | notas históricas | IMPLEMENTADO | no renueva actividad | mantener |
| Perfil AMA | perfil relacionado | ver/editar expediente | motor V3 | versiones | IMPLEMENTADO | sin copiar respuestas | mantener |
| Completitud perfil | relación perfil | expediente | motor de perfiles | versiones/estado | IMPLEMENTADO | fuera del grupo | mantener |
| Pago por solicitud | texto `ESTATUS DE PAGO` | módulo pagos | pagos | `pagos` 1:N | REDISEÑADO_CORRECTAMENTE | fuente financiera única | mantener |
| Pago como requisito de ingreso | no comprobado | no exige | no exige | no aplica | NO_APLICA | sin evidencia | no inventar |
| Pago rechazado y actividad | no documentado | estado pago | no renueva actividad | cálculo | IMPLEMENTADO | regla local probada | mantener |
| Checklist DS por integrante | `check_ds` | no expuesto en grupo | sin equivalente específico | actividades/seguimientos | PARCIAL | falta vista de actividad DS equivalente | decidir alcance operativo |
| Checklist grupal | no documentado | checklist grupo | CRUD trazable | `grupo_ama_checklist` | REDISEÑADO_CORRECTAMENTE | capacidad nueva | mantener como ayuda local |
| Historial del checklist | no documentado | fecha visible | fecha/usuario | columnas de auditoría | IMPLEMENTADO | falta historial de cada reversión | no ampliar sin requisito |
| Calendario por grupo | `CALENDARIO` | calendario de salidas | endpoint/lista grupos | fechas del grupo/calendario legacy | PARCIAL | sólo salidas; faltan 5 tipos AppSheet | unificar en trabajo de calendario |
| Documentos | enlaces/logística | expediente | módulo general | `documentos` | REDISEÑADO_CORRECTAMENTE | no hay documento grupal probado | reutilizar solicitud |
| Archivo de grupos terminados | action/copia | filtros estado | estado + activo | misma entidad | REDISEÑADO_CORRECTAMENTE | evita duplicar tabla | mantener |

Se compararon **31 capacidades**: 10 implementadas, 13 rediseñadas correctamente, 6 parciales, 1 requiere decisión y 1 no aplica. Una de las 10 implementadas es la corrección nueva: bloqueo explícito del duplicado activo en el mismo grupo.
