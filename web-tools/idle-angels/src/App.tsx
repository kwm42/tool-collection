import { useCallback, useEffect, useRef, useState } from "react";

import type { ColorRule, SaveState, ScheduleData } from "./types";
import {
  DEFAULT_DATA,
  buildColorMap,
  findDuplicates,
  parseText,
} from "./lib/schedule";
import { loadLocalCache, saveLocalCache } from "./lib/storage";
import { isUnlocked } from "./lib/unlock";
import { store } from "./lib/firebase";
import { Toolbar } from "./components/Toolbar";
import { Legend } from "./components/Legend";
import { ScheduleList } from "./components/ScheduleList";
import { SettingsPanel } from "./components/SettingsPanel";
import { QualityTable } from "./components/QualityTable";
import { Toasts, type ToastItem } from "./components/Toasts";

export default function App() {
  const [text, setText] = useState("");
  const [colorRules, setColorRules] = useState<ColorRule[]>([]);
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
    const local = loadLocalCache();
    const initialText = local?.text ?? DEFAULT_DATA;
    const initialRules = local?.colorRules ?? [];
    setText(initialText);
    setColorRules(initialRules);
    lastSaved.current = JSON.stringify({
      text: initialText,
      colorRules: initialRules,
    });

    let cancelled = false;
    store
      .get<ScheduleData>()
      .then(async (remote) => {
        if (cancelled) return;
        if (remote) {
          const nextText = typeof remote.text === "string" ? remote.text : "";
          const nextRules = Array.isArray(remote.colorRules)
            ? remote.colorRules
            : [];
          setText(nextText);
          setColorRules(nextRules);
          saveLocalCache({ text: nextText, colorRules: nextRules });
          lastSaved.current = JSON.stringify({
            text: nextText,
            colorRules: nextRules,
          });
          setSaveState("saved");
        } else if (initialText) {
          await store.save<ScheduleData>({
            text: initialText,
            colorRules: initialRules,
            updatedAt: Date.now(),
          });
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
    const current = JSON.stringify({ text, colorRules });
    if (current === lastSaved.current) return;

    setSaveState("unsaved");
    const timer = setTimeout(async () => {
      lastSaved.current = current;
      saveLocalCache({ text, colorRules });
      setSaveState("saving");
      try {
        await store.save<ScheduleData>({
          text,
          colorRules,
          updatedAt: Date.now(),
        });
        setSaveState("saved");
      } catch {
        setSaveState("error");
        pushToast("云端保存失败，已存本地");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [text, colorRules, pushToast]);

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

  const entries = parseText(text);
  const highlight = findDuplicates(entries);
  const colorMap = buildColorMap(colorRules);

  const uniqueChars = new Set<string>();
  let highlightedCount = 0;
  for (const entry of entries) {
    for (const char of entry.characters) {
      uniqueChars.add(char);
      if (highlight.has(`${entry.date}|${char}`)) highlightedCount++;
    }
  }

  const handleClear = () => {
    if (!text.trim()) return;
    if (confirm("确定要清空所有内容吗？")) {
      setText("");
      pushToast("已清空");
    }
  };

  return (
    <div className="min-h-screen p-10">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="mb-2 text-center text-[28px] font-bold text-[#222]">
          Idle Angels 角色神域归来记录
        </h1>
        <p className="mb-6 text-center text-sm text-[#999]">
          自动高亮重复出现的早期角色
        </p>

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
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"输入格式：日期：人物1，人物2，人物3...\n例如：6.7：射手座，洛基，荷鲁斯"}
            className="mb-4 min-h-[200px] w-full resize-y rounded-lg border border-[#e0e0e0] p-3.5 text-sm leading-[1.7] text-[#333] outline-none transition-colors focus:border-[#999]"
          />
        </div>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            settingsOpen ? "max-h-[400px]" : "max-h-0"
          }`}
        >
          <SettingsPanel colorRules={colorRules} onChange={setColorRules} />
        </div>

        <Legend />

        <ScheduleList
          entries={entries}
          highlight={highlight}
          colorMap={colorMap}
        />
        <div className="mt-3 text-center text-xs text-[#bbb]">
          {entries.length > 0
            ? `${entries.length} 日期 · ${uniqueChars.size} 角色 · ${highlightedCount} 高亮`
            : ""}
        </div>

        <QualityTable />
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
