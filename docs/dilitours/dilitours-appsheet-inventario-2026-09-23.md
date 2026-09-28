# Inventario AppSheet — DiliTours / Logística de viajes — 2026-09-23

## Fuente

Fuente canónica: `backend/reports/ama-audit/Application Documentation Logistica dilitours.pdf.txt`, appId `dc1776cd-0755-452a-98e0-55ee2b5896c1`, versión 1.001089, generada el 17/8/2026. Declara **36 tablas, 564 columnas, 8 slices, 96 vistas, 11 reglas de formato, 164 actions y 0 workflow rules**. Son 29 fuentes físicas y 7 tablas técnicas: 3 Process Tables y 4 Outputs.

## Dominios

| Dominio | Tablas AppSheet | Observación |
|---|---|---|
| Cliente/pasajero | `APLICANTES AMA`, `APLICANTES VISA IND`, `INFORMES`, `clientes_tours` | Migratorios y clientes turísticos no son siempre la misma población |
| Solicitud/servicio | `logistica_viajes`, `tours_cliente` | Dos flujos separados |
| Cotización | `cotizaciones_vuelo`, `cotizaciones_vehiculos` | Vuelo y transporte terrestre usan modelos distintos |
| Reservación | `hoteles_principal`, `hoteles_detalles` | Reserva 1:N habitaciones/detalles |
| Itinerario | `itinerario` | Pertenece a cotización y aplicante |
| Vuelo | `vuelos`, `aerolineas`, `aeropuertos` | Catálogos y vuelos relacionados |
| Hotel | `Hotel`, `hoteles_principal`, `hoteles_detalles` | Catálogo y reserva están separados |
| Transporte/tour | `vehiculos`, `tours`, `catalogo_tours`, `tours_cliente` | Operación terrestre, calendario y catálogo |
| Pago | `pagos_cotizacion_vehiculos` | Pago específico de cotización terrestre |
| Grupo | `grupo_asignado`, `GRUPOS AMA` | Grupo de vuelo distinto del grupo AMA, aunque puede referenciarlo |
| Compartidas | `CONTACTO`, `ASESORES`, `PAISES`, `TRAMITES`, `HISTORIAL DE TRAMITES`, `encuesta_satisfaccion`, `menu` | Catálogos, origen y navegación |
| Configuración/técnico | `_Per User Settings`, 3 Process Tables, 4 Outputs | No son entidades de negocio nuevas |

El sitio público no aparece como fuente de estas tablas. `catalogo_tours`, `Hotel` y `vehiculos` tienen imágenes y atributos comerciales, pero la exportación no demuestra sincronización con React público.

## Flujo AppSheet reconstruido

| Evento | Tabla | Action/process | Estado/resultado | Paso siguiente |
|---|---|---|---|---|
| Envío desde AMA/individual | `logistica_viajes` | alta desde módulos origen | expediente logístico | cotizar |
| Iniciar atención | `logistica_viajes` | `Start` | `Cotización` | crear cotización |
| Crear alternativa | `cotizaciones_vuelo` | `Crear cotización` / formulario | cotización independiente | aceptar o cancelar |
| Aceptar | `cotizaciones_vuelo` | `Aceptar` | `Aceptado` | crear itinerario |
| Cancelar | `cotizaciones_vuelo` | `Cancelar` | `Cancelado` | conservar histórico |
| Crear itinerario | `itinerario` | `Crear itinerario` | referencia cotización/aplicante | asignar vuelos y PDF |
| Reservar vuelo | `logistica_viajes` | `Next` | `Vuelo reservado` | operación/recordatorio |
| Reserva hotel | `hoteles_principal` | formulario + detalles | estado de reserva | habitaciones/fechas |
| Cotizar vehículo | `cotizaciones_vehiculos` | formulario/fórmulas | estado parametrizado | enviar/duplicar/pagar |
| Registrar pago | `pagos_cotizacion_vehiculos` | `registro_pago` | fila histórica | transformar en tour |
| Registrar tour | `tours` | `Pagado_transformar_tour` | evento de calendario | operación/cierre |

## Entidades y relaciones verificadas

- `logistica_viajes`: PK `id_logistica`; Ref a aplicante de `INFORMES`, opcional a `APLICANTES AMA` y `GRUPOS AMA`; precio al cliente, costo, costo real, ganancia (`precio_cliente - costo_real`), destino, fechas tentativas y estado.
- `cotizaciones_vuelo`: PK `id_cotizacion`; Ref a aplicante; cuatro aeropuertos, fechas/horas, precio, divisa, escalas, equipaje, asistencia, fecha, estado y PDF. Un aplicante/logística puede conservar varias cotizaciones.
- `itinerario`: PK `id_itinerario`; Ref a cotización y aplicante; aerolínea, asientos, vuelos de ida/regreso, hora en aeropuerto, confirmación y PDF.
- `vuelos`: PK `id_vuelo`; código/nombre/número, destino, fecha/hora, aerolínea, tipo y lista de aplicantes. Itinerario referencia vuelo de ida y regreso.
- `aeropuertos`: PK `id`; nombre, ciudad, estado, país, IATA.
- `hoteles_principal`: reserva por aplicante con llegada, salida, estado, total y noches. `hoteles_detalles` es 1:N con tipo/cantidad/personas/precio/subtotal y fechas.
- `grupo_asignado`: agrupación de vuelo con fechas, aplicantes y vuelos; no equivale automáticamente a `GRUPOS AMA`.
- `clientes_tours` y `tours_cliente`: cliente turístico y participación/pasajeros del tour; `nombres_viajeros` es texto legacy.
- `cotizaciones_vehiculos`: 47 columnas de ruta, vehículo, costos, viáticos, personal, utilidad, impuestos/descuento, vigencia y totales derivados.
- `pagos_cotizacion_vehiculos`: PK `id_pago`, Ref a cotización, cantidad, fecha, notas y forma de pago.

## Estados por dominio

`logistica_viajes.estatus` tiene 9 valores: `Cancelado`, `Terminado`, `En espera`, `Recordatorio enviado`, `Vuelo reservado`, `Pago confirmado`, `Cotización`, `Mensaje de reactivar enviado`, `Por enviar mensaje de reactivación`.

`cotizaciones_vuelo.estatus_cotizacion` se modifica explícitamente a `Aceptado` o `Cancelado`. Otros dominios —reserva hotel, tour, vehículo y pago— tienen campos separados; la exportación no aporta una máquina uniforme y no deben fusionarse.

## Actions, procesos, slices y vistas

De 164 actions, **102** pertenecen directamente a las 17 tablas operativas inventariadas. Incluyen CRUD, referencias, cotizar, aceptar/cancelar, crear itinerario, vuelos, hoteles, exportar, PDFs, WhatsApp/SMS/teléfono, vehículo, pago y tour. Las comunicaciones externas sólo se documentan.

Hay 3 Process Tables: creación de cotización, creación de itinerario y aceptación de cotización; 4 Outputs guardan PDF/pasos. La fuente declara 0 workflows y no expone una definición completa de Bots.

Los 8 slices son: aprobados AMA, grupos terminados, vuelos próximos, grupos próximos, aprobados individuales y tres menús por categoría. Son filtros, no tablas.

Hay **59 vistas operativas relevantes**: 5 card, 2 gallery, 19 detail, 20 form, 11 table y 2 calendar. El resto pertenece a fuentes compartidas o pantallas generadas fuera del núcleo.
