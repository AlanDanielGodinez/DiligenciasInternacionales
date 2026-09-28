# Snapshot previo al saneamiento — 2026-09-24

Capturado antes de modificar `.gitignore`, documentación sensible o el índice.

| Estado | Cantidad |
|---|---:|
| Working tree | 803 entradas |
| Modificadas | 398 |
| Eliminadas | 331 |
| Untracked | 74 |
| Renombradas | 0 |
| Staged | 0 |

`git diff --cached --name-status` estaba vacío. Las 331 eliminaciones pertenecían exclusivamente a `backend/node_modules`. No se incluyeron valores de archivos sensibles.

Riesgos previos confirmados:

- `backend/.env`: tracked, modificado y físicamente presente.
- `backend/node_modules`: 1,313 archivos históricos tracked; regla ignore ya existente.
- Siete CSV bajo `backend-mongo/data`: untracked y no ignorados.
- `GUIA_LOGIN_COMPLETA.md`: untracked, no ignorado y con credencial literal.
- `*.json`: regla global que ocultaba manifests y JSON seguros.
