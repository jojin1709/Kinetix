from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.core import db

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
def get_history(limit: int = 100):
    return db.list_generations(limit=limit)


@router.delete("/history/{gen_id}")
def delete_history_item(gen_id: str):
    row = db.get_generation(gen_id)
    if not row:
        raise HTTPException(404, "Generation not found")

    for path_key in ("video_path", "thumbnail_path"):
        p = row.get(path_key)
        if p and Path(p).exists():
            Path(p).unlink(missing_ok=True)

    db.delete_generation(gen_id)
    return {"deleted": gen_id}


@router.get("/video/{gen_id}")
def get_video(gen_id: str):
    row = db.get_generation(gen_id)
    if not row or not row.get("video_path") or not Path(row["video_path"]).exists():
        raise HTTPException(404, "Video not found")
    return FileResponse(row["video_path"], media_type="video/mp4")


@router.get("/thumbnail/{gen_id}")
def get_thumbnail(gen_id: str):
    row = db.get_generation(gen_id)
    if not row or not row.get("thumbnail_path") or not Path(row["thumbnail_path"]).exists():
        raise HTTPException(404, "Thumbnail not found")
    return FileResponse(row["thumbnail_path"], media_type="image/jpeg")
