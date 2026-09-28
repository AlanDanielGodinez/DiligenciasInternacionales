# Limpieza de builds y artefactos generados — 2026-09-25

## Antes

- Carpetas build: 10.
- Outputs de auditoría visual: 1 directorio, 34 archivos.
- Tamaño total confirmado: 6,073,541,820 bytes (6.07 GB; 5.66 GiB).
- Todos eran untracked e ignorados salvo `build/`, que todavía no tenía una regla explícita.
- `node_modules`: 1,063,002,332 bytes aproximados; conservado localmente.

| Ruta | Tamaño | Contenido y origen | Referencias | Clasificación |
|---|---:|---|---|---|
| `build/` | 607,266,160 B | React production build; `npm run build` | Servido por backend si existe; regenerable y no versionado | GENERADO_ELIMINAR |
| `build-ama-dynamic-local/` | 607,191,089 B | React build de validación | Solo documentación histórica | GENERADO_ELIMINAR |
| `build-ama-validation/` | 607,183,557 B | React build de validación AMA | Solo documentación histórica | GENERADO_ELIMINAR |
| `build-ama-validation-local/` | 607,187,936 B | React build de validación AMA | Sin consumidor operativo | GENERADO_ELIMINAR |
| `build-ama-validation-local-final/` | 607,187,936 B | React build de validación AMA | Sin consumidor operativo | GENERADO_ELIMINAR |
| `build-codex/` | 606,711,921 B | React build local | Sin consumidor operativo | GENERADO_ELIMINAR |
| `build-codex-visual/` | 606,667,581 B | React build visual | Sin consumidor operativo | GENERADO_ELIMINAR |
| `build-codex-visual2/` | 606,668,145 B | React build visual | Sin consumidor operativo | GENERADO_ELIMINAR |
| `build-codex-visual3/` | 606,668,133 B | React build visual | Sin consumidor operativo | GENERADO_ELIMINAR |
| `build-negados-validation/` | 607,048,826 B | React build de validación | Sin consumidor operativo | GENERADO_ELIMINAR |
| `.visual-audit/` | 3,760,536 B | 30 capturas y 4 JSON de resultados | Sin configuración fuente | TEMPORAL_ELIMINAR |

Todos los builds contenían la firma estándar: `index.html`, `asset-manifest.json`, `static/`, iconos, manifiesto, `robots.txt` y assets copiados. Git no registraba ningún archivo de estas rutas.

## Después

- Carpetas eliminadas: 11.
- Espacio recuperado respecto del inventario inicial: 6,073,541,820 bytes.
- Carpetas generadas conservadas: ninguna.
- Requieren revisión: ninguna.
- El build estándar se regeneró para validar y se eliminó nuevamente después del PASS.
- Se agregó a `.gitignore` la regla explícita `diligenciasinternacionalesinc/build/`; las reglas para `build-*/` y `.visual-audit/` ya existían.

## Validación

- Frontend: 47/47 PASS, 16/16 suites.
- Backend sin la suite que requiere PostgreSQL local: 230/230 PASS. `amaActividad.test.js` no se ejecutó porque su PostgreSQL temporal en `127.0.0.1:55439` no estaba iniciado; no se intentó usar PostgreSQL real.
- React build: PASS.
- ESLint durante build: 0 errores, 22 advertencias preexistentes.
- Staging previo: 1319 entradas; sin alteraciones y con `git diff --cached --check` limpio.

Se conservaron `src/`, `public/`, dependencias, archivos de entorno, PDFs AppSheet, documentación, SQL, uploads, `backend-mongo/` y `backend/index.js`.
