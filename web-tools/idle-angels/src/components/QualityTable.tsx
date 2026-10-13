const ROWS: [string, string, string, string, string, string][] = [
  ["0星", "144", "168", "176", "192", "195"],
  ["1星", "176", "210", "224", "240", "259"],
  ["2星", "224", "273", "312", "325", "330"],
  ["3星", "312", "357", "416", "432", "448"],
  ["4星", "416", "480", "552", "570", "585"],
  ["5星", "552", "620", "715", "720", "741"],
];

const HEADERS = ["星级", "SSR", "SSR+", "UR", "UR+", "MR/IR"];

export function QualityTable() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="border-b-2 border-[#f0f0f0] px-4 py-3 text-[15px] font-bold text-[#333]">
        抽卡消耗表
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {HEADERS.map((header, i) => (
                <th
                  key={header}
                  className={`whitespace-nowrap border-b border-[#f0f0f0] px-3.5 py-2 text-center font-semibold ${
                    i === 0 ? "bg-[#f5f6fa] text-[#999]" : "bg-[#fafafa] text-[#555]"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row[0]} className="hover:[&>td]:bg-[#fafafa]">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`whitespace-nowrap border-b border-[#f0f0f0] px-3.5 py-2 text-center ${
                      i === 0
                        ? "bg-[#fafafa] font-semibold text-[#777]"
                        : "text-[#333]"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
