import { degToRad } from "./utils";

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

export function toCanvasPoint(clientX, clientY, stageRect, viewScale) {
  return {
    x: (clientX - stageRect.left) / viewScale,
    y: (clientY - stageRect.top) / viewScale,
  };
}

export function toLayerLocalPoint(clientX, clientY, layer, stageRect, viewScale) {
  const cx = stageRect.left + layer.cx * viewScale;
  const cy = stageRect.top + layer.cy * viewScale;
  const dx = (clientX - cx) / viewScale;
  const dy = (clientY - cy) / viewScale;
  const rad = -degToRad(layer.rotation);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: (dx * cos - dy * sin) / layer.scale,
    y: (dx * sin + dy * cos) / layer.scale,
  };
}

export function hitZone(local, layer, HANDLE = 12) {
  const absX = Math.abs(local.x);
  const absY = Math.abs(local.y);
  const atCorner = absX > layer.w / 2 - HANDLE && absY > layer.h / 2 - HANDLE;
  return atCorner ? "scale" : "move";
}

export function cornerResizeCursor(cornerX, cornerY, rotation) {
  const rad = degToRad(rotation);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rx = cornerX * cos - cornerY * sin;
  const ry = cornerX * sin + cornerY * cos;
  return rx * ry >= 0 ? "nwse-resize" : "nesw-resize";
}