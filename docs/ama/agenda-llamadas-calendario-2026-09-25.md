# Agenda de llamadas y calendario AMA

## Referencia AppSheet

Se revisaron directamente `Application Documentation.pdf` y `Application Documentation Formularios.pdf`. La intención recuperada es la acción **AGENDAR LLAMADA**, su relación con el aplicante, la fecha de asesoría y los asesores, junto con el calendario y los eventos relacionados con grupos.

## Modelo

`ama_llamadas_agendadas` representa una cita futura. Tiene FK a solicitud y empleado; la FK a grupo AMA es opcional y se valida contra la membresía activa. Guarda fecha civil `DATE`, hora local `TIME`, tipo, notas, estado simple y timestamps. No usa `actividades_solicitud`, porque esa entidad registra actividad realizada, ni `seguimientos`, que carece de hora y estado de agenda.

La migración aditiva `backend/sql/2026_09_25_ama_agenda_llamadas.sql` no fue ejecutada.

## API y calendario

- `GET /api/calendario-ama/llamadas`: rango, responsable y grupo.
- `POST /api/calendario-ama/llamadas`: agenda una llamada.
- `PATCH /api/calendario-ama/llamadas/:idLlamada`: reprograma, cambia responsable/notas o estado.

El calendario combina llamadas persistidas con salidas tentativas/confirmadas derivadas de `grupos_ama`. Los filtros Responsable, Grupo y Tipo son combinables. El rango de llamadas corresponde al mes visible. Los eventos grupales no se duplican en base de datos.

## Login futuro

Hoy el responsable se selecciona expresamente del catálogo real de empleados. No se consulta identidad de sesión ni se modificó autenticación. En el futuro el formulario puede recibir un `id_empleado` predeterminado y habilitar “Mis llamadas” sin cambiar el modelo.
