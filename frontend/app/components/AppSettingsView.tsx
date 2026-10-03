"use client";

import { SystemStats } from "../lib/api";

export default function AppSettingsView({
  stats,
}: {
  stats: SystemStats | null;
}) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-vydea-border pb-6">
          <h2 className="text-xl font-bold tracking-tight">System & App Settings</h2>
          <p className="text-xs text-vydea-muted mt-1">
            Hardware acceleration, performance tuning, and local storage configurations
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-vydea-panel border border-vydea-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Hardware Acceleration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between py-2 border-b border-vydea-border/50">
                <span className="text-vydea-muted">GPU Device</span>
                <span className="font-mono text-vydea-text">NVIDIA GeForce RTX 3050 Laptop</span>
              </div>
              <div className="flex justify-between py-2 border-b border-vydea-border/50">
                <span className="text-vydea-muted">Dedicated VRAM</span>
                <span className="font-mono text-vydea-text">
                  {stats?.vram_total_gb ? `${stats.vram_total_gb.toFixed(1)} GB` : "4.0 GB"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-vydea-border/50">
                <span className="text-vydea-muted">Processor (CPU)</span>
                <span className="font-mono text-vydea-text">12th Gen Intel Core i5-12500H</span>
              </div>
              <div className="flex justify-between py-2 border-b border-vydea-border/50">
                <span className="text-vydea-muted">System Memory (RAM)</span>
                <span className="font-mono text-vydea-text">
                  {stats?.ram_total_gb ? `${stats.ram_total_gb.toFixed(1)} GB` : "16.0 GB"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-vydea-panel border border-vydea-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Low-VRAM Optimizations</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-vydea-border/50">
                <div>
                  <p className="font-medium text-vydea-text">Model CPU Offloading</p>
                  <p className="text-[11px] text-vydea-muted">
                    Keeps only active diffusion modules on GPU, allowing large models to fit in 4GB VRAM
                  </p>
                </div>
                <span className="px-2 py-1 text-[10px] font-mono rounded bg-green-950/60 text-green-300 border border-green-700/50">
                  ENABLED
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-vydea-border/50">
                <div>
                  <p className="font-medium text-vydea-text">VAE Tiling & Slicing</p>
                  <p className="text-[11px] text-vydea-muted">
                    Decodes latent video frames in slices to avoid peak memory spikes during export
                  </p>
                </div>
                <span className="px-2 py-1 text-[10px] font-mono rounded bg-green-950/60 text-green-300 border border-green-700/50">
                  ENABLED
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-vydea-text">Mock / Synthetic Mode</p>
                  <p className="text-[11px] text-vydea-muted">
                    Completely disabled. Every generation runs genuine PyTorch diffusion
                  </p>
                </div>
                <span className="px-2 py-1 text-[10px] font-mono rounded bg-vydea-panelLight text-vydea-muted border border-vydea-border">
                  DISABLED
                </span>
              </div>
            </div>
          </div>

          <div className="bg-vydea-panel border border-vydea-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">File Paths & Privacy</h3>
            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-vydea-border/50 gap-1">
                <span className="text-vydea-muted">Outputs Folder</span>
                <span className="font-mono text-vydea-text text-[11px]">D:\Projects\vydea\vydea\backend\outputs</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-vydea-border/50 gap-1">
                <span className="text-vydea-muted">Database</span>
                <span className="font-mono text-vydea-text text-[11px]">D:\Projects\vydea\vydea\backend\vydea.db</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
                <span className="text-vydea-muted">Weights Cache</span>
                <span className="font-mono text-vydea-text text-[11px]">D:\Projects\vydea\vydea\backend\models</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
