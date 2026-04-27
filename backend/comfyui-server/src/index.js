import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { TaskManager } from './services/taskManager.js';
import { ComfyUIService } from './services/comfyui.js';
import { createWebSocketServer, broadcast } from './websocket.js';
import registerTaskRoutes from './routes/tasks.js';

const app = express();
const server = createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const taskManager = new TaskManager();
const comfyuiService = new ComfyUIService({
  host: process.env.COMFYUI_HOST || '127.0.0.1:8188',
  outputDir: process.env.COMFYUI_OUTPUT_DIR,
  resultDir: process.env.COMFYUI_RESULT_DIR,
});

createWebSocketServer(server);

registerTaskRoutes(app, taskManager, comfyuiService, broadcast);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, taskManager, comfyuiService };