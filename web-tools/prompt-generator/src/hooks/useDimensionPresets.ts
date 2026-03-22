import { useState, useCallback, useEffect } from 'react';
import type { DimensionState } from '../types';
import { randomId } from '../utils/random';

const MAX_PRESETS = 20;
const STORAGE_KEY = 'prompt-generator-dimension-presets';

export interface DimensionPresetItem {
  id: string;
  name: string;
  timestamp: number;
  dimensions: Record<string, DimensionState>;
  locks: Record<string, boolean>;
}

export function useDimensionPresets() {
  const [presets, setPresets] = useState<DimensionPresetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
      console.error('Failed to save dimension presets to localStorage');
    }
  }, [presets]);

  const savePreset = useCallback((
    name: string,
    dimensions: Record<string, DimensionState>,
    locks: Record<string, boolean>
  ) => {
    const item: DimensionPresetItem = {
      id: randomId(),
      name,
      timestamp: Date.now(),
      dimensions,
      locks,
    };
    
    setPresets(prev => {
      const existing = prev.findIndex(p => p.name === name);
      if (existing >= 0) {
        const newPresets = [...prev];
        newPresets[existing] = { ...item, id: prev[existing].id };
        return newPresets;
      }
      return [item, ...prev].slice(0, MAX_PRESETS);
    });
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearPresets = useCallback(() => {
    setPresets([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    presets,
    savePreset,
    deletePreset,
    clearPresets,
  };
}
