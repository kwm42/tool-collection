import { useState, useCallback, useEffect, useRef } from 'react';
import type { DimensionState } from '../types';
import { dimensionPresets, dimensionOrder } from '../data';
import { weightedRandom } from '../utils/random';
import { generatePrompt, getDimensionPrompt } from '../utils/prompt';

const STORAGE_KEY = 'prompt-generator-dimensions';

function createInitialDimensionState(): DimensionState {
  return {
    locked: false,
    mode: 'preset',
    selectedPresetId: null,
    selectedSubDimensions: {},
  };
}

function createInitialDimensions(): Record<string, DimensionState> {
  const dims: Record<string, DimensionState> = {};
  for (const key of dimensionOrder) {
    dims[key] = createInitialDimensionState();
  }
  return dims;
}

function loadFromStorage(): Record<string, DimensionState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.error('Failed to load dimensions from storage');
  }
  return null;
}

export function usePromptGenerator() {
  const [dimensions, setDimensions] = useState<Record<string, DimensionState>>(() => {
    return loadFromStorage() || createInitialDimensions();
  });
  const [currentPrompt, setCurrentPrompt] = useState<{ positive: string; positiveChinese: string; negative: string }>({
    positive: '',
    positiveChinese: '',
    negative: '',
  });
  
  const isInitialized = useRef(false);
  const pendingGenerate = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dimensions));
      } catch {
        console.error('Failed to save dimensions to storage');
      }
    }
    isInitialized.current = true;
  }, [dimensions]);

  const randomDimension = useCallback((dimensionKey: string) => {
    const presetData = dimensionPresets[dimensionKey];
    if (!presetData) return;

    const newPreset = weightedRandom(presetData.presets);
    
    setDimensions(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        locked: false,
        mode: 'preset',
        selectedPresetId: newPreset.id,
        selectedSubDimensions: {},
      },
    }));
  }, []);

  const clearDimension = useCallback((dimensionKey: string) => {
    setDimensions(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        locked: false,
        mode: 'preset',
        selectedPresetId: null,
        selectedSubDimensions: {},
      },
    }));
  }, []);

  const generate = useCallback(() => {
    pendingGenerate.current = true;
    
    const newDimensions = { ...dimensions };
    
    for (const key of dimensionOrder) {
      const dimState = newDimensions[key];
      if (!dimState.locked) {
        const presetData = dimensionPresets[key];
        if (presetData) {
          const newPreset = weightedRandom(presetData.presets);
          newDimensions[key] = {
            ...dimState,
            mode: 'preset',
            selectedPresetId: newPreset.id,
            selectedSubDimensions: {},
          };
        }
      }
    }

    setDimensions(newDimensions);

    setTimeout(() => {
      const result = generatePrompt(dimensionPresets, newDimensions);
      setCurrentPrompt(result);
    }, 50);
  }, [dimensions]);

  const toggleLock = useCallback((dimensionKey: string) => {
    setDimensions(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        locked: !prev[dimensionKey].locked,
      },
    }));
  }, []);

  const setLock = useCallback((dimensionKey: string, locked: boolean) => {
    setDimensions(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        locked,
      },
    }));
  }, []);

  const lockAll = useCallback(() => {
    setDimensions(prev => {
      const newDims = { ...prev };
      for (const key of dimensionOrder) {
        newDims[key] = { ...newDims[key], locked: true };
      }
      return newDims;
    });
  }, []);

  const unlockAll = useCallback(() => {
    setDimensions(prev => {
      const newDims = { ...prev };
      for (const key of dimensionOrder) {
        newDims[key] = { ...newDims[key], locked: false };
      }
      return newDims;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDimensions(prev => {
      const newDims = { ...prev };
      for (const key of dimensionOrder) {
        newDims[key] = {
          ...newDims[key],
          locked: false,
          mode: 'preset',
          selectedPresetId: null,
          selectedSubDimensions: {},
        };
      }
      return newDims;
    });
  }, []);

  const selectPreset = useCallback((dimensionKey: string, presetId: string, preserveLock?: boolean) => {
    setDimensions(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        mode: 'preset',
        selectedPresetId: presetId,
        selectedSubDimensions: {},
        locked: preserveLock ? prev[dimensionKey].locked : false,
      },
    }));
  }, []);

  const getCurrentSummary = useCallback((dimensionKey: string): string => {
    const dimData = dimensionPresets[dimensionKey];
    const dimState = dimensions[dimensionKey];
    
    if (!dimData || !dimState) return '';
    
    if (dimState.mode === 'preset' && dimState.selectedPresetId) {
      const preset = dimData.presets.find(p => p.id === dimState.selectedPresetId);
      return preset?.name || '';
    }
    
    const subDimValues = Object.values(dimState.selectedSubDimensions).flat();
    return subDimValues.slice(0, 3).join(' | ');
  }, [dimensions]);

  const getDimensionLabel = useCallback((dimensionKey: string): string => {
    return dimensionPresets[dimensionKey]?.label || dimensionKey;
  }, []);

  const getDimensionPromptForCopy = useCallback((dimensionKey: string): string => {
    const dimData = dimensionPresets[dimensionKey];
    const dimState = dimensions[dimensionKey];
    if (!dimData || !dimState) return '';
    return getDimensionPrompt(dimData, dimState);
  }, [dimensions]);

  const refreshCurrentPrompt = useCallback(() => {
    const result = generatePrompt(dimensionPresets, dimensions);
    setCurrentPrompt(result);
  }, [dimensions]);

  useEffect(() => {
    refreshCurrentPrompt();
  }, [refreshCurrentPrompt]);

  return {
    dimensions,
    currentPrompt,
    generate,
    randomDimension,
    clearDimension,
    toggleLock,
    setLock,
    lockAll,
    unlockAll,
    clearAll,
    selectPreset,
    getCurrentSummary,
    getDimensionLabel,
    getDimensionPromptForCopy,
  };
}
