import { useState, useEffect, useMemo } from 'react';
import { scripts } from '../data/scripts';
import type { Script } from '../types';

const STORAGE_KEY = 'script-usage-counts';

export function useFrequentScripts() {
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usageCounts));
  }, [usageCounts]);

  const incrementUsage = (scriptId: string) => {
    setUsageCounts((prev) => ({
      ...prev,
      [scriptId]: (prev[scriptId] || 0) + 1,
    }));
  };

  const frequentScripts = useMemo(() => {
    const scriptMap = new Map(scripts.map((s) => [s.id, s]));

    return Object.entries(usageCounts)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => ({
        script: scriptMap.get(id),
        count,
      }))
      .filter((item): item is { script: Script; count: number } => item.script !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [usageCounts]);

  return { frequentScripts, incrementUsage };
}
