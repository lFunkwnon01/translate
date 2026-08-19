# Ola 2 - Checklist de integracion

Agente: D
Base: `00eb55b` (`main`)
Worktree: `wt-wave2-integration`

Este documento es operativo para integrar OL2-A1..A4 y OL2-C1..C2. No sustituye
el contrato canonico del vault ni modifica ese vault.

## Estado de partida

- [x] Base de Ola 1 identificada: `00eb55b`.
- [x] Backend FastAPI y configuracion por entorno presentes.
- [x] Harness pytest y fixture `TestClient` presentes.
- [x] Rutas actuales verificables: `/health` y `/api/v1/health`.
- [ ] CI versionado: no existe `.github/workflows/` en la base.
- [ ] Dependencias instaladas en este entorno: frontend no tiene `tsc`; backend no se ha instalado.
- [ ] SHAs de A y C: pendientes; no integrar ni cherry-pickear antes de recibirlos.

## Gates antes de recibir SHAs

- [ ] A entrega un SHA por tarjeta o un rango claro, con `git show --stat` y pruebas ejecutadas.
- [ ] C entrega un SHA por tarjeta o un rango claro, con matriz de pruebas y fixtures usados.
- [ ] Confirmar que ambos parten de `00eb55b` o documentar su base exacta.
- [ ] Confirmar que no hay cambios no relacionados, secretos, PDFs reales ni artefactos locales.
- [ ] Confirmar el prefijo de rutas: el contrato canonico documenta `/api/...`, mientras Ola 1 usa `/api/v1/...` para rutas nuevas.
- [ ] Confirmar que `owner_key`, `Idempotency-Key`, limite de 25 MiB y estados son los del contrato canonico.

## Orden de integracion

1. OL2-A1: dependencias SQLAlchemy/Alembic, configuracion SQLite.
2. OL2-A2: modelos `documents` y `translation_jobs`, migracion inicial.
3. OL2-C1: fixtures SQLite/PDF y contrato de foundation/upload.
4. OL2-A3: upload, storage local y creacion idempotente de document/job.
5. OL2-A4: worker falso, transiciones, outbox y artifact de prueba.
6. OL2-C2: pruebas de modelos, upload, idempotencia y worker falso.
7. D1/D2: CI, instalacion limpia, smoke tests y validacion completa.

No avanzar al siguiente punto si el gate del anterior falla. No hacer merge
directo ni usar `--force`.

## Revision por tarjeta

### OL2-A1

- [ ] Dependencias declaradas en `backend/pyproject.toml` con rangos compatibles.
- [ ] SQLite local configurable sin credenciales ni rutas absolutas.
- [ ] Alembic inicializa y ejecuta upgrade desde una instalacion limpia.
- [ ] La configuracion existente (`APP_ENV`, `APP_HOST`, `APP_PORT`) no regresa.
- [ ] Tests de importacion y compilacion pasan.

### OL2-A2

- [ ] Esquema y nombres coinciden con `Modelo de Datos`, `Contrato de API` y FSM canonicos.
- [ ] UUID, timestamps UTC, `owner_key`, status y progreso tienen tipos/valores definidos.
- [ ] Restricciones de unicidad soportan idempotencia sin duplicar jobs.
- [ ] La migracion es reversible en entorno local y no borra datos silenciosamente.
- [ ] C2 prueba invariantes y transiciones validas/prohibidas.

### OL2-C1

- [ ] Fixtures usan base SQLite aislada por test y no el archivo local persistente.
- [ ] PDF minimo sintetico se genera en test; no se incorpora un PDF real.
- [ ] `TestClient` usa la app/configuracion de test sin estado global contaminante.
- [ ] Los contratos fijan status HTTP, headers, payload y errores sin duplicar dominio.
- [ ] Revisar cualquier cambio concurrente en `backend/tests/conftest.py` y `test_health.py`.

### OL2-A3

- [ ] Upload valida extension/MIME/tamano/PDF corrupto y limpia temporales ante error.
- [ ] Exige `Idempotency-Key` y conserva la misma respuesta para reintentos equivalentes.
- [ ] El mismo propietario y clave no crea documentos/jobs duplicados.
- [ ] Un conflicto de clave con payload diferente devuelve error estable.
- [ ] La respuesta 202 coincide con el contrato y no espera al worker.

### OL2-A4

- [ ] Worker falso es determinista, inyectable y no llama OCI ni proveedores reales.
- [ ] Transiciones respetan estados y guardas de la FSM canonica.
- [ ] Cada cambio de estado actualiza job/evento de forma atomica.
- [ ] Outbox/artifact de prueba son aislables, repetibles y limpiables.
- [ ] Reintentos, cancelacion y fallo no dejan jobs en estados imposibles.

### OL2-C2

- [ ] Cubre modelos, upload, idempotencia, worker, estados y artifact.
- [ ] Prueba doble ejecucion y aislamiento entre tests.
- [ ] Prueba errores 400/413/415/422/404/409 relevantes al slice.
- [ ] No exige endpoints que OL2-A3/A4 no implementen.
- [ ] Evita modificar logica de `backend/app/**` para hacer pasar tests.

## Riesgos de solapamiento

| Area | Riesgo | Resolucion durante merge |
|---|---|---|
| `backend/pyproject.toml` | A1 agrega dependencias y C necesita `httpx/pytest`; cambios pueden pisarse. | Conservar una sola declaracion compatible y ejecutar instalacion limpia. |
| `backend/app/api/router.py` | A3 puede registrar upload bajo un prefijo distinto al contrato. | Resolver primero `/api` vs `/api/v1`; no crear alias silenciosos. |
| `backend/tests/conftest.py` | C1 puede reemplazar el fixture global o mezclar DB persistente. | Unificar fixture con override de settings/DB y aislamiento por test. |
| `backend/tests/unit/test_health.py` | C puede rebasar la cobertura de Ola 1 o cambiar el payload health. | Mantener ambos endpoints mientras el contrato no cambie y revisar diff manualmente. |
| modelos/migracion vs tests | A2 y C2 pueden fijar nombres, enums o defaults incompatibles. | El modelo canonico y la migracion de A son fuente; C prueba, no redefine. |
| worker/outbox vs C2 | A4 puede cambiar estados/eventos mientras C fija expectativas. | Comparar contra FSM y contrato; corregir con el propietario, no en D. |
| raiz/CI | D puede agregar workflow sin tocar dominio. | Mantener CI en `.github/workflows/` y documentacion/config compartida. |

## Dependencias y decisiones faltantes

- [ ] Python >=3.11 disponible en CI; la base local reporta Python 3.14.3.
- [ ] Node/Bun y estrategia de lockfile definida: raiz Vite y `frontend/` Next tienen paquetes separados.
- [ ] Paquetes de persistencia/migraciones concretos definidos por A1.
- [ ] Driver SQLite async/sync y estrategia de sesiones definidos antes de C1.
- [ ] Ruta de storage temporal y cleanup definidos para tests/CI.
- [ ] Prefijo API resuelto antes de crear pruebas de upload.
- [ ] Forma de `Idempotency-Key` y scope de `owner_key` confirmados.
- [ ] Herramienta de lint/typecheck del backend (`ruff`, `mypy`) ejecutable desde `backend/`.

## Comandos de validacion

Ejecutar desde la raiz, salvo donde se indique:

```bash
git status --short --branch
```

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[dev]'
pytest -q
ruff check app tests
mypy app
python -m compileall -q app tests
```

```bash
cd frontend
npm ci
npm run lint
npm run build
```

```bash
cd ..
npm ci
npm run lint
npm run build
```

Smoke backend, con el servidor levantado en otra terminal:

```bash
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
curl --fail http://127.0.0.1:8000/health
curl --fail http://127.0.0.1:8000/api/v1/health
```

## Criterio de listo para continuar

- [ ] SHAs A/C recibidos y sus bases verificadas.
- [ ] Solapamientos revisados por archivo antes de aplicar cambios.
- [ ] Migracion y fixtures funcionan desde cero.
- [ ] Pytest, Ruff, mypy, compileall, lint y builds verdes.
- [ ] Smoke de backend y frontend ejecutado.
- [ ] `git diff --check`, ausencia de secretos y worktree limpio al finalizar.
- [ ] No se modifica el vault; cualquier registro posterior se deja al responsable indicado.
