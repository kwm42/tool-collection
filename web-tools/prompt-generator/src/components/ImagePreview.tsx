import { Download, Copy, RefreshCw, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import type { GenerationStatus } from '../types/comfyui';

interface ImagePreviewProps {
  imageUrl?: string;
  seed?: number;
  status: GenerationStatus;
  error?: string;
  onDownload: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
}

export function ImagePreview({
  imageUrl,
  seed,
  status,
  error,
  onDownload,
  onCopy,
  onRegenerate,
}: ImagePreviewProps) {
  const handleCopy = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      onCopy();
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${seed || Date.now()}.png`;
    link.click();
    onDownload();
  };

  return (
    <div className="space-y-gap-sm">
      <div className="text-helper text-text-secondary mb-1">生成结果</div>
      
      <div
        className={`
          relative bg-background-hover rounded-sm overflow-hidden
          ${status === 'error' ? 'border-2 border-error' : 'border-2 border-dashed border-border'}
        `}
        style={{ minHeight: '300px' }}
      >
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">点击上方按钮生成图片</span>
          </div>
        )}

        {(status === 'connecting' || status === 'queued' || status === 'generating') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary">
            <Loader2 className="w-12 h-12 mb-2 animate-spin opacity-50" />
            <span className="text-sm">正在生成...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-error">
            <AlertCircle className="w-12 h-12 mb-2" />
            <span className="text-sm">{error || '生成失败'}</span>
            <button
              onClick={onRegenerate}
              className="mt-2 px-3 py-1 text-sm bg-error/20 hover:bg-error/30 rounded-md transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {status === 'completed' && imageUrl && (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full h-auto max-h-[600px] object-contain mx-auto"
            />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-md transition-colors"
                title="复制图片"
              >
                <Copy className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-md transition-colors"
                title="下载图片"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onRegenerate}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-md transition-colors"
                title="重新生成"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {seed !== undefined && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Seed: {seed}</span>
          {status === 'completed' && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Copy className="w-4 h-4" />
                复制
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
