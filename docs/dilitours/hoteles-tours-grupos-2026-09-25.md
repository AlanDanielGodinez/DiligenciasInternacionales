# Auditoría funcional: Hoteles, Tours y Grupos de viaje

Fuente revisada directamente: `docs/appsheet/Application Documentation Logistica dilitours.pdf`.

## Hoteles — BLOQUEADO

El documento distingue `hoteles_principal`, que representa reservaciones por aplicante, de una vista llamada `Catalogo de Hoteles`. La definición disponible no expone el contrato del catálogo (nombre, ubicación, contacto, servicios o imágenes). No se creó una entidad ni una interfaz con campos inventados. El hotel de itinerario permanece como texto y el acceso de catálogo no se habilitó en el hub.

## Tours — PARCIAL hasta instalar SQL

Se implementaron listado cronológico, agrupación por el estado calculado de AppSheet, alta, edición y calendario derivado de salida/regreso. El formulario usa los campos documentados: nombre, fechas, capacidad, cuatro costos, descripción, notas, lugar y gastos fijos. El código queda listo; la persistencia requiere ejecutar manualmente el SQL pendiente.

## Grupos de viaje — PARCIAL hasta instalar SQL

Se implementó una entidad distinta de Grupos AMA, con nombre, fechas, notas, indicador de regreso, integrantes, filtros y calendario. Se pueden incorporar solicitudes presentes en la vista global de aplicantes AMA sin copiar su información. El código queda listo; la persistencia requiere ejecutar manualmente el SQL pendiente.

## Integración revisada

La documentación contiene vistas de aprobados individuales y relaciones de `logistica_viajes`; esto confirma el punto de integración, pero no define una automatización inequívoca para crear reservaciones, tours o grupos. No se añadió automatización inferida.

## Instalación pendiente

`backend/sql/2026_09_25_logistica_tours_grupos.sql` crea únicamente las tablas e índices nuevos. No fue ejecutado contra ninguna base de datos.
