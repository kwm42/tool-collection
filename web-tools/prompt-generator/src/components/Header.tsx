import { Sparkles, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './common';

interface HeaderProps {
  onOpenComfyUISettings?: () => void;
  connected?: boolean;
}

export function Header({ onOpenComfyUISettings, connected }: HeaderProps) {
  return (
    <header className="flex-none flex items-center justify-between gap-2 p-padding bg-background-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-page-title">ComfyUI 人物提示词</h1>
        {connected !== undefined && (
          <span
            className={`w-2 h-2 rounded-full ${connected ? 'bg-success' : 'bg-error'}`}
            title={connected ? 'ComfyUI 已连接' : 'ComfyUI 未连接'}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {onOpenComfyUISettings && (
          <Button
            variant="icon"
            size="sm"
            onClick={onOpenComfyUISettings}
            title="ComfyUI 设置"
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
