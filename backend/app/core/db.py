"""
Lightweight SQLite persistence for generation history.
No ORM needed for a table this simple -- keeps the dependency list small
so setup on a fresh machine stays fast.
"""
import sqlite3
import json
import time
import uuid
from contextlib import contextmanager
from .config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    model_key TEXT NOT NULL,
    resolution TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    status TEXT NOT NULL,           -- queued | running | done | error
    progress REAL DEFAULT 0,
    video_path TEXT,
    thumbnail_path TEXT,
    error_message TEXT,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL
);
"""


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.execute(SCHEMA)


def create_generation(prompt, negative_prompt, model_key, resolution, duration_seconds):
    gen_id = str(uuid.uuid4())
    now = time.time()
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO generations
               (id, prompt, negative_prompt, model_key, resolution, duration_seconds,
                status, progress, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?)""",
            (gen_id, prompt, negative_prompt, model_key, resolution, duration_seconds, now, now),
        )
    return gen_id


def update_generation(gen_id, **fields):
    if not fields:
        return
    fields["updated_at"] = time.time()
    cols = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [gen_id]
    with get_conn() as conn:
        conn.execute(f"UPDATE generations SET {cols} WHERE id = ?", values)


def get_generation(gen_id):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM generations WHERE id = ?", (gen_id,)).fetchone()
        return dict(row) if row else None


def list_generations(limit=100):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM generations ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def delete_generation(gen_id):
    with get_conn() as conn:
        conn.execute("DELETE FROM generations WHERE id = ?", (gen_id,))
