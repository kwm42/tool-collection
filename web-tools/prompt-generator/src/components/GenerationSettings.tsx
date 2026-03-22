import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { GenerationParams } from '../types/comfyui';
import { styles, checkpoints } from '../data';

interface GenerationSettingsProps {
  params: GenerationParams;
  onUpdate: (params: Partial<GenerationParams>) => void;
}

export function GenerationSettings({ params, onUpdate }: GenerationSettingsProps) {
  const [expanded, setExpanded] = useState(false);

  const styleOptions = Object.keys(styles);
  const checkpointOptions = Object.keys(checkpoints);

  return (
    <div className="space-y-gap-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left text-helper text-text-secondary hover:text-text-primary transition-colors"
      >
        <span>⚙️ 生成参数</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="p-padding bg-background-hover rounded-sm space-y-gap-md">
          <div className="grid grid-cols-2 gap-gap-md">
            <div>
              <label className="block text-helper text-text-secondary mb-1">
                画风
              </label>
              <select
                value={params.style}
                onChange={(e) => onUpdate({ style: e.target.value })}
                className="w-full px-3 py-1.5 bg-background-card border border-border rounded-md text-body text-text-primary focus:outline-none focus:border-primary"
              >
                {styleOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-helper text-text-secondary mb-1">
                Checkpoint
              </label>
              <select
                value={params.checkpoint}
                onChange={(e) => onUpdate({ checkpoint: e.target.value })}
                className="w-full px-3 py-1.5 bg-background-card border border-border rounded-md text-body text-text-primary focus:outline-none focus:border-primary"
              >
                {checkpointOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-helper text-text-secondary mb-1">
                Width: {params.width}
              </label>
              <input
                type="number"
                min="512"
                max="2048"
                step="64"
                value={params.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-background-card border border-border rounded-md text-body text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-helper text-text-secondary mb-1">
                Height: {params.height}
              </label>
              <input
                type="number"
                min="512"
                max="2048"
                step="64"
                value={params.height}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-background-card border border-border rounded-md text-body text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useSameSeed"
              checked={params.useSameSeed}
              onChange={(e) => onUpdate({ useSameSeed: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label
              htmlFor="useSameSeed"
              className="text-body text-text-secondary cursor-pointer"
            >
              使用相同 Seed（下次生成保持本次 Seed）
            </label>
          </div>

          <div className="text-xs text-text-secondary">
            当前设置: {params.width}×{params.height} | 画风: {params.style} | Checkpoint: {params.checkpoint} | Steps: 20 | CFG: 4.0
          </div>
        </div>
      )}
    </div>
  );
}
