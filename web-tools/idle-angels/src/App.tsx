import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AppData,
  ColorRule,
  SaveState,
  SectionData,
  SectionId,
} from "./types";
import { buildColorMap, findDuplicates, parseText } from "./lib/schedule";
import { loadAppData, normalizeAppData, saveAppData } from "./lib/storage";
import { isUnlocked } from "./lib/unlock";
import { store } from "./lib/firebase";
import { createDefaultSections, getSectionMeta } from "./sections";
import { Tabs } from "./components/Tabs";
import { Toolbar } from "./components/Toolbar";
import { Legend } from "./components/Legend";
import { ScheduleList } from "./components/ScheduleList";
import { SettingsPanel } from "./components/SettingsPanel";
import { QualityTable } from "./components/QualityTable";
import { Toasts, type ToastItem } from "./components/Toasts";

const serialize = (sections: Record<SectionId, SectionData>) =>
  JSON.stringify(sections);

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("schedule");
  const [sections, setSections] =
    useState<Record<SectionId, SectionData>>(createDefaultSections);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [unlocked, setUnlocked] = useState(isUnlocked);

  const hydrated = useRef(false);
  const lastSaved = useRef("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const pushToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    const local = loadAppData();
    const initial = local?.sections ?? createDefaultSections();
    setSections(initial);
    lastSaved.current = serialize(initial);

    let cancelled = false;
    store
      .get<AppData>()
      .then(async (remote) => {
        if (cancelled) return;
        if (remote) {
          const normalized = normalizeAppData(remote);
          const wasLegacy = !(remote as { sections?: unknown }).sections;
          setSections(normalized.sections);
          saveAppData(normalized);
          lastSaved.current = wasLegacy ? "" : serialize(normalized.sections);
          setSaveState("saved");
        } else if (local === null) {
          await store.save<AppData>({ version: 2, sections: initial });
        }
      })
      .catch(() => {
        if (!cancelled) pushToast("云端读取失败，使用本地数据");
      })
      .finally(() => {
        if (!cancelled) hydrated.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  useEffect(() => {
    if (!hydrated.current) return;
    const current = serialize(sections);
    if (current === lastSaved.current) return;

    setSaveState("unsaved");
    const timer = setTimeout(async () => {
      lastSaved.current = current;
      saveAppData({ version: 2, sections });
      setSaveState("saving");
      try {
        await store.save<AppData>({ version: 2, sections });
        setSaveState("saved");
      } catch {
        setSaveState("error");
        pushToast("云端保存失败，已存本地");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [sections, pushToast]);

  useEffect(() => {
    const sync = () => setUnlocked(isUnlocked());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!unlocked) {
      setEditorOpen(false);
      setSettingsOpen(false);
    }
  }, [unlocked]);

  useEffect(() => {
    if (editorOpen) editorRef.current?.focus();
  }, [editorOpen]);

  const updateSection = useCallback(
    (patch: Partial<SectionData>) => {
      setSections((prev) => ({
        ...prev,
        [activeSection]: { ...prev[activeSection], ...patch },
      }));
    },
    [activeSection],
  );

  const meta = getSectionMeta(activeSection);
  const current = sections[activeSection];
  const entries = parseText(current.text);
  const highlight = findDuplicates(entries);
  const colorMap = buildColorMap(current.colorRules);

  const uniqueChars = new Set<string>();
  let highlightedCount = 0;
  for (const entry of entries) {
    for (const char of entry.characters) {
      uniqueChars.add(char);
      if (highlight.has(`${entry.date}|${char}`)) highlightedCount++;
    }
  }

  const handleClear = () => {
    if (!current.text.trim()) return;
    if (confirm(`确定要清空「${meta.label}」的内容吗？`)) {
      updateSection({ text: "" });
      pushToast("已清空");
    }
  };

  return (
    <div className="min-h-screen p-10">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="mb-2 text-center text-[28px] font-bold text-[#222]">
          Idle Angels 记录
        </h1>
        <p className="mb-6 text-center text-sm text-[#999]">
          神域归来 · 心愿召唤 · 活动记录（自动高亮重复出现的早期条目）
        </p>

        <Tabs active={activeSection} onChange={setActiveSection} />

        <Toolbar
          unlocked={unlocked}
          editorOpen={editorOpen}
          settingsOpen={settingsOpen}
          saveState={saveState}
          onToggleEditor={() => setEditorOpen((v) => !v)}
          onToggleSettings={() => setSettingsOpen((v) => !v)}
          onClear={handleClear}
        />

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            editorOpen ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <textarea
            ref={editorRef}
            value={current.text}
            onChange={(e) => updateSection({ text: e.target.value })}
            placeholder={meta.placeholder}
            className="mb-4 min-h-[200px] w-full resize-y rounded-lg border border-[#e0e0e0] p-3.5 text-sm leading-[1.7] text-[#333] outline-none transition-colors focus:border-[#999]"
          />
        </div>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            settingsOpen ? "max-h-[400px]" : "max-h-0"
          }`}
        >
          <SettingsPanel
            colorRules={current.colorRules}
            onChange={(colorRules: ColorRule[]) => updateSection({ colorRules })}
          />
        </div>

        <Legend />

        <ScheduleList
          entries={entries}
          highlight={highlight}
          colorMap={colorMap}
        />
        <div className="mt-3 text-center text-xs text-[#bbb]">
          {entries.length > 0
            ? `${entries.length} 日期 · ${uniqueChars.size} 条目 · ${highlightedCount} 高亮`
            : ""}
        </div>

        <QualityTable />
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
