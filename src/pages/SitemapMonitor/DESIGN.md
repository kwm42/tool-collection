# Sitemap Monitor 设计方案

## 需求细化（Step 1）
- **站点配置字段**
  - `id`：唯一标识（UUID）。
  - `name`：展示名称，必填，允许中英文。
  - `url`：Sitemap 地址，需支持 `xml`, `xml.gz`, `txt`。
  - `schedule.type`：`daily`（每日固定时间）或 `interval`（按小时间隔）。
  - `schedule.value`：当类型为 `daily` 时保存 0-23 的小时；`interval` 保存 1-24 的小时间隔。
  - `lastRun`：上次完成时间（ISO 字符串）。
  - `nextRun`：下次计划时间（ISO 字符串）。
  - `historyLimit`：可选整数，单站点保留的最大历史文件数，默认 10。
- **历史记录字段**
  - `siteId`、`timestamp`、`status`（`success`/`error`）、`durationMs`、`newUrls`（数组）、`filePath`、`previousFilePath`、`errorMessage`。
- **本地存储路径**
  - 配置文件：`appData/appData.json` 内的 `sitemaps` 字段。
  - Sitemap 原始文件：`<userData>/sitemaps/<siteId>/<timestamp>.xml`。
  - 比对结果缓存：`<userData>/sitemaps/<siteId>/<timestamp>.json`（可选，用于快速回显）。
- **UI 原型拆分**
  - `SiteListPanel`：展示站点卡片与 `AddSiteDialog`。
  - `RunStatusPanel`：当前执行状态 + 任务进度。
  - `HistoryTable`：历史任务记录。
  - `DiffViewer`：展示新增 URL，支持搜索、导出。
  - `SettingsDrawer`：全局设置、默认目录、历史保留策略。


## 界面信息架构
- **页面入口**：侧边栏新增 “Sitemap Monitor” 菜单项，加载本页面。
- **布局**：左右分栏。
  - **左侧：站点配置**
    - 顶部按钮：`添加站点`（弹出表单：站点名称、Sitemap URL、抓取频率）。
    - 配置列表：卡片展示站点名称、URL、抓取频率、上次抓取时间、下次计划时间，操作按钮（编辑、立即执行、删除）。
  - **右侧：执行状态与结果**
    - 当前执行状态：显示正在抓取的站点、进度条/旋转指示。
    - 历史记录：表格或时间线，字段包含执行时间、耗时、结果、新增条数，可筛选最近执行。
    - 新增网址区域：按站点切换展示最近一次对比结果的新增 `URL` 列表，提供复制/导出。
- **辅助组件**
  - 全局操作：`立即全量检查`、`导出新增记录`。
  - 设置面板：定时任务总开关、下载目录、代理设置等。

## 核心功能设计
### 数据存储
- 配置和历史数据统一持久化到 `electron/dataManager`（新键 `sitemaps`），结构示例：
  ```json
  {
    "sites": [
      {"id": "uuid", "name": "示例站点", "url": "https://.../sitemap.xml", "schedule": {"type": "daily", "hour": 3}, "lastRun": 0, "nextRun": 0, "history": ["2025-10-21T...Z"] }
    ],
    "history": [
      {"siteId": "uuid", "timestamp": 173000000, "status": "success", "duration": 2300, "newUrls": ["..."], "filePath": ".../sitemap.xml"}
    ]
  }
  ```
- Sitemap 文件落地：`appData/sitemaps/<siteId>/<timestamp>.xml`，便于比对与回溯。

### 调度与抓取
- 在 Electron 主进程新增 `sitemapScheduler` 服务：
  1. 启动加载配置，根据 `schedule` 生成下一次执行时间。
  2. 维护定时器（可用 `node-cron`，或自建 `setTimeout` 队列）支持每日定时 / 每 N 小时。
  3. 支持渲染进程命令动态增删站点、立即执行、重新计算调度。
- 抓取流程：
  - 使用 `axios` 或 `node-fetch` 下载 sitemap，复用项目代理设置。
  - 写入本地文件后记录执行时间、耗时与文件路径。

### 差异比对
- 解析 sitemap：引入 `fast-xml-parser` 转换 XML -> JSON，提取 `<url><loc>` 或 `<sitemap><loc>` 列表。
- 与上一版本 URL 集合做差集得到新增网址，结果写回历史记录，发送通知给渲染进程。

### IPC 接口
- Renderer -> Main：
  - `sitemap:add`, `sitemap:update`, `sitemap:delete`
  - `sitemap:get-config`, `sitemap:get-history`
  - `sitemap:run-now`, `sitemap:run-all`
- Main -> Renderer：
  - `sitemap:status`（执行开始、进度、结束）
  - `sitemap:result`（包含新增列表、状态、错误信息等）
- 预加载脚本封装 API：`window.Main.sitemap.*`。

### 前端实现要点
- 新建 `SitemapMonitor` 页面：拆分站点列表、表单、历史记录、结果展示组件。
- 首次加载：通过 IPC 获取配置与历史记录，写入本地状态。
- 监听 `sitemap:status/result` 更新执行状态、结果面板。
- 表单校验 sitemap URL、频率配置；支持导出新增列表为 CSV/JSON。

### 日志 & 容错
- 抓取失败记录错误详情，写入日志并在 UI 中标记“失败”；允许用户重试。
- 控制历史文件数量（例如按站点保留最近 10 份）避免磁盘占用失控。

## 功能实现排期（示例，3 人周）
1. **需求细化 & 技术设计（0.5 天）**
   - 讨论字段定义、存储路径、UI 原型。
2. **基础设施（1.5 天）**
   - 数据结构扩展、dataManager 读写接口。
   - 预加载脚本新增 sitemap API。
3. **调度与抓取服务（2 天）**
   - 主进程 scheduler、下载与比对逻辑、IPC 事件。
4. **前端界面开发（2.5 天）**
   - 页面框架、站点配置 UI、历史记录/结果展示。
   - 与 IPC 联调、状态管理、导出能力。
5. **测试 & 优化（1.5 天）**
   - 单元测试（解析、调度）、端到端自测。
   - 性能与容错验证（网络异常、文件损坏）。
6. **文档 & 交付（0.5 天）**
   - README 更新、使用说明、后续扩展建议。

> 总计：约 8.5 人天。可根据团队人手并行压缩（前后端并行开发、调度与 UI 交叉推进）。
