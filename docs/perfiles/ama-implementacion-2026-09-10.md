# Implementación incremental AMA — 10 de septiembre de 2026

Implementada en el workspace. Las migraciones se ejecutaron exclusivamente en PostgreSQL 17 local, aislado, con datos sintéticos. No se desplegó la aplicación ni se ejecutaron migraciones en producción. No se modificaron datos históricos reales ni autenticación global.

## 1. Archivos modificados y creados

Rutas relativas a la raíz del repositorio. El repositorio ya tenía numerosos cambios y archivos sin seguimiento; esta lista identifica únicamente el trabajo de esta entrega.

Modificados:

- `backend/src/services/gruposAma.service.js`
- `backend/src/services/pagos.service.js`
- `backend/src/services/perfiles.service.js`
- `backend/src/routes/solicitudes.routes.js`
- `diligenciasinternacionalesinc/src/Components/AreaBandeja/AreaBandejaPage.js`
- `diligenciasinternacionalesinc/src/Pages/Empleado/GruposAmaPage.js`
- `diligenciasinternacionalesinc/src/features/solicitudes/pages/SolicitudesNuevoPage.jsx`

Creados:

- `backend/src/services/amaActividad.service.js`
- `backend/src/services/solicitudNotas.service.js`
- `backend/src/services/pagosResumen.sql.js`
- `backend/src/templates/perfilAmaLegacy.template.js` — copia de referencia del contenido del seed anterior, sin ejecutar ese seed.
- `backend/src/templates/perfilAmaV2.template.js`
- `backend/scripts/audit-ama-actividad.js`
- `backend/scripts/generate-perfil-ama-v2-sql.js`
- `backend/sql/2026_09_10_ama_actividad_notas.sql`
- `backend/sql/2026_09_10_perfil_ama_v2.sql`
- `backend/test/amaActividad.test.js`
- `backend/test/perfilAmaV2.test.js`
- `backend/test/fixtures/ama-schema.sql`
- `diligenciasinternacionalesinc/src/Components/AreaBandeja/AmaActivitySummary.jsx`
- `diligenciasinternacionalesinc/src/Components/AreaBandeja/AmaSolicitudActivity.jsx`
- `diligenciasinternacionalesinc/src/Components/AreaBandeja/SolicitudReviewNotes.jsx`
- `diligenciasinternacionalesinc/src/Components/AreaBandeja/AmaActivitySummary.test.jsx`
- `diligenciasinternacionalesinc/src/Components/AreaBandeja/SolicitudReviewNotes.test.jsx`
- Este informe.

Artefactos locales de validación: `backend/reports/ama-test-db` y `diligenciasinternacionalesinc/build-ama-validation`. No forman parte del código a desplegar.

## 2. Endpoints

| Endpoint | Cambio |
|---|---|
| `GET /api/grupos-ama/candidatos` | Actividad, elegibilidad, motivo y estado del último pago por solicitud |
| `GET /api/grupos-ama/:idGrupo/solicitudes` | Mismo resumen en integrantes |
| `GET /api/grupos-ama/:idGrupo` | Integrantes enriquecidos en el detalle |
| `POST /api/grupos-ama/:idGrupo/solicitudes` | Revalidación transaccional; HTTP 409 con detalle para inactividad o base ausente |
| `PATCH /api/grupos-ama/:idGrupo` | Serializa edición de cupo con altas concurrentes |
| `GET /api/solicitudes/:idSolicitud/actividad-ama` | Nuevo: consulta individual del mismo cálculo |
| `GET /api/solicitudes/:idSolicitud/notas` | Nuevo: historial completo, sin filtro por autor o área |
| `POST /api/solicitudes/:idSolicitud/notas` | Nuevo: inserción con autor de sesión verificada |

Se reutilizan los endpoints existentes de lectura/creación de perfil, edición de perfil y versiones. Finanzas conserva su contrato; comparte el fragmento de orden del último pago con AMA.

## 3. Tablas utilizadas

Actividad: `solicitudes`, `seguimientos`, `actividades_solicitud`, `perfiles_solicitud`, `perfiles_solicitud_versiones`, `documentos`, `pagos`.

Notas: `notas_solicitud`, `empleados`, `solicitudes`.

Grupos y presentación existentes: `grupos_ama`, `grupo_ama_solicitudes`, `grupo_ama_checklist`, `clientes`, `contacto`, `tipos_tramite`, `catalogo_paises`, `catalogo_estatus`, `empleados`.

Perfil: `perfil_plantillas`, `perfiles_solicitud`, `perfiles_solicitud_versiones`, y `perfil_respuestas_repetibles` mediante el motor existente. No se agrega ninguna tabla de negocio.

## 4. Cálculo exacto

Una sola consulta, `ACTIVITY_SQL` en `amaActividad.service.js`, sirve a candidatos, integrantes, consulta individual y validación de altas.

1. `fecha_base` toma la más antigua de la columna de asignación y el primer `seguimientos.origen='asesor_asignado'` con responsable y fecha. Se usa la primera asignación para impedir que una reasignación rejuvenezca el expediente.
2. La columna nueva de asignación es `TIMESTAMPTZ`; se convierte al horario civil de la sesión PostgreSQL. Las fechas `DATE` de seguimientos y pagos históricos se interpretan al comienzo de ese día. Los `TIMESTAMP` locales se comparan como horario civil, igual que los escritores existentes que guardan `NOW()` en esos campos. La respuesta incluye `zona_horaria`.
3. Se reúne la base con los eventos de la sección siguiente. Se descartan fechas nulas y futuras y se selecciona el máximo. En empates se ordena por etiqueta de actividad para una respuesta estable.
4. `fecha_limite = ultima_actividad_valida + INTERVAL '6 months'` en PostgreSQL, con ajuste de fin de mes. No se usan 180 días.
5. Es elegible únicamente con base confiable no futura y `fecha_limite > CURRENT_TIMESTAMP` en el horario civil correspondiente. La igualdad ya bloquea.
6. Motivos: `SIN_FECHA_BASE`, `FECHA_BASE_FUTURA`, `SIN_ACTIVIDAD_6_MESES`; nulo cuando cumple. También se devuelven última actividad, tipo, fecha límite y días aproximados sin movimiento. Los días son informativos y no gobiernan el bloqueo.

Tener actividad reciente no elimina `SIN_FECHA_BASE`. No se usa `fecha_inicio`, el momento de migración, `actualizado_en` ni `fecha_ultimo_movimiento` como sustituto de asignación.

## 5. Eventos considerados

| Tipo | Evidencia y fecha |
|---|---|
| Asignación de asesor | Base descrita arriba; primera asignación futura de responsable en AMA capturada por trigger |
| Creación de perfil | Primera versión existente, `perfiles_solicitud_versiones.creado_en` |
| Actualización de perfil | Versión cuya respuesta JSON, snapshot de repetibles o estado cambia respecto de la anterior; usa `creado_en` de esa versión |
| Carga de documento | `documentos.origen_documento='documento_requerido'`, `fecha_subida`; incluye carga adicional por ese flujo |
| Registro de pago | `pagos.creado_en` para registros sin `source_id`; para importados con `source_id`, únicamente `fecha_pago`, evitando fechas técnicas de importación |
| Validación de pago | `pagos.fecha_validacion` cuando `estado_pago='validado'`; además el historial `pago_inicial_validado`, conservando evidencia si después cambió el estado del pago |
| Contacto o análisis | `actividades_solicitud.fecha_actividad` para `LLAMADA`, `WHATSAPP`, `CORREO`, `REUNION`, `INTENTO_CONTACTO`, `RESPUESTA_CLIENTE`, `ANALISIS` |
| Seguimiento operativo | `seguimientos.fecha_seguimiento`, origen `seguimiento_operativo`, incluso sin cambio de estado |
| Cambio real de estado | Estados anterior y nuevo no nulos y distintos, en los orígenes de negocio enumerados debajo |

Orígenes de estado incluidos: `cambio_estado`, `edicion_expediente`, `aprobado`, `negado`, `pago_rechazado`, `enviado_a_finanzas`, `enviado_a_ama`, `enviado_a_individuales`, `enviado_a_legal`, `enviado_a_logistica`, `enviado_a_protocolos`, `enviado_a_negados`, `enviado_post_pago`.

Un envío que sólo cambia área no cuenta. Tampoco cuentan notas, lecturas, login, timestamps automáticos, reasignaciones, sincronizaciones, metadatos/PDF de Drive, importación técnica de documentos, ni un guardado idéntico de perfil. QuickBooks no escribe pagos en los servicios locales revisados; su sincronización no participa en el cálculo.

No se encontró una operación genérica de validación documental con fecha propia ni una reactivación explícita del mismo expediente en el flujo revisado. No se inventaron esos eventos. Reaplicación crea otra solicitud y no se trata como reactivación de la original. Los orígenes desconocidos no renuevan por defecto.

## 6. Validación backend

El alta abre transacción, bloquea el grupo, verifica cupo y grupo activo, ordena los IDs para un orden de bloqueo estable, bloquea cada solicitud y ejecuta `assertElegible` con la misma conexión. Conserva la validación de área AMA y pertenencia a otro grupo. Un expediente bloqueado provoca rollback del lote completo. Las ediciones de cupo usan el mismo bloqueo de grupo.

La consulta del frontend nunca sustituye la validación al insertar. Los errores 409 incluyen `error.details` con la actividad y motivo de la solicitud bloqueada.

## 7. Frontend

Candidatos e integrantes muestran fecha de último movimiento, tipo, elegibilidad y estado del último pago. Los candidatos inelegibles tienen el checkbox deshabilitado; sin selección válida el alta no está disponible. Se usan los mensajes solicitados, con explicación específica para fecha base ausente o futura.

Al recuperar foco, la lista de candidatos vuelve a consultar backend y elimina selecciones que ya no sean válidas. Un fallo de consulta limpia candidatos y selección. La ficha AMA consulta el endpoint individual; se refresca al recuperar foco y después de guardar perfil. No hay aritmética de seis meses en React.

## 8. Notas del Revisor

Se reutiliza `notas_solicitud`, con contexto `REVISOR` para notas nuevas. Sólo se exponen lectura e inserción, sin edición ni sobrescritura. Correcciones se registran como otra nota. Se conservan fecha, contenido y snapshots de nombre y área del autor.

El POST verifica la sesión con `auth.service.verify`; no toma autor del formulario ni del encargado de la solicitud. El GET conserva el alcance de acceso de las rutas actuales del expediente. No se modifica autenticación global.

Para notas anteriores sin snapshot se muestra el autor referenciado, si existe, y se etiqueta el área consultada como actual, no histórica. Las observaciones heredadas siguen visibles con aviso de que autor, fecha y área originales no están registrados. Las notas no aparecen en la consulta de actividad.

## 9. Estatus de pago

El orden compartido en `pagosResumen.sql.js` es `p.creado_en DESC NULLS LAST, p.id_pago DESC`, igual al criterio existente de Finanzas por solicitud. AMA muestra el valor real `registrado`, `validado` o `rechazado`, o ausencia de pagos. No se agregó estado manual AMA ni se interpreta `validado` como saldo liquidado.

## 10. Ver/Editar perfil

Bandeja AMA, candidatos e integrantes tienen accesos por `id_solicitud` a Ver/Editar. Los parámetros `perfil=ver` y `perfil=editar` abren la acción una vez que carga el perfil correcto. Si no existe, el expediente conserva la acción Crear perfil.

Se mantiene el renderer dinámico, respuestas JSON, repetibles y versiones. Se corrigió además la inicialización de `inspection.errors` para que crear/editar perfiles legacy no falle por esa propiedad ausente.

La nueva plantilla V2 conserva todas las claves del seed, documentos requeridos y valores almacenados de las opciones. Ajusta otro nombre a texto largo, etiqueta, condición y orden documentados; la condición no se convierte en obligatoriedad. Estado civil usa orden y etiquetas AppSheet con los valores antiguos. La resolución existente selecciona la versión activa más alta para perfiles nuevos; los existentes siguen vinculados a su plantilla anterior.

## 11. Diferencias pendientes frente a AppSheet

La adaptación aplica los cambios comprobados de información general. No certifica paridad de todas las preguntas, condiciones o referencias de los PDF, ni del AppSheet vigente. Familiares en EE. UU. sigue con los campos históricos de texto de la plantilla AMA; su conversión a tabla repetible requiere completar el mapeo documentado y la política de convivencia de respuestas. No se transforman respuestas antiguas automáticamente ni se cambia su plantilla.

## 12. Pruebas

- PostgreSQL 17 aislado: 17 pruebas de integración aprobadas. Límite exacto y segundo anterior, fin de mes y bisiesto, base ausente/histórica/futura, zona, notas y snapshots, exclusiones administrativas/Drive, versiones idénticas y distintas, documentos/contactos/estados, pagos múltiples/importados e historial de validación, primera asignación, SQL de plantilla idempotente, rollback de lotes, concurrencia de cupo/pertenencia y reducción de cupo.
- Plantilla AMA V2 y motor existente: 9 pruebas aprobadas.
- React: 3 pruebas aprobadas para mensajes/fechas y notas sin sobrescribir, autor de sesión y observaciones heredadas.
- `node --check` en servicios y rutas modificados: aprobado.
- ESLint de los seis archivos frontend de implementación intervenidos: aprobado, sin advertencias de código en esos archivos.
- Build React: completado en `build-ama-validation`, con advertencias de lint en otros componentes y base Browserslist antigua. Se eliminó el import de icono que quedó sin usar al reemplazar la tarjeta de notas.

Comandos de reproducción:

```powershell
# Sólo contra el clúster local de pruebas en 127.0.0.1:55439, usuario ama_test.
cd backend
node --test test/amaActividad.test.js test/perfilAmaV2.test.js test/perfilesEngineV2.test.js

cd ../diligenciasinternacionalesinc
$env:CI='true'
npm.cmd test -- --watchAll=false --runInBand --runTestsByPath src/Components/AreaBandeja/AmaActivitySummary.test.jsx src/Components/AreaBandeja/SolicitudReviewNotes.test.jsx
```

El test de integración crea una base nueva de nombre `ama_test_<timestamp>` con datos sintéticos; no lee `.env` ni conecta a producción. La prueba no sustituye una integración contra el esquema realmente desplegado.

## 13. SQL generado y propósito

- `backend/sql/2026_09_10_ama_actividad_notas.sql`: agrega fecha de asignación y snapshots de notas; instala captura de primera asignación futura. No rellena filas históricas. Comprueba el tipo de una columna de asignación preexistente antes de continuar.
- `backend/sql/2026_09_10_perfil_ama_v2.sql`: inserta seis plantillas nuevas V2, con clave independiente y `ON CONFLICT DO NOTHING`. No actualiza plantillas ni perfiles anteriores. Regenerable con `node backend/scripts/generate-perfil-ama-v2-sql.js`, que sólo escribe el archivo.

Su propósito se explicó antes de ejecutarlas en la base local. Ambas siguen sin aplicarse en producción. El backend de esta entrega necesita la migración de actividad/notas antes de desplegarse.

## 14. Puntos no confirmados

La auditoría remota de sólo lectura falló con `EACCES` y, al reintentar fuera de esa restricción, con timeout. Por ello no se puede afirmar cuántos expedientes AMA carecen de base, qué tipos exactos están desplegados o cuál ha sido la zona histórica de sus timestamps. `backend/scripts/audit-ama-actividad.js` consulta exclusivamente metadatos y conteos agregados para completar esa revisión cuando haya conectividad.

La estructura usada está respaldada por código/migraciones locales y probada contra el esquema sintético. Antes de desplegar falta contrastarla con producción, particularmente asignación histórica, zona horaria, snapshots de versiones y orígenes importados. Los registros sin base quedarán bloqueados aunque tengan otro movimiento reciente. No se inventa una solución mediante backfill.

No se realizó una sesión visual end-to-end con datos de producción. La deuda de autorización por expediente en rutas antiguas permanece fuera del alcance. No se pidió ni se ejecutó despliegue.
