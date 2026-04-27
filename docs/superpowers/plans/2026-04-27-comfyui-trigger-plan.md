# ComfyUI Trigger 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建纯浏览器端 ComfyUI 图片触发工具，通过 File System Access API 读取本地目录，树形列出图片，选择后调用 ComfyUI 接口执行任务

**Architecture:** 使用 Vite + React + Tailwind，与 image-concat 项目技术栈一致。File System Access API 读取目录，基础路径+相对路径拼接完整路径

**Tech Stack:** Vite, React 18, Tailwind CSS

---

### Task 1: 创建项目基础结构

**Files:**
- Create: `web-tools/comfyui-trigger/package.json`
- Create: `web-tools/comfyui-trigger/vite.config.js`
- Create: `web-tools/comfyui-trigger/tailwind.config.js`
- Create: `web-tools/comfyui-trigger/postcss.config.js`
- Create: `web-tools/comfyui-trigger/index.html`
- Create: `web-tools/comfyui-trigger/src/main.tsx`
- Create: `web-tools/comfyui-trigger/src/index.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "comfyui-trigger",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
});
```

- [ ] **Step 3: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 4: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ComfyUI 图片触发</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: 安装依赖**

Run: `cd web-tools/comfyui-trigger && pnpm install`

Expected: 依赖安装成功

---

### Task 2: 创建类型定义和状态管理

**Files:**
- Create: `web-tools/comfyui-trigger/src/types/index.ts`
- Create: `web-tools/comfyui-trigger/src/hooks/useFileSystem.ts`

- [ ] **Step 1: 创建类型定义 src/types/index.ts**

```typescript
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  handle?: FileSystemFileHandle;
  children?: FileNode[];
}

export interface Workflow {
  id: string;
  name: string;
}

export interface TaskParams {
  prompt: string;
  seconds: number;
  inputImage: string;
  width: number;
  height: number;
  workflow: string;
  filenamePrefix: string;
}

export interface AppState {
  apiUrl: string;
  basePath: string;
  dirHandle: FileSystemDirectoryHandle | null;
  files: FileNode[];
  selectedFile: FileNode | null;
  workflows: Workflow[];
  params: Omit<TaskParams, 'filenamePrefix'>;
}
```

- [ ] **Step 2: 创建 useFileSystem hook src/hooks/useFileSystem.ts**

```typescript
import { useState, useCallback } from 'react';
import { FileNode } from '../types';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

function isImageFile(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

export function useFileSystem() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const selectDirectory = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      return handle;
    } catch (e) {
      console.error('Failed to select directory:', e);
      return null;
    }
  }, []);

  const scanDirectory = useCallback(async (handle: FileSystemDirectoryHandle, path = ''): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        const children = await scanDirectory(entry, path + '/' + entry.name);
        if (children.length > 0) {
          entries.push({
            name: entry.name,
            type: 'folder',
            children,
          });
        }
      } else if (isImageFile(entry.name)) {
        entries.push({
          name: entry.name,
          type: 'file',
          path: path + '/' + entry.name,
          handle: entry as FileSystemFileHandle,
        });
      }
    }
    
    return entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const loadDirectory = useCallback(async () => {
    const handle = await selectDirectory();
    if (!handle) return;
    
    setLoading(true);
    try {
      const scanned = await scanDirectory(handle);
      setFiles(scanned);
    } finally {
      setLoading(false);
    }
  }, [selectDirectory, scanDirectory]);

  return { files, loading, dirHandle, loadDirectory };
}
```

- [ ] **Step 3: 提交**

Run: `cd web-tools/comfyui-trigger && git add -A && git commit -m "feat: add project structure and file system hook"`

---

### Task 3: 创建 ConfigPanel 组件

**Files:**
- Create: `web-tools/comfyui-trigger/src/components/ConfigPanel.tsx`

- [ ] **Step 1: 创建 ConfigPanel 组件**

```tsx
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
```

- [ ] **Step 2: 提交**

Run: `cd web-tools/comfyui-trigger && git add src/components/ConfigPanel.tsx && git commit -m "feat: add ConfigPanel component"`

---

### Task 4: 创建 DirectoryPicker 组件

**Files:**
- Create: `web-tools/comfyui-trigger/src/components/DirectoryPicker.tsx`

- [ ] **Step 1: 创建 DirectoryPicker 组件**

```tsx
interface DirectoryPickerProps {
  dirHandle: FileSystemDirectoryHandle | null;
  onSelect: () => void;
  loading: boolean;
}

export function DirectoryPicker({ dirHandle, onSelect, loading }: DirectoryPickerProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
      <button
        onClick={onSelect}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? '加载中...' : '选择目录'}
      </button>
      <span className="text-sm text-gray-600">
        {dirHandle ? `已选择: ${dirHandle.name}` : '请选择图片目录'}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

Run: `cd web-tools/comfyui-trigger && git add src/components/DirectoryPicker.tsx && git commit -m "feat: add DirectoryPicker component"`

---

### Task 5: 创建 FileTree 组件

**Files:**
- Create: `web-tools/comfyui-trigger/src/components/FileTree.tsx`

- [ ] **Step 1: 创建 FileTree 组件**

```tsx
import { useState } from 'react';
import { FileNode } from '../types';

interface FileTreeProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onSelect: (file: FileNode) => void;
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  selectedFile: FileNode | null;
  onSelect: (file: FileNode) => void;
}

function TreeNode({ node, level, selectedFile, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level === 0);

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs">{expanded ? '▼' : '▶'}</span>
          <span className="font-medium">📁 {node.name}</span>
        </div>
        {expanded && node.children && (
          <div className="ml-4">
            {node.children.map((child, idx) => (
              <TreeNode
                key={idx}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFile?.path === node.path;

  return (
    <div
      className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={() => onSelect(node)}
    >
      <span className="text-xs">📄</span>
      <span>{node.name}</span>
    </div>
  );
}

export function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  if (files.length === 0) {
    return <div className="p-4 text-gray-500">请先选择目录</div>;
  }

  return (
    <div className="border rounded-lg overflow-auto max-h-96">
      {files.map((node, idx) => (
        <TreeNode
          key={idx}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

Run: `cd web-tools/comfyui-trigger && git add src/components/FileTree.tsx && git commit -m "feat: add FileTree component"`

---

### Task 6: 创建 ParamForm 组件

**Files:**
- Create: `web-tools/comfyui-trigger/src/components/ParamForm.tsx`

- [ ] **Step 1: 创建 ParamForm 组件**

```tsx
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
  onParamsChange: (params: typeof ParamFormProps.prototype.params) => void;
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
  const handleChange = (field: string, value: string | number) => {
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
```

- [ ] **Step 2: 提交**

Run: `cd web-tools/comfyui-trigger && git add src/components/ParamForm.tsx && git commit -m "feat: add ParamForm component"`

---

### Task 7: 创建 App 主组件

**Files:**
- Create: `web-tools/comfyui-trigger/src/App.tsx`

- [ ] **Step 1: 创建 App.tsx**

```tsx
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
```

- [ ] **Step 2: 提交**

Run: `cd web-tools/comfyui-trigger && git add src/App.tsx && git commit -m "feat: integrate all components in App"`

---

### Task 8: 构建并验证

- [ ] **Step 1: 构建项目**

Run: `cd web-tools/comfyui-trigger && pnpm build`

Expected: 构建成功，无报错

- [ ] **Step 2: 预览构建结果**

Run: `cd web-tools/comfyui-trigger && pnpm preview`

Expected: 服务启动，可访问 http://localhost:4173

- [ ] **Step 3: 提交**

Run: `cd web-tools/comfyui-trigger && git add -A && git commit -m "feat: complete comfyui-trigger tool"`

---

### Task 9: 添加到导航页

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加导航链接**

在 index.html 的 `.container` 中添加:

```html
<a class="card" href="web-tools/comfyui-trigger/dist/index.html">
  <div class="icon">🎨</div>
  <div class="title">ComfyUI Trigger</div>
  <div class="desc">图片触发工具</div>
</a>
```

- [ ] **Step 2: 提交**

Run: `git add index.html && git commit -m "feat: add comfyui-trigger to navigation"`