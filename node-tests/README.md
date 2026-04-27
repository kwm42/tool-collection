# ComfyUI Node.js Test Suite

Test scripts for Node.js integration with ComfyUI using `@stable-canvas/comfyui-client`.

## Setup

```bash
cd node-tests
pnpm install
```

## Tests

### 1. Basic Connection Test

Tests basic connectivity to ComfyUI server.

```bash
pnpm test
```

**What it tests:**
- Client connection to ComfyUI
- WebSocket connection
- System stats retrieval
- Available model listing

### 2. Pipeline Test

Tests Text-to-Image generation via pipeline DSL.

```bash
pnpm test:pipeline
```

**What it tests:**
- BasePipe usage
- Workflow execution
- Image generation
- Base64 output handling

## Prerequisites

- ComfyUI running at `127.0.0.1:8188` (default)
- At least one SD model installed

## Configuration

Edit the `COMFYUI_HOST` constant in test files to change the target server.

```js
const COMFYUI_HOST = "127.0.0.1:8188";
```