import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { generateTelegramLayout } from "../lib/layout/telegramLayout";
import { createCollageBlob } from "../lib/canvas/exportCollage";

function useElementWidth() {
  const [node, setNode] = useState(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const next = Math.floor(entries[0]?.target?.clientWidth || entries[0]?.contentRect?.width || 0);
      setWidth((prev) => (Math.abs(prev - next) >= 2 ? next : prev));
    });

    setWidth(Math.floor(node.clientWidth || 0));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, width];
}

function getBoardStyle(background) {
  if (background === "transparent") {
    return {
      backgroundColor: "#f8fafc",
      backgroundImage:
        "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
    };
  }

  return {
    background: background || "#ffffff",
  };
}

export function PreviewPanel({ images, gap, radius, background, layoutMode, layoutSeed, canvasShape }) {
  const [viewportRef, containerWidth] = useElementWidth();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerError, setViewerError] = useState("");

  const layout = useMemo(() => {
    if (!images.length) {
      return { width: 0, height: 0, boxes: [], mode: layoutMode, shape: canvasShape };
    }

    const usableWidth = Math.max(containerWidth, 280);
    return generateTelegramLayout(images, {
      width: usableWidth,
      gap,
      mode: layoutMode,
      shape: canvasShape,
      seed: layoutSeed,
    });
  }, [images, containerWidth, gap, layoutMode, canvasShape, layoutSeed]);

  const imageMap = useMemo(() => {
    const map = new Map();
    images.forEach((item) => map.set(item.id, item));
    return map;
  }, [images]);

  useEffect(() => {
    return () => {
      if (viewerUrl) {
        URL.revokeObjectURL(viewerUrl);
      }
    };
  }, [viewerUrl]);

  const handleOpenViewer = async () => {
    if (!images.length || isViewerLoading) {
      return;
    }

    setViewerError("");
    setIsViewerLoading(true);

    try {
      const blob = await createCollageBlob(images, {
        gap,
        radius,
        background,
        mode: layoutMode,
        shape: canvasShape,
        seed: layoutSeed,
        width: 1600,
        scale: 1,
        format: "png",
      });

      if (viewerUrl) {
        URL.revokeObjectURL(viewerUrl);
      }

      setViewerUrl(URL.createObjectURL(blob));
      setIsViewerOpen(true);
    } catch (_err) {
      setViewerError("Failed to generate full-screen preview.");
    } finally {
      setIsViewerLoading(false);
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  return (
    <section className="panel relative flex min-h-[420px] min-w-0 flex-col">
      <h2 className="panel-title">Collage Preview</h2>
      <button
        type="button"
        className="absolute right-5 top-5 rounded-md border border-slate-300 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!images.length || isViewerLoading}
        onClick={handleOpenViewer}
      >
        {isViewerLoading ? "Loading..." : "Zoom"}
      </button>

      {images.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Upload images to generate collage layout.
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="mt-4 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 bg-slate-50 p-0"
          style={{ scrollbarGutter: "stable" }}
        >
          <div style={{ width: "100%" }}>
            <div
              className="relative overflow-hidden"
              style={{ width: `${layout.width}px`, height: `${layout.height}px`, ...getBoardStyle(background) }}
            >
              {layout.boxes.map((box) => {
                const image = imageMap.get(box.id);
                if (!image) {
                  return null;
                }

                return (
                  <div
                    key={box.id}
                    className="absolute overflow-hidden bg-slate-200"
                    style={{
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                      borderRadius: `${radius}px`,
                    }}
                  >
                    <img src={image.url} alt={image.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Layout mode: {layout.mode} · shape: {layout.shape} · {layout.boxes.length} item(s) · {Math.max(layout.width, 0)} x{" "}
        {Math.max(layout.height, 0)} px
      </p>
      {viewerError ? <p className="mt-2 text-xs text-rose-600">{viewerError}</p> : null}

      {isViewerOpen
        ? createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/75 p-4 md:p-8 lg:p-12" onClick={handleCloseViewer}>
              <button
                type="button"
                className="absolute right-4 top-4 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white"
                onClick={handleCloseViewer}
              >
                Close
              </button>
              <div className="flex h-full w-full items-center justify-center" onClick={(event) => event.stopPropagation()}>
                {viewerUrl ? (
                  <img src={viewerUrl} alt="Full collage preview" className="max-h-full max-w-full object-contain shadow-2xl" />
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
