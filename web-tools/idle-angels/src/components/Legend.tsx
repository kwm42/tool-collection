export function Legend() {
  return (
    <div className="mb-3 flex items-center gap-5 rounded-lg bg-white px-4 py-2.5 text-[13px] text-[#666] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <span className="font-semibold text-[#333]">图例</span>
      <div className="flex items-center gap-1.5">
        <span className="rounded border border-[#ddd] bg-white px-2 py-px text-xs text-[#333]">
          正常
        </span>
        <span>最新出现</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="rounded border border-[#ffc107] bg-[#fff3cd] px-2 py-px text-xs text-[#856404]">
          高亮
        </span>
        <span>早期出现</span>
      </div>
    </div>
  );
}
