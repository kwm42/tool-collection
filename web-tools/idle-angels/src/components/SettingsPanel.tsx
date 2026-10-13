import type { ColorRule } from "../types";

interface Props {
  colorRules: ColorRule[];
  onChange: (rules: ColorRule[]) => void;
}

export function SettingsPanel({ colorRules, onChange }: Props) {
  const update = (idx: number, patch: Partial<ColorRule>) => {
    onChange(
      colorRules.map((rule, i) => (i === idx ? { ...rule, ...patch } : rule)),
    );
  };

  const remove = (idx: number) => {
    onChange(colorRules.filter((_, i) => i !== idx));
  };

  const add = () => {
    onChange([...colorRules, { name: "", color: "#e74c3c" }]);
  };

  return (
    <div className="mt-3 rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="mb-2.5 text-[13px] font-semibold text-[#555]">自定义颜色</div>
      <div className="mb-3 flex max-h-[180px] flex-col gap-2 overflow-y-auto">
        {colorRules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={rule.name}
              placeholder="角色名"
              onChange={(e) => update(idx, { name: e.target.value })}
              className="flex-1 rounded border border-[#e0e0e0] px-2.5 py-1 text-[13px] outline-none focus:border-[#999]"
            />
            <input
              type="color"
              value={rule.color}
              onChange={(e) => update(idx, { color: e.target.value })}
              className="h-7 w-8 cursor-pointer rounded border border-[#ddd] p-px"
            />
            <button
              onClick={() => remove(idx)}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#ddd] bg-white text-base text-[#999] transition-colors hover:border-[#e74c3c] hover:text-[#e74c3c]"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="rounded border border-dashed border-[#ccc] px-3 py-1 text-xs text-[#999] transition-colors hover:border-[#999] hover:text-[#555]"
      >
        + 添加
      </button>
    </div>
  );
}
