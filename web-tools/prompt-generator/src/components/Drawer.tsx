import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from './common';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  children: ReactNode;
  isLocked?: boolean;
}

export function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children, 
  isLocked = false,
}: DrawerProps) {
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
      <div className={`flex items-center justify-between p-padding border-b h-16 ${isLocked ? 'border-random bg-background-locked' : 'border-border'}`}>
        <div className="flex items-center gap-1">
          <span className="text-xl">{icon}</span>
          <span className="text-section-title">{title}</span>
        </div>
        <Button variant="icon" size="sm" onClick={onClose} title="关闭">
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="h-[calc(100%-4rem)] overflow-y-auto p-padding">
        {children}
      </div>
    </div>
  );
}
