import { useLayoutEffect, useRef, useState } from "react";
import { clamp, normalizeDeg } from "../lib/utils";
import {
  toCanvasPoint,
  toLayerLocalPoint,
  hitZone,
  cornerResizeCursor,
} from "../lib/geometry";

const ROTATE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cg stroke='%23111' fill='none' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M16 4a12 12 0 1 0 12 12'/%3E%3C/g%3E%3Cpath d='M28 4v8h-8' stroke='%23111' fill='%23111' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16, grab`;

const HANDLES = [
  { key: "tl", cx: -1, cy: -1 },
  { key: "tr", cx: 1, cy: -1 },
  { key: "br", cx: 1, cy: 1 },
  { key: "bl", cx: -1, cy: 1 },
];

export function Stage({ layers, canvas, selectedId, onSelect, onUpdateLayer, onCanvasDrop }) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [viewScale, setViewScale] = useState(1);
  const [hoverZone, setHoverZone] = useState(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      if (canvas.width <= 0 || canvas.height <= 0) return;
      const rect = el.getBoundingClientRect();
      const fit = Math.min((rect.width - 48) / canvas.width, (rect.height - 48) / canvas.height);
      setViewScale(clamp(fit, 0.05, 2));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvas.width, canvas.height]);

  function layerForEvent(e) {
    const el = e.target.closest("[data-layer-id]");
    if (!el) return null;
    return layers.find((l) => l.id === el.dataset.layerId) || null;
  }

  function startDrag(e) {
    const container = e.currentTarget;
    container.setPointerCapture(e.pointerId);
    const layer = layerForEvent(e);
    if (!layer) {
      setHoverZone(null);
      onSelect(null);
      return;
    }
    const stageRect = container.getBoundingClientRect();
    const rotateHandle = e.target.closest('[data-role="rotate"]');
    const cornerHandle = e.target.closest("[data-handle]");
    const local = toLayerLocalPoint(e.clientX, e.clientY, layer, stageRect, viewScale);
    let type = "move";
    let resizeCursor = null;
    if (rotateHandle) {
      type = "rotate";
    } else if (cornerHandle) {
      type = "scale";
      resizeCursor = cornerResizeCursor(
        Number(cornerHandle.dataset.cx) * layer.w,
        Number(cornerHandle.dataset.cy) * layer.h,
        layer.rotation
      );
    } else if (hitZone(local, layer) === "scale") {
      type = "scale";
      resizeCursor = cornerResizeCursor(
        Math.sign(local.x) * layer.w,
        Math.sign(local.y) * layer.h,
        layer.rotation
      );
    }
    const start = toCanvasPoint(e.clientX, e.clientY, stageRect, viewScale);
    dragRef.current = {
      type,
      layerId: layer.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCx: layer.cx,
      startCy: layer.cy,
      startScale: layer.scale,
      startRotation: layer.rotation,
      startPoint: start,
      startAngle: Math.atan2(start.y - layer.cy, start.x - layer.cx),
      resizeCursor,
    };
    onSelect(layer.id);
  }

  function onMove(e) {
    const container = e.currentTarget;
    const stageRect = container.getBoundingClientRect();
    const drag = dragRef.current;

    if (drag) {
      const layer = layers.find((l) => l.id === drag.layerId);
      if (!layer) return;
      if (drag.type === "move") {
        const p = toCanvasPoint(e.clientX, e.clientY, stageRect, viewScale);
        onUpdateLayer(layer.id, {
          cx: drag.startCx + (p.x - drag.startPoint.x),
          cy: drag.startCy + (p.y - drag.startPoint.y),
        });
      } else if (drag.type === "scale") {
        const local = toLayerLocalPoint(e.clientX, e.clientY, layer, stageRect, viewScale);
        const localStart = toLayerLocalPoint(
          drag.startClientX,
          drag.startClientY,
          layer,
          stageRect,
          viewScale
        );
        const d0 = Math.hypot(localStart.x, localStart.y);
        if (d0 > 0) {
          const d1 = Math.hypot(local.x, local.y);
          onUpdateLayer(layer.id, { scale: clamp(drag.startScale * (d1 / d0), 0.01, 20) });
        }
      } else if (drag.type === "rotate") {
        const p = toCanvasPoint(e.clientX, e.clientY, stageRect, viewScale);
        const angle = Math.atan2(p.y - layer.cy, p.x - layer.cx);
        onUpdateLayer(layer.id, {
          rotation: normalizeDeg(drag.startRotation + ((angle - drag.startAngle) * 180) / Math.PI),
        });
      }
      return;
    }

    const layer = layerForEvent(e);
    if (!layer) {
      setHoverZone(null);
      return;
    }
    if (e.target.closest('[data-role="rotate"]')) {
      setHoverZone("rotate");
      return;
    }
    const local = toLayerLocalPoint(e.clientX, e.clientY, layer, stageRect, viewScale);
    setHoverZone(hitZone(local, layer));
  }

  function endDrag(e) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setHoverZone(null);
  }

  let cursor = "crosshair";
  if (dragRef.current) {
    cursor =
      dragRef.current.type === "move"
        ? "grabbing"
        : dragRef.current.type === "rotate"
          ? ROTATE_CURSOR
          : dragRef.current.resizeCursor;
  } else if (hoverZone === "rotate") {
    cursor = ROTATE_CURSOR;
  } else if (hoverZone === "scale") {
    cursor = "nwse-resize";
  } else if (hoverZone === "move") {
    cursor = "grab";
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-slate-800 select-none touch-none"
      onPointerDown={startDrag}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onCanvasDrop(e.dataTransfer.files);
      }}
      style={{ cursor }}
    >
      <div
        className="relative"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: canvas.width,
          height: canvas.height,
          marginLeft: -canvas.width / 2,
          marginTop: -canvas.height / 2,
          transform: `scale(${viewScale})`,
          transformOrigin: "center",
        }}
      >
        <div
          className="absolute inset-0 shadow-lg"
          style={{
            backgroundColor: "#ffffff",
            backgroundImage:
              "linear-gradient(45deg,#d1d5db 25%,transparent 25%),linear-gradient(-45deg,#d1d5db 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d1d5db 75%),linear-gradient(-45deg,transparent 75%,#d1d5db 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
          }}
        />
        {layers.map((layer) => {
          const selected = layer.id === selectedId;
          return (
            <div
              key={layer.id}
              data-layer-id={layer.id}
              className="absolute"
              style={{
                left: layer.cx - layer.w / 2,
                top: layer.cy - layer.h / 2,
                width: layer.w,
                height: layer.h,
                display: layer.visible ? "block" : "none",
                transform: `rotate(${layer.rotation}deg) scale(${layer.scale})`,
                transformOrigin: "center",
                opacity: layer.opacity,
                boxShadow: selected ? "0 0 0 1.5px #3b82f6" : "none",
              }}
              title={`${layer.name} · 拖动移动 · 四角缩放 · 顶部圆钮旋转`}
            >
              <img
                src={layer.src}
                alt={layer.name}
                className="pointer-events-none h-full w-full"
                draggable={false}
              />
              {selected && (
                <div
                  data-role="rotate"
                  className="absolute left-1/2 -top-14 h-12 w-10 -translate-x-1/2 cursor-grab"
                  title="拖动旋转"
                >
                  <div className="absolute left-1/2 top-4 h-full w-0.5 -translate-x-1/2 bg-blue-600" />
                  <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow" />
                </div>
              )}
              {selected &&
                HANDLES.map((h) => (
                  <div
                    key={h.key}
                    data-handle={h.key}
                    data-cx={h.cx}
                    data-cy={h.cy}
                    className="absolute h-3 w-3 rounded-sm border-2 border-blue-600 bg-white"
                    style={{
                      ...(h.cx < 0 ? { left: -7 } : { right: -7 }),
                      ...(h.cy < 0 ? { top: -7 } : { bottom: -7 }),
                    }}
                  />
                ))}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-2 right-3 text-xs text-slate-400">
        画布 {canvas.width} × {canvas.height} · 拖动移动 / 四角缩放 / 顶部圆钮旋转 / Delete 删除所选图层
      </div>
    </div>
  );
}