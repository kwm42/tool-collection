# Tool Collection

一个个人工具集合，包含网页工具和桌面工具。

## 目录结构

```
tool-collection/
├── index.html             # 工具导航页
├── desktop-tools/         # 桌面工具
│   └── WallTools/        # Wallhaven 图片下载器 (Electron)
└── web-tools/            # 网页工具
    ├── image-concat/      # 图片拼接工具
    ├── pip-calculator/    # 外汇仓位计算器 (原生 JS)
    ├── pip-calculator-react/  # 外汇仓位计算器 (React)
    └── vtt-to-srt/        # 字幕格式转换
```

## 快速开始

### 网页工具

使用任意静态服务器打开 `index.html`，或使用各子项目的开发命令。

### 桌面工具

进入对应目录后：

```bash
cd desktop-tools/WallTools
yarn install
yarn dev:electron
```

## 工具列表

### 网页工具

| 工具 | 说明 |
|------|------|
| 外汇仓位计算器 | 计算不同货币对的开仓手数 |
| 外汇仓位计算器 (React) | React 版本仓位计算器 |
| ImageConcat | 图片拼接工具 |
| VTT 转 SRT | 字幕格式转换 |

### 桌面工具

| 工具 | 说明 |
|------|------|
| WallTools | Wallhaven 图片批量下载 |
