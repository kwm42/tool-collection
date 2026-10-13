export interface ColorRule {
  name: string;
  color: string;
}

export interface ScheduleEntry {
  date: string;
  characters: string[];
}

export type SectionId = "schedule" | "wish" | "activity";

export interface SectionData {
  text: string;
  colorRules: ColorRule[];
}

export interface AppData {
  version: 2;
  sections: Record<SectionId, SectionData>;
}

export type SaveState = "saved" | "unsaved" | "saving" | "error";
