"""
Wraps the Hugging Face `diffusers` Wan2.1 text-to-video pipeline with the
optimizations needed to fit a 4GB-class GPU (RTX 3050 Laptop and similar):

  - fp16 weights
  - sequential/model CPU offload (keeps only the active submodule on GPU)
  - VAE tiling + slicing (caps peak VRAM during the decode step, which is
    usually the actual OOM point, not the diffusion loop itself)
  - text encoder run on CPU when VRAM is tight

Set VYDEA_MOCK_MODEL=1 to skip loading any real weights and instead emit a
short synthetic clip. This lets you stand up and test the whole app (queue,
progress streaming, history, video serving, UI) in seconds, before
committing to the ~10-40 min real generation time / multi-GB model download.
"""
import os
import time
import logging
from pathlib import Path

import numpy as np
import imageio

from app.core.config import AVAILABLE_MODELS, HF_CACHE_DIR, DEFAULT_FPS, BASE_DIR

logger = logging.getLogger("vydea.pipeline")

MOCK_MODE = os.environ.get("VYDEA_MOCK_MODEL", "0") == "1"

_loaded_pipelines = {}


def _load_animatediff_pipeline():
    if "animatediff" in _loaded_pipelines:
        return _loaded_pipelines["animatediff"]

    import torch
    from diffusers import AnimateDiffPipeline, MotionAdapter, DDIMScheduler

    logger.info("Loading AnimateDiff motion adapter and base model...")
    local_adapter = BASE_DIR / "models" / "animatediff-motion-adapter-v1-5-2"
    local_base = BASE_DIR / "models" / "stable-diffusion-v1-5"

    if (local_adapter / "diffusion_pytorch_model.safetensors").exists():
        adapter_source = str(local_adapter)
        logger.info("Loading motion adapter from local directory: %s", adapter_source)
        adapter = MotionAdapter.from_pretrained(
            adapter_source,
            torch_dtype=torch.float16,
        )
    else:
        logger.info("Loading motion adapter from Hugging Face Hub...")
        adapter = MotionAdapter.from_pretrained(
            "guoyww/animatediff-motion-adapter-v1-5-2",
            torch_dtype=torch.float16,
            cache_dir=HF_CACHE_DIR,
        )

    if (local_base / "unet" / "diffusion_pytorch_model.fp16.safetensors").exists():
        base_source = str(local_base)
        logger.info("Loading base SD 1.5 model from local directory: %s", base_source)
        pipe = AnimateDiffPipeline.from_pretrained(
            base_source,
            motion_adapter=adapter,
            torch_dtype=torch.float16,
            variant="fp16",
        )
    else:
        logger.info("Loading base SD 1.5 model from Hugging Face Hub...")
        pipe = AnimateDiffPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            motion_adapter=adapter,
            torch_dtype=torch.float16,
            variant="fp16",
            cache_dir=HF_CACHE_DIR,
        )

    pipe.scheduler = DDIMScheduler.from_config(
        pipe.scheduler.config,
        beta_schedule="linear",
        steps_offset=1,
        clip_sample=False,
    )
    pipe.enable_model_cpu_offload()
    if hasattr(pipe, "enable_vae_slicing"):
        pipe.enable_vae_slicing()
    elif hasattr(pipe.vae, "enable_slicing"):
        pipe.vae.enable_slicing()

    if hasattr(pipe, "enable_vae_tiling"):
        pipe.enable_vae_tiling()
    elif hasattr(pipe.vae, "enable_tiling"):
        pipe.vae.enable_tiling()

    _loaded_pipelines["animatediff"] = pipe
    return pipe


def _load_real_pipeline(model_key: str):
    """Loads and caches the diffusion pipeline for the given model key."""
    if model_key == "animatediff":
        return _load_animatediff_pipeline()

    if model_key in _loaded_pipelines:
        return _loaded_pipelines[model_key]

    import torch
    from diffusers import WanPipeline, AutoencoderKLWan

    model_info = AVAILABLE_MODELS.get(model_key, AVAILABLE_MODELS["wan2.1-1.3b"])
    repo_id = model_info["repo_id"]

    logger.info("Loading %s from %s (this can take a while the first time)", model_key, repo_id)

    vae = AutoencoderKLWan.from_pretrained(
        repo_id, subfolder="vae", torch_dtype=torch.float32, cache_dir=HF_CACHE_DIR
    )
    pipe = WanPipeline.from_pretrained(
        repo_id, vae=vae, torch_dtype=torch.bfloat16, cache_dir=HF_CACHE_DIR
    )

    pipe.enable_model_cpu_offload()

    if hasattr(pipe.vae, "enable_tiling"):
        pipe.vae.enable_tiling()
    if hasattr(pipe.vae, "enable_slicing"):
        pipe.vae.enable_slicing()

    _loaded_pipelines[model_key] = pipe
    return pipe


def _generate_real(
    model_key: str,
    prompt: str,
    negative_prompt: str,
    width: int,
    height: int,
    num_frames: int,
    num_inference_steps: int,
    guidance_scale: float,
    seed: int | None,
    progress_callback,
):
    import torch

    pipe = _load_real_pipeline(model_key)

    def _cb(pipe_ref, step, timestep, callback_kwargs):
        if progress_callback:
            progress_callback(min((step + 1) / num_inference_steps, 0.98))
        return callback_kwargs

    if seed is None or seed < 0:
        seed = int(time.time())
    generator = torch.Generator(device="cpu").manual_seed(seed)

    if model_key == "animatediff":
        target_frames = 16
        w = (min(width, 512) // 8) * 8 or 512
        h = (min(height, 512) // 8) * 8 or 512

        neg = negative_prompt or "ugly, deformed, bad anatomy, blurry, extra limbs, low quality"
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        result = pipe(
            prompt=prompt,
            negative_prompt=neg,
            width=w,
            height=h,
            num_frames=target_frames,
            num_inference_steps=min(num_inference_steps, 30),
            guidance_scale=guidance_scale or 7.5,
            generator=generator,
            decode_chunk_size=1,
            callback_on_step_end=_cb,
        )
        frames_list = result.frames[0]
        raw = np.array([np.array(img.convert("RGB")) for img in frames_list])
        return raw

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt or None,
        width=width,
        height=height,
        num_frames=num_frames,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        generator=generator,
        callback_on_step_end=_cb,
    )
    raw = result.frames[0]
    if isinstance(raw, np.ndarray) and raw.dtype != np.uint8:
        if raw.max() <= 1.0:
            raw = (raw * 255).clip(0, 255).astype(np.uint8)
        else:
            raw = raw.clip(0, 255).astype(np.uint8)
    return raw


def generate_video(
    model_key: str,
    prompt: str,
    negative_prompt: str,
    output_path: Path,
    thumbnail_path: Path,
    width: int = 832,
    height: int = 480,
    duration_seconds: float = 5.0,
    fps: int = DEFAULT_FPS,
    num_inference_steps: int = 30,
    guidance_scale: float = 5.0,
    seed: int | None = None,
    progress_callback=None,
):
    """
    Runs real Wan2.1 text-to-video generation on GPU and writes MP4 + thumbnail.
    """
    num_frames = max(int(duration_seconds * fps), 1)

    frames = _generate_real(
        model_key=model_key,
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_frames=num_frames,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        seed=seed,
        progress_callback=progress_callback,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    imageio.mimsave(str(output_path), frames, fps=fps, macro_block_size=1)

    thumbnail_path.parent.mkdir(parents=True, exist_ok=True)
    mid_frame = frames[len(frames) // 2]
    imageio.imwrite(str(thumbnail_path), mid_frame)

    if progress_callback:
        progress_callback(1.0)

    return {"num_frames": len(frames), "fps": fps, "width": width, "height": height}
