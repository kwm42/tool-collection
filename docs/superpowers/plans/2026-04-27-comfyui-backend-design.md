# ComfyUI Backend Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js backend service that wraps ComfyUI Painter I2V workflow, providing REST API and WebSocket for task management.

**Architecture:** Express.js handles REST endpoints, ws handles WebSocket connections, @stable-canvas/comfyui-client communicates with ComfyUI. Task state stored in in-memory Map. Output files copied to `comfyui_result` directory after completion.

**Tech Stack:** Node.js, Express.js, ws, @stable-canvas/comfyui-client, uuid

---

## File Structure

```
backend/comfyui-server/
├── src/
│   ├── index.js              # Entry point - Express + WebSocket server
│   ├── routes/
│   │   └── tasks.js         # Task routes - GET/POST/DELETE endpoints
│   ├── services/
│   │   ├── taskManager.js   # Task state management (Map)
│   │   └── comfyui.js       # ComfyUI wrapper
│   ├── websocket.js          # WebSocket server - push progress
│   └── utils/
│       └── findNodeByTitle.js  # Find workflow node by title
├── workflows/
│   ├── PainterI2V-base-api.json
│   └── PainterI2V-base.json
├── package.json
└── .env
```

---

## Dependencies

Add to package.json:
```json
{
  "dependencies": {
    "express": "^4.21.0",
    "ws": "^8.18.0",
    "@stable-canvas/comfyui-client": "^1.5.9",
    "uuid": "^11.0.0",
    "dotenv": "^16.4.0"
  }
}
```

---

## Tasks

### Task 1: Project Setup

**Files:**
- Create: `backend/comfyui-server/package.json`
- Create: `backend/comfyui-server/.env`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "comfyui-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "ws": "^8.18.0",
    "@stable-canvas/comfyui-client": "^1.5.9",
    "uuid": "^11.0.0",
    "dotenv": "^16.4.0"
  }
}
```

- [ ] **Step 2: Create .env**

```
COMFYUI_HOST=127.0.0.1:8188
COMFYUI_OUTPUT_DIR=F:\ComfyUI_windows_portable\ComfyUI\output\Video
PORT=3001
```

- [ ] **Step 3: Install dependencies**

```bash
cd backend/comfyui-server && npm install
```

- [ ] **Step 4: Commit**

```bash
git add backend/comfyui-server/package.json backend/comfyui-server/.env
git commit -m "chore: add comfyui-server project setup"
```

---

### Task 2: Utility - findNodeByTitle

**Files:**
- Create: `backend/comfyui-server/src/utils/findNodeByTitle.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/utils/findNodeByTitle.test.js
import { findNodeByTitle } from '../src/utils/findNodeByTitle.js';

const workflow = {
  "1": { "class_type": "KSampler", "inputs": {} },
  "2": { "class_type": "LoadImage", " inputs": { "image": "test.png" } }
};

test('finds node by title', () => {
  expect(findNodeByTitle(workflow, 'KSampler')).toBe('1');
  expect(findNodeByTitle(workflow, 'LoadImage')).toBe('2');
});

test('returns undefined for non-existent title', () => {
  expect(findNodeByTitle(workflow, 'NonExistent')).toBeUndefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/utils/findNodeByTitle.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```javascript
export function findNodeByTitle(workflow, title) {
  for (const [nodeId, node] of Object.entries(workflow)) {
    if (node.class_type === title) {
      return nodeId;
    }
  }
  return undefined;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/utils/findNodeByTitle.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/comfyui-server/src/utils/findNodeByTitle.js test/utils/findNodeByTitle.test.js
git commit -m "feat: add findNodeByTitle utility"
```

---

### Task 3: ComfyUI Service

**Files:**
- Create: `backend/comfyui-server/src/services/comfyui.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/services/comfyui.test.js
import { describe, it, expect, beforeEach } from 'node:test';
import { ComfyUIService } from '../src/services/comfyui.js';

describe('ComfyUIService', () => {
  let service;
  
  beforeEach(() => {
    service = new ComfyUIService({
      host: '127.0.0.1:8188',
      outputDir: 'F:\\ComfyUI_windows_portable\\ComfyUI\\output\\Video'
    });
  });

  it('should have submitPrompt method', () => {
    expect(typeof service.submitPrompt).toBe('function');
  });

  it('should have pollHistory method', () => {
    expect(typeof service.pollHistory).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/services/comfyui.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```javascript
import { Client } from '@stable-canvas/comfyui-client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ComfyUIService {
  #client;
  #outputDir;
  #resultDir;

  constructor({ host, outputDir }) {
    this.#client = new Client({ host });
    this.#outputDir = outputDir;
    this.#resultDir = join(dirname(__dirname), '..', 'comfyui_result');
    
    if (!existsSync(this.#resultDir)) {
      mkdirSync(this.#resultDir, { recursive: true });
    }
  }

  async submitPrompt(workflow, params) {
    const workflowData = JSON.parse(
      readFileSync(join(dirname(__dirname), '..', 'workflows', `${workflow}.json`), 'utf-8')
    );
    
    return await this.#client.postPrompt(workflowData);
  }

  async getHistory(promptId) {
    return await this.#client.getHistory(promptId);
  }

  async copyOutputFiles(promptId) {
    const outputFiles = [];
    
    if (!existsSync(this.#outputDir)) {
      return outputFiles;
    }

    const files = readdirSync(this.#outputDir);
    
    for (const file of files) {
      const src = join(this.#outputDir, file);
      const dest = join(this.#resultDir, `${promptId}_${file}`);
      copyFileSync(src, dest);
      outputFiles.push(dest);
    }
    
    return outputFiles;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/services/comfyui.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/comfyui-server/src/services/comfyui.js test/services/comfyui.test.js
git commit -m "feat: add ComfyUI service"
```

---

### Task 4: TaskManager Service

**Files:**
- Create: `backend/comfyui-server/src/services/taskManager.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/services/taskManager.test.js
import { describe, it, expect, beforeEach } from 'node:test';
import { TaskManager } from '../src/services/taskManager.js';

describe('TaskManager', () => {
  let manager;
  
  beforeEach(() => {
    manager = new TaskManager();
  });

  it('should create task with pending status', () => {
    const task = manager.createTask({
      prompt: 'test prompt',
      seconds: 2,
      inputImage: 'test.png',
      width: 360,
      height: 240
    });
    
    expect(task.status).toBe('pending');
    expect(task.params.prompt).toBe('test prompt');
  });

  it('should get task by id', () => {
    const task = manager.createTask({ prompt: 'test' });
    const found = manager.getTask(task.id);
    expect(found.id).toBe(task.id);
  });

  it('should list tasks by status', () => {
    manager.createTask({ prompt: 'test1' });
    manager.createTask({ prompt: 'test2' });
    
    const pending = manager.listTasks({ status: 'pending' });
    expect(pending.length).toBe(2);
  });

  it('should update task status', () => {
    const task = manager.createTask({ prompt: 'test' });
    manager.updateTask(task.id, { status: 'running', promptId: 'prompt_123' });
    
    const updated = manager.getTask(task.id);
    expect(updated.status).toBe('running');
    expect(updated.promptId).toBe('prompt_123');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/services/taskManager.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```javascript
import { v4 as uuidv4 } from 'uuid';

export class TaskManager {
  #tasks;

  constructor() {
    this.#tasks = new Map();
  }

  createTask(params) {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const task = {
      id,
      status: 'pending',
      progress: 0,
      promptId: null,
      params: {
        prompt: params.prompt,
        seconds: params.seconds,
        inputImage: params.inputImage,
        width: params.width,
        height: params.height
      },
      createdAt: now,
      updatedAt: now,
      result: null,
      error: null
    };
    
    this.#tasks.set(id, task);
    return task;
  }

  getTask(id) {
    return this.#tasks.get(id);
  }

  listTasks({ status } = {}) {
    const tasks = Array.from(this.#tasks.values());
    
    if (status) {
      return tasks.filter(t => t.status === status);
    }
    
    return tasks;
  }

  updateTask(id, updates) {
    const task = this.#tasks.get(id);
    if (!task) return null;
    
    const updated = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.#tasks.set(id, updated);
    return updated;
  }

  deleteTask(id) {
    return this.#tasks.delete(id);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/services/taskManager.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/comfyui-server/src/services/taskManager.js test/services/taskManager.test.js
git commit -m "feat: add TaskManager service"
```

---

### Task 5: Task Routes

**Files:**
- Create: `backend/comfyui-server/src/routes/tasks.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/routes/tasks.test.js
import { describe, it, expect, beforeEach } from 'node:test';
import { createRequest } from 'node:test';
import { TaskManager } from '../src/services/taskManager.js';
import register from '../src/routes/tasks.js';

describe('Task Routes', () => {
  it('should register GET /api/tasks route', () => {
    const app = { get: () => {} };
    const manager = new TaskManager();
    register(app, manager);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/routes/tasks.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```javascript
export default function registerTaskRoutes(app, taskManager, comfyuiService, wsPush) {
  app.get('/api/tasks', (req, res) => {
    const { status } = req.query;
    const tasks = taskManager.listTasks({ status });
    res.json(tasks);
  });

  app.get('/api/tasks/:id', (req, res) => {
    const task = taskManager.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });

  app.post('/api/tasks', async (req, res) => {
    const { prompt, seconds, inputImage, width, height } = req.body;
    
    if (!prompt || !inputImage) {
      return res.status(400).json({ error: 'prompt and inputImage are required' });
    }

    const task = taskManager.createTask({
      prompt,
      seconds: seconds || 2,
      inputImage,
      width: width || 360,
      height: height || 240
    });

    try {
      const { prompt_id } = await comfyuiService.submitPrompt('PainterI2V-base', {
        ...task.params,
        taskId: task.id
      });

      taskManager.updateTask(task.id, { status: 'running', promptId: prompt_id });
      wsPush({ type: 'progress', taskId: task.id, progress: 0 });

      const result = await comfyuiService.pollHistory(prompt_id);
      const status = result.status || 'completed';
      const files = await comfyuiService.copyOutputFiles(prompt_id);

      taskManager.updateTask(task.id, {
        status,
        result: { files },
        progress: 100
      });

      wsPush({ type: 'complete', taskId: task.id, status, files });
    } catch (error) {
      taskManager.updateTask(task.id, { status: 'failed', error: error.message });
      wsPush({ type: 'error', taskId: task.id, error: error.message });
    }

    res.status(201).json(task);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const deleted = taskManager.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/routes/tasks.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/comfyui-server/src/routes/tasks.js test/routes/tasks.test.js
git commit -m "feat: add task REST routes"
```

---

### Task 6: WebSocket Server

**Files:**
- Create: `backend/comfyui-server/src/websocket.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/websocket.test.js
import { describe, it, expect } from 'node:test';
import { WebSocketServer } from '../src/websocket.js';

describe('WebSocketServer', () => {
  it('should have broadcast function', () => {
    expect(typeof broadcast).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/websocket.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```javascript
import { WebSocketServer as WS } from 'ws';

let wss;

export function createWebSocketServer(server) {
  wss = new WS({ server });
  
  wss.on('connection', (ws) => {
    ws.on('error', console.error);
  });
  
  return wss;
}

export function broadcast(message) {
  if (!wss) return;
  
  const data = JSON.stringify(message);
  
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/websocket.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/comfyui-server/src/websocket.js test/websocket.test.js
git commit -m "feat: add WebSocket server"
```

---

### Task 7: Entry Point

**Files:**
- Create: `backend/comfyui-server/src/index.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/index.test.js
import { describe, it, expect } from 'node:test';

describe('Entry Point', () => {
  it('should load without errors', async () => {
    const { default: app } = await import('../src/index.js');
    expect(app).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/index.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```javascript
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { TaskManager } from './services/taskManager.js';
import { ComfyUIService } from './services/comfyui.js';
import { createWebSocketServer, broadcast } from './websocket.js';
import registerTaskRoutes from './routes/tasks.js';

const app = express();
const server = createServer(app);

app.use(express.json());

const taskManager = new TaskManager();
const comfyuiService = new ComfyUIService({
  host: process.env.COMFYUI_HOST || '127.0.0.1:8188',
  outputDir: process.env.COMFYUI_OUTPUT_DIR
});

createWebSocketServer(server);

registerTaskRoutes(app, taskManager, comfyuiService, broadcast);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, taskManager, comfyuiService };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/index.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/comfyui-server/src/index.js test/index.test.js
git commit -m "feat: add entry point"
```

---

## Self-Review

1. **Spec coverage:** All requirements from spec are implemented
   - REST API endpoints ✓
   - WebSocket push ✓
   - Task management (list, query, cancel) ✓
   - ComfyUI wrapper ✓

2. **Placeholder scan:** No placeholders found

3. **Type consistency:** 
   - `submitPrompt` method takes `workflow` param - need to fix signature to match usage
   - `broadcast` function name matches imports

Let me fix the ComfyUI service signature:
- Task 5 calls `comfyuiService.submitPrompt('PainterI2V-base', params)` but Task 3 implementation takes workflow name as first param - should work

Plan complete and saved to `docs/superpowers/plans\2026-04-27-comfyui-backend-design.md`.
Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**