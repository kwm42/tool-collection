import { Copy, Check } from 'lucide-react';
import { Button, Card } from './common';

interface PreviewPanelProps {
  positivePrompt: string;
  positiveChinese: string;
  negativePrompt: string;
  onCopy: () => void;
  copied: boolean;
}

export function PreviewPanel({
  positivePrompt,
  positiveChinese,
  negativePrompt,
  onCopy,
  copied,
}: PreviewPanelProps) {
  return (
    <Card className="p-padding">
      <div className="flex items-center justify-between mb-gap-sm">
        <span className="text-section-title text-text-primary">生成结果</span>
        <Button
          variant={copied ? 'primary' : 'secondary'}
          size="sm"
          onClick={onCopy}
          className="gap-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-gap-sm">
        {positiveChinese && (
          <div>
            <div className="text-helper text-text-secondary mb-1">中文组合</div>
            <div className="text-body text-text-primary bg-background-hover p-padding rounded-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
              {positiveChinese.split('\n').join(' + ')}
            </div>
          </div>
        )}
        
        <div>
          <div className="text-helper text-text-secondary mb-1">正向提示词</div>
          <div className="text-body text-text-primary bg-background-hover p-padding rounded-sm max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
            {"> "}{positivePrompt || '点击"一键随机生成"开始'}
          </div>
        </div>
        
        <div>
          <div className="text-helper text-text-secondary mb-1">反向提示词</div>
          <div className="text-body text-text-secondary bg-background-hover p-padding rounded-sm">
            {negativePrompt || 'low quality, worst quality...'}
          </div>
        </div>
      </div>
    </Card>
  );
}
