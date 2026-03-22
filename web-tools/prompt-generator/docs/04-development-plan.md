# ComfyUI 集成开发计划

## 概述

为 Prompt Generator 添加 ComfyUI API 集成功能，实现一键生成图片。

---

## 阶段一：基础设施

### 1.1 类型定义

**文件**: `src/types/comfyui.ts`

| 类型 | 说明 |
|------|------|
| `ComfyUIConfig` | ComfyUI 连接配置（服务器地址、连接状态） |
| `GenerationParams` | 生成参数（Steps、CFG、宽高、Seed） |
| `GenerationState` | 生成状态（idle、connecting、queued、generating、completed、error） |

### 1.2 localStorage 键名

| 键名 | 类型 | 默认值 |
|------|------|--------|
| `comfyui-server` | string | `localhost:8188` |
| `comfyui-params` | GenerationParams | 见默认值 |

---

## 阶段二：API 封装

### 2.1 ComfyUI API 方法

**文件**: `src/utils/comfyui-api.ts`

| 方法 | 说明 |
|------|------|
| `testConnection(server)` | 测试连接，返回 boolean |
| `queuePrompt(server, prompt)` | 提交生成任务，返回 prompt_id |
| `getHistory(server, promptId)` | 查询任务状态 |
| `getImage(server, filename, subfolder)` | 获取图片 blob |

### 2.2 API 端点

| 操作 | 方法 | 端点 |
|------|------|------|
| 连接测试 | GET | `/system_stats` |
| 提交任务 | POST | `/prompt` |
| 查询状态 | GET | `/history/{prompt_id}` |
| 获取图片 | GET | `/view?filename={filename}&subfolder={subfolder}` |

---

## 阶段三：Hook 开发

### 3.1 useComfyUI Hook

**文件**: `src/hooks/useComfyUI.ts`

**功能**:
- 管理 ComfyUI 连接配置
- 管理生成状态和参数
- 提供 `generate()` 方法触发生成
- 轮询任务状态
- 返回图片 blob URL

**接口**:

```typescript
interface UseComfyUIReturn {
  // 配置
  config: ComfyUIConfig;
  updateServer: (address: string) => void;
  
  // 参数
  params: GenerationParams;
  updateParams: (params: Partial<GenerationParams>) => void;
  
  // 状态
  state: GenerationState;
  
  // 方法
  testConnection: () => Promise<boolean>;
  generate: (prompt: string, negativePrompt: string) => Promise<void>;
  clear: () => void;
}
```

---

## 阶段四：组件开发

### 4.1 GenerationButton

**文件**: `src/components/GenerationButton.tsx`

**功能**: 生成按钮 + 状态显示

**状态样式**:

| 状态 | 样式 |
|------|------|
| idle | 主色背景，白色文字 |
| connecting | 主色背景 + spinner |
| queued | 主色背景 + spinner |
| generating | 主色背景 + 进度条 |
| completed | 绿色背景 |
| error | 红色背景 |

### 4.2 ImagePreview

**文件**: `src/components/ImagePreview.tsx`

**功能**: 图片预览 + 操作按钮

**操作按钮**:
- 复制图片（到剪贴板）
- 下载图片
- 重新生成

**状态样式**:

| 状态 | 样式 |
|------|------|
| idle | 虚线边框 + 占位文字 |
| loading | 骨架屏 + spinner |
| completed | 显示图片 |
| error | 红色边框 + 错误信息 |

### 4.3 GenerationSettings

**文件**: `src/components/GenerationSettings.tsx`

**功能**: 生成参数设置面板（可折叠）

**参数控件**:

| 参数 | 控件类型 | 范围 |
|------|---------|------|
| Steps | Slider | 1-100 |
| CFG | Slider | 0-20 |
| Width | Number Input | 512-2048 |
| Height | Number Input | 512-2048 |
| Same Seed | Checkbox | boolean |

### 4.4 ComfyUISettings

**文件**: `src/components/ComfyUISettings.tsx`

**功能**: ComfyUI 连接设置

**设置项**:
- 服务器地址输入框
- 测试连接按钮
- 连接状态指示

---

## 阶段五：集成

### 5.1 修改 PreviewPanel

**文件**: `src/components/PreviewPanel.tsx`

**修改内容**:
- 添加生成按钮
- 添加图片预览区域
- 添加参数设置折叠面板

### 5.2 修改 Header

**文件**: `src/components/Header.tsx`

**修改内容**:
- 添加设置按钮（打开 ComfyUISettings）

---

## 阶段六：测试

### 6.1 功能测试

| 测试项 | 说明 |
|--------|------|
| 连接测试 | 输入正确地址，测试连接成功 |
| 连接失败 | 输入错误地址，显示失败提示 |
| 生成图片 | 提交任务，轮询状态，显示进度 |
| 图片展示 | 生成完成，显示图片 |
| 参数调整 | 修改参数，重新生成 |
| 下载图片 | 点击下载按钮 |
| 复制图片 | 点击复制图片到剪贴板 |

### 6.2 异常测试

| 测试项 | 说明 |
|--------|------|
| 超时处理 | 生成超过 5 分钟，显示超时错误 |
| 网络断开 | 生成中断，显示错误提示 |
| 参数越界 | 参数超出范围，自动限制 |

---

## 文件清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/types/comfyui.ts` | ComfyUI 类型定义 |
| `src/utils/comfyui-api.ts` | ComfyUI API 封装 |
| `src/hooks/useComfyUI.ts` | ComfyUI Hook |
| `src/components/GenerationButton.tsx` | 生成按钮 |
| `src/components/ImagePreview.tsx` | 图片预览 |
| `src/components/GenerationSettings.tsx` | 参数设置 |
| `src/components/ComfyUISettings.tsx` | 连接设置 |

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `src/components/PreviewPanel.tsx` | 集成生成功能 |
| `src/components/Header.tsx` | 添加设置按钮 |
| `src/components/index.ts` | 导出新组件 |
| `src/hooks/index.ts` | 导出新 Hook |

---

## 里程碑

| 阶段 | 任务 | 预计工时 |
|------|------|---------|
| M7-1 | 类型定义 + API 封装 | 2h |
| M7-2 | useComfyUI Hook | 2h |
| M7-3 | GenerationButton 组件 | 1h |
| M7-4 | ImagePreview 组件 | 2h |
| M7-5 | GenerationSettings 组件 | 1h |
| M7-6 | ComfyUISettings 组件 | 1h |
| M7-7 | 集成到 PreviewPanel | 2h |
| M7-8 | 测试与调试 | 3h |
| **总计** | | **14h** |

---

## 依赖项

无新增外部依赖，使用原生 `fetch` API。

---

## 注意事项

1. **跨域问题**: ComfyUI API 默认无 CORS，需在 ComfyUI 设置或使用代理
2. **图片路径**: 图片存储在 ComfyUI 的 output 目录，需正确解析路径
3. **并发控制**: 限制同时只能有一个生成任务
4. **清理资源**: 生成完成后及时释放 blob URL
