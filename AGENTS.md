# AGENTS.md - Agent Coding Guidelines

Personal tool collection: root `index.html` is a Chinese-language nav hub, plus fully independent subprojects. There is NO root workspace/package.json; each project has its own lockfile and package manager.

## Workflow

When the user proposes a requirement, follow this order:

1. **Discuss first** — ask clarifying questions and present a design plan (`讨论/提问，给出设计方案`).
2. **Read-only during discussion** — explore files as needed, but DO NOT modify, create, or delete anything.
3. **Wait for explicit confirmation** — start writing/changing code only after the user approves the plan (`修改确认后才能开始`).
4. Only then implement, and verify per the commands below.

## Project structure

```
tool-collection/
├── index.html                       # 工具导航 hub — add a card here for every new tool
├── backend/comfyui-server/          # Node Express + WebSocket server that drives ComfyUI (npm)
└── web-tools/                       # standalone tools, one per dir
    ├── comfyui-trigger/             # React 18 + Vite + Tailwind (pnpm) — pairs with backend
    ├── image-concat/                # React 18 + Vite + Tailwind (pnpm)
    ├── image-composer/              # React 18 + Vite + Tailwind (pnpm) — layer-based image composer
    ├── prompt-generator/            # React 19 + TS + Vite + Tailwind (npm), dev port 3002
    ├── script-collection/           # React 19 + TS + Vite (npm), dev port 3001, not in nav
    ├── risk-position-calculator/    # React 18 + Vite + Tailwind (pnpm), dev port 3003
    ├── srt-convertor/               # vanilla HTML/JS (renamed from vtt-to-srt)
    ├── pip-calculator/              # vanilla HTML/JS
    ├── screen-ruler/                # vanilla HTML/CSS
    ├── character-schedule/          # vanilla HTML
    ├── etf-monitor/                 # vanilla HTML (has api.md)
    ├── comfyui-frontend-test/       # throwaway scratch page, not in nav
    └── position-calculator/         # empty stub (unused)
```

Vanilla = no build/install; edit the HTML/JS directly. Built tools use Vite and each has `vite.config` with `base: './'` (all except script-collection).

## Build / Lint / Test Commands

### Vite + React tools (comfyui-trigger, image-concat, risk-position-calculator)

```bash
cd web-tools/<tool>
pnpm install
pnpm dev
pnpm build && pnpm preview
```

### Vite + TS tools (prompt-generator, script-collection)

```bash
cd web-tools/<tool>
npm install
npm run dev            # script-collection :3001, prompt-generator :3002
npm run build          # runs tsc -b && vite build (type-check included)
npm run lint           # ESLint flat config (typescript-eslint + react-hooks + react-refresh)
```

No dedicated test scripts exist in any project.

### backend/comfyui-server (used by comfyui-trigger)

```bash
cd backend/comfyui-server
npm install
npm run dev            # node --watch src/index.js, serves 127.0.0.1:3001
```

Reads `.env` (currently committed with machine-specific Windows paths like `F:\ComfyUI_windows_portable\...`). Defaults when unset: `COMFYUI_HOST=127.0.0.1:8188`, `PORT=3001`. Adjust paths for the local machine; never add credentials to it. Generated task outputs go to `comfyui_result/` (untracked).

### ComfyUI Trigger run flow

`start-comfyui-trigger.bat` (Windows): starts backend on 3001 and `pnpm preview` of comfyui-trigger on port 4173, opens `http://localhost:4173`. The frontend `dist/` must be built first (`pnpm build`). `start-comfyui-trigger.sh` instead runs both dev servers via `npx concurrently`.

## Style / conventions

- Chinese for UI labels/error messages, English for code.
- No comments unless explicitly requested.
- `const` by default; arrow functions; async/await; template literals.
- prompt-generator / script-collection: ESLint flat config with typescript-eslint; React Hooks rules enforced (`react-hooks/exhaustive-deps`).
- Git: conventional commits, English present tense — `<type>(<scope>): <description>`, types `feat`/`fix`/`refactor`/`docs`/`chore`/`build`.
- `.gitignore` covers `node_modules` and `.worktrees` (git worktree push/pull state). Broken pnpm store symlinks under a tool's `node_modules` will make recursive directory scans error out — run `pnpm install` to repair, and prefer search tools that skip `node_modules`.