"""
Reads live GPU/VRAM/CPU/RAM stats for the System Status panel in the UI.
Uses pynvml when an NVIDIA GPU is present; falls back to CPU/RAM-only stats
(and a clearly-marked "no GPU detected" state) so the app still runs on
machines without one, e.g. during frontend development.
"""
import psutil

_nvml_ready = False
try:
    import pynvml

    pynvml.nvmlInit()
    _nvml_ready = True
except Exception:
    _nvml_ready = False


def get_system_stats():
    stats = {
        "gpu_available": False,
        "gpu_name": None,
        "gpu_temp_c": None,
        "gpu_usage_pct": None,
        "vram_used_gb": None,
        "vram_total_gb": None,
        "cpu_usage_pct": psutil.cpu_percent(interval=0.1),
        "ram_used_gb": round(psutil.virtual_memory().used / (1024 ** 3), 1),
        "ram_total_gb": round(psutil.virtual_memory().total / (1024 ** 3), 1),
    }

    if _nvml_ready:
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(name, bytes):
                name = name.decode()
            mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)

            stats.update(
                {
                    "gpu_available": True,
                    "gpu_name": name,
                    "gpu_temp_c": temp,
                    "gpu_usage_pct": util.gpu,
                    "vram_used_gb": round(mem.used / (1024 ** 3), 1),
                    "vram_total_gb": round(mem.total / (1024 ** 3), 1),
                }
            )
        except Exception:
            pass

    return stats
