"use client";

import { Generation, api } from "../lib/api";

function timeAgo(unixSeconds: number) {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " +
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPanel({
  items,
  selectedId,
  onSelect,
  onNew,
  onDelete,
}: {
  items: Generation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-vydea-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">
          Generation History{" "}
          <span className="text-vydea-muted font-normal">{items.length}</span>
        </h2>
        <button
          onClick={onNew}
          className="w-6 h-6 rounded flex items-center justify-center text-vydea-muted hover:text-vydea-text hover:bg-vydea-panelLight"
          title="New generation"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-vydea-muted px-1 pt-2">
            Your generated clips will show up here.
          </p>
        )}
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left rounded-lg p-2 flex gap-3 border transition-colors cursor-pointer group relative ${
                isSelected
                  ? "border-vydea-accent bg-vydea-panelLight"
                  : "border-transparent hover:bg-vydea-panelLight"
              }`}
            >
              <div className="w-16 h-11 rounded overflow-hidden bg-vydea-panelLight flex-shrink-0 relative">
                {item.status === "done" ? (
                  <img
                    src={api.thumbnailUrl(item.id)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-vydea-muted">
                    {item.status === "error" ? "error" : `${Math.round((item.progress || 0) * 100)}%`}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <p className="text-xs font-medium truncate">{item.prompt}</p>
                <p className="text-[11px] text-vydea-muted mt-0.5">
                  {timeAgo(item.created_at)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                title="Delete generation"
                className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1 text-vydea-muted hover:text-red-400 rounded transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
