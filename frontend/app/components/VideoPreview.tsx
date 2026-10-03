"use client";

import { Generation, api } from "../lib/api";

export default function VideoPreview({
  current,
  history,
  onSelect,
}: {
  current: Generation | null;
  history: Generation[];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Video Preview</h3>
        {current && (
          <span className="text-xs text-vydea-muted font-mono">
            {current.resolution} · {current.duration_seconds}s · MP4
          </span>
        )}
      </div>

      <div className="rounded-xl border border-vydea-border bg-black aspect-video flex items-center justify-center overflow-hidden">
        {!current && (
          <p className="text-sm text-vydea-muted">
            Generate a clip to see the preview here
          </p>
        )}

        {current?.status === "queued" && (
          <p className="text-sm text-vydea-muted">Queued…</p>
        )}

        {current?.status === "running" && (
          <div className="w-2/3 text-center">
            <p className="text-sm text-vydea-muted mb-3">
              Generating — {Math.round((current.progress || 0) * 100)}%
            </p>
            <div className="h-1.5 rounded-full bg-vydea-panelLight overflow-hidden">
              <div
                className="h-full bg-vydea-accent transition-all duration-300"
                style={{ width: `${Math.round((current.progress || 0) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {current?.status === "error" && (
          <p className="text-sm text-red-400 px-6 text-center">
            {current.error_message || "Generation failed."}
          </p>
        )}

        {current?.status === "done" && (
          <video
            key={current.id}
            src={api.videoUrl(current.id)}
            poster={api.thumbnailUrl(current.id)}
            controls
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {history.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {history.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-20 h-12 rounded-md overflow-hidden flex-shrink-0 border ${
                current?.id === item.id ? "border-vydea-accent" : "border-vydea-border"
              }`}
            >
              {item.status === "done" ? (
                <img
                  src={api.thumbnailUrl(item.id)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-vydea-panelLight" />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
