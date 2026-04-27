import { useState, useEffect, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { DirectoryPicker } from './components/DirectoryPicker';
import { FileTree } from './components/FileTree';
import { ParamForm } from './components/ParamForm';
import { ImagePreview } from './components/ImagePreview';
import { useFileSystem } from './hooks/useFileSystem';
import { FileNode, Workflow } from './types';

const STORAGE_KEY = 'comfyui-trigger-config';

interface SavedConfig {
  apiUrl: string;
  basePath: string;
  params: typeof params;
}

function loadConfig(): Partial<SavedConfig> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveConfig(config: Partial<SavedConfig>) {
  try {
    const existing = loadConfig();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...config }));
  } catch {}
}

export default function App() {
  const savedConfig = loadConfig();
  
  const [apiUrl, setApiUrl] = useState(savedConfig.apiUrl || 'http://localhost:3001');
  const [basePath, setBasePath] = useState(savedConfig.basePath || 'F:\\视频图片\\自制动画');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [params, setParams] = useState(savedConfig.params || {
    prompt: '',
    seconds: 1,
    width: 360,
    height: 240,
    workflow: '',
  });

  const handleApiUrlChange = useCallback((value: string) => {
    setApiUrl(value);
    saveConfig({ apiUrl: value });
  }, []);

  const handleBasePathChange = useCallback((value: string) => {
    setBasePath(value);
    saveConfig({ basePath: value });
  }, []);

  const handleParamsChange = useCallback((newParams: typeof params) => {
    setParams(newParams);
    saveConfig({ params: newParams });
  }, []);

  const { files, loading, dirHandle, loadDirectory } = useFileSystem();

  const loadWorkflows = useCallback(() => {
    fetch(`${apiUrl}/api/workflows`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('workflows:', data);
        setWorkflows(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error('load workflows error:', e);
        setWorkflows([]);
      });
  }, [apiUrl]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const getFullPath = useCallback(() => {
    if (!selectedFile?.path) return '';
    const relativePath = selectedFile.path.replace('/', '\\');
    return basePath + relativePath;
  }, [selectedFile, basePath]);

  const handleSubmit = async () => {
    if (!selectedFile || !params.workflow) return;

    setSubmitting(true);
    setResult(null);

    const fullPath = getFullPath();
    const pathParts = selectedFile.path.split('/');
    const fullFileName = pathParts.pop() || '';
    const fileName = fullFileName.replace(/\.[^.]+$/, '');
    const folderPath = pathParts.join('__');
    const selectedWorkflow = workflows.find(w => w.id === params.workflow);
    const workflowName = selectedWorkflow?.name || '';
    const filenamePrefix = folderPath 
      ? `${folderPath}__${fileName}__${workflowName}`
      : `${fileName}__${workflowName}`;

    try {
      const response = await fetch(`${apiUrl}/api/simpletasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          inputImage: fullPath,
          filenamePrefix,
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('请求失败: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-[90vw] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ComfyUI 图片触发</h1>

      <ConfigPanel
        apiUrl={apiUrl}
        basePath={basePath}
        onApiUrlChange={handleApiUrlChange}
        onBasePathChange={handleBasePathChange}
      />

      <div className="mt-4">
        <DirectoryPicker
          dirHandle={dirHandle}
          onSelect={loadDirectory}
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-lg font-medium mb-2">图片列表</h2>
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelect={setSelectedFile}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">预览</h2>
          <ImagePreview file={selectedFile} />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">参数设置</h2>
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <ParamForm
            workflows={workflows}
            selectedFilePath={getFullPath()}
            onSubmit={handleSubmit}
            params={params}
            onParamsChange={handleParamsChange}
            submitting={submitting}
          />

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}