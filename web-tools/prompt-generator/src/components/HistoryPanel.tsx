import { ChevronDown, ChevronUp, Copy, Trash2, RotateCcw } from 'lucide-react';
import type { HistoryItem } from '../types';
import { Button, Card } from './common';

interface HistoryPanelProps {
  history: HistoryItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onApply: (item: HistoryItem) => void;
  onCopy: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({
  history,
  isExpanded,
  onToggle,
  onApply,
  onCopy,
  onDelete,
  onClear,
}: HistoryPanelProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="p-padding">
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={onToggle} className="gap-2">
          历史记录 ({history.length})
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        <Button variant="icon" size="sm" onClick={onClear} title="清空">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-gap-sm space-y-gap-sm max-h-64 overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="p-padding bg-background-hover rounded-sm text-body"
            >
              <div className="text-helper text-text-secondary mb-1">
                #{index + 1} · {new Date(item.timestamp).toLocaleString()}
              </div>
              <div className="truncate text-text-primary mb-2">
                {Object.values(item.dimensionSummary).filter(Boolean).slice(0, 4).join(' | ')}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onApply(item)} className="gap-1">
                  <RotateCcw className="w-3 h-3" />
                  应用
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onCopy(item)} className="gap-1">
                  <Copy className="w-3 h-3" />
                  复制
                </Button>
                <Button variant="icon" size="sm" onClick={() => onDelete(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
