import type { SectionData, SectionId } from "./types";
import { DEFAULT_DATA } from "./lib/schedule";

export interface SectionMeta {
  id: SectionId;
  label: string;
  placeholder: string;
  defaultText: string;
}

export const SECTIONS: SectionMeta[] = [
  {
    id: "schedule",
    label: "神域归来",
    placeholder:
      "输入格式：日期：人物1，人物2，人物3...\n例如：6.7：射手座，洛基，荷鲁斯",
    defaultText: DEFAULT_DATA,
  },
  {
    id: "wish",
    label: "心愿召唤",
    placeholder: "输入格式：日期：人物1，人物2，人物3...\n例如：6.7：射手座，洛基",
    defaultText: "",
  },
  {
    id: "activity",
    label: "活动记录",
    placeholder: "输入格式：日期：条目1，条目2...\n例如：6.7：周年庆，双倍掉落",
    defaultText: "",
  },
];

export function createDefaultSections(): Record<SectionId, SectionData> {
  const sections = {} as Record<SectionId, SectionData>;
  for (const meta of SECTIONS) {
    sections[meta.id] = { text: meta.defaultText, colorRules: [] };
  }
  return sections;
}

export function getSectionMeta(id: SectionId): SectionMeta {
  return SECTIONS.find((section) => section.id === id) ?? SECTIONS[0];
}
