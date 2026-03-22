import { Lock, Unlock, Shuffle, ChevronRight, X, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { DimensionPreset, DimensionState } from '../types';

interface DimensionRowProps {
  dimensionKey: string;
  config: DimensionPreset;
  state: DimensionState;
  currentSummary: string;
  nsfwEnabled: boolean;
  onToggleNsfw: () => void;
  onToggleLock: () => void;
  onRandom: () => void;
  onClear: () => void;
  onOpen: () => void;
  onCopy: () => void;
}

export function DimensionRow({
  dimensionKey,
  config,
  state,
  currentSummary,
  nsfwEnabled,
  onToggleNsfw,
  onToggleLock,
  onRandom,
  onClear,
  onOpen,
  onCopy,
}: DimensionRowProps) {
  const hasSelection = state.selectedPresetId || Object.keys(state.selectedSubDimensions).length > 0;
  const [copied, setCopied] = useState(false);

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock();
  };

  const handleRandomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRandom();
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`
        flex items-center gap-gap-sm p-padding rounded-md transition-all duration-200
        cursor-pointer hover:border-primary/50
        ${state.locked 
          ? 'bg-background-locked border border-error/20' 
          : 'bg-background-card border border-border'
        }
      `}
      onClick={onOpen}
    >
      <span className="text-xl">{config.icon}</span>
      
      <span className={`font-medium ${state.locked ? 'text-error' : 'text-text-primary'}`}>
        {config.label}
      </span>
      
      <div className="flex-1 text-helper text-text-secondary truncate">
        {hasSelection ? currentSummary : '留空'}
      </div>
      
      <div className="flex items-center gap-1">
        {hasSelection && (
          <button
            onClick={handleCopyClick}
            title="复制提示词"
            className={`p-1.5 rounded transition-colors ${
              copied 
                ? 'text-success bg-success/10' 
                : 'text-text-secondary hover:bg-background-hover hover:text-primary'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
        
        {hasSelection && (
          <button
            onClick={handleClearClick}
            title="清空"
            className="p-1.5 rounded text-text-secondary hover:text-error hover:bg-background-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {dimensionKey === 'action' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleNsfw();
            }}
            title={nsfwEnabled ? '隐藏NSFW内容' : '显示NSFW内容'}
            className={`p-1.5 rounded transition-colors ${
              nsfwEnabled
                ? 'text-error hover:bg-error/10'
                : 'text-text-secondary hover:bg-background-hover'
            }`}
          >
            {nsfwEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
        
        <button
          onClick={handleLockClick}
          title={state.locked ? '解锁' : '锁定'}
          className={`p-1.5 rounded transition-colors ${
            state.locked 
              ? 'text-error hover:bg-error/10' 
              : 'text-text-secondary hover:bg-background-hover'
          }`}
        >
          {state.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
        
        <button
          onClick={handleRandomClick}
          title="随机"
          className="p-1.5 rounded text-random hover:bg-secondary/10 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
        </button>
        
        <span className="p-1.5 text-text-secondary">
          <ChevronRight className="w-5 h-5" />
        </span>
      </div>
    </div>
  );
}
