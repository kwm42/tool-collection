let uidCounter = 0;

export function uid() {
  uidCounter += 1;
  return `layer-${Date.now().toString(36)}-${uidCounter}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function normalizeDeg(deg) {
  return ((deg + 180) % 360 + 360) % 360 - 180;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function createLayerFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        id: uid(),
        name: file.name,
        src: url,
        w: img.naturalWidth,
        h: img.naturalHeight,
        cx: 0,
        cy: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        visible: true,
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`无法加载图片: ${file.name}`));
    };
    img.src = url;
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}