import type { SaveState } from "../types";

interface Props {
  unlocked: boolean;
  editorOpen: boolean;
  settingsOpen: boolean;
  saveState: SaveState;
  onToggleEditor: () => void;
  onToggleSettings: () => void;
  onClear: () => void;
}

const DOT_CLASS: Record<SaveState, string> = {
  saved: "bg-emerald-500",
  unsaved: "bg-orange-500",
  saving: "bg-sky-500",
  error: "bg-red-500",
};

const DOT_TITLE: Record<SaveState, string> = {
  saved: "已保存",
  unsaved: "未保存",
  saving: "保存中",
  error: "保存失败",
};

const baseBtn =
  "rounded-md border px-4 py-[7px] text-[13px] transition-colors duration-200";

export function Toolbar({
  unlocked,
  editorOpen,
  settingsOpen,
  saveState,
  onToggleEditor,
  onToggleSettings,
  onClear,
}: Props) {
  if (!unlocked) return null;

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          className={`${baseBtn} border-[#ddd] bg-white text-[#555] hover:border-[#999] hover:text-[#222]`}
          onClick={onToggleEditor}
        >
          {editorOpen ? "收起" : "编辑"}
        </button>
        <button
          className={`${baseBtn} border-[#ddd] bg-white text-[#555] hover:border-[#999] hover:text-[#222]`}
          onClick={onToggleSettings}
        >
          {settingsOpen ? "收起" : "设置"}
        </button>
        <span
          className={`inline-block h-[7px] w-[7px] rounded-full align-middle ${DOT_CLASS[saveState]}`}
          title={DOT_TITLE[saveState]}
        />
      </div>
      <button
        className={`${baseBtn} border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white`}
        onClick={onClear}
      >
        清空
      </button>
    </div>
  );
}
