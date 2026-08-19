# Ola 3 - Checklist de integracion

Agente: D
Base: `1dd0463` (`main`)
Worktree: `wt-ola3-integration`

Documento operativo para integrar OL3-A1..A5, OL3-B1 y OL3-C1. No sustituye los
contratos canonicos ni autoriza cambios en la logica de dominio desde este
worktree. La base no contiene todavia commits OL3 en las ramas de backend,
frontend o tests; los SHAs de las tarjetas son un gate obligatorio.

## Estado de partida

- [x] Base verificada: `1dd0463`.
- [x] Prefijo canonico actual: `/api/...`; `/api/v1/...` solo es alias de health.
- [x] Modelos actuales: `documents`, `translation_jobs` y `job_outbox_messages`.
- [x] Upload exige `Idempotency-Key`, limita PDF a 25 MiB y particiona storage por `owner_key`.
- [x] `FakeWorker` es determinista y no invoca OCI, OCR ni proveedores externos.
- [x] Artefactos locales se escriben con permisos `0600`; directorios de owner/job con `0700`.
- [ ] Endpoints de stream, preview, download y cancel/delete implementados.
- [ ] OCR/provider real o adaptador de prueba implementado.
- [ ] SHAs, bases y pruebas ejecutadas de OL3-A1..A5/B1/C1 recibidos.

## Gates antes de cherry-pick

- [ ] Cada tarjeta entrega un SHA identificable, `git show --stat`, base exacta y comandos de prueba.
- [ ] Cada SHA parte de `1dd0463` o documenta explícitamente su base y se valida el diff adicional.
- [ ] No hay secretos, PDFs reales, credenciales OCI, artefactos generados ni cambios no relacionados.
- [ ] El contrato canonico es la fuente de nombres, payloads, estados, errores, headers y rutas; los tests no lo redefinen.
- [ ] La FSM canonica es la fuente de transiciones y guardas; ningún handler cambia estados directamente sin la operación de dominio acordada.
- [ ] Cualquier migración es revisable, reversible en local y compatible con una instalación limpia.
- [ ] Revisar el diff por archivo antes de aplicar cada SHA; no hacer merge directo ni usar `--force`.

## Orden de cherry-pick

Aplicar un SHA por vez y ejecutar el gate indicado antes de continuar:

1. `OL3-A1`: contratos, modelos y migración base de la slice. Debe fijar primero los nombres y formas que consumirán las demás tarjetas.
2. `OL3-A2`: FSM, eventos/estado persistido y guardas. Debe consumir A1, no duplicar enums o transiciones en handlers.
3. `OL3-A3`: generación y recuperación de preview, incluyendo warnings OCR contractuales. Debe usar el estado/artefactos definidos por A1-A2.
4. `OL3-A4`: descarga del artefacto traducido y controles de autorización/ruta. Debe depender de la misma resolución de owner/job que preview.
5. `OL3-A5`: límites de integración OCI/OCR y dobles deterministas (si la tarjeta los incluye). El backend local debe seguir funcionando sin credenciales ni llamadas de red.
6. `OL3-B1`: integración de UI/API. Solo después de estabilizar rutas, tipos, estados, errores y enlaces de A1-A5; no debe introducir un segundo contrato.
7. `OL3-C1`: pruebas de contrato/integración y eliminación de xfails justificados. C1 prueba lo implementado y no agrega lógica para hacer pasar expectativas.
8. Gate D final: instalación limpia, migración, suite backend, checks frontend, smoke HTTP, seguridad y `git diff --check`.

Si una tarjeta combina varios puntos, conservar este orden conceptual y
descomponer el cherry-pick solo si el propietario entrega commits atómicos.

## Revisión por tarjeta

### OL3-A1 - Contratos y modelos

- [ ] Payloads de job, preview, warnings, enlaces y download coinciden con el contrato canonico.
- [ ] Modelos, columnas, índices, constraints y defaults no contradicen la FSM ni los datos existentes.
- [ ] Timestamps son UTC y los estados/progreso tienen valores y rangos definidos.
- [ ] Migraciones no hacen `create_all` en runtime, no borran datos silenciosamente y arrancan desde cero.
- [ ] Errores conservan forma estable `{error: {code, message, details}}` cuando aplique.

### OL3-A2 - FSM y procesamiento

- [ ] Tabla de transiciones y guardas está explícita y coincide con el contrato.
- [ ] No existen saltos imposibles, regresiones de progreso ni terminales mutables.
- [ ] Persistencia de estado y evento/outbox es atómica o deja una recuperación definida.
- [ ] Reintento, fallo, cancelación y ejecución duplicada son idempotentes y no generan artefactos huérfanos.
- [ ] `FakeWorker` permanece aislado de OCI/OCR y sigue siendo determinista.

### OL3-A3 - Preview/OCR

- [ ] Preview solo se sirve para jobs del owner autenticado/configurado y con estado permitido por contrato.
- [ ] Un job inexistente, ajeno, no listo o sin preview devuelve el código HTTP/error contractual, sin filtrar existencia ni rutas.
- [ ] El contenido se trata como datos: no se renderiza HTML sin escape ni se ejecuta texto extraído.
- [ ] Warnings OCR incluyen confianza/origen según contrato y nunca se presentan como traducción verificada.
- [ ] OCR es una etapa/proveedor separado de OCI: no se usa un cliente OCI para simular OCR ni se mezclan credenciales.

### OL3-A4 - Download

- [ ] Descarga requiere autorización por owner/job y solo se habilita con artefacto completo y estado permitido.
- [ ] La ruta se resuelve desde un identificador persistido y validado; no se concatena input del usuario ni se permite traversal/symlink escape.
- [ ] El response fija `Content-Type`, `Content-Disposition` seguro, tamaño y errores sin revelar filesystem, owner hash o stack trace.
- [ ] El archivo se transmite sin cargar arbitrariamente un blob controlado por el cliente y mantiene permisos `0600`.
- [ ] Preview y download no comparten un bypass: cada endpoint prueba owner, estado, existencia y expiración/limpieza por separado.

### OL3-A5 - Integraciones externas

- [ ] OCI y OCR tienen interfaces, configuración, timeouts, errores y métricas separados.
- [ ] Ningún import de OCI aparece en el módulo/worker de OCR, y ningún import de OCR aparece en el adaptador OCI.
- [ ] Las credenciales solo se leen desde configuración segura; nunca desde payload, logs, fixtures o frontend.
- [ ] Tests usan fake clients inyectables, sin red, claves reales ni dependencia de disponibilidad externa.
- [ ] Rate limit, timeout y retry respetan la FSM y tienen límites; no reintentan errores no recuperables ni duplican efectos.
- [ ] El modo local/test falla cerrado y explícito cuando falta un proveedor, sin fingir éxito de producción.

### OL3-B1 - Frontend

- [ ] Tipos y estados frontend son una representación del contrato backend, incluyendo errores y estados terminales.
- [ ] Preview/download solo aparecen habilitados cuando los enlaces y el estado lo permiten; los fallos son visibles y no silenciosos.
- [ ] El navegador no recibe ni almacena credenciales OCI/OCR ni llama directamente a proveedores.
- [ ] Las URLs de download no se construyen con IDs sin codificar ni permiten sustituir el job mostrado.
- [ ] La UI separa aviso OCR de estado de traducción OCI y no atribuye OCR a OCI.
- [ ] Se validan lint/typecheck/build de ambos frontends existentes sin mezclar lockfiles.

### OL3-C1 - Pruebas

- [ ] Cubre contratos HTTP, modelos/migración, FSM, autorización, preview, download y aislamiento de proveedores.
- [ ] Usa SQLite/storage temporales por test y fixtures sintéticos; no usa PDFs reales ni servicios externos.
- [ ] Prueba owner correcto/incorrecto, job inexistente, estados no listos, artefacto ausente y traversal/symlink.
- [ ] Prueba headers y contenido de preview/download, errores estables, repetición e idempotencia.
- [ ] Prueba OCI y OCR con dobles distintos y verifica que ninguno se llama fuera de su frontera.
- [ ] `xfail(strict=True)` solo permanece mientras el endpoint o contrato esté explícitamente fuera de esta ola.

## Seguridad de preview y download

- [ ] Autorización se hace en servidor con `owner_key` derivado de contexto confiable; nunca desde query, form o header controlado por el cliente.
- [ ] Se evita enumeración: IDs ajenos/inexistentes tienen respuesta indistinguible donde el contrato lo permita.
- [ ] Se validan estado, relación job-documento y existencia del artefacto antes de responder.
- [ ] Se impide traversal con resolución bajo una raíz fija y comprobación de que el path final permanece dentro de ella.
- [ ] `Content-Disposition` usa nombre saneado y sin CR/LF; `Content-Type` no se deduce de un nombre enviado por el usuario.
- [ ] No se registran texto OCR, contenido traducido, tokens, rutas privadas ni credenciales; los logs de error son mínimos.
- [ ] Se definen límites de tamaño/tiempo y limpieza de temporales para lectura, preview y descarga.

## Criterio para eliminar xfails

Eliminar un xfail solo cuando exista implementación versionada y prueba positiva
que cubra el contrato completo. El test debe pasar en una instalación limpia,
con owner autorizado y no autorizado, errores y repetición. Para TP-09/TP-10,
además debe pasar el gate de seguridad anterior. Para OCR/provider, el fake
inyectado debe demostrar separación y ausencia de red; una UI o un mock local
por sí solos no justifican quitar el xfail. Si el contrato cambia, actualizar
primero la especificación y luego el test; no convertir un xfail en una
expectativa más débil.

## Separación estricta OCI/OCR

OCI se limita al proveedor de traducción/generación y sus credenciales, límites
y reintentos. OCR se limita a detección/extracción, confianza y warnings. El
pipeline puede orquestarlos mediante interfaces de dominio, pero cada uno debe
tener cliente, configuración, fake, errores y pruebas propios. La capa API,
preview y frontend consumen resultados contractuales, no SDKs. El worker local
de esta base continúa sin red y no debe transformarse en integración real por
efecto de un cherry-pick de pruebas.

## Conflictos esperados

| Archivo/área | Riesgo | Resolución |
|---|---|---|
| `backend/app/api/v1/jobs.py` y router | Rutas `/api` frente a alias `/api/v1`, enlaces nulos frente a URLs OL3. | Mantener `/api` canónico; revisar alias solo para health y actualizar enlaces según contrato, sin alias silenciosos. |
| `backend/app/models/*` y Alembic | A1/A2 y C1 fijan nombres, defaults o estados distintos. | Modelo/FSM canónicos son fuente; migración y tests se alinean, no se resuelve cambiando expectativas. |
| `backend/app/worker/fake.py` | A2/A5 pueden mezclar FSM, OCI y OCR en el fake. | Conservar fake offline; extraer puertos/adaptadores separados y pedir corrección al propietario si invade dominio. |
| `backend/app/storage/local.py` y endpoints nuevos | Preview/download pueden repetir resolución de paths o relajar permisos. | Centralizar la política de storage existente y revisar traversal, owner y `0600` con tests. |
| `backend/tests/unit/test_contract.py` y `backend/tests/conftest.py` | C1 puede quitar xfails o reemplazar aislamiento SQLite/storage. | Mantener fixtures temporales; cada xfail se elimina solo con su gate. |
| `frontend/lib/api.ts` y `frontend/lib/mock*` | B1 puede divergir entre mock, Vite y Next. | Un solo contrato tipado; mocks no se presentan como proveedor real y ambos builds se verifican. |
| `pyproject.toml`, lockfiles y workflows | Dependencias de SDK, pytest o frontend pisan CI existente. | Añadir solo lo necesario, conservar Bun/lockfiles actuales y exigir instalación reproducible sin secretos. |

## Gates de pruebas

Ejecutar desde la raíz salvo indicación:

```bash
git diff --check
```

```bash
cd backend
python -m pip install -e '.[dev]'
pytest -q
ruff check app tests
mypy app
python -m compileall -q app tests
alembic upgrade head
```

```bash
cd frontend
bun install --frozen-lockfile
bun run lint
bun run build
```

```bash
cd ..
bun install --frozen-lockfile
bun run lint
bun run build
```

Gate funcional final: smoke de health, upload sintético, transición con fake
offline, preview autorizado/no autorizado y download autorizado/no autorizado.
Gate de seguridad final: búsqueda de secretos/SDKs en frontend y logs, prueba
de path traversal/symlink, permisos `0700/0600`, y confirmación de cero
conexiones de red durante la suite C1.

## Criterio de listo

- [ ] Todos los SHAs A/B/C parten de la base verificada o tienen divergencia documentada.
- [ ] A1-A5 pasan contratos, FSM, seguridad y separación OCI/OCR.
- [ ] B1 pasa ambos builds y no duplica el contrato.
- [ ] C1 deja solo xfails explícitamente fuera de Ola 3 y todos son `strict`.
- [ ] Migración limpia, pytest, Ruff, mypy, compileall, lint, builds y smoke pasan.
- [ ] No se modificó la lógica de dominio desde este agente; solo esta checklist fue añadida.
- [ ] Worktree final limpio salvo el commit de esta checklist y sin artefactos `graphify-out`.
