"""
Vydea backend configuration.
Central place for paths, model IDs, and low-VRAM defaults tuned for
4GB-class GPUs (e.g. RTX 3050 Laptop).
"""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

OUTPUTS_DIR = BASE_DIR / "outputs"
THUMBNAILS_DIR = BASE_DIR / "thumbnails"
DB_PATH = BASE_DIR / "vydea.db"

OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)

# Hugging Face model registry available in the app.
# Wan2.1-1.3B is the default: it is the only mainline T2V checkpoint that
# realistically fits a 4GB VRAM budget when combined with CPU offload +
# VAE tiling. Larger models are listed but flagged as requiring more VRAM
# so the UI can warn the user before they try to run them.
AVAILABLE_MODELS = {
    "animatediff": {
        "label": "AnimateDiff (Fast · ~1.8GB)",
        "repo_id": "runwayml/stable-diffusion-v1-5",
        "min_vram_gb": 3.0,
        "default_resolution": "512x512",
        "description": "Ultra fast (~1-2 min generation), low VRAM",
    },
    "wan2.1-1.3b": {
        "label": "Wan2.1-1.3B (Cinematic · 5.8GB)",
        "repo_id": "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
        "min_vram_gb": 3.5,
        "default_resolution": "832x480",
        "description": "Cinematic quality, requires 5.8GB download",
    },
}

DEFAULT_MODEL_KEY = "animatediff"

# Generation defaults
DEFAULT_FPS = 16
DEFAULT_NUM_INFERENCE_STEPS = 30
DEFAULT_GUIDANCE_SCALE = 5.0

# Low-VRAM pipeline behavior. These map directly onto diffusers pipeline
# calls in models/wan_pipeline.py.
LOW_VRAM_MODE = os.environ.get("VYDEA_LOW_VRAM", "1") == "1"

HF_CACHE_DIR = os.environ.get("HF_HOME", str(BASE_DIR / "hf_cache"))
