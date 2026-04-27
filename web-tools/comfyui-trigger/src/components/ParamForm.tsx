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
  workflowLoading?: boolean;
}

export function ParamForm({
  workflows,
  selectedFilePath,
  onSubmit,
  params,
  onParamsChange,
  submitting,
  workflowLoading = false,
}: ParamFormProps) {
  const handleChange = (field: keyof ParamFormProps['params'], value: string | number) => {
    onParamsChange({ ...params, [field]: value });
  };

  return (
    <div className="space-y-4 p-4 bg-white border rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2">Workflow</label>
        <div className="flex flex-wrap gap-2">
          {workflowLoading ? (
            <span className="text-gray-500">加载中...</span>
          ) : workflows.length === 0 ? (
            <span className="text-gray-500">无可用工作流</span>
          ) : (
            workflows.map((w) => (
              <button
                key={w.id}
                onClick={() => handleChange('workflow', w.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  params.workflow === w.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {w.name}
              </button>
            ))
          )}
        </div>
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