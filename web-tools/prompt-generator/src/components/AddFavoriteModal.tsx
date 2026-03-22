import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from './common';

interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  defaultName?: string;
}

export function AddFavoriteModal({
  isOpen,
  onClose,
  onConfirm,
  defaultName = '',
}: AddFavoriteModalProps) {
  const [name, setName] = useState(defaultName);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-padding">
      <div className="bg-background-card rounded-lg shadow-drawer w-full max-w-sm">
        <div className="flex items-center justify-between p-padding border-b border-border">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <span className="text-section-title">添加收藏</span>
          </div>
          <Button variant="icon" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-padding space-y-3">
          <div>
            <label className="block text-helper text-text-secondary mb-1">
              收藏名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="给这个组合起个名字"
              className="w-full px-3 py-2 bg-background-hover border border-border rounded-md text-body text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!name.trim()}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
