import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} Task
 * @property {string} id - Task ID (UUID)
 * @property {'pending'|'running'|'completed'|'failed'} status - Task status
 * @property {number} progress - Progress percentage (0-100)
 * @property {string|null} promptId - ComfyUI prompt ID
 * @property {Object} params - Task parameters
 * @property {string} params.prompt - Text prompt
 * @property {number} params.seconds - Video duration in seconds
 * @property {string} params.inputImage - Input image filename
 * @property {number} params.width - Output width
 * @property {number} params.height - Output height
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 * @property {Object|null} result - Result data
 * @property {string[]} result.files - Output file paths
 * @property {string|null} error - Error message
 */

/**
 * @typedef {Object} CreateTaskRequest
 * @property {string} prompt - Text prompt for image generation
 * @property {number} [seconds=2] - Video duration in seconds
 * @property {string} inputImage - Input image filename
 * @property {number} [width=360] - Output width
 * @property {number} [height=240] - Output height
 */

/**
 * GET /api/tasks - List all tasks
 * @summary 获取任务列表
 * @param {string} [status] - Filter by status: pending|running|completed|failed
 * @returns {Task[]} Array of tasks
 */
export default function registerTaskRoutes(app, taskManager, comfyuiService, wsPush) {
  app.get('/api/tasks', (req, res) => {
    const { status } = req.query;
    const tasks = taskManager.listTasks({ status });
    res.json(tasks);
  });

  /**
   * GET /api/tasks/:id - Get task by ID
   * @summary 获取单个任务详情
   * @param {string} req.params.id - Task ID
   * @returns {Task} Task object
   * @returns {404} Task not found
   */
  app.get('/api/tasks/:id', (req, res) => {
    const task = taskManager.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });

  /**
   * POST /api/tasks - Create a new task
   * @summary 创建新任务
   * @body {CreateTaskRequest}
   * @returns {Task} Created task
   * @returns {400} Missing required fields
   */
  app.post('/api/tasks', async (req, res) => {
    const { prompt, seconds, inputImage, width, height, filenamePrefix, seed } = req.body;
    console.log('[POST /api/tasks] Received params:', { prompt, seconds, inputImage, width, height, filenamePrefix, seed });
    
    if (!prompt || !inputImage) {
      return res.status(400).json({ error: 'prompt and inputImage are required' });
    }

    const task = taskManager.createTask({
      prompt,
      seconds: seconds || 2,
      inputImage,
      width: width || 360,
      height: height || 240,
      filenamePrefix
    });

try {
      console.log('[submitPrompt] Calling with params:', JSON.stringify(task.params));
      const result = await comfyuiService.submitPrompt('PainterI2V-base', {
        prompt: task.params.prompt,
        seconds: task.params.seconds,
        inputImage: task.params.inputImage,
        width: task.params.width,
        height: task.params.height,
        filenamePrefix: task.params.filenamePrefix,
        seed: task.params.seed,
      });
      console.log('[submitPrompt] Result:', result);

      const promptId = result.prompt_id;
      taskManager.updateTask(task.id, { status: 'running', promptId });
      const inputFilename = task.params.inputImage.split(/[\\/]/).pop();
      console.log(`[${task.id}] Task started, promptId: ${promptId}`);
      wsPush({ type: 'progress', taskId: task.id, progress: 0 });

      const poll = async () => {
        let attempts = 0;
        const maxAttempts = 90;
        const pollInterval = 10000;
        
        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, pollInterval));
          attempts++;
          
          try {
            const history = await comfyuiService.getHistory(promptId);
            const taskStatus = history[promptId]?.status;
            const statusStr = taskStatus?.status_str;
            console.log(`[${task.id}] Check ${attempts}/${maxAttempts}, status: ${statusStr}`);
            
            if (statusStr === 'success') {
              let files = [];
              try {
                files = await comfyuiService.copyOutputFiles(promptId, task.params.inputImage);
              } catch (e) {
                console.error('Copy error:', e.message);
              }
              comfyuiService.deleteInputFile(inputFilename);
              taskManager.updateTask(task.id, {
                status: 'completed',
                result: { files },
                progress: 100
              });
              console.log(`[${task.id}] Task completed`);
              wsPush({ type: 'complete', taskId: task.id, status: 'completed', files });
              return;
            }
            
            if (statusStr === 'error') {
              const error = taskStatus?.messages?.[0]?.message || 'Execution failed';
              console.log(`[${task.id}] Error: ${error}`);
              comfyuiService.deleteInputFile(inputFilename);
              taskManager.updateTask(task.id, { status: 'failed', error });
              wsPush({ type: 'error', taskId: task.id, error });
              return;
            }
            
            const progress = Math.min(Math.floor((attempts / 30) * 100), 95);
            wsPush({ type: 'progress', taskId: task.id, progress });
          } catch (e) {
            console.error('Poll error:', e);
          }
        }
        
        taskManager.updateTask(task.id, { status: 'failed', error: 'Timeout' });
        comfyuiService.deleteInputFile(inputFilename);
        wsPush({ type: 'error', taskId: task.id, error: 'Timeout' });
      };
      
      poll();
    } catch (error) {
      console.error(`[${task.id}] Error: ${error.message}`);
      taskManager.updateTask(task.id, { status: 'failed', error: error.message });
      wsPush({ type: 'error', taskId: task.id, error: error.message });
    }

    res.status(201).json(task);
  });

  /**
   * GET /api/workflows - List available workflows
   * @summary 获取可用工作流列表
   * @returns {Array} Array of workflow names
   */
app.get('/api/workflows', (req, res) => {
    const workflowsDir = path.join(__dirname, '..', '..', 'workflows');
    const configPath = path.join(workflowsDir, 'workflows.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    res.json(config);
  });

  /**
   * POST /api/simpletasks - Simple task without polling
   * @summary 简单任务（只调用ComfyUI，不处理结果）
   * @body {CreateTaskRequest}
   * @returns {Object} ComfyUI result
   */
  app.post('/api/simpletasks', async (req, res) => {
    const { prompt, seconds, inputImage, width, height, filenamePrefix, seed, workflow } = req.body;
    console.log('[POST /api/simpletasks] Received params:', { prompt, seconds, inputImage, width, height, filenamePrefix, seed, workflow });
    
    if (!inputImage) {
      return res.status(400).json({ error: 'inputImage is required' });
    }

    const workflowsDir = path.join(__dirname, '..', '..', 'workflows');
    const configPath = path.join(workflowsDir, 'workflows.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const wf = config.find(w => w.id === workflow);
    const workflowName = wf ? wf.workflow : null;
    if (!workflowName) {
      return res.status(400).json({ error: 'Invalid workflow' });
    }
    console.log('[api/simpletasks] workflow id:', workflow, '-> name:', workflowName);
    
    try {
      const result = await comfyuiService.submitPrompt(workflowName, {
        prompt: prompt || undefined,
        seconds: seconds || 2,
        inputImage,
        width: width || 360,
        height: height || 240,
        filenamePrefix,
        seed,
      });
      console.log('[api/simpletasks] Result:', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('[api/simpletasks] Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/tasks/:id - Cancel a task
   * @summary 取消任务
   * @param {string} req.params.id - Task ID
   * @returns {204} Task deleted
   * @returns {404} Task not found
   */
  app.delete('/api/tasks/:id', (req, res) => {
    const deleted = taskManager.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  });
}