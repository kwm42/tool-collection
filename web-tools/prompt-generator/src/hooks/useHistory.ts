import { useState, useCallback, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { randomId } from '../utils/random';

const MAX_HISTORY = 50;
const STORAGE_KEY = 'prompt-generator-history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      console.error('Failed to save history to localStorage');
    }
  }, [history]);

  const addHistory = useCallback((
    positivePrompt: string,
    negativePrompt: string,
    dimensionSummary: Record<string, string>
  ) => {
    const item: HistoryItem = {
      id: randomId(),
      timestamp: Date.now(),
      positivePrompt,
      negativePrompt,
      dimensionSummary,
    };
    
    setHistory(prev => {
      const newHistory = [item, ...prev].slice(0, MAX_HISTORY);
      return newHistory;
    });
  }, []);

  const removeHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  };
}
