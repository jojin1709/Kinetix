import { useState } from "react";

const STYLE_CHIPS = ["Cinematic", "Realistic", "Anime", "Nature", "Sci-Fi"];
const EXAMPLE_PROMPT =
  "A cinematic shot of a futuristic city at night, rainy streets, people walking, cyberpunk style, 4k, cinematic lighting";

export default function PromptPanel({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  onGenerate,
  isGenerating,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  negativePrompt: string;
  setNegativePrompt: (v: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const [showNegative, setShowNegative] = useState(false);

  const addStyle = (style: string) => {
    setPrompt(prompt.trim().length ? `${prompt.trim()}, ${style.toLowerCase()} style` : style);
  };

  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    const enhancements = [
      "cinematic lighting, smooth camera tracking shot, shallow depth of field, 4k ultra-detailed, photorealistic texture",
      "dramatic volumetric illumination, slow-motion panning, atmospheric haze, 35mm film grain, masterfully composed",
      "hyper-realistic detail, smooth fluid motion, golden hour lighting, sharp focus, 8k resolution",
    ];
    const pick = enhancements[Math.floor(Math.random() * enhancements.length)];
    if (!prompt.includes(pick.slice(0, 15))) {
      setPrompt(`${prompt.trim()}, ${pick}`);
    }
  };

  return (
    <section>
      <h1 className="text-lg font-semibold">Text to Video</h1>
      <p className="text-sm text-vydea-muted mt-0.5">
        Turn your imagination into videos, locally.
      </p>

      <div className="mt-4 rounded-xl border border-vydea-border bg-vydea-panel focus-within:border-vydea-accent transition-colors">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
          placeholder="Describe the video you want to generate..."
          rows={3}
          className="w-full bg-transparent resize-none px-4 pt-4 pb-2 text-sm outline-none placeholder:text-vydea-muted"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex gap-2 flex-wrap">
            {STYLE_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => addStyle(chip)}
                className="text-xs px-2.5 py-1 rounded-full border border-vydea-border text-vydea-muted hover:text-vydea-text hover:border-vydea-muted transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-vydea-muted font-mono">
            {prompt.length}/1000
          </span>
        </div>
      </div>

      {showNegative && (
        <div className="mt-2.5 rounded-xl border border-vydea-border bg-vydea-panel focus-within:border-vydea-accent transition-colors">
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value.slice(0, 1000))}
            placeholder="Negative prompt (e.g. blurry, distorted, low quality, artifacts)..."
            className="w-full bg-transparent px-4 py-2.5 text-xs outline-none placeholder:text-vydea-muted font-mono"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrompt("")}
            className="text-xs text-vydea-muted hover:text-vydea-text"
          >
            Clear
          </button>
          <button
            onClick={() => setPrompt(EXAMPLE_PROMPT)}
            className="text-xs text-vydea-muted hover:text-vydea-text"
          >
            Examples
          </button>
          <button
            onClick={enhancePrompt}
            disabled={!prompt.trim()}
            className="text-xs text-vydea-accent hover:text-vydea-accentHover disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            title="Enrich prompt with cinematic lighting, depth, and camera motion"
          >
            ✨ Enhance
          </button>
          <button
            onClick={() => setShowNegative(!showNegative)}
            className={`text-xs transition-colors ${showNegative ? "text-vydea-accent font-medium" : "text-vydea-muted hover:text-vydea-text"}`}
          >
            {showNegative ? "Hide negative prompt" : "+ Negative prompt"}
          </button>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || prompt.trim().length === 0}
          className="flex items-center gap-2 bg-vydea-accent hover:bg-vydea-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
            <path d="M6 4l14 8-14 8V4z" />
          </svg>
          {isGenerating ? "Generating…" : "Generate"}
        </button>
      </div>
    </section>
  );
}
