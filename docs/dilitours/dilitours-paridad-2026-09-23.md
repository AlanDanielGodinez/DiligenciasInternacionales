# Matriz de paridad — DiliTours / Logística — 2026-09-23

| Capacidad AppSheet | Fuente | Frontend actual | Backend actual | PostgreSQL | Estado | Diferencia | Acción propuesta |
|---|---|---|---|---|---|---|---|
| Expediente logístico | `logistica_viajes` | bandeja Vuelos | solicitud/área | `solicitudes` | REDISEÑADO_CORRECTAMENTE | reutiliza expediente | mantener |
| Origen AMA | Ref `id_ama`/grupo | expediente | relación por solicitud | membresía/solicitud | REDISEÑADO_CORRECTAMENTE | no copia perfil | mantener |
| Origen individual | aprobados individual | bandeja | solicitud | solicitud/cliente | REDISEÑADO_CORRECTAMENTE | canónico | mantener |
| Cliente migratorio | Ref INFORMES | ficha canónica | joins | `clientes` | REDISEÑADO_CORRECTAMENTE | sin duplicado | mantener |
| Cliente turístico externo | `clientes_tours` | sitio público separado | ausente | ausente | FALTA | no todo pasajero es aplicante | decidir persona/pasajero |
| Varias cotizaciones | filas `cotizaciones_vuelo` | lista por solicitud | 1:N | `cotizaciones_viaje` | IMPLEMENTADO | conserva alternativas | mantener |
| Tipo de servicio | dos cotizaciones especializadas | selector | enum cerrado | `tipo_servicio` | REDISEÑADO_CORRECTAMENTE | catálogo compacto | ampliar con ítems si se aprueba |
| Precio estimado/moneda | precio/divisa | formulario | validación | monto/moneda | IMPLEMENTADO | básico | mantener |
| Costos y ganancia | fórmula logística | ausente | ausente | ausente | PARCIAL | sólo monto estimado | definir permisos financieros |
| Estado cotización | aceptar/cancelar | 5 estados | enum backend | texto | PARCIAL | estados nuevos no trazan transición | definir catálogo/transiciones |
| Aceptar cotización | action `Aceptar` | edición | actualización genérica | estado | PARCIAL | no vincula cotización al itinerario | agregar FK tras migración |
| Cancelar/rechazar | action `Cancelar` | edición | estado | estado | IMPLEMENTADO | conserva fila | mantener |
| Vigencia | vehículo | ausente | ausente | ausente | PARCIAL | sólo flujo terrestre | decidir alcance |
| Ítems de cotización | entidades separadas | tipo único | fila única | fila única | FALTA | no soporta combinación 1:N | diseñar ítems |
| Itinerario por solicitud | itinerario por cotización | formulario | uno activo | `itinerarios_viaje` | PARCIAL | falta `id_cotizacion` | migración requerida |
| Versiones itinerario | no probado | ausente | sobreescribe | timestamps | NO_APLICA | fuente no prueba versiones | no inventar |
| Vuelos relacionados | refs ida/regreso | texto único | campos planos | texto | FALTA | sin entidad 1:N | modelar segmentos |
| Aerolínea | catálogo | CRUD legacy separado | endpoints legacy | tabla legacy | PARCIAL | no integrada al itinerario nuevo | consolidar catálogo |
| Aeropuertos/IATA | catálogo AppSheet | ausente | ausente | ausente | FALTA | origen/destino son texto | decidir catálogo |
| Reserva hotel | principal + detalles | módulo pendiente | ausente | ausente | FALTA | falta 1:N habitaciones | migración requerida |
| Catálogo hotel | `Hotel` | módulo pendiente | ausente | ausente | FALTA | no confundir reserva | decidir integración |
| Transporte incluido | cotización vehículo | checkbox básico | booleano itinerario | booleano | PARCIAL | no guarda trayectos/proveedor | diseñar servicio 1:N |
| Vehículos | catálogo operativo | ausente | ausente | ausente | FALTA | marketing no basta | migrar si sigue vigente |
| Tours | catálogo/evento | sitio público separado | ausente | ausente | REQUIERE_DECISIÓN | integración pública no demostrada | mantener separado |
| Grupo de viaje | `grupo_asignado` | ausente | ausente | ausente | FALTA | distinto de grupo AMA | modelar si sigue vigente |
| Pasajeros múltiples | listas/tours_cliente | aplicante único | solicitud única | cliente por solicitud | FALTA | no soporta pasajero externo/1:N | diseñar membresía |
| Pago turístico | pagos vehículo | pagos generales | pagos por solicitud | `pagos` | PARCIAL | falta concepto/vínculo a cotización | extender sin segundo ledger |
| Documentos/PDF | PDF cotización/itinerario | documentos expediente | módulo general | `documentos` | PARCIAL | sin relación específica | añadir metadato/vínculo |
| Calendario salida/regreso | 2 Calendar | calendario | deriva itinerarios | fechas | IMPLEMENTADO | cubre fechas principales | mantener |
| Encuesta | action/ref compartida | encuesta existente | servicio existente | encuesta | REDISEÑADO_CORRECTAMENTE | no duplicada | mantener |
| Proveedores | texto en cotización | texto | texto | `proveedor` texto | PARCIAL | sin catálogo | decidir catálogo único |
| Comunicaciones | WhatsApp/SMS/email | ausente | ausente | N/A | NO_APLICA | externas y no integradas | no automatizar |
| PDF automático | 3 procesos/outputs | ausente | ausente | N/A | PARCIAL | definición opaca | decidir generación documental |
| Sitio público | catálogos con imágenes | sitio independiente | sin sync | sin vínculo | NO_APLICA | fuente no prueba integración | no modificar |
| Aislamiento por solicitud | refs aplicante | filtros | consultas parametrizadas | FK solicitud | IMPLEMENTADO | correcto | mantener pruebas |

Se compararon **35 capacidades**: 5 implementadas, 6 rediseñadas correctamente, 11 parciales, 9 faltantes, 1 requiere decisión y 3 no aplican. No se hizo una corrección funcional porque las diferencias restantes exigen decisiones de modelo o esquema.
