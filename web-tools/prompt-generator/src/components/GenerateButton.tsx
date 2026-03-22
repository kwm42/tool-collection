import { useState } from 'react';
import { Dices, Loader2 } from 'lucide-react';
import { Button } from './common';

interface GenerateButtonProps {
  onGenerate: () => void;
}

export function GenerateButton({ onGenerate }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    setIsGenerating(true);
    onGenerate();
    setTimeout(() => setIsGenerating(false), 500);
  };

  return (
    <div className="flex justify-center py-gap-lg">
      <Button
        variant="primary"
        size="lg"
        onClick={handleClick}
        disabled={isGenerating}
        className="min-w-64 gap-2"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Dices className="w-5 h-5" />
        )}
        {isGenerating ? '生成中...' : '一键随机生成'}
      </Button>
    </div>
  );
}
