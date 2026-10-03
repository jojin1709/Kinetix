"use client";

import { ModelInfo, SystemStats } from "../lib/api";

export default function ModelsView({
  models,
  activeModelKey,
  onSelectModel,
  stats,
}: {
  models: ModelInfo[];
  activeModelKey: string;
  onSelectModel: (key: string) => void;
  stats: SystemStats | null;
}) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-vydea-border pb-6">
          <h2 className="text-xl font-bold tracking-tight">AI Models Manager</h2>
          <p className="text-xs text-vydea-muted mt-1">
            Local diffusion models installed and running on your NVIDIA RTX 3050 GPU
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {models.map((model) => {
            const isActive = model.key === activeModelKey;
            return (
              <div
                key={model.key}
                className={`p-6 rounded-xl border transition-all ${
                  isActive
                    ? "bg-vydea-panel border-vydea-accent/80 shadow-md shadow-vydea-accent/5"
                    : "bg-vydea-panel/50 border-vydea-border hover:border-vydea-border/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-base font-semibold text-white">{model.label}</h3>
                      {isActive && (
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-vydea-accent/20 text-vydea-accent border border-vydea-accent/40">
                          Active Model
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-vydea-muted mb-3">{model.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-vydea-muted">
                      <span>VRAM Req: {model.min_vram_gb} GB</span>
                      <span>·</span>
                      <span>Default Res: {model.default_resolution}</span>
                      <span>·</span>
                      <span>Source: {model.repo_id || "Local weights"}</span>
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-vydea-panelLight text-vydea-muted border border-vydea-border rounded-lg text-xs font-medium cursor-default"
                      >
                        ✓ Selected
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectModel(model.key)}
                        className="px-4 py-2 bg-vydea-accent hover:bg-vydea-accentHover text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Select Model
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-vydea-panel/40 border border-vydea-border rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Local Storage & Hardware Allocation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-vydea-panel p-3.5 rounded-lg border border-vydea-border/60">
              <span className="text-vydea-muted block mb-1">Local Models Path</span>
              <span className="font-mono text-vydea-text text-[11px] break-all">
                D:\Projects\vydea\vydea\backend\models\
              </span>
            </div>
            <div className="bg-vydea-panel p-3.5 rounded-lg border border-vydea-border/60">
              <span className="text-vydea-muted block mb-1">GPU VRAM Budget</span>
              <span className="font-mono text-vydea-text text-[11px]">
                {stats?.vram_total_gb ? `${stats.vram_total_gb.toFixed(1)} GB Available` : "4.0 GB (RTX 3050)"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-vydea-muted italic">
            Models run 100% offline once files are present on your machine.
          </p>
        </div>
      </div>
    </div>
  );
}
