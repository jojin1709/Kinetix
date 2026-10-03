"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import IconRail from "./components/IconRail";
import TopBar from "./components/TopBar";
import HistoryPanel from "./components/HistoryPanel";
import PromptPanel from "./components/PromptPanel";
import VideoPreview from "./components/VideoPreview";
import SettingsPanel from "./components/SettingsPanel";
import LibraryView from "./components/LibraryView";
import ModelsView from "./components/ModelsView";
import AppSettingsView from "./components/AppSettingsView";
import { api, Generation, ModelInfo, SystemStats } from "./lib/api";

export default function Home() {
  const [activeNav, setActiveNav] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [resolution, setResolution] = useState("512x512");
  const [duration, setDuration] = useState(5);
  const [modelKey, setModelKey] = useState("animatediff");
  const [numInferenceSteps, setNumInferenceSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(5.0);
  const [seed, setSeed] = useState<number | null>(null);
  const [randomSeed, setRandomSeed] = useState(true);
  const [genError, setGenError] = useState<string | null>(null);

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [history, setHistory] = useState<Generation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const current = history.find((h) => h.id === selectedId) || null;
  const anyRunning = history.some((h) => h.status === "queued" || h.status === "running");
  const isGenerating = anyRunning;

  const refreshHistory = useCallback(async () => {
    try {
      const items = await api.listHistory();
      setHistory(items);
      return items;
    } catch {
      // Backend not reachable yet -- normal on first load before `uvicorn` is up.
      return [];
    }
  }, []);

  const trackProgress = useCallback((genId: string) => {
    wsRef.current?.close();
    try {
      const ws = new WebSocket(api.progressSocketUrl(genId));
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setHistory((prev) =>
            prev.map((h) =>
              h.id === genId
                ? { ...h, status: data.status, progress: data.progress, error_message: data.error_message }
                : h
            )
          );
          if (data.status === "done" || data.status === "error") {
            refreshHistory();
            ws.close();
          }
        } catch {}
      };

      ws.onerror = () => {
        // Fallback: refresh from REST after small delay
        setTimeout(refreshHistory, 1500);
      };
    } catch {}
  }, [refreshHistory]);

  useEffect(() => {
    refreshHistory().then((items) => {
      const active = items.find((i) => i.status === "queued" || i.status === "running");
      if (active) {
        setSelectedId(active.id);
        trackProgress(active.id);
      }
    });
    api.listModels().then(setModels).catch(() => {});
    return () => {
      wsRef.current?.close();
    };
  }, [refreshHistory, trackProgress]);

  // Poll system stats every 2s for the live GPU/VRAM/CPU readout.
  useEffect(() => {
    const tick = () => api.getSystemStats().then(setStats).catch(() => {});
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);

  // Guarantee live progress updates even if WebSocket connection drops
  useEffect(() => {
    const hasActive = history.some((h) => h.status === "queued" || h.status === "running");
    if (!hasActive) return;

    const interval = setInterval(() => {
      refreshHistory();
    }, 2000);
    return () => clearInterval(interval);
  }, [history, refreshHistory]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setGenError(null);
    try {
      const { id } = await api.startGeneration({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        model_key: modelKey,
        resolution,
        duration_seconds: duration,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        seed: randomSeed ? null : seed,
      });
      setSelectedId(id);
      await refreshHistory();
      trackProgress(id);
    } catch (err: any) {
      setGenError(err?.message || "Failed to start generation");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const item = history.find((h) => h.id === id);
    if (item && (item.status === "queued" || item.status === "running")) {
      trackProgress(id);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      refreshHistory();
    } catch (err: any) {
      console.error("Failed to delete generation:", err);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setPrompt("");
    setNegativePrompt("");
    setGenError(null);
  };

  return (
    <div className="h-screen flex flex-col bg-vydea-bg text-vydea-text">
      <TopBar stats={stats} />
      <div className="flex flex-1 min-h-0">
        <IconRail active={activeNav} onSelect={setActiveNav} />

        {activeNav === "generate" && (
          <>
            <HistoryPanel
              items={history}
              selectedId={selectedId}
              onSelect={handleSelect}
              onNew={handleNew}
              onDelete={handleDelete}
            />

            <main className="flex-1 min-w-0 overflow-y-auto p-6">
              {genError && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-700/50 text-red-200 text-xs flex justify-between items-center">
                  <span>{genError}</span>
                  <button onClick={() => setGenError(null)} className="text-red-300 hover:text-white ml-2">✕</button>
                </div>
              )}
              <PromptPanel
                prompt={prompt}
                setPrompt={setPrompt}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
              <VideoPreview current={current} history={history} onSelect={handleSelect} />
            </main>

            <SettingsPanel
              resolution={resolution}
              setResolution={setResolution}
              duration={duration}
              setDuration={setDuration}
              modelKey={modelKey}
              setModelKey={setModelKey}
              models={models.length ? models : [
                { key: "animatediff", label: "AnimateDiff (Fast · ~1.8GB)", repo_id: "runwayml/stable-diffusion-v1-5", min_vram_gb: 3.0, default_resolution: "512x512", description: "Ultra fast (~1-2 min generation), low VRAM" },
                { key: "wan2.1-1.3b", label: "Wan2.1-1.3B", repo_id: "", min_vram_gb: 3.5, default_resolution: "832x480", description: "Fast, optimized for consumer GPUs" },
              ]}
              stats={stats}
              numInferenceSteps={numInferenceSteps}
              setNumInferenceSteps={setNumInferenceSteps}
              guidanceScale={guidanceScale}
              setGuidanceScale={setGuidanceScale}
              seed={seed}
              setSeed={setSeed}
              randomSeed={randomSeed}
              setRandomSeed={setRandomSeed}
            />
          </>
        )}

        {activeNav === "library" && (
          <LibraryView
            items={history}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onSwitchToGenerate={() => setActiveNav("generate")}
          />
        )}

        {activeNav === "models" && (
          <ModelsView
            models={models.length ? models : [
              { key: "animatediff", label: "AnimateDiff (Fast · ~1.8GB)", repo_id: "runwayml/stable-diffusion-v1-5", min_vram_gb: 3.0, default_resolution: "512x512", description: "Ultra fast (~1-2 min generation), low VRAM" },
              { key: "wan2.1-1.3b", label: "Wan2.1-1.3B", repo_id: "Wan-AI/Wan2.1-T2V-1.3B-Diffusers", min_vram_gb: 3.5, default_resolution: "832x480", description: "Cinematic quality, requires 5.8GB download" },
            ]}
            activeModelKey={modelKey}
            onSelectModel={setModelKey}
            stats={stats}
          />
        )}

        {activeNav === "settings" && (
          <AppSettingsView stats={stats} />
        )}
      </div>

      <footer className="h-8 flex-shrink-0 border-t border-vydea-border flex items-center justify-between px-5 text-[11px] text-vydea-muted">
        <span>KINETIX v0.1.0 · Developed by JOJIN JOHN · Generate Locally. Keep Your Ideas Private.</span>
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${stats ? "bg-green-500" : "bg-vydea-muted"}`} />
          {stats ? "Backend connected" : "Connecting…"}
        </span>
      </footer>
    </div>
  );
}
