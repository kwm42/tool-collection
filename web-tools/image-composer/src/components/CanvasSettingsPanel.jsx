const PRESETS = [
  { label: "16:9", w: 1920, h: 1080 },
  { label: "9:16", w: 1080, h: 1920 },
  { label: "4:3", w: 1024, h: 768 },
  { label: "3:4", w: 768, h: 1024 },
  { label: "1:1", w: 1080, h: 1080 },
  { label: "3:2", w: 1200, h: 800 },
  { label: "2:3", w: 800, h: 1200 },
  { label: "21:9", w: 2560, h: 1080 },
];

export function CanvasSettingsPanel({ width, height, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-medium text-slate-500">画布设置</div>
      <div className="flex items-center gap-2">
        <label className="flex flex-1 items-center gap-1 text-xs text-slate-500">
          宽
          <input
            type="number"
            min="1"
            value={width}
            className="w-full rounded border border-slate-300 px-1.5 py-1 text-sm"
            onChange={(e) => onChange(Number(e.target.value) || 1, height)}
          />
        </label>
        <span className="text-slate-400">×</span>
        <label className="flex flex-1 items-center gap-1 text-xs text-slate-500">
          高
          <input
            type="number"
            min="1"
            value={height}
            className="w-full rounded border border-slate-300 px-1.5 py-1 text-sm"
            onChange={(e) => onChange(width, Number(e.target.value) || 1)}
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => onChange(p.w, p.h)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}