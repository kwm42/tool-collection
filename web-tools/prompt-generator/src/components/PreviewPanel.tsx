import { useState, useMemo } from 'react';
import { Copy, Check, Download, RefreshCw, Image as ImageIcon, Loader2, AlertCircle, ChevronDown, ChevronUp, Star, Maximize2 } from 'lucide-react';
import { Button, Card } from './common';
import { ImageModal } from './ImageModal';
import type { GenerationParams, GenerationStatus } from '../types/comfyui';
import type { DimensionState } from '../types';
import { dimensionPresets, styles, checkpoints } from '../data';
import type { DimensionPreset } from '../types';

interface ClickableSegment {
  text: string;
  dimensionKey: string | null;
}

interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '竖版 (9:16)', width: 720, height: 1280 },
  { label: '竖版 (9:16 1024)', width: 768, height: 1344 },
  { label: '竖版 (2:3)', width: 768, height: 1152 },
  { label: '竖版 (3:4)', width: 896, height: 1152 },
  { label: '竖版 (512)', width: 512, height: 896 },
  { label: '方形 (1:1)', width: 1024, height: 1024 },
  { label: '方形 (512)', width: 512, height: 512 },
  { label: '横版 (512)', width: 896, height: 512 },
  { label: '横版 (16:9)', width: 1344, height: 768 },
  { label: '横版 (3:2)', width: 1152, height: 768 },
  { label: '横版 (4:3)', width: 1152, height: 896 },
];

interface PreviewPanelProps {
  positivePrompt: string;
  positiveChinese: string;
  negativePrompt: string;
  onCopy: () => void;
  copied: boolean;
  onOpenSettings: () => void;
  comfyUIEnabled?: boolean;
  generationState?: {
    status: GenerationStatus;
    progress: number;
    elapsedTime: number;
    error?: string;
    imageUrl?: string;
    imageBlob?: Blob;
    seed?: number;
  };
  generationParams?: GenerationParams;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onUpdateParams?: (params: Partial<GenerationParams>) => void;
  dimensions?: Record<string, DimensionState>;
  dimensionOrder?: string[];
  onOpenDimension?: (dimensionKey: string) => void;
  onAddFavorite: () => void;
  onOpenFavorites: () => void;
  favoritesCount?: number;
}

export function PreviewPanel({
  positivePrompt,
  positiveChinese,
  negativePrompt,
  onCopy,
  copied,
  onOpenSettings,
  comfyUIEnabled = false,
  generationState,
  generationParams,
  onGenerate,
  onRegenerate,
  onUpdateParams,
  dimensions = {},
  dimensionOrder = [],
  onOpenDimension,
  onAddFavorite,
  onOpenFavorites,
  favoritesCount = 0,
}: PreviewPanelProps) {
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const clickableSegments = useMemo<ClickableSegment[]>(() => {
    if (!positiveChinese || !dimensionOrder.length) return [];
    
    const segments: ClickableSegment[] = [];
    const lines = positiveChinese.split('\n').filter(Boolean);
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed) {
        let matchedKey: string | null = null;
        
        for (const key of dimensionOrder) {
          const dimData = dimensionPresets[key] as DimensionPreset | undefined;
          if (dimData) {
            const dimState = dimensions[key];
            if (dimState?.mode === 'preset' && dimState.selectedPresetId) {
              const preset = dimData.presets.find((p) => p.id === dimState.selectedPresetId);
              if (preset && trimmed.includes(preset.name)) {
                matchedKey = key;
                break;
              }
            }
          }
        }
        
        segments.push({ text: trimmed, dimensionKey: matchedKey });
      }
      
      if (index < lines.length - 1) {
        segments.push({ text: ' + ', dimensionKey: null });
      }
    });
    
    return segments;
  }, [positiveChinese, dimensions, dimensionOrder]);

  const handleCopy = async () => {
    if (!generationState?.imageUrl) return;
    try {
      const response = await fetch(generationState.imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const handleDownload = () => {
    if (!generationState?.imageUrl) return;
    const link = document.createElement('a');
    link.href = generationState.imageUrl;
    link.download = `generated-${generationState.seed || Date.now()}.png`;
    link.click();
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    } else if (onGenerate) {
      onGenerate();
    }
  };

  const getButtonClass = () => {
    if (!generationState) return 'bg-random hover:bg-random/90';
    switch (generationState.status) {
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

  const isGenerating = generationState?.status === 'connecting' || 
                       generationState?.status === 'queued' || 
                       generationState?.status === 'generating';

  return (
    <Card className="p-padding">
      <div className="flex items-center justify-between mb-gap-sm">
        <span className="text-section-title text-text-primary">生成面板</span>
        <Button
          variant="icon"
          size="sm"
          onClick={onOpenSettings}
          title="ComfyUI 设置"
        >
          <span className="text-lg">⚙️</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-gap-lg">
        <div className="space-y-gap-sm">
          <div>
            <div className="text-helper text-text-secondary mb-1">中文组合</div>
            <div className="text-body text-text-primary bg-background-hover p-padding rounded-sm max-h-36 overflow-y-auto">
              {clickableSegments.length > 0 ? (
                <span className="whitespace-pre-wrap">
                  {clickableSegments.map((segment, index) => {
                    if (segment.dimensionKey && onOpenDimension) {
                      const key = segment.dimensionKey;
                      return (
                        <button
                          key={index}
                          onClick={() => onOpenDimension(key)}
                          className="text-primary hover:text-primary-hover hover:underline cursor-pointer bg-transparent border-none p-0 m-0 font-inherit"
                          title={`打开${dimensionPresets[key]?.label || key}配置`}
                        >
                          {segment.text}
                        </button>
                      );
                    }
                    return <span key={index} className="text-text-secondary">{segment.text}</span>;
                  })}
                </span>
              ) : (
                <span className="text-text-secondary">点击"一键随机生成"开始</span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-helper text-text-secondary mb-1">正向提示词</div>
            <div className="text-body text-text-primary bg-background-hover p-padding rounded-sm max-h-36 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
              {positivePrompt || '点击"一键随机生成"开始'}
            </div>
          </div>
          
          <div>
            <div className="text-helper text-text-secondary mb-1">反向提示词</div>
            <div className="text-body text-text-secondary bg-background-hover p-padding rounded-sm text-xs">
              {negativePrompt || 'low quality, worst quality...'}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-gap-sm">
            <Button
              variant={copied ? 'primary' : 'secondary'}
              onClick={onCopy}
              className="gap-2 px-4 py-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  复制
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={onAddFavorite}
              disabled={!positivePrompt}
              className="gap-2 px-4 py-2"
            >
              <Star className="w-5 h-5" />
              收藏
            </Button>

            <Button
              variant="secondary"
              onClick={onOpenFavorites}
              className="gap-2 px-4 py-2"
            >
              <Star className="w-5 h-5" />
              收藏列表{favoritesCount > 0 && `(${favoritesCount})`}
            </Button>

            {comfyUIEnabled && (
              <Button
                variant="primary"
                onClick={handleRegenerate}
                disabled={isGenerating || !positivePrompt}
                className={`gap-2 px-4 py-2 ${getButtonClass()}`}
              >
                {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
                生成图片
              </Button>
            )}
          </div>

          {comfyUIEnabled && generationParams && (
            <div className="pt-gap-sm border-t border-border">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="flex items-center justify-between w-full text-helper text-text-secondary hover:text-text-primary transition-colors mb-2"
              >
                <span>⚙️ 生成参数</span>
                {settingsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {settingsExpanded && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-background-hover rounded-sm">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      画风
                    </label>
                    <select
                      value={generationParams.style}
                      onChange={(e) => {
                        onUpdateParams?.({ style: e.target.value });
                      }}
                      className="w-full px-2 py-1.5 bg-background-card border border-border rounded text-xs text-text-primary cursor-pointer"
                    >
                      {Object.keys(styles).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      Checkpoint
                    </label>
                    <select
                      value={generationParams.checkpoint}
                      onChange={(e) => {
                        onUpdateParams?.({ checkpoint: e.target.value });
                      }}
                      className="w-full px-2 py-1.5 bg-background-card border border-border rounded text-xs text-text-primary cursor-pointer"
                    >
                      {Object.keys(checkpoints).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      分辨率
                    </label>
                    <select
                      value={`${generationParams.width}x${generationParams.height}`}
                      onChange={(e) => {
                        const [w, h] = e.target.value.split('x').map(Number);
                        onUpdateParams?.({ width: w, height: h });
                      }}
                      className="w-full px-2 py-1.5 bg-background-card border border-border rounded text-xs text-text-primary cursor-pointer"
                    >
                      {RESOLUTION_PRESETS.map((preset) => (
                        <option
                          key={`${preset.width}x${preset.height}`}
                          value={`${preset.width}x${preset.height}`}
                        >
                          {preset.label} ({preset.width}x{preset.height})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generationParams.useSameSeed}
                        onChange={(e) => {
                          onUpdateParams?.({ useSameSeed: e.target.checked });
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      使用相同 Seed
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generationParams.randomStyle}
                        onChange={(e) => {
                          onUpdateParams?.({ randomStyle: e.target.checked });
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      随机画风
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-gap-sm">
          <div className="text-helper text-text-secondary mb-1">图片预览</div>
          
          <div
            className={`
              relative bg-background-hover rounded-sm overflow-hidden
              ${generationState?.status === 'error' ? 'border-2 border-error' : 'border border-border'}
            `}
            style={{ height: '600px' }}
          >
            {(!generationState || generationState.status === 'idle') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary">
                <ImageIcon className="w-20 h-20 mb-3 opacity-50" />
                <span className="text-base">点击生成按钮创建图片</span>
              </div>
            )}

            {(generationState?.status === 'connecting' || generationState?.status === 'queued' || generationState?.status === 'generating') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary">
                <Loader2 className="w-16 h-16 mb-2 animate-spin opacity-50" />
                <span className="text-sm">{generationState.status === 'generating' ? `生成中 ${generationState.elapsedTime}s` : '等待中...'}</span>
              </div>
            )}

            {generationState?.status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-error">
                <AlertCircle className="w-16 h-16 mb-2" />
                <span className="text-sm">{generationState.error || '生成失败'}</span>
                <button
                  onClick={handleRegenerate}
                  className="mt-2 px-4 py-2 text-sm bg-error/20 hover:bg-error/30 rounded-md transition-colors"
                >
                  重试
                </button>
              </div>
            )}

            {generationState?.status === 'completed' && generationState.imageUrl && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={generationState.imageUrl}
                  alt="Generated"
                  className="max-w-full max-h-full object-contain cursor-zoom-in"
                  onClick={() => setFullscreenImage(generationState.imageUrl!)}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => setFullscreenImage(generationState.imageUrl!)}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-md transition-colors"
                    title="全屏预览"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </button>
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
                    onClick={handleRegenerate}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-md transition-colors"
                    title="重新生成"
                  >
                    <RefreshCw className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {generationState?.seed !== undefined && (
            <div className="text-sm text-text-secondary">
              Seed: {generationState.seed}
            </div>
          )}
        </div>
      </div>

      <div className="text-helper text-text-placeholder text-center mt-2">
        双击 L 键快速随机生成 + 生成图片
      </div>

      <ImageModal
        isOpen={fullscreenImage !== null}
        onClose={() => setFullscreenImage(null)}
        imageUrl={fullscreenImage || ''}
      />
    </Card>
  );
}
