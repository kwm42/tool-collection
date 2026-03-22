import { useState } from 'react';
import { Lock, Unlock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card } from './common';

interface DimensionPresetConfig {
  name: string;
  icon: string;
  locks: Record<string, boolean>;
}

const BUILT_IN_PRESETS: DimensionPresetConfig[] = [
  {
    name: '全随机',
    icon: '🎲',
    locks: {
      appearance: false,
      hairstyle: false,
      body: false,
      action: false,
      clothing: false,
      time: false,
      scene: false,
      weather: false,
      lighting: false,
      props: false,
      composition: false,
      quality: false,
    },
  },
  {
    name: '随机人物',
    icon: '👤',
    locks: {
      appearance: false,
      hairstyle: false,
      body: false,
      action: true,
      clothing: true,
      time: true,
      scene: true,
      weather: true,
      lighting: true,
      props: true,
      composition: true,
      quality: true,
    },
  },
  {
    name: '随机人物+服装',
    icon: '👗',
    locks: {
      appearance: false,
      hairstyle: false,
      body: false,
      action: true,
      clothing: false,
      time: true,
      scene: true,
      weather: true,
      lighting: true,
      props: true,
      composition: true,
      quality: true,
    },
  },
  {
    name: '随机人物+服装+场景',
    icon: '🌆',
    locks: {
      appearance: false,
      hairstyle: false,
      body: false,
      action: true,
      clothing: false,
      time: false,
      scene: false,
      weather: true,
      lighting: true,
      props: true,
      composition: true,
      quality: true,
    },
  },
  {
    name: '固定人物',
    icon: '🔒',
    locks: {
      appearance: true,
      hairstyle: true,
      body: true,
      action: true,
      clothing: true,
      time: true,
      scene: true,
      weather: true,
      lighting: true,
      props: true,
      composition: true,
      quality: true,
    },
  },
];

const LOCK_PRESETS: DimensionPresetConfig[] = [
  {
    name: '锁定人物',
    icon: '👤',
    locks: {
      appearance: true,
      hairstyle: true,
      body: true,
      action: false,
      clothing: false,
      time: false,
      scene: false,
      weather: false,
      lighting: false,
      props: false,
      composition: false,
      quality: false,
    },
  },
  {
    name: '锁定人物+服装',
    icon: '👗',
    locks: {
      appearance: true,
      hairstyle: true,
      body: true,
      action: false,
      clothing: true,
      time: false,
      scene: false,
      weather: false,
      lighting: false,
      props: false,
      composition: false,
      quality: false,
    },
  },
  {
    name: '锁定人物+服装+场景',
    icon: '🌆',
    locks: {
      appearance: true,
      hairstyle: true,
      body: true,
      action: false,
      clothing: true,
      time: true,
      scene: true,
      weather: false,
      lighting: false,
      props: false,
      composition: false,
      quality: false,
    },
  },
];

interface DimensionPresetPanelProps {
  dimensionOrder: Array<{ key: string; label: string; icon: string }>;
  locks: Record<string, boolean>;
  onToggleLock: (key: string) => void;
  onApplyPreset: (preset: DimensionPresetConfig) => void;
  onClearAll: () => void;
  onLockAll: () => void;
  onUnlockAll: () => void;
}

export function DimensionPresetPanel({
  dimensionOrder,
  locks,
  onToggleLock,
  onApplyPreset,
  onClearAll,
  onLockAll,
  onUnlockAll,
}: DimensionPresetPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const getCurrentPreset = (): DimensionPresetConfig | null => {
    for (const preset of [...BUILT_IN_PRESETS, ...LOCK_PRESETS]) {
      const matches = dimensionOrder.every(
        (dim) => preset.locks[dim.key] === locks[dim.key]
      );
      if (matches) return preset;
    }
    return null;
  };

  const currentPreset = getCurrentPreset();

  return (
    <div className="space-y-gap-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-section-title text-text-secondary">维度预设</span>
          {currentPreset && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {currentPreset.icon} {currentPreset.name}
            </span>
          )}
        </div>
        <Button
          variant="icon"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? '收起' : '展开'}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <Card className="p-padding space-y-gap-sm">
          <div>
            <div className="text-helper text-text-secondary mb-2">随机预设</div>
            <div className="flex flex-wrap gap-2">
              {BUILT_IN_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={currentPreset?.name === preset.name ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onApplyPreset(preset)}
                  className="gap-1"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-gap-sm">
            <div className="text-helper text-text-secondary mb-2">锁定预设</div>
            <div className="flex flex-wrap gap-2">
              {LOCK_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={currentPreset?.name === preset.name ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onApplyPreset(preset)}
                  className="gap-1"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-gap-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-helper text-text-secondary">手动锁定</span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onUnlockAll}
                  className="text-xs gap-1"
                >
                  <Unlock className="w-3 h-3" />
                  全解锁
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onLockAll}
                  className="text-xs gap-1"
                >
                  <Lock className="w-3 h-3" />
                  全锁定
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs gap-1"
                >
                  <X className="w-3 h-3" />
                  清空
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {dimensionOrder.map((dim) => (
                <Button
                  key={dim.key}
                  variant={locks[dim.key] ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onToggleLock(dim.key)}
                  className="gap-1"
                >
                  {locks[dim.key] ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                  <span>{dim.icon}</span>
                  <span>{dim.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
