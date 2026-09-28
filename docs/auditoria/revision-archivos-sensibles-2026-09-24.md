# Revisión de archivos sensibles — 2026-09-24

## Método

Se revisaron nombres, existencia, tracking, estado y reglas de ignore. No se imprimieron valores. Para los `.env` y el JSON de servicio sólo se comprobó estructura/nombres de campos.

## Inventario definitivo

| # | Ruta | Tipo | Git | Ignore | Estado | Riesgo | Disposición |
|---:|---|---|---|---|---|---|---|
| 1 | `backend/.env` | Entorno real | TRACKED | Regla `.env`, ineficaz para tracked | MODIFICADO | Puede entrar con `git add -u` y ya tiene historia Git | NO VERSIONAR; acción obligatoria |
| 2 | `backend-mongo/.env` | Entorno real legacy | UNTRACKED | IGNORADO | Sin estado visible | Secreto local legacy; ignore funciona | NO VERSIONAR |
| 3 | `backend/credentials/diligencias-drive-service-account.json` | Credencial Google | UNTRACKED | IGNORADO por `credentials/` y `*.json` | Sin estado visible | Clave privada/identidad de servicio | NO VERSIONAR |
| 4 | `backend-mongo/data/diligencias_ejemplo.csv` | Export/fixture | UNTRACKED | NO IGNORADO | NUEVO | Puede contener datos de personas | NO VERSIONAR; acción obligatoria |
| 5 | `backend-mongo/data/INFORMES Y PAGOS - CONTACTO.csv` | Export AppSheet | UNTRACKED | NO IGNORADO | NUEVO | Contactos/PII potencial | NO VERSIONAR; acción obligatoria |
| 6 | `backend-mongo/data/INFORMES Y PAGOS - HISTORIAL DE TRAMITES.csv` | Export AppSheet | UNTRACKED | NO IGNORADO | NUEVO | Historial operacional/PII | NO VERSIONAR; acción obligatoria |
| 7 | `backend-mongo/data/INFORMES Y PAGOS - INFORMES (2).csv` | Export AppSheet | UNTRACKED | NO IGNORADO | NUEVO | Datos operativos/PII | NO VERSIONAR; acción obligatoria |
| 8 | `backend-mongo/data/INFORMES Y PAGOS - PAISES.csv` | Export AppSheet | UNTRACKED | NO IGNORADO | NUEVO | Catálogo mezclado con export local | REQUIERE DECISIÓN; excluir por ahora |
| 9 | `backend-mongo/data/INFORMES Y PAGOS - TELEFONOS DE RECEPCION.csv` | Export AppSheet | UNTRACKED | NO IGNORADO | NUEVO | Teléfonos/PII | NO VERSIONAR; acción obligatoria |
| 10 | `backend-mongo/data/INFORMES Y PAGOS - TRAMITES.csv` | Export AppSheet | UNTRACKED | NO IGNORADO | NUEVO | Datos de operación | REQUIERE DECISIÓN; excluir por ahora |
| 11 | `GUIA_LOGIN_COMPLETA.md` | Documento con credencial literal | UNTRACKED | NO IGNORADO | NUEVO | Contiene material de acceso real en texto | NO VERSIONAR; acción obligatoria |

La auditoría anterior contabilizó nueve rutas: `backend/.env`, la credencial Google y siete CSV. Esta revisión localizó además `backend-mongo/.env` y confirmó que `GUIA_LOGIN_COMPLETA.md` contiene una credencial literal. El total corregido es 11.

## Variantes `.env`

| Ruta | Existe | Naturaleza | Resultado |
|---|---|---|---|
| `.env`, `.env.local` raíz | No | — | Sin riesgo actual |
| `backend/.env` | Sí | Real/local | TRACKED y modificado; crítico |
| `backend/.env.local` | No | — | Sin riesgo actual |
| `backend/.env.example` | Sí | Plantilla | Untracked; revisar placeholders antes de versionar |
| `backend-mongo/.env` | Sí | Real/local legacy | Ignorado correctamente |
| `backend-mongo/.env.example` | Sí | Plantilla legacy | Untracked; revisión humana |
| frontend `.env`/`.env.local` | No | — | Sin riesgo actual |

Los nombres estructurales observados en los entornos corresponden a configuración de servidor, PostgreSQL, Google/Drive, QuickBooks/OAuth y autenticación. Los valores permanecieron ocultos.

## QuickBooks, OAuth y Google

El código QuickBooks usa variables de entorno y persistencia cifrada; no se encontraron certificados o archivos de tokens QuickBooks sueltos. `backend/logs/quickbooks-oauth-audit.log` está ignorado como log. La única credencial de servicio encontrada por ruta es el JSON de Google, ignorado correctamente.

La regla global `*.json` también ignora manifests y fixtures legítimos. No se modificó, pero requiere revisión posterior porque es demasiado amplia.

## Resumen

| Métrica | Cantidad |
|---|---:|
| RUTAS SENSIBLES | 11 |
| TRACKED | 1 |
| UNTRACKED | 10 |
| IGNORADAS por alguna regla | 3 |
| RIESGO REAL DE VERSIONADO | 9 |
| REQUIEREN ACCIÓN ANTES DE STAGING | 9 |

Clasificación global: **RIESGO_TRACKED** por `backend/.env` y **RIESGO_UNTRACKED** por siete CSV y la guía de login.

