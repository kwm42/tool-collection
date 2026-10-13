import type { ScheduleEntry } from "../types";

interface Props {
  entries: ScheduleEntry[];
  highlight: Set<string>;
  colorMap: Record<string, string>;
}

export function ScheduleList({ entries, highlight, colorMap }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[#bbb]">
        点击「编辑」输入文本后自动渲染
      </div>
    );
  }

  return (
    <div>
      {entries.map((entry, idx) => (
        <div
          key={`${entry.date}-${idx}`}
          className="flex items-baseline gap-4 border-b border-[#eee] bg-white px-3.5 py-2 first:rounded-t-lg last:rounded-b-lg last:border-b-0 hover:bg-[#fafafa]"
        >
          <div className="min-w-[44px] whitespace-nowrap text-[15px] font-bold text-[#333]">
            {entry.date}
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5">
            {entry.characters.map((char, ci) => {
              const isHighlighted = highlight.has(`${entry.date}|${char}`);
              const color = colorMap[char];
              return (
                <span
                  key={`${char}-${ci}`}
                  className={`inline-block rounded px-2.5 py-0.5 text-[13px] ${
                    isHighlighted
                      ? "border border-[#ffc107] bg-[#fff3cd] text-[#856404]"
                      : "border border-[#ddd] bg-white text-[#333]"
                  }`}
                  style={color ? { color } : undefined}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
