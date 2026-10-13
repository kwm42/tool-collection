import type { AppData, ColorRule, SectionData, SectionId } from "../types";
import { SECTIONS, createDefaultSections } from "../sections";

const DATA_KEY = "idle-angels-data-v2";
const LEGACY_DATA_KEY = "idle-angels-data";
const LEGACY_TEXT_KEY = "character-schedule-data";
const LEGACY_COLORS_KEY = "character-schedule-colors";

function safeParseColorRules(value: string | null): ColorRule[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as ColorRule[]) : [];
  } catch {
    return [];
  }
}

function normalizeColorRules(value: unknown): ColorRule[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (rule): rule is ColorRule =>
      !!rule &&
      typeof rule === "object" &&
      typeof (rule as ColorRule).name === "string" &&
      typeof (rule as ColorRule).color === "string",
  );
}

function normalizeSection(value: unknown, fallback: SectionData): SectionData {
  if (!value || typeof value !== "object") return fallback;
  const section = value as Partial<SectionData>;
  return {
    text: typeof section.text === "string" ? section.text : fallback.text,
    colorRules: normalizeColorRules(section.colorRules),
  };
}

export function normalizeAppData(value: unknown): AppData {
  const defaults = createDefaultSections();
  const obj =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rawSections =
    obj.sections && typeof obj.sections === "object"
      ? (obj.sections as Record<string, unknown>)
      : {};

  const sections = {} as Record<SectionId, SectionData>;
  for (const meta of SECTIONS) {
    sections[meta.id] = normalizeSection(
      rawSections[meta.id],
      defaults[meta.id],
    );
  }

  if (!obj.sections && typeof obj.text === "string") {
    sections.schedule = {
      text: obj.text,
      colorRules: normalizeColorRules(obj.colorRules),
    };
  }

  return { version: 2, sections };
}

function readLegacySection(): SectionData | null {
  try {
    const raw = localStorage.getItem(LEGACY_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        text?: unknown;
        colorRules?: unknown;
      };
      return {
        text: typeof parsed.text === "string" ? parsed.text : "",
        colorRules: normalizeColorRules(parsed.colorRules),
      };
    }
  } catch {
    // ignore malformed legacy cache
  }

  const legacyText = localStorage.getItem(LEGACY_TEXT_KEY);
  const legacyColors = localStorage.getItem(LEGACY_COLORS_KEY);
  if (legacyText !== null || legacyColors !== null) {
    return {
      text: legacyText ?? "",
      colorRules: safeParseColorRules(legacyColors),
    };
  }
  return null;
}

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "sections" in parsed) {
        return normalizeAppData(parsed);
      }
    }
  } catch {
    // ignore malformed cache
  }

  const legacy = readLegacySection();
  if (legacy) {
    const sections = createDefaultSections();
    sections.schedule = legacy;
    return { version: 2, sections };
  }
  return null;
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / privacy mode errors
  }
}
