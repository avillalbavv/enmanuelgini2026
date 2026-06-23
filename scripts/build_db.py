#!/usr/bin/env python3
"""Construye data/padron.sqlite desde el DVD del padrón (DBF).

Uso (completo):
  python scripts/build_db.py --zip DVD-padron2026.zip --out data/padron.sqlite

Filtrar SOLO un distrito (recomendado para consultas locales):
  python scripts/build_db.py --zip DVD-padron2026.zip --out data/padron.sqlite --distrito PIRIBEBUY

(Opt.) si querés asegurar departamento:
  python scripts/build_db.py --zip DVD-padron2026.zip --out data/padron.sqlite --departamento CORDILLERA --distrito PIRIBEBUY

Ayuda para ver nombres exactos dentro del DVD:
  python scripts/build_db.py --zip DVD-padron2026.zip --list-distritos
  python scripts/build_db.py --zip DVD-padron2026.zip --departamento CORDILLERA --list-distritos
"""

import argparse
import os
import shutil
import sqlite3
import tempfile
import zipfile
import re
import unicodedata
from typing import Optional, Set, Tuple

from dbfread import DBF

Key = Tuple[int, int, int]  # (CODIGO_DEP, CODIGO_DIS, CODIGO_SEC)

def _norm(s: Optional[str]) -> str:
    """Normaliza texto para comparar: upper + sin acentos + espacios."""
    s = (s or "").strip().upper()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s)
    return s

def ensure_dir(path: str):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)

def connect(out_db: str) -> sqlite3.Connection:
    if os.path.exists(out_db):
        os.remove(out_db)
    conn = sqlite3.connect(out_db)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL;")
    cur.execute("PRAGMA synchronous=OFF;")
    cur.execute("PRAGMA temp_store=MEMORY;")
    return conn

def create_schema(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.execute("""
      CREATE TABLE seccio (
        CODIGO_DEP INTEGER,
        CODIGO_DIS INTEGER,
        CODIGO_SEC INTEGER,
        NDEPART TEXT,
        NDISTRITO TEXT,
        DESCRIPCIO TEXT,
        LOCAL_VOTA TEXT,
        DIRECCION TEXT,
        PRIMARY KEY (CODIGO_DEP, CODIGO_DIS, CODIGO_SEC)
      );
    """)
    cur.execute("""
      CREATE TABLE secc_local (
        CODIGO_DEP INTEGER,
        CODIGO_DIS INTEGER,
        CODIGO_SEC INTEGER,
        CODIGO_LOC INTEGER,
        SECC_LOC INTEGER,
        NOMBRE_LOC TEXT,
        PRIMARY KEY (CODIGO_DEP, CODIGO_DIS, CODIGO_SEC, CODIGO_LOC, SECC_LOC)
      );
    """)
    # Tabla principal SIN campos sensibles del afiliado (domicilio personal/fechas/sexo/etc.)
    cur.execute("""
      CREATE TABLE padron (
        NUMERO_CED INTEGER PRIMARY KEY,
        APELLIDO TEXT,
        NOMBRE TEXT,
        COD_DPTO INTEGER,
        COD_DIST INTEGER,
        CODIGO_SEC INTEGER,
        SLOCAL INTEGER,
        SEC_LOC INTEGER,
        MESA INTEGER,
        ORDEN INTEGER
      );
    """)
    conn.commit()

def list_distritos(seccio_path: str, departamento: Optional[str]) -> None:
    dep_norm = _norm(departamento) if departamento else None
    dbf = DBF(seccio_path, load=False, char_decode_errors="ignore")
    pairs = set()
    for r in dbf:
        dep = _norm(r.get("NDEPART"))
        dis = _norm(r.get("NDISTRITO"))
        if dep_norm and dep != dep_norm:
            continue
        pairs.add((dep, dis))
    for dep, dis in sorted(pairs):
        print(f"{dep} | {dis}")
    print(f"\nTotal: {len(pairs)}")

def load_seccio(conn: sqlite3.Connection, path: str, departamento: Optional[str], distrito: Optional[str]) -> Set[Key]:
    cur = conn.cursor()
    dep_norm = _norm(departamento) if departamento else None
    dis_norm = _norm(distrito) if distrito else None
    allowed: Set[Key] = set()
    inserted = 0

    dbf = DBF(path, load=False, char_decode_errors="ignore")
    for r in dbf:
        dep = _norm(r.get("NDEPART"))
        dis = _norm(r.get("NDISTRITO"))
        if dep_norm and dep != dep_norm:
            continue
        if dis_norm and dis != dis_norm:
            continue

        key: Key = (int(r["CODIGO_DEP"]), int(r["CODIGO_DIS"]), int(r["CODIGO_SEC"]))
        allowed.add(key)
        cur.execute(
            """
            INSERT INTO seccio (CODIGO_DEP, CODIGO_DIS, CODIGO_SEC, NDEPART, NDISTRITO, DESCRIPCIO, LOCAL_VOTA, DIRECCION)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                r["CODIGO_DEP"],
                r["CODIGO_DIS"],
                r["CODIGO_SEC"],
                r.get("NDEPART"),
                r.get("NDISTRITO"),
                r.get("DESCRIPCIO"),
                r.get("LOCAL_VOTA"),
                r.get("DIRECCION"),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  seccio insertadas: {inserted:,}")
    return allowed

def load_secc_local(conn: sqlite3.Connection, path: str, allowed_keys: Optional[Set[Key]]):
    cur = conn.cursor()
    inserted = 0
    dbf = DBF(path, load=False, char_decode_errors="ignore")

    for r in dbf:
        key: Key = (int(r["CODIGO_DEP"]), int(r["CODIGO_DIS"]), int(r["CODIGO_SEC"]))
        if allowed_keys is not None and key not in allowed_keys:
            continue
        cur.execute(
            """
            INSERT INTO secc_local (CODIGO_DEP, CODIGO_DIS, CODIGO_SEC, CODIGO_LOC, SECC_LOC, NOMBRE_LOC)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                r["CODIGO_DEP"],
                r["CODIGO_DIS"],
                r["CODIGO_SEC"],
                r.get("CODIGO_LOC"),
                r.get("SECC_LOC"),
                r.get("NOMBRE_LOC"),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  secc_local insertadas: {inserted:,}")

def load_padron(conn: sqlite3.Connection, path: str, allowed_keys: Optional[Set[Key]]):
    cur = conn.cursor()
    dbf = DBF(path, load=False, char_decode_errors="ignore")
    batch = []
    BATCH_SIZE = 20000
    inserted = 0
    skipped = 0

    for r in dbf:
        key: Key = (int(r["COD_DPTO"]), int(r["COD_DIST"]), int(r["CODIGO_SEC"]))
        if allowed_keys is not None and key not in allowed_keys:
            skipped += 1
            continue

        batch.append(
            (
                r["NUMERO_CED"],
                r.get("APELLIDO"),
                r.get("NOMBRE"),
                r["COD_DPTO"],
                r["COD_DIST"],
                r["CODIGO_SEC"],
                r.get("SLOCAL"),
                r.get("SEC_LOC"),
                r.get("MESA"),
                r.get("ORDEN"),
            )
        )

        if len(batch) >= BATCH_SIZE:
            cur.executemany(
                """
                INSERT OR REPLACE INTO padron
                (NUMERO_CED, APELLIDO, NOMBRE, COD_DPTO, COD_DIST, CODIGO_SEC, SLOCAL, SEC_LOC, MESA, ORDEN)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                batch,
            )
            conn.commit()
            inserted += len(batch)
            print(f"  padrón cargados: {inserted:,}")
            batch.clear()

    if batch:
        cur.executemany(
            """
            INSERT OR REPLACE INTO padron
            (NUMERO_CED, APELLIDO, NOMBRE, COD_DPTO, COD_DIST, CODIGO_SEC, SLOCAL, SEC_LOC, MESA, ORDEN)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            batch,
        )
        conn.commit()
        inserted += len(batch)
        print(f"  padrón cargados: {inserted:,}")

    # Índices para joins
    cur.execute("CREATE INDEX idx_padron_geo ON padron(COD_DPTO, COD_DIST, CODIGO_SEC);")
    conn.commit()

    if allowed_keys is not None:
        print(f"  descartados por filtro: {skipped:,}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", help="Ruta al DVD .zip (opcional)")
    ap.add_argument("--input", help="Ruta a carpeta extraída (opcional)")
    ap.add_argument("--out", required=False, help="Ruta salida sqlite, ej: data/padron.sqlite")
    ap.add_argument("--departamento", help="Filtrar por departamento (texto)")
    ap.add_argument("--distrito", help="Filtrar por distrito (texto)")
    ap.add_argument("--list-distritos", action="store_true", help="Lista DEPARTAMENTO | DISTRITO y sale")
    args = ap.parse_args()

    if not args.zip and not args.input:
        raise SystemExit("Debés pasar --zip o --input")

    tmpdir = None
    try:
        src = None
        if args.zip:
            tmpdir = tempfile.mkdtemp(prefix="padron_dvd_")
            with zipfile.ZipFile(args.zip) as z:
                z.extractall(tmpdir)
            cand = os.path.join(tmpdir, "DVD-padron2026")
            src = cand if os.path.isdir(cand) else tmpdir
        else:
            src = args.input

        mas = os.path.join(src, "mas_pda.dbf")
        seccio = os.path.join(src, "seccio.dbf")
        secc_local = os.path.join(src, "secc_local.dbf")

        for p in [mas, seccio, secc_local]:
            if not os.path.exists(p):
                raise SystemExit(f"No encuentro {os.path.basename(p)} en {src}")

        if args.list_distritos:
            list_distritos(seccio, args.departamento)
            return

        if not args.out:
            raise SystemExit("Debés pasar --out si no usás --list-distritos")

        ensure_dir(args.out)
        conn = connect(args.out)
        print("Creando esquema…")
        create_schema(conn)

        # Si hay filtro por distrito/departamento, limitamos todo a esas secciones
        filtering = bool(args.departamento or args.distrito)
        if filtering:
            print("Cargando secciones (FILTRADO)…")
        else:
            print("Cargando secciones…")

        allowed_keys = load_seccio(conn, seccio, args.departamento, args.distrito)

        if filtering and not allowed_keys:
            raise SystemExit(
                "No encontré coincidencias para el filtro.\n"
                "Tip: ejecutá --list-distritos para ver los nombres exactos y luego repetí el comando."
            )

        print("Cargando seccionales/locales…")
        load_secc_local(conn, secc_local, allowed_keys if filtering else None)

        print("Cargando padrón (esto puede tardar)…")
        load_padron(conn, mas, allowed_keys if filtering else None)

        conn.close()
        print("OK ->", args.out)
    finally:
        if tmpdir:
            shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    main()
