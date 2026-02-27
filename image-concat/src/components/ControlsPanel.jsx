import { CANVAS_SHAPE_OPTIONS, LAYOUT_MODE_OPTIONS } from "../lib/layout/telegramLayout";

export function ControlsPanel({
  gap,
  radius,
  layoutMode,
  canvasShape,
  background,
  exportWidth,
  exportFormat,
  exportQuality,
  exportScale,
  onGapChange,
  onRadiusChange,
  onLayoutModeChange,
  onCanvasShapeChange,
  onBackgroundChange,
  onExportWidthChange,
  onExportFormatChange,
  onExportQualityChange,
  onExportScaleChange,
}) {
  return (
    <section className="panel space-y-4">
      <h2 className="panel-title">Layout Controls</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Layout Mode</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
            value={layoutMode}
            onChange={(event) => onLayoutModeChange(event.target.value)}
          >
            {LAYOUT_MODE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Canvas Shape</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
            value={canvasShape}
            onChange={(event) => onCanvasShapeChange(event.target.value)}
          >
            {CANVAS_SHAPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Background</span>
          <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5">
            <input
              type="color"
              className="h-7 w-10 cursor-pointer rounded border border-slate-300"
              value={background === "transparent" ? "#ffffff" : background}
              onChange={(event) => onBackgroundChange(event.target.value)}
            />
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700"
              onClick={() => onBackgroundChange("transparent")}
            >
              Transparent
            </button>
          </div>
        </label>
      </div>

      <label className="block space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>Gap</span>
          <span>{gap}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          step="1"
          value={gap}
          className="w-full"
          onChange={(event) => onGapChange(Number(event.target.value))}
        />
      </label>

      <label className="block space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>Corner Radius</span>
          <span>{radius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          step="1"
          value={radius}
          className="w-full"
          onChange={(event) => onRadiusChange(Number(event.target.value))}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Export Width</span>
          <input
            type="number"
            min="360"
            max="4096"
            step="10"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
            value={exportWidth}
            onChange={(event) => onExportWidthChange(Number(event.target.value))}
          />
        </label>

        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Export Format</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
            value={exportFormat}
            onChange={(event) => onExportFormatChange(event.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Resolution</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
            value={exportScale}
            onChange={(event) => onExportScaleChange(Number(event.target.value))}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-700">JPG Quality</span>
          <input
            type="number"
            min="10"
            max="100"
            step="1"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
            value={Math.round(exportQuality * 100)}
            disabled={exportFormat !== "jpg"}
            onChange={(event) => onExportQualityChange(Number(event.target.value) / 100)}
          />
        </label>
      </div>

      <p className="text-xs text-slate-500">
        Parameter changes refresh preview immediately. Export uses the same layout mode, canvas shape and seed as preview.
      </p>
    </section>
  );
}
