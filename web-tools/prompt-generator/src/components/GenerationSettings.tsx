import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { GenerationParams } from '../types/comfyui';

interface GenerationSettingsProps {
  params: GenerationParams;
  onUpdate: (params: Partial<GenerationParams>) => void;
}

export function GenerationSettings({ params, onUpdate }: GenerationSettingsProps) {
  const [expanded, setExpanded] = useState(false);

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
                Steps: {params.steps}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={params.steps}
                onChange={(e) => onUpdate({ steps: Number(e.target.value) })}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="block text-helper text-text-secondary mb-1">
                CFG: {params.cfg.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={params.cfg}
                onChange={(e) => onUpdate({ cfg: Number(e.target.value) })}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-gap-md">
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
            当前设置: {params.width}×{params.height} | Steps: {params.steps} | CFG: {params.cfg.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
}
