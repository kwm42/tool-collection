# ComfyUI 图片触发工具设计

## 项目概述

纯浏览器端 Web 工具，通过 File System Access API 读取本地目录，选择图片后调用 ComfyUI 接口执行任务。

## 技术栈

- Vite + React + Tailwind（与 image-concat 项目一致）

## 功能结构

### 1. 顶部配置区
- **API 地址输入框**：默认 `http://localhost:3001`
- **基础路径输入框**：默认 `F:\视频图片\自制动画`

### 2. 目录选择区
- "选择目录"按钮 → 触发 `showDirectoryPicker()`
- 显示当前选中路径

### 3. 图片树形列表
- 递归扫描目录，显示 `.png`, `.jpg`, `.jpeg` 文件
- 文件夹支持展开/折叠
- 点击文件选中，高亮显示
- 目录层级深时显示加载状态

### 4. 参数表单区
- **Workflow 下拉框**：从 API `/api/workflows` 加载
- **提示词 textarea**：默认空
- **输入图片**：自动填充（基础路径 + 相对路径 + 文件名）
- **时长**：默认 1，最小 1
- **宽度**：默认 360
- **高度**：默认 240
- **执行任务按钮**：调用 `/api/simpletasks` POST 接口

## 接口调用

### GET /api/workflows
返回 workflow 列表

### POST /api/simpletasks
```json
{
  "prompt": "string",
  "seconds": 1,
  "inputImage": "F:\\视频图片\\自制动画\\subfolder\\test.png",
  "width": 360,
  "height": 240,
  "workflow": "workflow-id",
  "filenamePrefix": "timestamp"
}
```

## 已知限制

1. 仅 Chromium 浏览器（Chrome/Edge）支持 File System Access API
2. 每次打开页面需重新授权目录
3. 无法获取文件绝对路径，通过"基础路径 + 相对路径"拼接

## 文件结构

```
web-tools/comfyui-trigger/
├── src/
│   ├── components/
│   │   ├── ConfigPanel.tsx      # 配置区
│   │   ├── DirectoryPicker.tsx  # 目录选择
│   │   ├── FileTree.tsx         # 树形列表
│   │   └── ParamForm.tsx        # 参数表单
│   ├── hooks/
│   │   └── useFileSystem.ts     # 文件系统操作
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```