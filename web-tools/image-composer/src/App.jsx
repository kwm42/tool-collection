import { useCallback, useEffect, useMemo, useState } from "react";
import { Stage } from "./components/Stage";
import { UploadPanel } from "./components/UploadPanel";
import { LayerPanel } from "./components/LayerPanel";
import { CanvasSettingsPanel } from "./components/CanvasSettingsPanel";
import { createLayerFromFile, downloadBlob } from "./lib/utils";
import { compositeCanvas } from "./lib/export";

const CANVAS_KEY = "image-composer:canvas";

function defaultCanvas() {
  const landscape = window.innerWidth >= window.innerHeight;
  return landscape ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 };
}

function loadCanvas() {
  const saved = localStorage.getItem(CANVAS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Number.isFinite(parsed.width) && Number.isFinite(parsed.height)) {
        return { width: Math.max(1, Math.round(parsed.width)), height: Math.max(1, Math.round(parsed.height)) };
      }
    } catch {
      /* fall through to default */
    }
  }
  return defaultCanvas();
}

export default function App() {
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [exporting, setExporting] = useState(false);
  const [canvasSize, setCanvasSize] = useState(loadCanvas);

  const canvas = useMemo(() => canvasSize, [canvasSize]);

  useEffect(() => {
    localStorage.setItem(CANVAS_KEY, JSON.stringify(canvasSize));
  }, [canvasSize]);

  useEffect(() => {
    if (!layers.some((l) => l.id === selectedId)) setSelectedId(null);
  }, [layers, selectedId]);

  const addFiles = useCallback(
    async (files) => {
      const created = [];
      for (const file of files) {
        try {
          created.push(await createLayerFromFile(file));
        } catch {
          /* skip unreadable files */
        }
      }
      if (created.length === 0) return;
      setLayers((prev) => {
        const startIndex = prev.length;
        return prev.concat(
          created.map((l, i) => {
            const fit = Math.min(canvas.width / l.w, canvas.height / l.h, 1);
            const scale = fit < 1 ? fit : 1;
            const step = (startIndex + i) * 30;
            return {
              ...l,
              scale,
              cx: (l.w * scale) / 2 + step,
              cy: (l.h * scale) / 2 + step,
            };
          })
        );
      });
      const last = created[created.length - 1];
      setSelectedId(last.id);
    },
    [canvas]
  );

  const updateLayer = useCallback((id, patch) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const alignTopLeft = useCallback(() => {
    setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        cx: (l.w * l.scale) / 2,
        cy: (l.h * l.scale) / 2,
      }))
    );
  }, []);

  const resetLayer = useCallback((id) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, cx: (l.w * 1) / 2, cy: (l.h * 1) / 2, scale: 1, rotation: 0 }
          : l
      )
    );
  }, []);

  const removeLayer = useCallback((id) => {
    setLayers((prev) => {
      const layer = prev.find((l) => l.id === id);
      if (layer) URL.revokeObjectURL(layer.src);
      return prev.filter((l) => l.id !== id);
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const moveLayer = useCallback((id, delta) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });
  }, []);

  const edgeLayer = useCallback((id, where) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      if (where === "top") next.push(item);
      else next.unshift(item);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Delete") return;
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (selectedId) removeLayer(selectedId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeLayer]);

  const handleExport = async () => {
    if (layers.length === 0 || exporting) return;
    setExporting(true);
    try {
      const blob = await compositeCanvas(layers, canvas.width, canvas.height, format, quality);
      const ext = format === "jpeg" ? "jpg" : "png";
      downloadBlob(blob, `image-composer-${Date.now()}.${ext}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <span className="text-lg font-bold text-slate-800">🎨 Image Composer</span>
        <span className="text-sm text-slate-500">多图层合成 · 移动 / 缩放 / 旋转</span>
        <div className="flex-1" />
        <label className="flex items-center gap-1 text-sm text-slate-600">
          格式
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </label>
        {format === "jpeg" && (
          <label className="flex items-center gap-1 text-sm text-slate-600">
            质量
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={quality}
              className="accent-blue-500"
              onChange={(e) => setQuality(Number(e.target.value))}
            />
            <span className="w-9 text-right">{Math.round(quality * 100)}%</span>
          </label>
        )}
        <button
          type="button"
          onClick={alignTopLeft}
          disabled={layers.length === 0}
          className="rounded border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="所有图层左上角对齐到画布原点"
        >
          一键对齐
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={layers.length === 0 || exporting}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? "导出中..." : "导出图片"}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 flex-col gap-3 overflow-y-auto border-r border-slate-200 bg-white p-3">
          <CanvasSettingsPanel
            width={canvasSize.width}
            height={canvasSize.height}
            onChange={(width, height) => setCanvasSize({ width, height })}
          />
          <UploadPanel onAddFiles={addFiles} />
          <LayerPanel
            layers={layers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={updateLayer}
            onMove={moveLayer}
            onEdge={edgeLayer}
            onReset={resetLayer}
            onRemove={removeLayer}
          />
        </aside>
        <Stage
          layers={layers}
          canvas={canvas}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateLayer={updateLayer}
          onCanvasDrop={addFiles}
        />
      </div>
    </div>
  );
}