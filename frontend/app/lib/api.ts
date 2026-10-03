export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export type GenerationStatus = "queued" | "running" | "done" | "error";

export interface Generation {
  id: string;
  prompt: string;
  negative_prompt: string | null;
  model_key: string;
  resolution: string;
  duration_seconds: number;
  status: GenerationStatus;
  progress: number;
  video_path: string | null;
  thumbnail_path: string | null;
  error_message: string | null;
  created_at: number;
  updated_at: number;
}

export interface SystemStats {
  gpu_available: boolean;
  gpu_name: string | null;
  gpu_temp_c: number | null;
  gpu_usage_pct: number | null;
  vram_used_gb: number | null;
  vram_total_gb: number | null;
  cpu_usage_pct: number;
  ram_used_gb: number;
  ram_total_gb: number;
}

export interface ModelInfo {
  key: string;
  label: string;
  repo_id: string;
  min_vram_gb: number;
  default_resolution: string;
  description: string;
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  startGeneration: (payload: {
    prompt: string;
    negative_prompt?: string;
    model_key: string;
    resolution: string;
    duration_seconds: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    seed?: number | null;
  }) =>
    fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => j<{ id: string; status: string }>(r)),

  getGeneration: (id: string) =>
    fetch(`${API_BASE}/api/generate/${id}`).then((r) => j<Generation>(r)),

  listHistory: () =>
    fetch(`${API_BASE}/api/history`).then((r) => j<Generation[]>(r)),

  deleteHistoryItem: (id: string) =>
    fetch(`${API_BASE}/api/history/${id}`, { method: "DELETE" }).then((r) =>
      j<{ deleted: string }>(r)
    ),

  getSystemStats: () =>
    fetch(`${API_BASE}/api/system`).then((r) => j<SystemStats>(r)),

  listModels: () => fetch(`${API_BASE}/api/models`).then((r) => j<ModelInfo[]>(r)),

  videoUrl: (id: string) => `${API_BASE}/api/video/${id}`,
  thumbnailUrl: (id: string) => `${API_BASE}/api/thumbnail/${id}`,

  progressSocketUrl: (id: string) => `${WS_BASE}/api/generate/${id}/ws`,
};
