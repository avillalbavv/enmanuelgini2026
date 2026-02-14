# Entrega Padrón 2026 (Web + API)

Esta entrega incluye:
- `web/`: tu sitio actualizado, con búsqueda de padrón por cédula (sin exponer la base).
- `api/`: API en FastAPI para consultar por cédula (`/api/padron?ci=...`) con rate-limit básico.
- `scripts/`: script para construir `data/padron.sqlite` a partir del DVD del padrón (DBF).

## 1) Construir la base (SQLite)

Requisitos:
- Python 3.10+
- `pip install -r scripts/requirements.txt`

Comando (desde la carpeta raíz de esta entrega):

```bash
python scripts/build_db.py --zip DVD-padron2026.zip --out data/padron.sqlite
```

> Nota: el archivo `data/padron.sqlite` NO se incluye porque es muy grande.

## 2) Levantar la API

### Opción A: con Docker (recomendado)

```bash
docker compose up --build
```

La API queda en:
- `http://localhost:8000/api/padron?ci=4880123`
- `http://localhost:8000/health`

### Opción B: sin Docker

```bash
pip install -r api/requirements.txt
PADRON_DB_PATH=data/padron.sqlite uvicorn api.app:app --host 0.0.0.0 --port 8000
```

## 3) Conectar el frontend

En `web/config.js`:

- Si la API corre en el **mismo dominio** (reverse proxy), dejá:
  - `padronApiBase: ""`
- Si la API corre en **otro dominio/subdominio**, poné por ejemplo:
  - `padronApiBase: "https://api.tudominio.com"`

Luego publicás `web/` como sitio estático (Netlify / GitHub Pages / hosting clásico).

## 4) Recomendación para producción (día de elecciones)

- Poner la API detrás de Cloudflare/Nginx y habilitar:
  - cache + WAF
  - rate limit más estricto si hay abuso
- Mantener la respuesta mínima (local/mesa/orden) como ya está.

