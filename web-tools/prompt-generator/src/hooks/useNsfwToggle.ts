import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'prompt-generator-nsfw-enabled';

export function useNsfwToggle() {
  const [nsfwEnabled, setNsfwEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch {
      console.error('Failed to load nsfw setting from storage');
    }
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nsfwEnabled));
    } catch {
      console.error('Failed to save nsfw setting to storage');
    }
  }, [nsfwEnabled]);

  const toggleNsfw = useCallback(() => {
    setNsfwEnabled((prev) => !prev);
  }, []);

  const setNsfw = useCallback((enabled: boolean) => {
    setNsfwEnabled(enabled);
  }, []);

  return {
    nsfwEnabled,
    toggleNsfw,
    setNsfw,
  };
}
