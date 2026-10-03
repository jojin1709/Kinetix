from fastapi import APIRouter

from app.core.system_stats import get_system_stats
from app.core.config import AVAILABLE_MODELS

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/system")
def system_stats():
    return get_system_stats()


@router.get("/models")
def list_models():
    return [
        {"key": key, **info}
        for key, info in AVAILABLE_MODELS.items()
    ]
