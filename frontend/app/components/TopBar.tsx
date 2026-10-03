"use client";

import { SystemStats } from "../lib/api";

export default function TopBar({ stats }: { stats: SystemStats | null }) {
  return (
    <header className="h-14 flex-shrink-0 border-b border-vydea-border flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-vydea-accent flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
            <path d="M6 4l14 8-14 8V4z" />
          </svg>
        </div>
        <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
          KINETIX
        </span>
        <span className="text-vydea-muted text-xs hidden sm:inline">
          Local AI Studio
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium hidden md:inline">
          Developed by JOJIN JOHN
        </span>
      </div>

      <div className="flex items-center gap-5 text-xs text-vydea-muted font-mono">
        {stats?.gpu_available ? (
          <>
            <span>{stats.gpu_name}</span>
            <span>
              VRAM {stats.vram_used_gb?.toFixed(1)} / {stats.vram_total_gb?.toFixed(1)} GB
            </span>
            <span>{stats.gpu_usage_pct}%</span>
            <span>{stats.gpu_temp_c}°C</span>
          </>
        ) : (
          <span>No GPU detected</span>
        )}
      </div>
    </header>
  );
}
