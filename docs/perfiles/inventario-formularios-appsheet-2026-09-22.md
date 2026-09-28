# Inventario de formularios AppSheet — 2026-09-22

## Alcance y criterio

Este inventario es exclusivamente documental. No modifica el motor de perfiles, frontend, backend funcional, SQL, base de datos, producción ni autenticación.

Se revisaron las exportaciones de documentación AppSheet disponibles en `backend/reports/ama-audit`, incluidas Formularios, Informes y Pagos, Legales, Negados, Visas individuales, AMA y Logística DiliTours. También se contrastaron las plantillas, semillas, generadores de SQL y matrices existentes en `backend/src/templates`, `backend/scripts` y `docs/perfiles`.

Para evitar falsos positivos se aplicó este criterio:

- **Perfil/cuestionario principal:** captura estructurada de respuestas de una persona o de evaluación de un servicio y puede tratarse como una unidad de formulario.
- **Subformulario/repetible:** entidad hija que permite cero o más registros dentro del contexto de un perfil.
- **Formulario operativo:** captura citas, flujo, asignaciones, seguimiento, pagos, logística o administración; no constituye un perfil dinámico.
- **Catálogo/tabla técnica:** fuente de opciones, configuración, salida de automatización o dato auxiliar; no es formulario candidato.
- Las tablas `Process Table` y `Output` se descartaron como artefactos de automatización, no como formularios de usuario.

## Resultado ejecutivo

| Métrica | Total exacto | Composición |
|---|---:|---|
| Perfiles o cuestionarios principales reales encontrados | **6** | AMA, Visa Individual, Pasaporte, ETA, Encuesta de satisfacción y el cuestionario faltante de Visa Canadiense |
| Ya trabajados | **4** | AMA, Visa Individual, Pasaporte y ETA |
| Pendientes con fuente documental suficiente | **1** | Encuesta de satisfacción |
| Pendientes sin fuente documental suficiente | **1** | Visa Canadiense |
| Subformularios/repetibles de perfil identificados | **5** | Familiares AMA, Estudios AMA por verificar, Familiares Visa, Redes sociales e Ingresos a Estados Unidos |
| Tablas operativas descartadas como perfil | **31** | Enumeradas en la sección de descarte operativo |

La siguiente implementación candidata, cuando se autorice una fase posterior, es **Encuesta de satisfacción**. Tiene un esquema físico completo de 13 columnas y relaciones documentadas. Este inventario no inicia esa implementación.

## Inventario final de candidatos

| FORMULARIO / TABLA | APPSHEET | FUNCIÓN REAL | YA MIGRADO | NECESITA PLANTILLA | DEPENDENCIAS | SIGUIENTE ACCIÓN |
|---|---|---|---|---|---|---|
| `PERFILES AMA` | Formularios / AMA | Cuestionario migratorio y biográfico principal AMA; 130 columnas físicas y secciones virtuales en la fuente más completa | Sí, V3 | No | `APLICANTES AMA PERFILES`; `FAMILIARES EN EE. UU` | Mantener como referencia; no reimplementar |
| `PERFIL VISA INDIVIDUAL` | Visas individuales | Cuestionario DS-160/visa estadounidense | Sí, V3 | No | `APLICANTES VISA IND`; familiares, redes e ingresos repetibles | Mantener como referencia; no reimplementar |
| `PERFIL PASAPORTES` | Formularios / Pasaportes | Cuestionario para trámite de pasaporte | Sí, V2 | No | `APLICANTES PASAPORTES`; variantes México/Guatemala | Mantener como referencia; no reimplementar |
| `PERFIL ETA` | Formularios / ETA | Cuestionario de autorización electrónica de viaje | Sí, V1 | No | `ETA` | Mantener como referencia; no reimplementar |
| `encuesta_satisfaccion` | Informes y Pagos; también referenciada por AMA, Visas y Logística | Cuestionario autónomo de satisfacción, calidad, tiempos, utilidad y recomendación | No | **Sí** | `id_aplicante` → `INFORMES` en la fuente tipada; `id_asesor` → `ASESORES`; resultado `aprobado_negado` | **Siguiente candidato**: auditar escalas y Enum antes de diseñar plantilla |
| Cuestionario de **Visa Canadiense** | No localizado como tabla de respuestas en las exportaciones | Perfil/cuestionario principal requerido por el trámite canadiense | No | Sí, pero falta fuente | La tabla existente `VISA CANADIENSE` sólo administra el caso; las automatizaciones dicen “llenar visa canada”, pero no contienen las preguntas | Conseguir exportación AppSheet o fuente oficial del cuestionario; no inferir campos desde la tabla operativa |
| `FAMILIARES EN EE. UU` | AMA | Repetidor de familiares asociado al perfil AMA | Sí, dentro del trabajo AMA | No | `ID APLICANTE` Ref/`IsAPartOf`; `REF_ROWS` desde `PERFILES AMA` | Mantener dentro de AMA |
| `estudios` | AMA | Registro de estudios potencialmente repetible | No confirmado | Por verificar | Conserva `id_aplicante` como texto, pero la documentación revisada no demuestra Ref, `IsAPartOf` ni `REF_ROWS` | Verificar si sigue activo o es una tabla huérfana antes de cualquier migración |
| `FAMILIARES EN EEUU` | Visas individuales | Repetidor de familiares para Visa Individual | Sí, dentro de Visa V3 | No | Ref/`IsAPartOf` hacia el perfil de Visa Individual | Mantener dentro de Visa Individual |
| `REDES SOCIALES` | Visas individuales | Repetidor de redes sociales | Sí, dentro de Visa V3 | No | Relación hija del perfil de Visa Individual | Mantener dentro de Visa Individual |
| `INGRESOS A ESTADOS UNIDOS` | Visas individuales | Repetidor de entradas o viajes a Estados Unidos | Sí, dentro de Visa V3 | No | Relación hija del perfil de Visa Individual | Mantener dentro de Visa Individual |

## A. Perfil principal ya trabajado

Los cuatro perfiles principales con implementación documental y plantillas actuales son:

1. `PERFILES AMA` → `perfilAmaV3.template.js`.
2. `PERFIL VISA INDIVIDUAL` → `perfilVisaIndividualV3.template.js`.
3. `PERFIL PASAPORTES` → `perfilPasaporteV2.template.js`.
4. `PERFIL ETA` → `perfilEtaV1.template.js`.

Las versiones legacy/V2 y las semillas antiguas no representan formularios nuevos: son versiones previas o mecanismos de carga del mismo perfil.

## B. Perfil principal pendiente con fuente suficiente

### `encuesta_satisfaccion`

La tabla documenta un cuestionario real y autocontenido con **13 columnas físicas**, sin columnas virtuales ni listas hijas:

| Grupo | Campos documentados |
|---|---|
| Identidad | `_RowNumber`, `id_respuesta` |
| Escalas numéricas | `satisfaccion_general`, `claridad_informacion`, `calidad_atencion`, `tiempo_respuesta`, `utilidad_asesoria`, `probabilidad_recomendacion` |
| Respuesta abierta | `fortalezas_servicio`, `punto_mejora` |
| Relaciones | `id_aplicante`, `id_asesor` |
| Resultado | `aprobado_negado` |

La fuente es suficiente para reconocer el formulario, sus tipos y relaciones. Antes de implementarlo se deben confirmar las escalas permitidas de los campos Number, las opciones del Enum y qué tabla de solicitantes debe usarse en el sistema nuevo. No se debe asumir que una escala numérica es 1–5 o 0–10 porque esa restricción no quedó demostrada por la exportación revisada.

## C. Perfil principal pendiente sin fuente suficiente

### Visa Canadiense

La auditoría existente confirma que `VISA CANADIENSE` es una tabla operativa de seguimiento, no el cuestionario del solicitante. Sus campos administran identidad básica, asesoría, estatus y flujo. Las acciones y automatizaciones con nombres como `llenar visa canada` prueban que el trámite existe, pero no aportan el conjunto de preguntas del perfil.

Por ello no se puede construir una plantilla fiel con la evidencia local. La fuente faltante debe ser una de estas:

- exportación actual de **AppSheet > Documentation** que incluya la tabla real de respuestas;
- definición de columnas, tipos, `Show_If`, `Required_If`, `Valid_If`, opciones y referencias;
- formulario oficial vigente aceptado como fuente funcional por el responsable del trámite.

No deben deducirse preguntas desde nombres de acciones, desde `VISA CANADIENSE` ni desde otro perfil migratorio.

## D. Subformularios y repetibles

El total de **5** cuenta sólo entidades de datos personales vinculadas o potencialmente vinculadas a un perfil. No incluye hijos de cotización, itinerarios, vuelos, hoteles ni tours, porque pertenecen a operación logística.

`estudios` queda en **REQUIERE VERIFICACIÓN**: parece una entidad hija por su contenido y por `id_aplicante`, pero la exportación disponible no demuestra una relación AppSheet activa. Esto evita convertir una tabla posiblemente obsoleta en un perfil nuevo.

## E. Formularios operativos descartados como perfil

Se descartaron exactamente estas **31 tablas operativas**. Pueden tener vistas Form o columnas condicionales, pero su propósito es administrar expedientes, citas, flujo, grupos, seguimiento o logística:

1. `APLICANTES AMA`
2. `APLICANTES AMA PERFILES`
3. `APLICANTES VISA IND`
4. `APLICANTES PASAPORTES`
5. `ETA`
6. `INFORMES`
7. `legal`
8. `NEGADOS`
9. `negados ind`
10. `NotasProtocolo`
11. `check_ds`
12. `Fecha de asesoria`
13. `Nuevo tramite`
14. `GRUPOS AMA`
15. `REALIZADOS GRUPOS AMA`
16. `CALENDARIO`
17. `CITAS CAS`
18. `CITAS CONSULADO`
19. `CITAS PASAPORTES`
20. `HISTORIAL DE TRAMITES`
21. `grupo_asignado`
22. `logistica_viajes`
23. `clientes_tours`
24. `tours_cliente`
25. `cotizaciones_vehiculos`
26. `cotizaciones_vuelo`
27. `itinerario`
28. `pagos_cotizacion_vehiculos`
29. `vuelos`
30. `hoteles_principal`
31. `hoteles_detalles`

La tabla operativa `VISA CANADIENSE` se documenta en la categoría C porque evidencia el trámite cuyo cuestionario falta. Se excluye del total anterior para evitar contar dos veces el mismo hallazgo, pero también queda expresamente descartada como fuente de un perfil.

### Tablas y artefactos excluidos antes de la lista operativa

Los siguientes elementos no entran en ninguno de los conteos de perfiles o subformularios:

- Catálogos y maestros: `ASESORES`, `CONTACTO`, `PAISES`, `TRAMITES`, `aerolineas`, `aeropuertos`, `catalogo_tours`, `Hotel`, `tours`, `vehiculos`.
- Navegación/configuración: `_Per User Settings`, `menu`, `VISTAS`.
- Salidas documentales: `Pdf_perfil`, `generar_pdf_individual`, `Pdf_cotizacion`, `Pdf_itinerario`.
- Esquemas con sufijo `Output` y `Process Table`: pasos internos de bots y procesos AppSheet.

## Plantillas o semillas huérfanas

No se encontró una plantilla actual que revele otro formulario AppSheet pendiente. Los archivos legacy y semillas existentes corresponden a los mismos cuatro perfiles ya trabajados:

- `perfilAmaLegacy.template.js`, `perfilAmaV2.template.js` y semillas AMA: versiones anteriores de AMA.
- `perfilVisaIndividualV2.template.js` y semillas Visa: versiones anteriores de Visa Individual.
- semillas de Pasaporte México/Guatemala: variantes de carga del perfil Pasaporte.
- `seed-perfil-demo-v2.js`: demostración técnica, sin contraparte de cuestionario AppSheet.

Ninguno debe contarse como un perfil adicional.

## Dictamen

El inventario no revela otro perfil principal completo y pendiente además de **Encuesta de satisfacción**. **Visa Canadiense** sigue pendiente, pero bloqueada documentalmente hasta obtener el cuestionario fuente. Las demás tablas con apariencia de formulario corresponden a subformularios ya absorbidos por perfiles, flujo operativo, logística, catálogos o automatizaciones.
