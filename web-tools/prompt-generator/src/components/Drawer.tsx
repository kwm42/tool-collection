import { X, Shuffle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from './common';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  children: ReactNode;
  onRandom?: () => void;
}

export function Drawer({ isOpen, onClose, title, icon, children, onRandom }: DrawerProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed inset-0 w-full max-w-md ml-auto bg-background-card z-50
        shadow-drawer transition-transform duration-300 ease-out
        ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-padding border-b border-border h-16">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-section-title">{title}</span>
        </div>
        <div className="flex gap-2">
          {onRandom && (
            <Button variant="icon" size="sm" onClick={onRandom} title="随机">
              <Shuffle className="w-4 h-4" />
            </Button>
          )}
          <Button variant="icon" size="sm" onClick={onClose} title="关闭">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="h-[calc(100%-4rem)] overflow-y-auto p-padding">
        {children}
      </div>
    </div>
  );
}
