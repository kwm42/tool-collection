# GitHub Copilot 指令

## 项目概览
- 项目是一个使用 **Vite + React + TypeScript** 的桌面应用，Electron 负责主进程与预加载脚本。
- Electron 主进程入口位于 `electron/index.ts`，预加载脚本在 `electron/preload.ts`。
- 前端界面位于 `src/` 目录，主要页面包括壁纸下载、K 线看板、文件夹工具与传输中心。
- `backend/server.js` 提供基于 Koa 的 Wallhaven API 代理服务。

## 关键模块
- `electron/services/download/` 维护带并发控制的下载队列，依赖本地配置的下载目录。
- `electron/services/system/` 提供路径选择、文件夹去重等系统操作。
- `src/pages/WallhavenDownload/` 负责壁纸搜索、批量下载逻辑，与主进程通过 IPC 交互。
- `src/pages/DownloadCenter/` 轮询并监听下载状态。
- `src/pages/FolderTool/` 操作 IPC 完成重复文件检测、删除、移动。
- `src/components/SettingsModal/` 读取与保存设置（如下载路径），数据由 `electron/dataManager.ts` 持久化。

## 开发约定
- 统一使用 TypeScript；React 组件采用函数式写法。
- 样式结合 Tailwind，注意 dark mode 下的样式兼容。
- 与主进程通信统一通过 `window.Main` 暴露的 API，不直接访问 `ipcRenderer`。
- 下载目录默认存储在用户设置中，如新增功能需考虑该字段。
- 若需要新增 IPC 通道，应在预加载脚本增加封装，避免直接暴露 `ipcRenderer`。
- 引入第三方资源时确认与现有代理、日志体系兼容。

## 测试与调试
- 前端运行：`npm run dev`（Vite）。
- Electron 联调：`npm run dev:electron`。
- 后端代理：手动启动 `node backend/server.js` 或整合到并行流程。

## 文档和多语言
- i18n 资源位于 `src/locales/`，新增文案需同步更新多语言文件。

## 注意事项
- 下载、文件操作依赖本地路径，开发时留意路径跨平台兼容。
- Electron 日志存储于 `app.getPath('userData')/logs/app.log`。
- 代理地址默认 `http://127.0.0.1:7897`，根据实际环境调整。
- 避免在渲染进程中直接使用 Node API，必要时通过 IPC 扩展。
