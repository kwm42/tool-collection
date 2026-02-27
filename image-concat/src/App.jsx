import { useEffect, useMemo, useRef, useState } from "react";
import { UploadPanel } from "./components/UploadPanel";
import { ControlsPanel } from "./components/ControlsPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { ActionBar } from "./components/ActionBar";
import { shuffleArray } from "./lib/layout/shuffle";
import { copyCollageToClipboard, exportCollage } from "./lib/canvas/exportCollage";

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_COUNT = 30;
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function loadImageSize(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = url;
  });
}

async function toImageItem(file) {
  const url = URL.createObjectURL(file);

  try {
    const size = await loadImageSize(url);

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      url,
      width: size.width,
      height: size.height,
      ratio: size.width / size.height,
      pixels: size.width * size.height,
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

export default function App() {
  const [images, setImages] = useState([]);
  const [gap, setGap] = useState(2);
  const [radius, setRadius] = useState(4);
  const [background, setBackground] = useState("#ffffff");
  const [layoutMode, setLayoutMode] = useState("organic");
  const [canvasShape, setCanvasShape] = useState("landscape");
  const [layoutSeed, setLayoutSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [exportFormat, setExportFormat] = useState("png");
  const [exportQuality, setExportQuality] = useState(0.92);
  const [exportScale, setExportScale] = useState(2);
  const [exportWidth, setExportWidth] = useState(2560);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const summary = useMemo(() => {
    const totalSize = images.reduce((acc, item) => acc + item.size, 0);
    const totalPixels = images.reduce((acc, item) => acc + (item.pixels || 0), 0);
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);
    const totalMP = (totalPixels / 1_000_000).toFixed(1);
    return `${images.length} images · ${totalMB} MB · ${totalMP} MP`;
  }, [images]);

  const handleFilesSelected = async (fileList) => {
    if (!fileList?.length) {
      return;
    }

    setError("");
    setWarning("");
    setIsLoading(true);

    const files = Array.from(fileList);
    const byType = files.filter((file) => SUPPORTED_TYPES.has(file.type));
    const unsupportedCount = files.length - byType.length;
    const bySize = byType.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);
    const overSizeCount = byType.length - bySize.length;

    const remainingSlots = Math.max(0, MAX_IMAGE_COUNT - imagesRef.current.length);
    const accepted = bySize.slice(0, remainingSlots);
    const droppedByCount = Math.max(0, bySize.length - accepted.length);

    const results = await Promise.allSettled(accepted.map((file) => toImageItem(file)));
    const next = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
    const failedCount = results.length - next.length;

    setImages((prev) => [...prev, ...next]);

    if (next.length > 0) {
      setLayoutSeed(Math.floor(Math.random() * 1_000_000));
      const nextPixels = next.reduce((acc, item) => acc + (item.pixels || 0), 0);
      const currentPixels = imagesRef.current.reduce((acc, item) => acc + (item.pixels || 0), 0);
      const totalMP = (currentPixels + nextPixels) / 1_000_000;
      if (totalMP > 120) {
        setWarning(`Large total pixels (${totalMP.toFixed(1)} MP). Preview/export may be slower on some devices.`);
      }
    }

    const issues = [];
    if (unsupportedCount > 0) {
      issues.push(`${unsupportedCount} unsupported`);
    }
    if (overSizeCount > 0) {
      issues.push(`${overSizeCount} over ${MAX_FILE_SIZE_MB}MB`);
    }
    if (droppedByCount > 0) {
      issues.push(`${droppedByCount} over max count (${MAX_IMAGE_COUNT})`);
    }
    if (failedCount > 0) {
      issues.push(`${failedCount} failed to decode`);
    }

    if (issues.length > 0) {
      setError(`Skipped files: ${issues.join(", ")}.`);
    }

    setIsLoading(false);
  };

  const handleRemove = (id) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClear = () => {
    setImages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    setError("");
    setWarning("");
  };

  const handleShuffle = () => {
    setImages((prev) => shuffleArray(prev));
    setLayoutSeed(Math.floor(Math.random() * 1_000_000));
  };

  const renderOptions = {
    gap,
    radius,
    background,
    mode: layoutMode,
    shape: canvasShape,
    seed: layoutSeed,
    width: Math.max(360, Math.min(4096, Number(exportWidth) || 2560)),
  };

  const handleExport = async () => {
    if (!images.length || isExporting || isCopying) {
      return;
    }

    setError("");
    setIsExporting(true);

    try {
      await exportCollage(images, {
        ...renderOptions,
        format: exportFormat,
        quality: exportQuality,
        scale: exportScale,
      });
    } catch (_err) {
      setError("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!images.length || isExporting || isCopying) {
      return;
    }

    setError("");
    setIsCopying(true);

    try {
      await copyCollageToClipboard(images, { ...renderOptions, scale: exportScale });
    } catch (_err) {
      setError("Copy failed. Your browser may block clipboard image writing.");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dcf0ef_0%,#f8fafc_35%,#f8fafc_100%)] text-slate-800">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Image Concat</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Image Concat Tool</h1>
          <p className="max-w-3xl text-sm text-slate-600 md:text-base">
            Choose canvas shape (portrait/square/landscape), tune params, export or copy current collage.
          </p>
        </header>

        <ActionBar
          hasImages={images.length > 0}
          isLoading={isLoading}
          isExporting={isExporting}
          isCopying={isCopying}
          onClear={handleClear}
          onShuffle={handleShuffle}
          onExport={handleExport}
          onCopy={handleCopy}
        />

        <main className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex min-w-0 flex-col gap-6">
            <ControlsPanel
              gap={gap}
              radius={radius}
              background={background}
              layoutMode={layoutMode}
              canvasShape={canvasShape}
              exportWidth={exportWidth}
              exportFormat={exportFormat}
              exportQuality={exportQuality}
              exportScale={exportScale}
              onGapChange={setGap}
              onRadiusChange={setRadius}
              onBackgroundChange={setBackground}
              onLayoutModeChange={setLayoutMode}
              onCanvasShapeChange={setCanvasShape}
              onExportWidthChange={(value) => setExportWidth(Math.max(360, Math.min(4096, value || 2560)))}
              onExportFormatChange={setExportFormat}
              onExportQualityChange={(value) => setExportQuality(Math.max(0.1, Math.min(1, value || 0.92)))}
              onExportScaleChange={(value) => setExportScale(value === 1 ? 1 : 2)}
            />
            <UploadPanel
              images={images}
              isLoading={isLoading}
              error={error}
              warning={warning}
              summary={summary}
              onFilesSelected={handleFilesSelected}
              onRemove={handleRemove}
              onClear={handleClear}
            />
          </section>
          <PreviewPanel
            images={images}
            gap={gap}
            radius={radius}
            background={background}
            layoutMode={layoutMode}
            layoutSeed={layoutSeed}
            canvasShape={canvasShape}
          />
        </main>
      </div>
    </div>
  );
}
