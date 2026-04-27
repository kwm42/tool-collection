# ComfyUI Backend Service Design

**Date:** 2026-04-27
**Author:** AI Assistant
**Status:** Approved

---

## 1. Overview

A Node.js backend service that wraps ComfyUI Painter I2V workflow, providing REST API and WebSocket for task management. Frontend can create tasks, query status, and receive real-time progress updates.

---

## 2. Scope

**Included:**
- ComfyUI Painter I2V workflow encapsulation
- Task management: list, query, cancel
- WebSocket progress push
- Single workflow only

**Excluded:**
- Multiple workflow support
- Frontend page
- Persistence (in-memory only, restart loses state)
- Concurrency control

---

## 3. Tech Stack

- Node.js runtime
- Express.js (HTTP server)
- ws (WebSocket)
- @stable-canvas/comfyui-client (ComfyUI client)

---

## 4. Directory Structure

```
backend/comfyui-server/
├── src/
│   ├── index.js              # Entry point
│   ├── routes/
│   │   └── tasks.js         # Task routes
│   ├── services/
│   │   ├── taskManager.js   # Task state management (Map)
│   │   └── comfyui.js       # ComfyUI wrapper
│   ├── websocket.js          # WebSocket server
│   └── utils/
│       └── findNodeByTitle.js
├── workflows/
│   ├── PainterI2V-base-api.json
│   └── PainterI2V-base.json
├── package.json
└── .env
```

---

## 5. API Design

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List all tasks (supports ?status=pending\|running\|completed\|failed) |
| GET | /api/tasks/:id | Get task detail |
| POST | /api/tasks | Create new task |
| DELETE | /api/tasks/:id | Cancel task |

### Create Task Request

```json
{
  "prompt": "A beautiful woman with long hair, walking in a forest",
  "seconds": 2,
  "inputImage": "kiss03.png",
  "width": 360,
  "height": 240
}
```

### Task Response

```json
{
  "id": "uuid",
  "status": "pending|running|completed|failed",
  "progress": 0,
  "promptId": "comfyui-prompt-id",
  "params": {
    "prompt": "...",
    "seconds": 2,
    "inputImage": "kiss03.png",
    "width": 360,
    "height": 240"
  },
  "createdAt": "2026-04-27T10:00:00.000Z",
  "updatedAt": "2026-04-27T10:00:00.000Z",
  "result": {
    "files": ["F:\\ComfyUI_windows_portable\\ComfyUI\\output\\Video\\xxx.mp4"]
  },
  "error": null
}
```

---

## 6. WebSocket Design

**Endpoint:** `/ws`

**Push Messages:**

```json
{ "type": "progress", "taskId": "uuid", "progress": 45 }
{ "type": "complete", "taskId": "uuid", "status": "completed", "files": ["..."] }
{ "type": "error", "taskId": "uuid", "error": "error message" }
```

---

## 7. Data Flow

### Create Task Flow

1. Frontend POST `/api/tasks` with params
2. Backend generates UUID, stores in Map with `status: pending`
3. Immediately submit to ComfyUI, get `prompt_id`
4. Update status to `running`, push via WebSocket
5. Poll ComfyUI `/history/{prompt_id}` for completion
6. On complete, update status to `completed`/`failed`, push result

### Task Status Values

- `pending`: Task created, not yet submitted
- `running`: Submitted to ComfyUI, executing
- `completed`: Execution finished successfully
- `failed`: Execution failed

---

## 8. Configuration

Environment variables in `.env`:

```
COMFYUI_HOST=127.0.0.1:8188
COMFYUI_OUTPUT_DIR=F:\ComfyUI_windows_portable\ComfyUI\output\Video
PORT=3001
```

---

## 9. Dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "ws": "^8.x",
    "@stable-canvas/comfyui-client": "^1.5.9"
  }
}
```

---

## 10. Implementation Notes

- Use `findNodeByTitle()` to locate workflow nodes by their title
- TaskManager uses in-memory Map for simplicity
- WebSocket broadcasts all task updates to connected clients
- Copy output files to `comfyui_result` directory after completion