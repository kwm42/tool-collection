import { Rocket, Loader2, Check, AlertCircle } from 'lucide-react';
import type { GenerationStatus } from '../types/comfyui';

interface GenerationButtonProps {
  status: GenerationStatus;
  progress: number;
  elapsedTime: number;
  onClick: () => void;
  disabled?: boolean;
}

export function GenerationButton({
  status,
  progress,
  elapsedTime,
  onClick,
  disabled,
}: GenerationButtonProps) {
  const getButtonContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            连接中...
          </>
        );
      case 'queued':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            等待生成...
          </>
        );
      case 'generating':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            生成中 {elapsedTime}s
          </>
        );
      case 'completed':
        return (
          <>
            <Check className="w-4 h-4" />
            生成完成
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            生成失败
          </>
        );
      default:
        return (
          <>
            <Rocket className="w-4 h-4" />
            生成图片
          </>
        );
    }
  };

  const getButtonClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-success hover:bg-success/90';
      case 'error':
        return 'bg-error hover:bg-error/90';
      case 'connecting':
      case 'queued':
      case 'generating':
        return 'bg-primary hover:bg-primary/90';
      default:
        return 'bg-random hover:bg-random/90';
    }
  };

  const isDisabled = disabled || status === 'connecting' || status === 'queued' || status === 'generating';

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          flex items-center gap-1.5 px-4 py-2 rounded-md text-white font-medium
          transition-all duration-150
          ${getButtonClass()}
          ${isDisabled ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        `}
      >
        {getButtonContent()}
      </button>
      
      {(status === 'generating') && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-background-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-white/50 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
