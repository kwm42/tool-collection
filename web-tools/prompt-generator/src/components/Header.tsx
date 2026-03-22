import { Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="flex-none flex items-center justify-between gap-2 p-padding bg-background-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-page-title">ComfyUI 人物提示词</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
