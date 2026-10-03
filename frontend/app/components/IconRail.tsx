"use client";

const items = [
  { key: "generate", label: "Generate" },
  { key: "library", label: "Library" },
  { key: "models", label: "Models" },
  { key: "settings", label: "Settings" },
];

function Icon({ name }: { name: string }) {
  const common = "w-5 h-5";
  switch (name) {
    case "generate":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
        </svg>
      );
    case "library":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <rect x="4" y="4" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <rect x="14" y="4" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "models":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path
            d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M19 12a7 7 0 00-.14-1.39l2-1.56-2-3.46-2.36.95a7 7 0 00-1.2-.7L15 3h-4l-.3 2.84a7 7 0 00-1.2.7l-2.36-.95-2 3.46 2 1.56A7 7 0 005 12c0 .47.05.93.14 1.39l-2 1.56 2 3.46 2.36-.95c.37.28.78.51 1.2.7L9 21h4l.3-2.84c.42-.19.83-.42 1.2-.7l2.36.95 2-3.46-2-1.56c.09-.46.14-.92.14-1.39z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function IconRail({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <nav className="w-16 flex-shrink-0 border-r border-vydea-border flex flex-col items-center py-4 gap-1">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            title={item.label}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
              isActive
                ? "bg-vydea-accent text-white"
                : "text-vydea-muted hover:text-vydea-text hover:bg-vydea-panelLight"
            }`}
          >
            <Icon name={item.key} />
          </button>
        );
      })}
    </nav>
  );
}
