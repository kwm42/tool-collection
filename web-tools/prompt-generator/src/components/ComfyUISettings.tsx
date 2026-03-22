import { X, Link, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './common';

interface ComfyUISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  connected: boolean;
  isTesting: boolean;
  onTestConnection: () => void;
}

export function ComfyUISettings({
  isOpen,
  onClose,
  connected,
  isTesting,
  onTestConnection,
}: ComfyUISettingsProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background-card z-50 shadow-drawer">
        <div className="flex items-center justify-between p-padding border-b border-border">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            <span className="text-section-title">ComfyUI 设置</span>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} title="关闭">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-padding space-y-gap-lg">
          <div className="p-padding bg-background-hover rounded-sm">
            <p className="text-sm text-text-secondary">
              当前服务器: <span className="text-text-primary font-mono">localhost:8188</span>
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={onTestConnection}
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                测试连接
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 p-padding bg-background-hover rounded-sm">
            {connected ? (
              <>
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-body text-success">已连接</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-error" />
                <span className="text-body text-error">未连接</span>
              </>
            )}
          </div>

          <div className="p-padding bg-background-hover rounded-sm">
            <p className="text-sm text-text-secondary">
              ⚠️ 请确保：
            </p>
            <ul className="mt-2 text-xs text-text-secondary space-y-1 list-disc list-inside">
              <li>ComfyUI 已启动并运行</li>
              <li>设置中已启用 API</li>
              <li>网络连接正常</li>
              <li>已安装所需的模型</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
