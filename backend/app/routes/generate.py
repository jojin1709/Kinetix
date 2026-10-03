import asyncio
import threading
import traceback
from pathlib import Path

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from app.core import db
from app.core.config import AVAILABLE_MODELS, DEFAULT_MODEL_KEY, OUTPUTS_DIR, THUMBNAILS_DIR
from app.models.wan_pipeline import generate_video

router = APIRouter(prefix="/api/generate", tags=["generate"])

# In-memory progress cache, keyed by generation id. The DB row is the
# source of truth for history; this is just for fast websocket polling
# without hitting SQLite every 100ms.
_progress_cache = {}
_active_job_lock = threading.Lock()
_active_job_id = None


class GenerateRequest(BaseModel):
    model_config = {"protected_namespaces": ()}

    prompt: str = Field(..., min_length=1, max_length=1000)
    negative_prompt: str = Field(default="", max_length=1000)
    model_key: str = Field(default=DEFAULT_MODEL_KEY)
    resolution: str = Field(default="512x512")  # WIDTHxHEIGHT
    duration_seconds: float = Field(default=5.0, ge=1, le=15)
    num_inference_steps: int = Field(default=30, ge=10, le=60)
    guidance_scale: float = Field(default=5.0, ge=1.0, le=15.0)
    seed: int | None = Field(default=None)


def _parse_resolution(resolution: str):
    try:
        w, h = resolution.lower().split("x")
        return int(w), int(h)
    except Exception:
        raise HTTPException(400, f"Invalid resolution format: {resolution}")


def _run_job(gen_id: str, req: GenerateRequest):
    global _active_job_id
    width, height = _parse_resolution(req.resolution)
    video_path = OUTPUTS_DIR / f"{gen_id}.mp4"
    thumb_path = THUMBNAILS_DIR / f"{gen_id}.jpg"

    db.update_generation(gen_id, status="running", progress=0)
    _progress_cache[gen_id] = 0.0

    def on_progress(pct: float):
        _progress_cache[gen_id] = pct
        db.update_generation(gen_id, progress=pct)

    try:
        generate_video(
            model_key=req.model_key,
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            output_path=video_path,
            thumbnail_path=thumb_path,
            width=width,
            height=height,
            duration_seconds=req.duration_seconds,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
            seed=req.seed,
            progress_callback=on_progress,
        )
        db.update_generation(
            gen_id,
            status="done",
            progress=1.0,
            video_path=str(video_path),
            thumbnail_path=str(thumb_path),
        )
    except Exception as e:
        traceback.print_exc()
        db.update_generation(gen_id, status="error", error_message=str(e))
    finally:
        _progress_cache.pop(gen_id, None)
        with _active_job_lock:
            if _active_job_id == gen_id:
                _active_job_id = None


@router.post("")
def start_generation(req: GenerateRequest):
    global _active_job_id
    if req.model_key not in AVAILABLE_MODELS:
        raise HTTPException(400, f"Unknown model: {req.model_key}")
    _parse_resolution(req.resolution)  # validate early

    with _active_job_lock:
        if _active_job_id is not None:
            raise HTTPException(
                409,
                "A generation job is already in progress. Please wait for it to complete.",
            )

        gen_id = db.create_generation(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            model_key=req.model_key,
            resolution=req.resolution,
            duration_seconds=req.duration_seconds,
        )
        _active_job_id = gen_id

    thread = threading.Thread(target=_run_job, args=(gen_id, req), daemon=True)
    thread.start()

    return {"id": gen_id, "status": "queued"}


@router.get("/{gen_id}")
def get_generation_status(gen_id: str):
    row = db.get_generation(gen_id)
    if not row:
        raise HTTPException(404, "Generation not found")
    return row


@router.websocket("/{gen_id}/ws")
async def generation_progress_ws(websocket: WebSocket, gen_id: str):
    await websocket.accept()
    try:
        while True:
            row = db.get_generation(gen_id)
            if not row:
                await websocket.send_json({"error": "not_found"})
                break

            progress = _progress_cache.get(gen_id, row["progress"])
            await websocket.send_json(
                {
                    "id": gen_id,
                    "status": row["status"],
                    "progress": progress,
                    "error_message": row["error_message"],
                }
            )

            if row["status"] in ("done", "error"):
                break

            await asyncio.sleep(0.4)
    except WebSocketDisconnect:
        pass
