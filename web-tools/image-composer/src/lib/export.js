import { loadImage } from "./utils";

export async function compositeCanvas(layers, canvasWidth, canvasHeight, format, quality) {
  const el = document.createElement("canvas");
  el.width = canvasWidth;
  el.height = canvasHeight;
  const ctx = el.getContext("2d");
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
  const cache = new Map();
  for (const layer of layers) {
    if (!layer.visible || layer.opacity <= 0) continue;
    let img = cache.get(layer.src);
    if (!img) {
      img = await loadImage(layer.src);
      cache.set(layer.src, img);
    }
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.cx, layer.cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);
    ctx.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
    ctx.restore();
  }
  return new Promise((resolve) => {
    el.toBlob((blob) => resolve(blob), `image/${format}`, quality);
  });
}