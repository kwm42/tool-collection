import { X, Star, Trash2, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button, Card } from './common';
import type { FavoriteItem } from '../hooks/useFavorites';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onApply: (item: FavoriteItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onImport: (favorites: FavoriteItem[]) => void;
}

export function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  onApply,
  onDelete,
  onClear,
  onImport,
}: FavoritesDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredItem, setHoveredItem] = useState<FavoriteItem | null>(null);

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

  const handleExport = () => {
    const data = JSON.stringify(favorites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-favorites-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
        }
      } catch {
        console.error('Failed to parse import file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className={`
        fixed inset-y-0 right-0 w-full max-w-2xl bg-background-card z-50
        shadow-drawer transition-transform duration-300 ease-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-padding border-b h-16 border-border">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          <span className="text-section-title">收藏列表</span>
          <span className="text-helper text-text-secondary">({favorites.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {favorites.length > 0 && (
            <>
              <Button variant="icon" size="sm" onClick={handleExport} title="导出">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="icon" size="sm" onClick={handleImportClick} title="导入">
                <Upload className="w-4 h-4" />
              </Button>
              <Button variant="icon" size="sm" onClick={onClear} title="清空全部">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="icon" size="sm" onClick={onClose} title="关闭">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-padding">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <Star className="w-12 h-12 mb-3 opacity-30" />
            <span>暂无收藏</span>
            <span className="text-helper mt-1">点击收藏按钮保存当前组合</span>
          </div>
        ) : (
          <div className="space-y-gap-sm">
            {favorites.map((item) => (
              <Card
                key={item.id}
                variant="hover"
                className="p-padding cursor-pointer"
                onClick={() => onApply(item)}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex gap-gap-sm">
                  {item.previewImage && (
                    <div className="w-20 h-20 rounded overflow-hidden shrink-0 bg-background-hover">
                      <img
                        src={item.previewImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent shrink-0" />
                      <span className="font-medium text-body truncate">{item.name}</span>
                    </div>
                    <div className="text-helper text-text-secondary mt-1 line-clamp-2">
                      {Object.values(item.dimensionSummary).filter(Boolean).join(' + ')}
                    </div>
                    {item.generationParams && (
                      <div className="text-helper text-accent mt-1">
                        {item.generationParams.style} · {item.generationParams.checkpoint}
                      </div>
                    )}
                    <div className="text-helper text-text-placeholder mt-1">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
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

      {hoveredItem && hoveredItem.previewImage && (
        <div className="fixed right-full top-0 h-full w-96 bg-background-card border-l border-border shadow-lg z-[60] flex items-center justify-center mr-2">
          <img
            src={hoveredItem.previewImage}
            alt={hoveredItem.name}
            className="max-w-full max-h-full object-contain p-2"
          />
        </div>
      )}
    </div>
  );
}
