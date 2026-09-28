# Archivos que no deben versionarse — 2026-09-23

## NO_VERSIONAR

| Ruta/patrón observado | Estado | Motivo |
|---|---|---|
| `backend/node_modules/**` | tracked modificado/eliminado | Dependencia regenerable; 687 entradas de ruido |
| `diligenciasinternacionalesinc/node_modules/**` | ignored | Dependencia regenerable |
| `backend/.env` | tracked y modificado | Configuración local con secretos potenciales |
| `backend/credentials/diligencias-drive-service-account.json` | ignored/local | Credencial de cuenta de servicio |
| `backend/.tmp/ama-postgres-test/**` | untracked | Clúster PostgreSQL local, 2,094 archivos |
| `backend/.tmp/ama-postgres-test.log` | untracked/ignored | Log local |
| `backend/.tmp/*.json` | ignored/local | Extracciones y resultados intermedios |
| `backend/.tmp/auditoria-git-status-2026-09-23.txt` | untracked | Evidencia local voluminosa; el informe resume su contenido |
| `backend/reports/**` | ignored | Salidas y datos locales |
| `backend-mongo/data/*.csv` | untracked/ignored | Siete exports con posible información personal |
| `backend-mongo.zip` | untracked | Respaldo/binario |
| `diligenciasinternacionalesinc.zip` | untracked | Respaldo/binario |
| `diligenciasinternacionalesinc/public.zip` | untracked | Respaldo/binario |
| `diligenciasinternacionalesinc/src.zip` | untracked | Respaldo/binario |
| `diligenciasinternacionalesinc/build-*/**` | untracked | Nueve builds regenerables |
| `diligenciasinternacionalesinc/.visual-audit/**` | untracked | 34 capturas/JSON de validación local |
| `diligenciasinternacionalesinc/Clientes_js_para_revisar.txt` | untracked | Salida temporal de revisión |

## Archivos sensibles detectados

Se detectaron **9 rutas sensibles o potencialmente sensibles** sin abrir sus valores:

- 1 archivo tracked y modificado: `backend/.env`.
- 1 credencial JSON local e ignorada bajo `backend/credentials/`.
- 7 CSV locales/ignorados bajo `backend-mongo/data/`.

Los dos `.env.example` son plantillas sin clasificación sensible por nombre y deben revisarse antes de versionarlos para confirmar que sólo contienen placeholders.

## REVISIÓN_HUMANA_OBLIGATORIA

- `.gitignore`: actualmente ignora `*.json` de forma global, lo que puede ocultar fixtures o configuración legítima además de secretos.
- `backend/package.json` y lock: cambian entrypoint y eliminan dependencias usadas por `backend/index.js`.
- Las 331 eliminaciones de `node_modules`: correctas como higiene, pero deben consolidarse junto con la política de dependencias.
- `backend-mongo/**`: 22 entradas cambiadas/nuevas corresponden a arquitectura heredada y no están explicadas por esta ronda.
- Los 18 SQL, especialmente los cinco con solapamiento Negados/Legal.
- Los 13 scripts de `.tmp`: decidir promoción a `backend/scripts` o descarte posterior.
- `DOCUMENTO_TECNICO.md`, `ESTRUCTURA_FRONTEND_DETALLADA.md`, `GUIA_LOGIN_COMPLETA.md`: comprobar vigencia frente al backend modular.

No se modificó `.gitignore` en esta fase.
