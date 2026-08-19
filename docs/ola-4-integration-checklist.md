# Ola 4 - Checklist de integracion PDF/OCR

Agente: D
Base: `a1a4730` (`main`)
Worktree: `wt-ola4-integration`

Documento operativo para integrar la extraccion PDF, la deteccion de texto,
OCR y la preparacion del contenido para traduccion. No sustituye los
contratos canonicos ni autoriza cambios en la logica de dominio desde este
worktree. Este agente solo entrega esta checklist.

## Estado de partida

- [x] Base verificada: `a1a4730`.
- [x] Upload canonico: `POST /api/documents/upload`, `Idempotency-Key`, PDF y
  limite configurable de 25 MiB (`max_file_size_bytes`).
- [x] Storage local particionado por `owner_key` y UUID, con permisos
  restringidos; no se debe relajar esta frontera al crear temporales.
- [x] `FakeWorker` es determinista, offline y no invoca OCR ni OCI.
- [x] `app/pdf/__init__.py` declara la frontera del modulo, pero no contiene
  implementacion de extraccion/OCR.
- [x] Alembic es el propietario del esquema en runtime; la aplicacion no usa
  `create_all` al arrancar.
- [ ] Contrato OL4 de paginas, bloques, orden de lectura, warnings y estado de
  OCR recibido y fijado como fuente unica.
- [ ] SHAs de las tarjetas OL4-A/B/C, base exacta y comandos de prueba
  entregados por cada propietario.

## Orden de integracion

Aplicar un SHA por vez. Ejecutar el gate de su fase antes de continuar; no
integrar una fase posterior para compensar fallos de una anterior.

1. **OL4-A - Fundacion y extraccion determinista.** Contratos, puertos,
   configuracion de limites, dependencia PyMuPDF/pdfplumber, lectura segura,
   normalizacion y fixtures sinteticos. A no debe llamar OCRmyPDF/Tesseract ni
   OCI para que el texto nativo sea reproducible.
2. **OL4-B - OCR y orquestacion.** Adaptador OCRmyPDF/Tesseract aislado,
   clasificacion de documento escaneado, confianza/warnings, temporales,
   timeouts y cooperacion con la FSM existente. B depende de los puertos y
   resultados fijados por A; no redefine estados ni muta el job directamente.
3. **OL4-C - Integracion, persistencia y validacion.** Worker/API/frontend si
   aplica, migraciones Alembic, pruebas de contrato, seguridad, observabilidad
   y doubles. C consume A/B y no introduce un segundo contrato ni credenciales
   en el navegador.
4. **Gate D final.** Instalacion limpia, migracion desde cero y desde la base,
   suite offline, limites, seguridad de PDFs maliciosos, `git diff --check` y
   confirmacion de que solo se incorporo documentacion desde este worktree.

Si una tarjeta mezcla fases, conservar este orden conceptual y pedir commits
atomicos o documentar claramente el diff adicional.

## Gate de cada fase

### Gate A - Extraccion

- [ ] El propietario entrega SHA, `git show --stat`, base, dependencias y
  comandos reproducibles.
- [ ] El contrato define resultado por pagina/bloque, coordenadas si se
  necesitan, orden de lectura, idioma, texto vacio, errores y warnings.
- [ ] PyMuPDF (`fitz`) se usa para apertura, paginas y operaciones de bajo
  nivel; pdfplumber se usa solo donde aporte tablas/layout. No se duplican
  lecturas completas sin limite ni se exponen objetos del parser en la API.
- [ ] La validacion de upload no se considera analisis de seguridad: el PDF se
  vuelve a abrir y valida antes de extraer, con el MIME y extension sin ser
  fuente de confianza.
- [ ] La extraccion es determinista con los mismos bytes, version de libreria
  fijada y locale estable; no descarga fuentes, recursos ni ejecuta contenido
  embebido.
- [ ] El resultado no cambia la FSM ni marca el job como traducido; cualquier
  transicion usa la operacion de dominio existente.
- [ ] Gate A: fixtures nativos pasan, fixtures corruptos fallan cerrado, no hay
  llamadas de red y `ruff`, `mypy`, `pytest` y `compileall` pasan.

### Gate B - OCR

- [ ] OCRmyPDF y Tesseract estan detras de una interfaz propia, inyectable y
  con errores, timeout, version y metadatos de origen explicitos.
- [ ] OCRmyPDF recibe un archivo temporal dentro de una raiz controlada y
  Tesseract usa un `tessdata` configurado, no una ruta enviada por el usuario.
- [ ] OCR se ejecuta solo por criterio documentado (por ejemplo, texto nativo
  insuficiente), no como fallback silencioso ante cualquier excepcion.
- [ ] La salida distingue texto nativo de texto OCR y conserva warnings de
  confianza/idioma sin presentarlos como traduccion verificada.
- [ ] El fake OCR no invoca binarios ni red; el test del adaptador real es
  opt-in y se salta explicitamente cuando el binario no esta instalado.
- [ ] Cancellation, timeout, salida parcial, exit code no cero y limite de
  paginas producen resultado/error contractual y limpieza de temporales.
- [ ] Gate B: fixture escaneado sintetico usa el fake; una prueba separada
  verifica que OCR no importa ni instancia el cliente OCI.

### Gate C - Integracion

- [ ] API, worker y UI consumen DTOs del contrato; ningun SDK PDF/OCR/OCI cruza
  hacia la capa HTTP o el frontend.
- [ ] El procesamiento por job es idempotente, reanudable en checkpoints
  definidos y no deja artefactos o temporales huerfanos.
- [ ] Autorizacion, owner, estado del job y rutas de artefactos se comprueban
  antes de leer o servir cualquier resultado.
- [ ] Las migraciones tienen revision lineal, `down_revision` correcto,
  constraints/indexes revisables y downgrade local probado.
- [ ] Gate C: contratos HTTP, worker offline, pruebas de seguridad, Alembic y
  los dos frontends pasan sin secretos ni servicios externos.

## Dependencias y fronteras

### Python y sistema

- [ ] `PyMuPDF` y `pdfplumber` se declaran con versiones/rangos compatibles y
  se actualizan en el lock o mecanismo de instalacion vigente, no mediante
  imports opcionales ambiguos.
- [ ] `ocrmypdf` se declara como dependencia opcional de la capacidad OCR; no
  debe hacer obligatoria la instalacion de OCR para ejecutar el modo nativo y
  los tests offline.
- [ ] Tesseract es un binario del sistema, no un secreto ni una dependencia
  descargada durante una peticion. Se documentan version, idiomas (`tessdata`)
  y deteccion de disponibilidad.
- [ ] Si OCRmyPDF introduce Ghostscript u otras herramientas, se fijan sus
  versiones compatibles y se valida su configuracion segura. No se permite
  ejecutar un binario cuyo path provenga del documento o del request.
- [ ] CI instala la ruta nativa siempre y la ruta OCR en un job/imagen
  explicitamente etiquetado; un entorno sin OCR no puede fingir OCR exitoso.

### Criterio de separar OCR real y OCI

La separacion es obligatoria si existe cualquiera de estas condiciones: se
requieren credenciales distintas, timeouts/reintentos distintos, escalado o
coste distinto, binarios locales para OCR, datos de confianza diferentes, o
un proveedor puede fallar sin que el otro deba reintentarse. En ese caso:

- [ ] OCR tiene puerto, adaptador, configuracion, fake, errores, metricas y
  pruebas propios; solo devuelve texto, paginas y warnings contractuales.
- [ ] OCI tiene puerto, adaptador, configuracion, fake, errores, metricas y
  pruebas propios; solo traduce el DTO acordado.
- [ ] No hay imports cruzados `app.pdf`/OCR hacia OCI ni cliente OCI dentro del
  worker de OCR; el orquestador solo conecta resultados mediante interfaces.
- [ ] `FakeWorker` sigue sin red y puede probar A, OCR fake y OCI fake por
  separado. Un test que use un fake combinado no satisface este gate.
- [ ] Se puede ejecutar el pipeline nativo sin OCI y el pipeline de OCR sin
  OCI. La falta de OCR real falla cerrado con codigo/warning explicito, nunca
  se etiqueta como texto OCR si se uso un fake.

## Seguridad de PDFs maliciosos

- [ ] Se tratan bytes, nombre, MIME y metadata del PDF como entrada no
  confiable; no se abre desde una ruta controlada por el usuario.
- [ ] Se rechazan o aislan PDFs truncados, cifrados si no estan soportados,
  con password, con demasiados objetos/paginas, referencias invalidas,
  streams comprimidos anormalmente grandes y capas/adjuntos no necesarios.
- [ ] JavaScript, acciones automaticas, formularios, anotaciones activas,
  adjuntos, fuentes o URLs externas no se ejecutan ni se siguen. Si OCRmyPDF o
  Ghostscript reescriben el archivo, se usa un perfil seguro y sandbox.
- [ ] PyMuPDF/pdfplumber se ejecutan con timeout, limites y aislamiento de
  proceso cuando el riesgo o la libreria lo requiera; un crash del parser no
  tumba el proceso API ni filtra traceback.
- [ ] Se detectan PDF bombs/decompression bombs con limites de bytes
  descomprimidos, objetos y memoria; el limite de upload de 25 MiB no se
  presenta como limite suficiente de procesamiento.
- [ ] Temporales tienen raiz dedicada, permisos `0700`, nombres no
  controlables, cleanup en exito/error/cancelacion y no se reutilizan entre
  owners/jobs.
- [ ] Se impide traversal y symlink escape al leer entrada, salida o
  tessdata; el path final debe permanecer bajo la raiz esperada.
- [ ] Logs no contienen contenido extraido, prompts, paths privados completos,
  nombres sin sanear, credenciales ni bytes del documento.

## Limites de recursos

Los valores finales deben quedar en configuracion validada y en el contrato
operativo. Como minimo, revisar y probar estos limites sin hardcodearlos en el
parser:

- [ ] Bytes de upload: conserva `max_file_size_bytes` (25 MiB por defecto) y
  lee como maximo `limite + 1` para detectar exceso.
- [ ] Paginas por documento, bloques por pagina, objetos PDF, bytes
  descomprimidos y caracteres extraidos tienen limites independientes.
- [ ] Tiempo total de parseo, tiempo por pagina, tiempo de OCR y tiempo de
  proceso hijo tienen timeout y cancelacion verificables.
- [ ] Memoria/procesos concurrentes de OCR y tamano de salida temporal tienen
  presupuesto; un worker no puede lanzar un proceso por pagina sin cota.
- [ ] Reintentos tienen maximo, backoff y clasificacion de error. Timeout,
  limite y PDF malicioso no se reintentan infinitamente.
- [ ] Se prueba que una entrada justo bajo el limite pasa y justo sobre el
  limite falla con error estable, sin reservar el tamano completo varias veces.

## Fixtures sinteticos y pruebas

- [ ] Fixtures son generados en test: pagina con texto, varias paginas con
  orden conocido, tabla simple, pagina sin texto, caracteres Unicode y PDF
  truncado. No se agregan documentos reales, datos personales ni credenciales.
- [ ] Fixture de PDF bomb usa streams sinteticamente pequenos o metadatos
  controlados para probar el gate sin incluir payload peligroso en el repo.
- [ ] Fixture OCR fake devuelve texto y confianza deterministas; registra
  llamadas, argumentos saneados y cero red. El resultado real de Tesseract no
  se congela como snapshot obligatorio.
- [ ] Se cubren documento nativo, escaneado, mixto, vacio, protegido,
  ilegible, limite de paginas/bytes, timeout, cancelacion y proceso hijo con
  exit code no cero.
- [ ] Se cubren owner autorizado/no autorizado, job inexistente, reintento,
  duplicado, artefacto ausente, symlink y limpieza despues de exception.
- [ ] Los tests no dependen de `Base.metadata.create_all` para validar una
  migracion; esa validacion usa Alembic sobre SQLite temporal.

## Validacion Alembic

- [ ] En una base SQLite vacia: `alembic upgrade head`, inspeccion de tablas,
  indices, constraints y `alembic current` en el head esperado.
- [ ] En una base creada con `a1a4730`: aplicar todas las revisiones sin
  editar manualmente el esquema y conservar datos sinteticos existentes.
- [ ] Probar `alembic downgrade -1` y `alembic upgrade head` en una copia
  temporal; documentar cualquier operacion no reversible y su razon.
- [ ] `alembic check` no reports cambios pendientes despues de importar todos
  los modelos; no usar `create_all` en runtime.
- [ ] La migracion no guarda texto OCR completo, blobs ni paths absolutos si el
  contrato no lo requiere; cualquier indice tiene justificacion y coste.
- [ ] CI ejecuta la migracion con Python 3.11+ y SQLite temporal, sin servicios
  externos, y el nombre de revision no colisiona con otra ola.

## Gates de pruebas finales

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
alembic check
```

```bash
cd ..
bun install --frozen-lockfile
bun run lint
bun run build
cd frontend
bun install --frozen-lockfile
bun run lint
bun run build
```

Gate funcional: upload sintetico, extraccion nativa, decision OCR, OCR fake,
OCI fake separado, transicion offline, resultado autorizado/no autorizado y
limpieza de temporales.

Gate de seguridad: cero conexiones de red durante la suite, PDF malicioso
sintetico, traversal/symlink, timeout/memoria, permisos `0700/0600`, ausencia
de secretos en diff/logs y fallo cerrado cuando falta Tesseract.

## Criterio de listo y riesgos

- [ ] A, B y C tienen SHAs revisables, bases documentadas y gates verdes.
- [ ] PyMuPDF/pdfplumber, OCRmyPDF/Tesseract y OCI mantienen fronteras y
  dependencias documentadas; no hay proveedor real oculto tras un fake.
- [ ] Limites, timeouts, cleanup y errores son configurables y probados.
- [ ] Alembic pasa desde cero y desde `a1a4730`, con downgrade local probado.
- [ ] No se modifico logica de dominio desde este agente; solo esta checklist
  fue anadida.
- [ ] Worktree final limpio salvo el commit de esta checklist y sin artefactos
  generados.

Riesgos residuales que debe aceptar el integrador antes del merge:

- [ ] PyMuPDF, pdfplumber, OCRmyPDF, Ghostscript y Tesseract tienen superficies
  de parser/binario distintas; actualizar versiones requiere repetir el gate
  de seguridad, no solo el unit test.
- [ ] SQLite no reproduce todos los limites de produccion ni el aislamiento de
  procesos; el despliegue debe confirmar sandbox, cuotas y usuario sin
  privilegios.
- [ ] El criterio automatico para decidir OCR puede producir falsos positivos;
  el contrato debe conservar warning/origen para permitir revision posterior.
- [ ] Un fallo parcial despues de OCR puede dejar temporales o texto sensible;
  la limpieza y retencion deben verificarse tambien durante shutdown abrupto.
