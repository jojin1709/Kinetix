"use client";

import { useState } from "react";
import { Generation, api } from "../lib/api";

export default function LibraryView({
  items,
  onSelect,
  onDelete,
  onSwitchToGenerate,
}: {
  items: Generation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSwitchToGenerate: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.prompt.toLowerCase().includes(search.toLowerCase()) ||
      item.model_key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vydea-border pb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Video Library</h2>
            <p className="text-xs text-vydea-muted mt-1">
              All generated videos saved locally on your device ({items.length} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search prompts or models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-vydea-panel border border-vydea-border rounded-lg text-xs px-3 py-2 w-64 outline-none focus:border-vydea-accent transition-colors"
            />
            <button
              onClick={onSwitchToGenerate}
              className="px-4 py-2 bg-vydea-accent hover:bg-vydea-accentHover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>+</span> New Video
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-vydea-border rounded-2xl bg-vydea-panel/30">
            <div className="w-12 h-12 rounded-full bg-vydea-panelLight flex items-center justify-center mx-auto mb-3 text-vydea-muted text-xl">
              🎬
            </div>
            <h3 className="text-sm font-semibold mb-1">No videos found</h3>
            <p className="text-xs text-vydea-muted max-w-sm mx-auto mb-5">
              {search
                ? "No generations match your search filter."
                : "You haven't generated any videos yet. Enter a prompt in the Studio to begin."}
            </p>
            <button
              onClick={onSwitchToGenerate}
              className="px-4 py-2 bg-vydea-accent hover:bg-vydea-accentHover text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Go to Studio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="group bg-vydea-panel border border-vydea-border hover:border-vydea-accent/60 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-black/40 cursor-pointer"
              >
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {item.status === "done" ? (
                    <video
                      src={api.videoUrl(item.id)}
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : item.status === "running" ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="w-6 h-6 border-2 border-vydea-accent border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-vydea-muted">
                        Generating ({Math.round(item.progress * 100)}%)
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-red-400 p-4 text-center">
                      Failed: {item.error_message || "Generation error"}
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-vydea-panelLight text-vydea-muted border border-vydea-border">
                        {item.model_key}
                      </span>
                      <span className="text-[10px] text-vydea-muted">
                        {item.resolution} · {item.duration_seconds}s
                      </span>
                    </div>
                    <p className="text-xs font-medium text-vydea-text line-clamp-3 mb-3" title={item.prompt}>
                      {item.prompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-vydea-border/50 text-xs">
                    <span className="text-[10px] text-vydea-muted">
                      {new Date(item.created_at * 1000).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {item.status === "done" && (
                        <a
                          href={api.videoUrl(item.id)}
                          download={`vydea-${item.id}.mp4`}
                          className="px-2 py-1 rounded bg-vydea-panelLight hover:bg-vydea-panel hover:text-white text-vydea-muted transition-colors text-[11px]"
                          title="Download video file"
                        >
                          ⬇ Download
                        </a>
                      )}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="px-2 py-1 rounded hover:bg-red-950/60 hover:text-red-300 text-vydea-muted transition-colors text-[11px]"
                        title="Delete from history"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
