import type { ColorRule } from "../types";

const DATA_KEY = "idle-angels-data";
const LEGACY_TEXT_KEY = "character-schedule-data";
const LEGACY_COLORS_KEY = "character-schedule-colors";

export interface LocalCache {
  text: string;
  colorRules: ColorRule[];
}

function safeParse(value: string | null): ColorRule[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as ColorRule[]) : [];
  } catch {
    return [];
  }
}

export function loadLocalCache(): LocalCache | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalCache;
      return {
        text: typeof parsed.text === "string" ? parsed.text : "",
        colorRules: Array.isArray(parsed.colorRules) ? parsed.colorRules : [],
      };
    }
  } catch {
    // ignore malformed cache
  }

  const legacyText = localStorage.getItem(LEGACY_TEXT_KEY);
  const legacyColors = localStorage.getItem(LEGACY_COLORS_KEY);
  if (legacyText !== null || legacyColors !== null) {
    return {
      text: legacyText ?? "",
      colorRules: safeParse(legacyColors),
    };
  }

  return null;
}

export function saveLocalCache(cache: LocalCache): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota / privacy mode errors
  }
}
