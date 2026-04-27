import { Workflow } from '../types';

interface ParamFormProps {
  workflows: Workflow[];
  selectedFilePath: string;
  onSubmit: () => void;
  params: {
    prompt: string;
    seconds: number;
    width: number;
    height: number;
    workflow: string;
  };
  onParamsChange: (params: ParamFormProps['params']) => void;
  submitting: boolean;
}

export function ParamForm({
  workflows,
  selectedFilePath,
  onSubmit,
  params,
  onParamsChange,
  submitting,
}: ParamFormProps) {
  const handleChange = (field: keyof ParamFormProps['params'], value: string | number) => {
    onParamsChange({ ...params, [field]: value });
  };

  return (
    <div className="space-y-4 p-4 bg-white border rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Workflow</label>
        <select
          value={params.workflow}
          onChange={(e) => handleChange('workflow', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">加载中...</option>
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">提示词</label>
        <textarea
          value={params.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="A beautiful woman with long hair"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">输入图片</label>
        <input
          type="text"
          value={selectedFilePath}
          readOnly
          className="w-full px-3 py-2 border rounded-md bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">时长(秒)</label>
          <input
            type="number"
            value={params.seconds}
            onChange={(e) => handleChange('seconds', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border rounded-md"
            min={1}
            max={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">宽度</label>
          <input
            type="number"
            value={params.width}
            onChange={(e) => handleChange('width', parseInt(e.target.value) || 360)}
            className="w-full px-3 py-2 border rounded-md"
            min={64}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">高度</label>
          <input
            type="number"
            value={params.height}
            onChange={(e) => handleChange('height', parseInt(e.target.value) || 240)}
            className="w-full px-3 py-2 border rounded-md"
            min={64}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || !params.workflow || !selectedFilePath}
        className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
      >
        {submitting ? '执行中...' : '执行任务'}
      </button>
    </div>
  );
}