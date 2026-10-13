import type { SectionId } from "../types";
import { SECTIONS } from "../sections";

interface Props {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export function Tabs({ active, onChange }: Props) {
  return (
    <div className="mb-4 flex gap-2">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => onChange(section.id)}
          className={`rounded-md px-4 py-2 text-[14px] transition-colors ${
            active === section.id
              ? "bg-[#333] text-white"
              : "border border-[#ddd] bg-white text-[#555] hover:border-[#999] hover:text-[#222]"
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}
