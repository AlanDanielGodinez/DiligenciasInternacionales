# Matriz de paridad INFORMES Y PAGOS — 2026-09-23

| Capacidad AppSheet | Tabla / action | Frontend | Backend | PostgreSQL | Estado | Diferencia | Acción propuesta |
|---|---|---|---|---|---|---|---|
| Contacto inicial | CONTACTO | listado y ficha | CRUD contacto | `contacto` | IMPLEMENTADO | Campos canónicos | Mantener |
| Contacto 1:N aplicantes | Related INFORMES | ficha jerárquica | endpoint aplicantes | `clientes.id_contacto` | REDISEÑADO_CORRECTAMENTE | Sin copia de datos | Mantener |
| Datos de emergencia | CONTACTO | formulario/ficha | alta y edición | `telefono_emergencia` | IMPLEMENTADO | Equivalente directo | Mantener |
| Estado cobro contacto | CONTACTO.cobro | pagos por solicitud | derivado de pagos | `pagos` | REDISEÑADO_CORRECTAMENTE | No se duplica resumen mutable | Mantener |
| Aplicante INFORMES | INFORMES | ficha cliente | clientes service | `clientes` | REDISEÑADO_CORRECTAMENTE | Persona separada del trámite | Mantener |
| Interés/expediente | INFORMES | solicitudes | solicitudes service | `solicitudes` | REDISEÑADO_CORRECTAMENTE | Instancia independiente | Mantener |
| Varios trámites por aplicante | copias/cambio TRAMITE | múltiples solicitudes | crea filas nuevas | solicitud 1:N | IMPLEMENTADO | Conserva historial | Mantener |
| Catálogo trámite | TRAMITES | selector | tipos trámite | `tipos_tramite` | REDISEÑADO_CORRECTAMENTE | Catálogo separado | Mantener |
| Trámite adicional | TRAMITE ADICIONAL | nueva solicitud/relación | relación explícita cuando aplica | `solicitudes_relaciones` | PARCIAL | No hay conversión universal del dato legacy | Decidir por caso |
| País del trámite | PAISES/Valid If | selector | catálogo | países/tipo trámite | IMPLEMENTADO | Normalizado | Mantener |
| Asesor | ASESORES | responsable | asignación | empleado FK | REDISEÑADO_CORRECTAMENTE | Sin catálogo duplicado | Mantener |
| Área | copias por hoja | bandejas | mover/enviar | `catalogo_areas` | REDISEÑADO_CORRECTAMENTE | Movimiento, no copia | Mantener |
| Historial de alta | action historial | ficha | seguimiento | `seguimientos` | IMPLEMENTADO | Más detalle | Mantener |
| Historial de pago | action historial | ficha/pagos | seguimiento | `seguimientos` | IMPLEMENTADO | Más detalle | Mantener |
| Notas | NOTAS DE TRAMITE | notas/ficha | notas | `notas_solicitud`/observaciones | REDISEÑADO_CORRECTAMENTE | Histórico cuando corresponde | Mantener |
| Cotización pendiente | PAGO REALIZADO | estado solicitud | estados canónicos | catálogo estatus | IMPLEMENTADO | Separado del pago | Mantener |
| Anticipo | Cobro realizado | registrar pago | createPago | `pagos` | REDISEÑADO_CORRECTAMENTE | Transacción real | Mantener |
| Varios pagos | no representado | historial pagos | altas 1:N | solicitud 1:N pagos | REDISEÑADO_CORRECTAMENTE | Extensión necesaria | Mantener |
| Monto/moneda/concepto | no documentado | formulario pago | validación | columnas pago | REDISEÑADO_CORRECTAMENTE | AppSheet insuficiente | Mantener |
| Método/referencia | no documentado | formulario pago | persistencia | columnas pago | REDISEÑADO_CORRECTAMENTE | AppSheet insuficiente | Mantener |
| Comprobante | no específico | carga/descarga | módulo documentos | FK pago→documento | REDISEÑADO_CORRECTAMENTE | Archivo reutilizado | Mantener |
| Validar pago | actions de confirmación | Finanzas | transacción con lock | estado/fecha/validador | IMPLEMENTADO | Idempotente | Mantener |
| Rechazar pago | no documentado | Finanzas | rechazo transaccional | pago + seguimiento | IMPLEMENTADO | Corregido: la repetición ya no crea seguimiento duplicado | Mantener |
| Pago completo | actions por hoja | historial y estados | múltiples pagos | pagos | REDISEÑADO_CORRECTAMENTE | Sin estado duplicado por perfil | Mantener |
| Saldo/liquidación | implícito por dos etapas | historial de pagos | no cálculo contractual | pagos | REQUIERE_DECISIÓN | No hay precio/saldo AppSheet fiable | No inventar |
| Envío post pago | actions de copia | acción de envío | destino por área | solicitud/seguimiento | REDISEÑADO_CORRECTAMENTE | Sin copiar persona | Mantener |
| Documentos trámite | 12 File | expediente | documentos service | `documentos` | REDISEÑADO_CORRECTAMENTE | Almacenamiento general | Mantener |
| Checklist requerido | reglas por archivo | perfil/documentos | plantillas | requisitos | PARCIAL | No todos los IDs legacy están mapeados | Continuar por plantilla comprobada |
| Encuesta | referencias compartidas | tarjeta encuesta | entidad independiente | `encuestas_satisfaccion` | REDISEÑADO_CORRECTAMENTE | Relación cliente/solicitud | Mantener |
| Negados | hojas relacionadas | tarjeta proceso | proceso especializado | proceso Negados | IMPLEMENTADO | Integración por solicitud | Mantener |
| Legal | copy actions | tarjeta proceso | proceso especializado | proceso Legal | IMPLEMENTADO | Integración explícita | Mantener |
| QuickBooks disparo | proceso QBKS opaco | administración QB | sync diferido | cola/enlace persistente | PARCIAL | Fuente AppSheet no documenta payload/evento | No reescribir |
| QuickBooks duplicados | no documentado | estado sync | lock + lookup + id externo | `contacto_quickbooks` | REDISEÑADO_CORRECTAMENTE | Mayor control | Mantener |
| Facturación fiscal | no documentada | no módulo | no módulo | no entidad fiscal | NO_APLICA | Sin evidencia | No crear |
| Colas de cobro | 7 slices | filtros Finanzas | consultas | solicitudes/pagos | IMPLEMENTADO | Unifica variantes | Mantener |
| Eliminación | Delete estándar | no expuesta | sin endpoint | conserva histórico | REDISEÑADO_CORRECTAMENTE | Decisión deliberada | Mantener |
| Autorización | Show If/áreas | sesión existente | protección inconsistente por ruta | sin política por caso | PARCIAL | Deuda global | No ampliar alcance |

Se compararon **37 capacidades**: 12 implementadas, 19 rediseñadas correctamente, 4 parciales, 1 requiere decisión y 1 no aplica. Dentro de las 12 implementadas se corrigió una diferencia funcional: el rechazo repetido de un pago ahora es idempotente y no agrega seguimientos duplicados.
