import { useState, useCallback } from 'react';

export function useDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDimension, setCurrentDimension] = useState<string | null>(null);

  const openDrawer = useCallback((dimension: string) => {
    setCurrentDimension(dimension);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setCurrentDimension(null), 300);
  }, []);

  return {
    isOpen,
    currentDimension,
    openDrawer,
    closeDrawer,
  };
}
