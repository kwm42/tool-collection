import { X, Save, Trash2 } from 'lucide-react';
import { Button, Card } from './common';
import type { DimensionPresetItem } from '../hooks/useDimensionPresets';

interface DimensionPresetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: DimensionPresetItem[];
  onApply: (preset: DimensionPresetItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function DimensionPresetsDrawer({
  isOpen,
  onClose,
  presets,
  onApply,
  onDelete,
  onClear,
}: DimensionPresetsDrawerProps) {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`
        fixed inset-0 w-full max-w-md ml-auto bg-background-card z-50
        shadow-drawer transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-padding border-b h-16 border-border">
        <div className="flex items-center gap-2">
          <Save className="w-5 h-5 text-primary" />
          <span className="text-section-title">维度预设</span>
          <span className="text-helper text-text-secondary">({presets.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {presets.length > 0 && (
            <Button variant="icon" size="sm" onClick={onClear} title="清空全部">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="icon" size="sm" onClick={onClose} title="关闭">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="h-[calc(100%-4rem)] overflow-y-auto p-padding">
        {presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <Save className="w-12 h-12 mb-3 opacity-30" />
            <span>暂无保存的预设</span>
            <span className="text-helper mt-1">点击保存按钮保存当前配置</span>
          </div>
        ) : (
          <div className="space-y-gap-sm">
            {presets.map((preset) => (
              <Card
                key={preset.id}
                variant="hover"
                className="p-padding cursor-pointer"
                onClick={() => onApply(preset)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Save className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-body truncate">{preset.name}</span>
                    </div>
                    <div className="text-helper text-text-secondary mt-1">
                      {Object.entries(preset.dimensions).filter(([, dim]) => dim.selectedPresetId).length} 个维度
                    </div>
                    <div className="text-helper text-text-placeholder mt-1">
                      {formatDate(preset.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(preset.id);
                    }}
                    className="text-text-secondary hover:text-error shrink-0"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
