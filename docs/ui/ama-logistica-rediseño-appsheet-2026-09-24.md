# Rediseño funcional AMA y Logística

La referencia AppSheet se usa para jerarquía y tipos de vista. React conserva su navegación, componentes, paleta y contratos existentes.

- `GRUPOS EN PROCESO` / card → cards operativas de grupos AMA con estado, fecha, ocupación, checklist y responsable.
- `CALENDARIO` → ruta compatible con `OperationalCalendar`, accesible desde el selector AMA.
- `Tabla de aplicantes` → información tabular conservada en el detalle de grupo; no se inventó un agregado sin endpoint.
- `Vuelos y hoteles` y `Dilitours` / gallery → hub de Logística con accesos únicamente a Vuelos, Itinerarios, Cotizaciones y Aerolíneas existentes.
- `vuelos_proximos` / calendar → calendario de itinerarios como vista inicial de Vuelos; la bandeja anterior permanece como Lista.
- `Catalogo de Hoteles`, `Gestion_tours` y `Todos los grupos` → documentados, sin falsa implementación mientras las rutas actuales sigan siendo placeholders y no haya contratos de datos equivalentes.

El CRUD existente de grupos, itinerarios y cotizaciones se conserva. No se modificó backend ni se ejecutó SQL.
