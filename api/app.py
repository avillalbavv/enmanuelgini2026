import os
import sqlite3
import time
import tempfile
import shutil
import urllib.request
import zipfile
import gzip
from collections import OrderedDict, deque
from typing import Optional, Dict, Any

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

DB_PATH = os.getenv("PADRON_DB_PATH", "data/padron.sqlite")

# If you're on Render Free (ephemeral disk), set PADRON_DB_URL to a direct-download URL
# (e.g. GitHub Release asset URL). The service will download the DB on startup when missing.
DB_URL = os.getenv("PADRON_DB_URL", "").strip()
DB_FORCE_DOWNLOAD = os.getenv("PADRON_DB_FORCE_DOWNLOAD", "0").strip() == "1"

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("PADRON_ALLOWED_ORIGINS", "*").split(",") if o.strip()]

# Rate limit: N requests per window (seconds)
RATE_LIMIT_MAX = int(os.getenv("PADRON_RATE_MAX", "30"))
RATE_LIMIT_WINDOW = int(os.getenv("PADRON_RATE_WINDOW", "60"))

# Simple in-memory rate limiter (per-IP). For multi-instance deployments, use a shared store (Redis).
_ip_hits: Dict[str, deque] = {}

# Tiny cache to reduce DB hits for repeated queries (per process).
CACHE_MAX = int(os.getenv("PADRON_CACHE_MAX", "5000"))
_cache: "OrderedDict[int, Dict[str, Any]]" = OrderedDict()

app = FastAPI(title="Padron API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

def _ensure_db() -> None:
    """Ensure DB exists at DB_PATH. If PADRON_DB_URL is set, download/extract it."""
    if not DB_URL:
        return

    if (not DB_FORCE_DOWNLOAD) and os.path.exists(DB_PATH):
        return

    # Ensure directory exists
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    # Download to temp file
    with tempfile.TemporaryDirectory() as td:
        tmp = os.path.join(td, "padron_download")
        req = urllib.request.Request(
            DB_URL,
            headers={"User-Agent": "PadronAPI/1.1 (Render/Netlify)"},
        )
        with urllib.request.urlopen(req, timeout=120) as r, open(tmp, "wb") as f:
            shutil.copyfileobj(r, f)

        # Detect and extract
        lower = DB_URL.lower()
        if lower.endswith(".zip") or zipfile.is_zipfile(tmp):
            with zipfile.ZipFile(tmp, "r") as zf:
                # find first .sqlite entry
                sqlite_members = [m for m in zf.namelist() if m.lower().endswith(".sqlite")]
                if not sqlite_members:
                    raise RuntimeError("ZIP descargado no contiene archivo .sqlite")
                member = sqlite_members[0]
                # Extract to temp then move
                extracted = zf.extract(member, path=td)
                shutil.move(extracted, DB_PATH)
        elif lower.endswith(".gz"):
            with gzip.open(tmp, "rb") as fin, open(DB_PATH, "wb") as fout:
                shutil.copyfileobj(fin, fout)
        else:
            shutil.move(tmp, DB_PATH)

@app.on_event("startup")
def _startup():
    # On Render Free this runs on every cold start/redeploy.
    _ensure_db()

def _get_client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    client = request.client
    return client.host if client else "unknown"

def _rate_limit_ok(ip: str) -> bool:
    now = time.time()
    q = _ip_hits.get(ip)
    if q is None:
        q = deque()
        _ip_hits[ip] = q

    while q and (now - q[0]) > RATE_LIMIT_WINDOW:
        q.popleft()

    if len(q) >= RATE_LIMIT_MAX:
        return False

    q.append(now)
    return True

def _conn() -> sqlite3.Connection:
    if not os.path.exists(DB_PATH):
        _ensure_db()
    if not os.path.exists(DB_PATH):
        raise RuntimeError(f"DB not found at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn

def _cache_get(ci: int) -> Optional[Dict[str, Any]]:
    val = _cache.get(ci)
    if val is None:
        return None
    _cache.move_to_end(ci, last=True)
    return val

def _cache_set(ci: int, data: Dict[str, Any]) -> None:
    _cache[ci] = data
    _cache.move_to_end(ci, last=True)
    if len(_cache) > CACHE_MAX:
        _cache.popitem(last=False)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/padron")
def padron(request: Request, ci: int = Query(..., ge=1, le=9999999999)):
    ip = _get_client_ip(request)
    if not _rate_limit_ok(ip):
        return JSONResponse(status_code=429, content={"error": "rate_limited"})

    cached = _cache_get(ci)
    if cached is not None:
        return cached

    conn = _conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
          p.NUMERO_CED as ci, p.APELLIDO as apellido, p.NOMBRE as nombre,
          p.MESA as mesa, p.ORDEN as orden,
          s.NDEPART as departamento, s.NDISTRITO as distrito,
          s.DESCRIPCIO as seccion, s.LOCAL_VOTA as local_votacion, s.DIRECCION as direccion_local,
          sl.NOMBRE_LOC as seccional
        FROM padron p
        LEFT JOIN seccio s
          ON s.CODIGO_DEP=p.COD_DPTO AND s.CODIGO_DIS=p.COD_DIST AND s.CODIGO_SEC=p.CODIGO_SEC
        LEFT JOIN secc_local sl
          ON sl.CODIGO_DEP=p.COD_DPTO AND sl.CODIGO_DIS=p.COD_DIST AND sl.CODIGO_SEC=p.CODIGO_SEC
         AND sl.CODIGO_LOC=p.SLOCAL AND sl.SECC_LOC=p.SEC_LOC
        WHERE p.NUMERO_CED=?
        LIMIT 1
        """,
        (ci,),
    )

    row = cur.fetchone()
    conn.close()

    if not row:
        data = {"found": False}
        _cache_set(ci, data)
        return data

    data = {
        "found": True,
        "ci": row["ci"],
        "apellido": (row["apellido"] or "").strip(),
        "nombre": (row["nombre"] or "").strip(),
        "departamento": (row["departamento"] or "").strip(),
        "distrito": (row["distrito"] or "").strip(),
        "seccion": (row["seccion"] or "").strip(),
        "seccional": (row["seccional"] or "").strip(),
        "local_votacion": (row["local_votacion"] or "").strip(),
        "direccion_local": (row["direccion_local"] or "").strip(),
        "mesa": row["mesa"],
        "orden": row["orden"],
    }
    _cache_set(ci, data)
    return data
