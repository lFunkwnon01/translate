# CI reproducible

Tarjeta: OL1-R4, Agente D

## Jobs

- `Backend CI`: Python 3.11, instalacion editable con `.[dev]`, pytest con
  `pytest-cov`, Ruff, mypy, `compileall` y Alembic sobre SQLite temporal.
- `Frontend CI`: una matriz para el prototipo Vite de la raiz y la aplicacion
  Next en `frontend/`; cada entrada usa su `bun.lock` con `bun install
  --frozen-lockfile`, lint/typecheck y build.

## Decision de lockfiles

No hay `package-lock.json`; ambos proyectos tienen `bun.lock`. CI usa Bun en
ambos directorios y no ejecuta `npm ci`, evitando generar o imponer un lockfile
distinto en el prototipo raiz.

## Validacion local

La validacion local debe ejecutarse en un entorno con Python 3.11+ y Bun 1.3.14.
La maquina de desarrollo tiene Python 3.14.3 y Bun 1.3.14; no se modifican
artefactos del vault ni se crean dependencias cruzadas entre los dos frontends.
