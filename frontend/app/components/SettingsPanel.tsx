"use client";

import { ModelInfo, SystemStats } from "../lib/api";

const RESOLUTIONS = [
  { label: "512 × 512 (AnimateDiff Standard)", value: "512x512" },
  { label: "832 × 480 (Wan 16:9)", value: "832x480" },
  { label: "1024 × 576 (Wan 16:9 HD)", value: "1024x576" },
  { label: "1280 × 720 (Wan 720p)", value: "1280x720" },
];

const DURATIONS = [2, 3, 5, 10, 15];

function Meter({
  label,
  used,
  total,
  unit,
}: {
  label: string;
  used: number | null;
  total: number | null;
  unit: string;
}) {
  const pct = used != null && total ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-vydea-muted">{label}</span>
        <span className="font-mono text-vydea-text">
          {used != null ? `${used.toFixed(1)} / ${total?.toFixed(1)} ${unit}` : "—"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-vydea-panelLight overflow-hidden">
        <div
          className="h-full bg-vydea-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SettingsPanel({
  resolution,
  setResolution,
  duration,
  setDuration,
  modelKey,
  setModelKey,
  models,
  stats,
  numInferenceSteps,
  setNumInferenceSteps,
  guidanceScale,
  setGuidanceScale,
  seed,
  setSeed,
  randomSeed,
  setRandomSeed,
}: {
  resolution: string;
  setResolution: (v: string) => void;
  duration: number;
  setDuration: (v: number) => void;
  modelKey: string;
  setModelKey: (v: string) => void;
  models: ModelInfo[];
  stats: SystemStats | null;
  numInferenceSteps: number;
  setNumInferenceSteps: (v: number) => void;
  guidanceScale: number;
  setGuidanceScale: (v: number) => void;
  seed: number | null;
  setSeed: (v: number | null) => void;
  randomSeed: boolean;
  setRandomSeed: (v: boolean) => void;
}) {
  const activeModel = models.find((m) => m.key === modelKey);

  return (
    <aside className="w-80 flex-shrink-0 border-l border-vydea-border p-5 overflow-y-auto space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Video Settings</h3>

        <label className="block text-xs text-vydea-muted mb-1.5">Resolution</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full bg-vydea-panel border border-vydea-border rounded-lg text-sm px-3 py-2 mb-4 outline-none focus:border-vydea-accent"
        >
          {RESOLUTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="block text-xs text-vydea-muted mb-1.5">
          Duration (seconds)
        </label>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="range"
            min={0}
            max={DURATIONS.length - 1}
            step={1}
            value={DURATIONS.indexOf(duration)}
            onChange={(e) => setDuration(DURATIONS[Number(e.target.value)])}
            className="w-full accent-vydea-accent"
          />
          <span className="text-xs font-mono w-8 text-right">{duration}s</span>
        </div>
        <div className="flex justify-between text-[10px] text-vydea-muted mb-4">
          {DURATIONS.map((d) => (
            <span key={d}>{d}s</span>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <label className="text-vydea-muted">Inference Steps</label>
            <span className="font-mono text-vydea-text text-xs">{numInferenceSteps}</span>
          </div>
          <input
            type="range"
            min={15}
            max={50}
            step={1}
            value={numInferenceSteps}
            onChange={(e) => setNumInferenceSteps(Number(e.target.value))}
            className="w-full accent-vydea-accent"
          />
          <div className="flex justify-between text-[10px] text-vydea-muted mt-0.5">
            <span>15 (faster)</span>
            <span>30 (balanced)</span>
            <span>50 (quality)</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <label className="text-vydea-muted">Guidance Scale (CFG)</label>
            <span className="font-mono text-vydea-text text-xs">{guidanceScale.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={12.0}
            step={0.5}
            value={guidanceScale}
            onChange={(e) => setGuidanceScale(Number(e.target.value))}
            className="w-full accent-vydea-accent"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <label className="text-vydea-muted">Seed</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-vydea-muted hover:text-vydea-text">
              <input
                type="checkbox"
                checked={randomSeed}
                onChange={(e) => {
                  setRandomSeed(e.target.checked);
                  if (e.target.checked) setSeed(null);
                  else if (seed === null) setSeed(Math.floor(Math.random() * 1000000));
                }}
                className="accent-vydea-accent rounded"
              />
              <span>Random</span>
            </label>
          </div>
          {!randomSeed ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={seed ?? 42}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="w-full bg-vydea-panel border border-vydea-border rounded-lg text-xs px-3 py-1.5 font-mono outline-none focus:border-vydea-accent"
              />
              <button
                type="button"
                onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                title="Roll new seed"
                className="px-2.5 py-1 text-xs border border-vydea-border rounded-lg bg-vydea-panelLight hover:border-vydea-accent text-vydea-muted hover:text-white transition-colors"
              >
                🎲
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-vydea-muted italic bg-vydea-panel px-3 py-1.5 rounded-lg border border-vydea-border/50">
              Randomized per generation
            </div>
          )}
        </div>

        <label className="block text-xs text-vydea-muted mb-1.5">Model</label>
        <select
          value={modelKey}
          onChange={(e) => setModelKey(e.target.value)}
          className="w-full bg-vydea-panel border border-vydea-border rounded-lg text-sm px-3 py-2 outline-none focus:border-vydea-accent"
        >
          {models.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        {activeModel && (
          <p className="text-[11px] text-vydea-muted mt-1.5">
            {activeModel.description} · min {activeModel.min_vram_gb}GB VRAM
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">System Status</h3>
        <div className="space-y-3">
          <Meter
            label="VRAM Usage"
            used={stats?.vram_used_gb ?? null}
            total={stats?.vram_total_gb ?? null}
            unit="GB"
          />
          <div className="flex justify-between text-xs">
            <span className="text-vydea-muted">GPU Usage</span>
            <span className="font-mono">{stats?.gpu_usage_pct ?? "—"}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-vydea-muted">GPU Temperature</span>
            <span className="font-mono">
              {stats?.gpu_temp_c != null ? `${stats.gpu_temp_c}°C` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-vydea-muted">CPU Usage</span>
            <span className="font-mono">{stats?.cpu_usage_pct ?? "—"}%</span>
          </div>
          <Meter
            label="RAM Usage"
            used={stats?.ram_used_gb ?? null}
            total={stats?.ram_total_gb ?? null}
            unit="GB"
          />
        </div>
      </div>

      <div className="text-[11px] text-vydea-muted border-t border-vydea-border pt-4">
        No internet required for generation once the model is downloaded.
      </div>
    </aside>
  );
}
