import { Shuffle, Check, X, Lock, Unlock } from 'lucide-react';
import type { DimensionPreset } from '../types';
import { Button, Card } from './common';

interface PresetSelectorProps {
  config: DimensionPreset;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
  onRandom: () => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export function PresetSelector({
  config,
  selectedId,
  onSelect,
  onClear,
  onRandom,
  isLocked = false,
  onToggleLock,
}: PresetSelectorProps) {
  return (
    <div className="space-y-gap-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-section-title">预设模板</span>
          {onToggleLock && (
            <Button 
              variant="icon" 
              size="sm" 
              onClick={onToggleLock} 
              title={isLocked ? '解锁' : '锁定'}
              className={isLocked ? 'text-random' : ''}
            >
              {isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClear} className="gap-1">
            <X className="w-3 h-3" />
            清空
          </Button>
          <Button variant="secondary" size="sm" onClick={onRandom} className="gap-1">
            <Shuffle className="w-3 h-3" />
            随机
          </Button>
        </div>
      </div>
      
      <div className="text-helper text-text-secondary">
        选择预设或留空不选择
      </div>
      
      <div className="grid gap-gap-sm">
        {config.presets.map((preset) => (
          <Card
            key={preset.id}
            variant={selectedId === preset.id ? 'selected' : 'hover'}
            className="p-padding cursor-pointer"
            onClick={() => onSelect(preset.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-body truncate">
                  {selectedId === preset.id && (
                    <Check className="w-4 h-4 inline-block mr-1 text-primary" />
                  )}
                  {preset.name}
                </div>
                <div className="text-helper text-text-secondary truncate mt-1">
                  {preset.prompt}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
