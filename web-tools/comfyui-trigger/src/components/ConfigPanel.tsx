interface ConfigPanelProps {
  apiUrl: string;
  basePath: string;
  onApiUrlChange: (url: string) => void;
  onBasePathChange: (path: string) => void;
}

export function ConfigPanel({ apiUrl, basePath, onApiUrlChange, onBasePathChange }: ConfigPanelProps) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">API 地址</label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => onApiUrlChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="http://localhost:3001"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">基础路径</label>
        <input
          type="text"
          value={basePath}
          onChange={(e) => onBasePathChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="F:\视频图片\自制动画"
        />
      </div>
    </div>
  );
}