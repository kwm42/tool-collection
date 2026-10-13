export interface ColorRule {
  name: string;
  color: string;
}

export interface ScheduleEntry {
  date: string;
  characters: string[];
}

export interface ScheduleData {
  text: string;
  colorRules: ColorRule[];
  updatedAt: number;
}

export type SaveState = "saved" | "unsaved" | "saving" | "error";
