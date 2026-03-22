import type { DimensionPreset, DimensionState } from '../types';

export const DIMENSION_ORDER = [
  'appearance',
  'hairstyle',
  'body',
  'action',
  'clothing',
  'time',
  'scene',
  'weather',
  'lighting',
  'props',
  'composition',
  'quality',
];

export const DEFAULT_NEGATIVE_PROMPT = 'low quality, worst quality, blurry, deformed, bad anatomy, bad hands, extra fingers';

export interface GeneratedPrompt {
  positive: string;
  positiveChinese: string;
  negative: string;
}

export function getDimensionPrompt(
  dimensionData: DimensionPreset,
  dimensionState: DimensionState
): string {
  if (dimensionState.mode === 'preset' && dimensionState.selectedPresetId) {
    const preset = dimensionData.presets.find(p => p.id === dimensionState.selectedPresetId);
    return preset?.prompt || '';
  }
  
  const parts: string[] = [];
  for (const [subDim, values] of Object.entries(dimensionState.selectedSubDimensions)) {
    if (values.length > 0) {
      const options = dimensionData.subDimensionOptions[subDim] || [];
      for (const value of values) {
        const option = options.find(o => o.value === value);
        if (option?.prompt) {
          parts.push(option.prompt);
        }
      }
    }
  }
  
  return parts.join(', ');
}

export function generatePrompt(
  dimensionsData: Record<string, DimensionPreset>,
  dimensionStates: Record<string, DimensionState>
): GeneratedPrompt {
  const parts: string[] = [];
  const chineseParts: string[] = [];
  
  parts.push('1girl');
  
  for (const dimKey of DIMENSION_ORDER) {
    const dimData = dimensionsData[dimKey];
    const dimState = dimensionStates[dimKey];
    
    if (!dimData || !dimState) continue;
    
    if (dimKey === 'quality') {
      if (dimState.selectedPresetId) {
        const preset = dimData.presets.find(p => p.id === dimState.selectedPresetId);
        if (preset) {
          parts.push(preset.prompt);
        }
      }
      continue;
    }
    
    if (dimState.mode === 'preset' && dimState.selectedPresetId) {
      const preset = dimData.presets.find(p => p.id === dimState.selectedPresetId);
      if (preset) {
        parts.push(preset.prompt);
        chineseParts.push(preset.name);
      }
    } else if (Object.keys(dimState.selectedSubDimensions).length > 0) {
      const subDimNames: string[] = [];
      for (const [subDim, values] of Object.entries(dimState.selectedSubDimensions)) {
        if (values.length > 0) {
          const options = dimData.subDimensionOptions[subDim] || [];
          for (const value of values) {
            const option = options.find(o => o.value === value);
            if (option?.prompt) {
              parts.push(option.prompt);
            }
            subDimNames.push(value);
          }
        }
      }
      if (subDimNames.length > 0) {
        chineseParts.push(subDimNames.join(' + '));
      }
    }
  }
  
  return {
    positive: parts.join(',\n> '),
    positiveChinese: chineseParts.join('\n'),
    negative: DEFAULT_NEGATIVE_PROMPT,
  };
}
