import { useState, useCallback, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { randomId } from '../utils/random';
import type { GenerationParams } from '../types/comfyui';

const MAX_FAVORITES = 100;
const STORAGE_KEY = 'prompt-generator-favorites';

export interface FavoriteItem extends HistoryItem {
  name: string;
  generationParams?: Pick<GenerationParams, 'style' | 'checkpoint'>;
  previewImage?: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err){
      console.error(err)
      console.error('Failed to save favorites to localStorage');
    }
  }, [favorites]);

  const addFavorite = useCallback((
    name: string,
    positivePrompt: string,
    negativePrompt: string,
    dimensionSummary: Record<string, string>,
    generationParams?: Pick<GenerationParams, 'style' | 'checkpoint'>,
    previewImage?: string
  ) => {
    const item: FavoriteItem = {
      id: randomId(),
      name,
      timestamp: Date.now(),
      positivePrompt,
      negativePrompt,
      dimensionSummary,
      generationParams,
      previewImage,
    };
    
    setFavorites(prev => {
      const existing = prev.findIndex(f => f.name === name);
      if (existing >= 0) {
        const newFavorites = [...prev];
        newFavorites[existing] = item;
        return newFavorites;
      }
      return [item, ...prev].slice(0, MAX_FAVORITES);
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    clearFavorites,
  };
}
