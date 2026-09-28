# Inventario AppSheet INFORMES Y PAGOS — 2026-09-23

## Fuente canónica

La exportación canónica es `backend/reports/ama-audit/Application Documentation Negados.pdf.txt`. El nombre del archivo es incorrecto, pero el encabezado identifica la aplicación **INFORMES Y PAGOS**, app id `05b883d5-d795-4611-954e-f883b33bd36b`, versión `1.000888`, estable `1.000886`, generada el 17 de agosto de 2026.

AppSheet declara **39 tablas, 965 columnas, 7 slices, 63 vistas, 8 format rules, 120 actions y 0 workflow rules**. Las 39 tablas se dividen en **17 fuentes físicas** —16 de negocio más `_Per User Settings`— y **22 tablas internas de estado/salida de procesos**. Estas últimas no son entidades de negocio migrables.

## Flujo real AppSheet

```text
CONTACTO
  → INFORMES (aplicante + interés/trámite + estado de cotización/anticipo)
  → confirmación de anticipo
  → copia de datos a la hoja operativa del área
  → cambio de estados de pago en esa hoja
  → HISTORIAL DE TRAMITES
```

| Evento | Tabla origen | Action/proceso | Destino | Datos transferidos |
|---|---|---|---|---|
| Alta de interesado | CONTACTO | Form/Add | CONTACTO | nombre, teléfonos, correo |
| Alta de aplicante | CONTACTO/INFORMES | Form | INFORMES | contacto, nombre, apellidos, país, trámite, asesor, notas y archivos |
| Cotización realizada | INFORMES | `Cotización realizada` | misma fila | estado a envío de información pendiente |
| Información enviada | INFORMES | `Información enviada` | misma fila | falta de pago inicial + fecha |
| Anticipo confirmado | INFORMES | `Cobro realizado` | misma fila | pago inicial realizado + fecha + receptor |
| Ingreso AMA | INFORMES | `Action for AGREGAR HOJA A AMA` | APLICANTES AMA PERFILES | copia identidad, contacto, trámite, notas, teléfonos y estado |
| Ingreso Visa individual | INFORMES | action homónima | APLICANTES VISA IND | copia de identidad, contacto, trámite, país y notas |
| Ingreso Pasaporte | INFORMES | action homónima | APLICANTES PASAPORTES | copia de identidad, contacto, trámite principal/adicional y notas |
| Ingreso ETA | INFORMES | action homónima | ETA | copia de identidad |
| Ingreso Visa canadiense | INFORMES | action homónima | VISA CANADIENSE | copia de identidad, contacto y trámite |
| Ingreso Legal | INFORMES | `ENVIAR INFOMRACION A LEGAL` / `Área Legal` | legal | copia de identidad/contacto y origen Informes |
| Historial de alta | INFORMES | `registro_historial_tramites Action - 2` | HISTORIAL DE TRAMITES | fecha, aplicante, trámite, asesor, tipo `REGISTRO DE APLICANTE` |
| Historial de pago | INFORMES | `tb_registros_act Action - 1` | HISTORIAL DE TRAMITES | fecha, aplicante, trámite, asesor, tipo `PAGO DE TRAMITE` |

No hay evidencia de que cambiar el trámite conserve una instancia anterior: `PAGO REALIZADO` y `FECHA INICIO DE TRAMITE` se reinician cuando cambia `TRAMITE`. La arquitectura nueva debe crear otra solicitud cuando el cambio represente otro expediente.

## Entidades físicas

Las fuentes físicas de negocio son `INFORMES`, `TRAMITES`, `APLICANTES PASAPORTES`, `APLICANTES VISA IND`, `ETA`, `CONTACTO`, `APLICANTES AMA PERFILES`, `APLICANTES AMA`, `PERFILES AMA`, `FAMILIARES EN EE. UU`, `ASESORES`, `legal`, `VISA CANADIENSE`, `PAISES`, `HISTORIAL DE TRAMITES` y `VISTAS`.

Las 22 tablas técnicas pertenecen a procesos como envío de información, selección de área, creación de PDF, correo de pago completo, `QBKS_INF` y registro de historial. Sólo conservan estado o salida de ejecución.

## CONTACTO

`CONTACTO` tiene 13 columnas: 7 físicas y 6 virtuales. Su PK es `id_contacto` (`UNIQUEID()`). Captura `nombre_contacto`, `numero_contacto`, `numero_emergencia`, `email` y `cobro`; `cobro` admite `Cobro pendiente` y `Cobro realizado`. Sus relaciones virtuales enumeran INFORMES, Visa individual y Legal. `QB_Tramite` y `QB_Aplicante` toman el primer trámite y aplicante relacionado.

La Ref `INFORMES.NOMBRE DE CONTACTO` es `IsAPartOf=true`. Por tanto, un contacto puede contener varios aplicantes INFORMES; AppSheet no guarda la familia en un solo texto.

## INFORMES

`INFORMES` es el registro de **aplicante e interés comercial/operativo**, no una tabla contable. Tiene 38 columnas: 28 físicas, 10 virtuales; PK `ID DEL APLICANTE` (`UNIQUEID()`).

Campos físicos: nombre y apellidos, país, contacto, trámite principal y adicional, teléfono de recepción, asesor, estado `PAGO REALIZADO`, fecha de inicio, receptor y fecha de anticipo, fecha de información enviada, notas y 12 archivos.

Refs: país→PAISES, contacto→CONTACTO, trámite/trámite adicional→TRAMITES, asesor/receptor de pago→ASESORES. Las listas virtuales relacionan el aplicante con hojas de AMA, Pasaporte, Visa individual, ETA e historial.

No contiene monto, moneda, método, referencia, saldo, RFC, factura ni identificador contable.

## TRAMITES y asesores

`TRAMITES` es un catálogo: PK `ID TRAMITE`, nombre, país y `PROCEDIMIENTO`. Los valores sugeridos de procedimiento son Pasaporte, Visa, AMA y Legal, con otros valores permitidos. Las instancias concretas viven en INFORMES y en las hojas operativas.

`ASESORES` es el catálogo compartido de responsables. AppSheet incluye usuario y contraseña en esa hoja; esas credenciales no deben migrarse como autorización del sistema nuevo. La asignación de `PERSONA QUIEN ATIENDE` usa el correo de la sesión.

## Estados

| Entidad | Campo | Valores comprobados | Uso |
|---|---|---|---|
| CONTACTO | cobro | Cobro pendiente; Cobro realizado | estado comercial resumido |
| INFORMES | PAGO REALIZADO | Pendiente de cotización; Envío de información pendiente; Falta de pago inicial; Pago inicial realizado; Trámite detenido | cotización/anticipo |
| HISTORIAL | tipo_registro | REGISTRO DE APLICANTE; PAGO DE TRAMITE | clasificación histórica |
| Hojas operativas | estados de pago | falta de información, falta de pago completo, pago completo realizado y variantes por hoja | cobro posterior |
| Legal | estatus | secuencia de primer pago y pago completo | cobro Legal |

Los textos difieren en mayúsculas, acentos y redacción según la hoja. No forman un catálogo único fiable.

## Pagos

AppSheet no documenta una tabla `PAGOS`. El pago se representa mediante estados, fechas y responsable en INFORMES y hojas operativas. Permite distinguir anticipo y pago completo, pero no varias transacciones monetarias, saldo calculado ni evidencia ligada a un pago.

La action `Cobro realizado` confirma el anticipo, pone la fecha actual y registra al asesor receptor. Las actions de pago completo cambian campos en AMA, Visa individual, Pasaporte, Legal y Visa canadiense. La confirmación se limita por área/correo en varias acciones.

## Documentos

INFORMES contiene 12 columnas File: pasaporte, identificación frontal/trasera, acta frontal/trasera, comprobante de domicilio, pasaporte vencido, visa vencida, archivo adicional, CURP y credencial adicional frontal/trasera. La carpeta se construye con trámite, nombre e id del aplicante. No existe un archivo específico de comprobante de pago.

## Slices y vistas

Los 7 slices son colas de cobro: falta de pago inicial, falta de pago completo Visa individual, cobro AMA, pago Legal, cobro Visa canadiense, falta de pago inicial Informes y cobro Pasaporte estadounidense.

Hay 63 vistas. Son relevantes 34: alta y menú; 8 cards de cobro; 14 Detail/Form generadas para slices; y 10 Detail/Form/Inline de CONTACTO, INFORMES, HISTORIAL y TRAMITES. El resto pertenece a módulos operativos compartidos. Los slices se migran como filtros, no como tablas.

## Actions, procesos y QuickBooks

Se auditaron las **120 actions**. Hay **68 funcionalmente relevantes** para Informes/Pagos y sus envíos: 51 sobre CONTACTO, INFORMES, TRAMITES, ASESORES e HISTORIAL, más 17 cambios de pago/copias en hojas destino. Incluyen altas/ediciones/bajas, llamadas/SMS/correo, archivos, navegación, copias por área, cambios de estado e historial.

AppSheet declara 0 workflows. La exportación conserva 3 tablas de estado de proceso y 19 tablas de salida, pero no enumera Bots ni sus eventos completos. QuickBooks sólo aparece como `Process for QBKS_INF - 1 Process Table`, `QBKS Output` y una Ref de salida; no documenta endpoint, payload, id Customer, SyncToken ni control de duplicados. Esta fuente no permite certificar su integración histórica.

AppSheet ofrece Delete estándar para tablas principales. No se migrará a borrado físico mientras la política global priorice trazabilidad.
