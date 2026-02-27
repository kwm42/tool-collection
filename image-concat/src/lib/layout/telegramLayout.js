function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeItem(item) {
  return {
    ...item,
    ratio: Math.max(0.15, Number(item.ratio) || 1),
  };
}

function seededFloat(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function hashIds(items) {
  const input = items.map((item) => item.id).join("|");
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

export const CANVAS_SHAPE_OPTIONS = [
  { value: "random", label: "Random" },
  { value: "portrait", label: "Portrait" },
  { value: "square", label: "Square" },
  { value: "landscape", label: "Landscape" },
];

function pickCanvasAspect(items, seed, shape = "random") {
  const avgRatio = items.reduce((acc, item) => acc + item.ratio, 0) / items.length;

  if (shape === "portrait") {
    return 0.72;
  }
  if (shape === "square") {
    return 1;
  }
  if (shape === "landscape") {
    return 1.45;
  }

  const roll = seededFloat(seed + 131);

  // 0: tall, 1: square, 2: wide
  let family;
  if (roll < 0.34) {
    family = 0;
  } else if (roll < 0.67) {
    family = 1;
  } else {
    family = 2;
  }

  // Light bias by image pool characteristics.
  if (avgRatio < 0.85 && seededFloat(seed + 211) > 0.45) {
    family = 0;
  } else if (avgRatio > 1.3 && seededFloat(seed + 223) > 0.45) {
    family = 2;
  }

  const jitter = 0.92 + seededFloat(seed + 307) * 0.16;
  if (family === 0) {
    return 0.72 * jitter;
  }
  if (family === 1) {
    return 1 * jitter;
  }
  return 1.45 * jitter;
}

function calcTargetHeight(items, width, seed, shape) {
  const aspect = pickCanvasAspect(items, seed, shape);
  const avgRatio = items.reduce((acc, item) => acc + item.ratio, 0) / items.length;
  const countBoost = clamp(0.92 + (items.length - 3) * 0.1, 0.85, 2.25);
  const portraitBoost = clamp(1.18 - avgRatio * 0.22, 0.8, 1.25);
  return (width / aspect) * countBoost * portraitBoost;
}

function pickSplitIndex(items, axis, seed, depth) {
  if (items.length <= 1) {
    return 1;
  }

  const weights = items.map((item) => (axis === "vertical" ? item.ratio : 1 / item.ratio));
  const total = weights.reduce((acc, value) => acc + value, 0);
  const pivot = clamp(0.35 + seededFloat(seed + depth * 43) * 0.3, 0.3, 0.7) * total;

  let sum = 0;
  for (let i = 0; i < items.length - 1; i += 1) {
    sum += weights[i];
    if (sum >= pivot) {
      return i + 1;
    }
  }

  return Math.floor(items.length / 2);
}

function splitByIndex(items, index) {
  const safeIndex = clamp(index, 1, items.length - 1);
  return [items.slice(0, safeIndex), items.slice(safeIndex)];
}

function chooseAxis(rect, items, depth, seed) {
  const rectRatio = rect.width / Math.max(rect.height, 1);
  const avgRatio = items.reduce((acc, item) => acc + item.ratio, 0) / items.length;

  if (rectRatio > avgRatio * 1.2) {
    return "vertical";
  }

  if (rectRatio < avgRatio * 0.82) {
    return "horizontal";
  }

  return seededFloat(seed + depth * 17) > 0.5 ? "vertical" : "horizontal";
}

function partitionOrganic(items, rect, gap, depth, seed, boxes) {
  if (items.length === 1 || rect.width < 32 || rect.height < 32) {
    boxes.push({
      id: items[0].id,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
    return;
  }

  const axis = chooseAxis(rect, items, depth, seed);
  const splitIndex = pickSplitIndex(items, axis, seed, depth);
  const [groupA, groupB] = splitByIndex(items, splitIndex);

  if (!groupA.length || !groupB.length) {
    boxes.push({
      id: items[0].id,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
    return;
  }

  const weightFn = axis === "vertical" ? (item) => item.ratio : (item) => 1 / item.ratio;
  const weightA = groupA.reduce((acc, item) => acc + weightFn(item), 0);
  const weightB = groupB.reduce((acc, item) => acc + weightFn(item), 0);
  const total = Math.max(weightA + weightB, 0.0001);

  let splitRatio = weightA / total;
  splitRatio += (seededFloat(seed + depth * 97) - 0.5) * 0.16;
  splitRatio = clamp(splitRatio, 0.25, 0.75);

  const halfGap = gap / 2;

  if (axis === "vertical") {
    const splitX = rect.x + rect.width * splitRatio;
    let leftWidth = splitX - rect.x - halfGap;
    let rightWidth = rect.x + rect.width - splitX - halfGap;

    if (leftWidth < 8 || rightWidth < 8) {
      leftWidth = rect.width * 0.5 - halfGap;
      rightWidth = rect.width - leftWidth - gap;
    }

    partitionOrganic(groupA, { x: rect.x, y: rect.y, width: leftWidth, height: rect.height }, gap, depth + 1, seed + 11, boxes);
    partitionOrganic(
      groupB,
      { x: rect.x + leftWidth + gap, y: rect.y, width: rightWidth, height: rect.height },
      gap,
      depth + 1,
      seed + 19,
      boxes
    );
  } else {
    const splitY = rect.y + rect.height * splitRatio;
    let topHeight = splitY - rect.y - halfGap;
    let bottomHeight = rect.y + rect.height - splitY - halfGap;

    if (topHeight < 8 || bottomHeight < 8) {
      topHeight = rect.height * 0.5 - halfGap;
      bottomHeight = rect.height - topHeight - gap;
    }

    partitionOrganic(groupA, { x: rect.x, y: rect.y, width: rect.width, height: topHeight }, gap, depth + 1, seed + 13, boxes);
    partitionOrganic(
      groupB,
      { x: rect.x, y: rect.y + topHeight + gap, width: rect.width, height: bottomHeight },
      gap,
      depth + 1,
      seed + 23,
      boxes
    );
  }
}

function layoutOrganic(items, width, gap, options = {}) {
  const baseSeed = hashIds(items) + Math.abs(Number(options.seed) || 0);
  const height = calcTargetHeight(items, width, baseSeed, options.shape || "random");
  const boxes = [];

  partitionOrganic(items, { x: 0, y: 0, width, height }, gap, 0, baseSeed, boxes);

  return {
    width,
    height,
    boxes,
  };
}

function layoutJustified(items, width, gap, options = {}) {
  const targetPerRow = clamp(options.targetPerRow || Math.round(Math.sqrt(items.length)), 1, 5);
  const targetHeight = width / (targetPerRow + 0.15);
  const maxLastRowScale = options.maxLastRowScale || 1;

  const boxes = [];
  let row = [];
  let ratioSum = 0;
  let cursorY = 0;

  const commitRow = (isLastRow = false) => {
    if (!row.length) {
      return;
    }

    const rowGap = gap * (row.length - 1);
    let rowHeight = (width - rowGap) / Math.max(ratioSum, 0.1);

    if (isLastRow) {
      rowHeight = Math.min(rowHeight, targetHeight * maxLastRowScale);
    }

    const rowContentWidth = row.reduce((acc, item) => acc + item.ratio * rowHeight, 0) + rowGap;
    const rowOffsetX = Math.max(0, (width - rowContentWidth) / 2);

    let cursorX = rowOffsetX;
    row.forEach((item) => {
      const boxWidth = item.ratio * rowHeight;
      boxes.push({ id: item.id, x: cursorX, y: cursorY, width: boxWidth, height: rowHeight });
      cursorX += boxWidth + gap;
    });

    cursorY += rowHeight + gap;
    row = [];
    ratioSum = 0;
  };

  items.forEach((item, index) => {
    row.push(item);
    ratioSum += item.ratio;

    const projectedWidth = ratioSum * targetHeight + gap * (row.length - 1);
    const isLast = index === items.length - 1;

    if (projectedWidth >= width && row.length >= 2) {
      commitRow(false);
    } else if (isLast) {
      commitRow(true);
    }
  });

  return { width, height: Math.max(0, cursorY - gap), boxes };
}

function layoutMasonry(items, width, gap) {
  const count = items.length;
  const columns = count <= 2 ? 1 : count <= 6 ? 2 : count <= 12 ? 3 : 4;
  const columnWidth = (width - gap * (columns - 1)) / columns;
  const heights = Array.from({ length: columns }, () => 0);
  const boxes = [];

  items.forEach((item) => {
    let col = 0;
    for (let i = 1; i < columns; i += 1) {
      if (heights[i] < heights[col]) {
        col = i;
      }
    }

    const boxHeight = columnWidth / item.ratio;
    const x = col * (columnWidth + gap);
    const y = heights[col];

    boxes.push({ id: item.id, x, y, width: columnWidth, height: boxHeight });
    heights[col] += boxHeight + gap;
  });

  return { width, height: Math.max(0, Math.max(...heights) - gap), boxes };
}

function layoutCompact(items, width, gap) {
  return layoutJustified(items, width, gap, {
    targetPerRow: clamp(Math.round(Math.sqrt(items.length) + 1), 2, 6),
    maxLastRowScale: 1.35,
  });
}

function layoutRows(items, width, gap) {
  return layoutJustified(items, width, gap, {
    targetPerRow: clamp(Math.round(Math.sqrt(items.length) - 0.3), 1, 4),
    maxLastRowScale: 1,
  });
}

const LAYOUT_GENERATORS = {
  organic: layoutOrganic,
  justified: layoutJustified,
  compact: layoutCompact,
  masonry: layoutMasonry,
  rows: layoutRows,
};

export const LAYOUT_MODE_OPTIONS = [
  { value: "organic", label: "Organic (Irregular)" },
  { value: "justified", label: "Justified" },
  { value: "compact", label: "Compact" },
  { value: "masonry", label: "Masonry" },
  { value: "rows", label: "Rows" },
];

export function generateTelegramLayout(items, options = {}) {
  const width = Math.max(options.width || 640, 280);
  const gap = clamp(options.gap ?? 8, 0, 24);
  const mode = options.mode || "organic";
  const seed = Number(options.seed) || 0;
  const shape = options.shape || "random";

  if (!items.length) {
    return { width, height: 0, boxes: [], gap, mode };
  }

  const normalized = items.map(normalizeItem);
  const generator = LAYOUT_GENERATORS[mode] || LAYOUT_GENERATORS.organic;
  const layout = generator(normalized, width, gap, { seed, shape });

  return {
    ...layout,
    mode,
    shape,
    gap,
  };
}
