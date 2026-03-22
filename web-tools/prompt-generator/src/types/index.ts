export interface Preset {
  id: string;
  name: string;
  prompt: string;
  weight: number;
}

export interface SubOption {
  value: string;
  prompt: string;
  weight: number;
}

export interface DimensionPreset {
  dimension: string;
  label: string;
  icon: string;
  presets: Preset[];
  subDimensionOptions: Record<string, SubOption[]>;
}

export interface DimensionState {
  locked: boolean;
  mode: 'preset' | 'custom';
  selectedPresetId: string | null;
  selectedSubDimensions: Record<string, string[]>;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  positivePrompt: string;
  negativePrompt: string;
  dimensionSummary: Record<string, string>;
}

export interface GeneratorState {
  dimensions: Record<string, DimensionState>;
  currentPrompt: {
    positive: string;
    negative: string;
  };
}

export type DrawerPosition = 'right' | 'bottom';
