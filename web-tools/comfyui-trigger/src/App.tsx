import { useState, useEffect, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { DirectoryPicker } from './components/DirectoryPicker';
import { FileTree } from './components/FileTree';
import { ParamForm } from './components/ParamForm';
import { useFileSystem } from './hooks/useFileSystem';
import { FileNode, Workflow } from './types';

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3001');
  const [basePath, setBasePath] = useState('F:\\视频图片\\自制动画');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [params, setParams] = useState({
    prompt: '',
    seconds: 1,
    width: 360,
    height: 240,
    workflow: '',
  });

  const { files, loading, dirHandle, loadDirectory } = useFileSystem();

  useEffect(() => {
    fetch(`${apiUrl}/api/workflows`)
      .then((res) => res.json())
      .then(setWorkflows)
      .catch(console.error);
  }, [apiUrl]);

  const getFullPath = useCallback(() => {
    if (!selectedFile?.path) return '';
    return basePath + selectedFile.path.replace('/', '\\');
  }, [selectedFile, basePath]);

  const handleSubmit = async () => {
    if (!selectedFile || !params.workflow) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/simpletasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          inputImage: getFullPath(),
          filenamePrefix: Date.now().toString(),
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ComfyUI 图片触发</h1>

      <ConfigPanel
        apiUrl={apiUrl}
        basePath={basePath}
        onApiUrlChange={setApiUrl}
        onBasePathChange={setBasePath}
      />

      <div className="mt-4">
        <DirectoryPicker
          dirHandle={dirHandle}
          onSelect={loadDirectory}
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-medium mb-2">图片列表</h2>
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelect={setSelectedFile}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">参数设置</h2>
          <ParamForm
            workflows={workflows}
            selectedFilePath={getFullPath()}
            onSubmit={handleSubmit}
            params={params}
            onParamsChange={setParams}
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
  );
}