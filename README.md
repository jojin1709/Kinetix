> [!NOTE]
> **Kinetix v1.0 is live:** Zero cloud fees, 100% offline text-to-video generation powered by AnimateDiff and Stable Diffusion, engineered specifically to run smoothly on consumer GPUs with 4GB VRAM.

<div align="center">

# ⚡ KINETIX

### Autonomous Local Text-to-Video AI Studio

*Generate cinematic AI videos from text prompts entirely on your own GPU — 100% private, offline, with zero subscriptions.*

**Developed by [JOJIN JOHN](https://github.com/jojin1709)**

---

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA_12.4-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Diffusers](https://img.shields.io/badge/HuggingFace-Diffusers-yellow.svg?logo=huggingface&logoColor=black)](https://github.com/huggingface/diffusers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [What is Kinetix?](#what-is-kinetix)
  - [Why Kinetix Exists](#why-kinetix-exists)
  - [Designed for Consumer GPUs (4GB VRAM)](#designed-for-consumer-gpus-4gb-vram)
- [Key Capabilities](#key-capabilities)
- [System Architecture](#system-architecture)
- [Hardware Requirements](#hardware-requirements)
- [Quick Start](#quick-start)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone the Repository](#2-clone-the-repository)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Download Model Weights](#4-download-model-weights)
  - [5. Frontend Setup](#5-frontend-setup)
  - [6. Launch Kinetix](#6-launch-kinetix)
- [Directory Structure](#directory-structure)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Author & Credits](#author--credits)
- [License](#license)

---

## What is Kinetix?

**Kinetix** is a high-performance, full-stack desktop web application that generates real AI videos locally on your machine. Combining a **FastAPI + PyTorch/Diffusers** backend with a modern **Next.js 14** studio interface, Kinetix transforms plain text prompts into smooth, animated MP4 videos without sending a single byte of your data or prompts to the cloud.

### Why Kinetix Exists

Commercial video generation models (Runway, Sora, Kling, Luma) require expensive monthly subscriptions, impose strict generation credits, and expose your creative ideas to third-party servers. 

Kinetix eliminates those barriers:
* **Zero Subscriptions:** Free forever. No tokens, credits, or paywalls.
* **100% Privacy:** All prompt processing, diffusion passes, and video encoding happen completely offline on your hardware.
* **Instant Creative Iteration:** Real-time feedback, seed reproducibility, guidance scale control, and automatic local gallery storage.

### Designed for Consumer GPUs (4GB VRAM)

Running 3D video diffusion usually requires datacenter GPUs with 16GB–24GB VRAM. Kinetix incorporates cutting-edge memory optimization techniques:
* **Micro-Chunked VAE Decoding (`decode_chunk_size=1`):** Decodes video latents frame-by-frame instead of all 16 frames in one batch, preventing out-of-memory crashes on 4GB VRAM.
* **Model CPU Offloading:** Dynamically swaps modules between system RAM and GPU VRAM during inference.
* **VAE Slicing & Tiling:** Splits high-dimensional tensor operations into manageable tiles.
* **FP16 Half-Precision:** Reduces weights and activation tensors by 50% without visual degradation.

---

## Key Capabilities

- **Real AI Text-to-Video Diffusion:** Generates coherent, cinematic motion from descriptive prompts using AnimateDiff motion adapters and Stable Diffusion v1.5.
- **Fast 16-Stream Parallel Downloader:** Built-in multi-connection model downloader (`download_models.py`) fetches weights in ~10–12 minutes instead of hours.
- **Real-Time Progress Tracking:** Live WebSocket telemetry and REST fallback keep you updated step-by-step with real-time GPU/VRAM telemetry.
- **Full Studio Interface:**
  - **Generation Studio:** Prompt input, style presets, negative prompt, seed locking, inference step control, and duration selection.
  - **Video Library:** History of all past generations with instant playback, resolution badges, and file details.
  - **Model Manager:** Visual manager displaying active diffusion pipelines, disk footprint, and VRAM requirements.
  - **Hardware Monitor:** Live GPU usage %, VRAM allocation, temperature, CPU, and RAM metrics.

---

## System Architecture

```mermaid
flowchart TD
    UI["Kinetix Web Studio<br/>(Next.js 14 + Tailwind)"] -->|"REST / WebSocket"| API["FastAPI Backend<br/>(Uvicorn)"]
    
    subgraph Engine ["Kinetix Diffusion Engine"]
        API --> PIPELINE["AnimateDiff Pipeline"]
        PIPELINE --> TE["CLIP Text Encoder (FP16)"]
        PIPELINE --> UNET["3D Motion UNet + Adapter"]
        PIPELINE --> VAE["Chunked AutoencoderKL (FP16)"]
    end

    subgraph Memory ["4GB VRAM Optimization Engine"]
        OFFLOAD["CPU Model Offloading"]
        TILES["VAE Tiling & Slicing"]
        CHUNK["Single-Frame Latent Chunking"]
    end

    Engine -.-> Memory
    VAE -->|"16-Frame Tensor"| ENC["ImageIO / OpenCV Video Encoder"]
    ENC --> MP4["Local MP4 Video<br/>(backend/outputs/)"]
    MP4 -->|"Direct Streaming"| UI
```

---

## Hardware Requirements

| Component | Minimum Requirements | Recommended |
| :--- | :--- | :--- |
| **GPU** | NVIDIA RTX 3050 Laptop / Desktop (4.0 GB VRAM) | NVIDIA RTX 3060 / 4060 (6GB - 8GB+ VRAM) |
| **CUDA** | CUDA 11.8 or 12.1+ | CUDA 12.4+ |
| **RAM** | 16 GB DDR4/DDR5 | 16 GB - 32 GB |
| **Storage** | 15 GB Free Disk Space (SSD recommended) | 30 GB Free SSD Space |
| **OS** | Windows 10/11 or Ubuntu Linux 22.04+ | Windows 11 / Linux |

---

## Quick Start

### 1. Prerequisites

Make sure you have installed:
* [Python 3.10 or 3.11](https://www.python.org/)
* [Node.js 18+ and npm](https://nodejs.org/)
* [Git](https://git-scm.com/)
* NVIDIA Driver with CUDA support

### 2. Clone the Repository

```bash
git clone https://github.com/jojin1709/Kinetix.git
cd Kinetix
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install PyTorch with CUDA support:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124

# Install backend dependencies:
pip install -r requirements.txt
```

### 4. Download Model Weights

Kinetix includes a high-speed parallel downloader using 16 connections for fast setup:

```bash
python download_models.py
```

*This will fetch the AnimateDiff motion adapter and Stable Diffusion v1.5 FP16 components into `backend/models/`.*

### 5. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
```

### 6. Launch Kinetix

**Start Backend (Terminal 1):**
```bash
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)** and start generating videos!

---

## Directory Structure

```text
Kinetix/
├── backend/
│   ├── app/
│   │   ├── core/           # Database & configuration
│   │   ├── models/         # Diffusion pipelines & inference engine
│   │   ├── routes/         # REST API & WebSocket endpoints
│   │   └── main.py         # FastAPI application entrypoint
│   ├── models/             # Local model weights (gitignored)
│   ├── outputs/            # Generated MP4 videos (gitignored)
│   ├── thumbnails/         # Video thumbnail previews (gitignored)
│   ├── download_models.py  # 16-connection parallel downloader
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── components/     # Studio UI, Video Player, Settings, TopBar
│   │   ├── lib/            # REST API client & types
│   │   ├── layout.tsx      # Root HTML layout & branding
│   │   └── page.tsx        # Main Studio application
│   ├── package.json
│   └── tailwind.config.ts
├── .gitignore
└── README.md
```

---

## API Reference

### Generate Video
```http
POST /api/generate
Content-Type: application/json

{
  "prompt": "a cinematic drone shot of ocean waves crashing on cliffs",
  "negative_prompt": "blurry, low quality, distorted",
  "model_key": "animatediff",
  "resolution": "512x512",
  "duration_seconds": 5.0,
  "num_inference_steps": 20,
  "guidance_scale": 7.5,
  "seed": 42
}
```

### Stream Progress
```text
WebSocket: ws://127.0.0.1:8000/api/generate/{id}/ws
```

### Generation History
```http
GET /api/history
```

### System & Hardware Stats
```http
GET /api/system
```

---

## Roadmap

- [x] Full AnimateDiff local text-to-video diffusion pipeline
- [x] Memory chunking for 4GB VRAM GPUs (NVIDIA RTX 3050 Laptop)
- [x] 16-stream parallel model downloader script
- [x] Live WebSocket step progress & GPU hardware telemetry
- [ ] Motion LoRA support (Zoom, Pan, Tilt, Rotate)
- [ ] Image-to-Video (I2V) animation mode
- [ ] Wan2.1-1.3B cinematic mode download accelerator
- [ ] Export to GIF & MP4 with custom framerates (12fps - 60fps)

---

## Author & Credits

**Developed by [JOJIN JOHN](https://github.com/jojin1709)**  
Software Engineer & AI Enthusiast.

If you find Kinetix helpful, please consider starring ⭐ the repository!

---

## License

This project is licensed under the [MIT License](LICENSE).
Model weights are subject to the [CreativeML OpenRAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license) license.
