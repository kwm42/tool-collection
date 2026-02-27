import { generateTelegramLayout } from "../layout/telegramLayout";

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load source image"));
    image.src = url;
  });
}

function clipRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawImageCover(ctx, image, box) {
  const srcWidth = image.naturalWidth || image.width;
  const srcHeight = image.naturalHeight || image.height;
  if (!srcWidth || !srcHeight) {
    return;
  }

  const scale = Math.max(box.width / srcWidth, box.height / srcHeight);
  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;
  const dx = box.x + (box.width - drawWidth) / 2;
  const dy = box.y + (box.height - drawHeight) / 2;

  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ];
  return parts.join("");
}

export async function createCollageBlob(images, options = {}) {
  const {
    gap = 2,
    radius = 4,
    mode = "organic",
    shape = "random",
    seed = 0,
    format = "png",
    quality = 0.92,
    scale = 2,
    width = 1080,
    background = "#ffffff",
  } = options;

  if (!images?.length) {
    throw new Error("No images to render");
  }

  const layout = generateTelegramLayout(images, { width, gap, mode, shape, seed });
  const ratio = Math.max(1, Number(scale) || 1);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(layout.width * ratio));
  canvas.height = Math.max(1, Math.round(layout.height * ratio));
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.scale(ratio, ratio);
  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, layout.width, layout.height);
  } else {
    ctx.clearRect(0, 0, layout.width, layout.height);
  }

  const decoded = await Promise.all(
    images.map(async (item) => ({
      id: item.id,
      image: await loadImage(item.url),
    }))
  );
  const imageMap = new Map(decoded.map((item) => [item.id, item.image]));

  layout.boxes.forEach((box) => {
    const image = imageMap.get(box.id);
    if (!image) {
      return;
    }

    ctx.save();
    clipRoundedRect(ctx, box.x, box.y, box.width, box.height, radius);
    ctx.clip();
    drawImageCover(ctx, image, box);
    ctx.restore();
  });

  const mime = format === "jpg" ? "image/jpeg" : "image/png";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to export blob"));
          return;
        }
        resolve(result);
      },
      mime,
      format === "jpg" ? quality : undefined
    );
  });
}

export async function exportCollage(images, options = {}) {
  const format = options.format || "png";
  const ext = format === "jpg" ? "jpg" : "png";
  const blob = await createCollageBlob(images, options);
  const filename = `concat-${getTimestamp()}.${ext}`;
  downloadBlob(blob, filename);
}

export async function copyCollageToClipboard(images, options = {}) {
  const blob = await createCollageBlob(images, { ...options, format: "png" });

  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    throw new Error("Clipboard API is not available in this browser context");
  }

  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
