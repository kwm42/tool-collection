import { useEffect, useMemo, useRef, useState } from "react";
import { generateTelegramLayout } from "../lib/layout/telegramLayout";

function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const next = Math.floor(entries[0]?.target?.clientWidth || entries[0]?.contentRect?.width || 0);
      setWidth((prev) => (Math.abs(prev - next) >= 2 ? next : prev));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
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

  const layout = useMemo(() => {
    if (!images.length) {
      return { width: 0, height: 0, boxes: [], mode: layoutMode };
    }

    const usableWidth = Math.max(containerWidth - 8, 280);
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

  return (
    <section className="panel flex min-h-[420px] min-w-0 flex-col">
      <h2 className="panel-title">Collage Preview</h2>

      {images.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Upload images to generate collage layout.
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="mt-4 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="mx-auto" style={{ width: `${layout.width}px`, maxWidth: "100%" }}>
            <div className="relative overflow-hidden" style={{ width: `${layout.width}px`, height: `${layout.height}px`, ...getBoardStyle(background) }}>
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
    </section>
  );
}
