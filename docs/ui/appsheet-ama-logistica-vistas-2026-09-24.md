# Inventario de vistas AppSheet: AMA y Logística

Fuente directa: `Application Documentation.pdf` y `Application Documentation Logistica dilitours.pdf`, sección UX / Views.

| Área | Vista AppSheet owner | Fuente | Tipo / posición | Datos o filtro principal | Equivalente React | Acción |
|---|---|---|---|---|---|---|
| AMA | CALENDARIO | CALENDARIO | calendar / menu | FECHA, HORA, TITULO, TIPO; mes | OperationalCalendar AMA | Conservar e integrar en navegación AMA |
| AMA | GRUPOS EN PROCESO | slice homónimo | card / menu | grupos operativos | `/empleado/ama/grupos` | Cards como vista principal |
| AMA | Tabla de aplicantes | APLICANTES AMAs | table / menu | agrupación GRUPO; nombre y protocolo | integrantes en detalle | Conservar formato denso |
| Logística | Vuelos y hoteles | slice de menu | gallery / menu | categoría Vuelos y Hoteles; acción abrir_menu | Hub Logística | Galería de accesos reales |
| Logística | Dilitours | slice de menu | gallery / menu | categoría Dilitours | Hub Logística | Galería de accesos reales |
| Vuelos | vuelos_proximos | vuelos | calendar / ref | fecha, hora, encabezado_calendario, tipo_vuelo | calendario de itinerarios | Predeterminado; lista secundaria |
| Hoteles | Catalogo de Hoteles | catálogo | card / menu | catálogo hotelero | Sin catálogo React conectado | No crear datos o módulo ficticio |
| Tours | Gestion_tours | tours | card / ref | grupo Estatus; orden fecha_hora_salida | Sin endpoint React conectado | Mantener pendiente hasta tener datos reales |
| Grupos de viaje | Todos los grupos | grupos logísticos | card | grupos de viaje | Sin endpoint React específico | No simular con grupos AMA |

Las vistas Detail/Form/Ref creadas por el sistema se auditaron como soporte de navegación, pero no se reproducen una por una.
