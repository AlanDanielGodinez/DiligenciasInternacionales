# Auditoría — Perfil Visa Individual V2

Fuente única: `docs/appsheet/Application Documentation Visas inv.pdf`, generado el 17/08/2026.

Bloques revisados:

- `PERFIL VISA INDIVIDUAL_Schema`: páginas 266–390.
- `FAMILIARES EN EEUU_Schema`: páginas 159–164.
- `REDES SOCIALES_Schema`: páginas 399–403.
- `INGRESOS A ESTADOS UNIDOS_Schema`: páginas 404–408.
- `APLICANTES VISA IND_Schema`: páginas 33–63, sólo para contexto y detección de datos canónicos.

## Conteo y destino

| Origen | Columnas históricas | Destino |
|---|---:|---|
| PERFIL VISA INDIVIDUAL | 160 | Campos escalares, controles de condición y tres contenedores repetibles V2 |
| FAMILIARES EN EEUU | 7 | 4 campos dentro de `familiares_eeuu` |
| REDES SOCIALES | 5 | 2 campos dentro de `redes_sociales_detalle` |
| INGRESOS A ESTADOS UNIDOS | 7 | 3 campos confirmados dentro de `ingresos_estados_unidos` |
| Total histórico | 179 | 151 definiciones V2: 142 campos/contenedores y 9 campos hijos |

La relación completa y ejecutable `Campo AppSheet → key V2 → label → section → type → required → show_if → required_if → options → destino` está en
`backend/src/templates/perfilVisaIndividualV2.template.js`. Cada definición conserva `source_column`; cuando la clave fue normalizada se declara explícitamente. Los repeaters conservan `source_table`.

## Secciones y claves V2

| Sección | Campos superiores | Claves |
|---|---:|---|
| Información general | 7 | `ha_usado_otro_nombre_o_lo_ha_modificado`, `cual_fue_su_otro_nombre`, `estado_civil`, `tiene_alguna_otra_nacionalidad`, `cual_es_su_otra_nacionalidad`, `tiene_alguna_discapacidad`, `cual_es_su_discapacidad` |
| Datos del viaje | 6 | `fecha_tentativa_de_llegada`, `duracion`, `cual_es_el_motivo_de_su_viaje`, `domicilio_donde_va_a_llegar_a_estados_unidos`, `parentesco`, `con_quienes_viaja_a_estados_unidos_y_cual_es_su_parentesco` |
| Pagador del viaje | 6 | `usted_pagara_por_su_viaje` y cinco datos condicionales del pagador |
| Entradas y viajes anteriores a EE. UU. | 5 | `ha_entrado_a_estados_unidos`, `ingresos_estados_unidos` y antecedentes de ingreso/deportación |
| Peticiones migratorias | 3 | pregunta principal, peticionario/tipo y motivo de rechazo |
| Delitos y sentencias | 7 | pregunta principal, delito, sentencia, lugar, fecha y explicación |
| Visa anterior | 15 | otorgamiento, fechas, tipo, número, consulado, huellas, pérdida/robo, cancelación y admisión |
| Visa negada | 6 | negación, lugar, fecha, observaciones y declaración previa |
| Domicilio y teléfonos | 5 | localidad, municipio, código postal, teléfono de hogar y empleo |
| Redes sociales | 2 | control principal y repeater `redes_sociales_detalle` |
| Pasaporte | 3 | lugar de trámite y pérdida/robo histórico |
| Contacto en EE. UU. | 6 | nombre, parentesco, teléfono, domicilio, correo y estatus |
| Padres y familiares | 15 | padre, madre, controles familiares, repeater `familiares_eeuu` e hijos nacidos en EE. UU. |
| Cónyuge y divorcios | 8 | cónyuge, nacimiento, divorcios, fechas y domicilio |
| Empleo actual | 14 | situación, ocupación, empleador, dirección, sueldo, descripción y fecha |
| Empleos anteriores | 15 | control y un bloque histórico escalar de empleo anterior |
| Estudios | 14 | estudio actual/anterior documentado como dos bloques escalares |
| Viajes a otros países | 2 | control y países visitados |
| Organizaciones e idiomas | 2 | organización e idiomas |
| Consulados disponibles | 1 | consulados posibles |

## Repeaters confirmados

| Tabla AppSheet | Repeater V2 | Campos hijos confirmados |
|---|---|---|
| FAMILIARES EN EEUU | `familiares_eeuu` | `apellidos`, `nombre`, `estatus`, `relacion` |
| REDES SOCIALES | `redes_sociales_detalle` | `red_social`, `nombre_usuario` |
| INGRESOS A ESTADOS UNIDOS | `ingresos_estados_unidos` | `fecha_ingreso`, `duracion`, `tiempo` |

Empleos anteriores y estudios no son tablas relacionadas ni listas en el PDF. Viajes a otros países es `EnumList`, no un registro estructurado. No se convirtieron en repeaters.

## Datos canónicos no duplicados

No se persisten de nuevo en `respuestas_json`:

| Dato histórico/contextual | Fuente actual | Presentación |
|---|---|---|
| Nombre del aplicante | `clientes.nombre`, apellidos | panel precargado |
| Fecha de nacimiento | `clientes.fecha_nacimiento` | panel precargado |
| Teléfono del aplicante | `clientes.telefono` | panel precargado |
| Correo del aplicante | `clientes.correo` | panel precargado |
| País | `clientes.id_pais → catalogo_paises` | panel precargado |
| Domicilio registrado | `clientes.direccion`, estado y ciudad | panel precargado |

Se conservaron localidad, municipio, código postal, teléfono de hogar y teléfono de empleo porque no tienen una fuente canónica equivalente completa.

## Required y condiciones

El PDF declara `Required_If: null` en los campos históricos recuperados. Para evitar afirmar que AppSheet los hacía obligatorios, la auditoría distingue:

- `required`: 22 preguntas discriminadoras que determinan ramas o repeaters y hacen determinista la completitud V2.
- `required_if`: 90 campos cuyo requisito V2 deriva exclusivamente de un `Show_If` histórico confirmado.
- Las preguntas sin respaldo de condición permanecen opcionales.

Las condiciones traducidas preservan únicamente expresiones observadas: respuestas sí/no, estado civil, situación laboral y pertenencia a `Sí/Estudiante`.

## Enums confirmados

- Estado civil: Casado, Soltero, Viudo, Divorciado, Legalmente separado, Unión libre.
- Situación laboral: Sí, No, Ama de casa, Estudiante.
- Estatus familiar: valores específicos documentados para padre, madre y familiar.
- Relación de familiar: Hijo, Hermano.
- Relación del contacto: Relative, Spouse, Friend, Business associate, Employer, School official, Other.
- Red social: Facebook, X, Instagram, Tik Tok.
- Duración de ingreso: Días, Semanas, Meses, Años, Menos de 24 horas.
- Idiomas: Español, Mam, Ingles.
- Países visibles en el `EnumList`: México y Colombia; AppSheet permite otros valores, por lo que V2 usa texto abierto y no restringe a esos dos.

## Omitidos y no confirmados

Se omitieron 31 columnas técnicas o no persistibles como respuesta independiente:

- `_RowNumber`, identificadores y referencias de unión.
- campos `Related...`, `REF_ROWS` y listas virtuales sustituidas por repeaters normalizados;
- encabezados `Show`, fórmulas, links y banderas de interfaz;
- datos canónicos ya disponibles en cliente/contacto/solicitud.

No pude confirmar:

- definición, tipo, etiqueta y reglas de `INGRESOS A ESTADOS UNIDOS.ilega_legal`; la página 408 termina justo después del nombre de columna;
- enum de consulados: `EnumValues` aparece vacío y admite valores externos;
- lista completa de países visitados: sólo aparecen México y Colombia y se permiten otros valores;
- multiplicidad real de empleos anteriores o estudios: el PDF sólo documenta bloques escalares;
- obligatoriedad histórica: todos los `Required_If` recuperados son nulos.

## Activación

La plantilla `perfil_visa_individual_v2`, versión 2, queda activa para `id_tipo_tramite=20`. El resolver existente selecciona la plantilla activa de mayor versión sólo cuando se crea un perfil nuevo. Un perfil existente conserva su `id_plantilla`; no hay migración automática ni sustitución de V1.
