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
      const result = await comfyuiService.submitPrompt('PainterI2V-base', {
        ...task.params,
        taskId: task.id
      });

      const promptId = result.prompt_id;
      taskManager.updateTask(task.id, { status: 'running', promptId });
      wsPush({ type: 'progress', taskId: task.id, progress: 0 });

      const poll = async () => {
        let attempts = 0;
        const maxAttempts = 120;
        
        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000));
          attempts++;
          
          try {
            const history = await comfyuiService.getHistory(promptId);
            const status = history[promptId]?.status;
            
            if (status === 'completed') {
              const files = await comfyuiService.copyOutputFiles(promptId);
              taskManager.updateTask(task.id, {
                status: 'completed',
                result: { files },
                progress: 100
              });
              wsPush({ type: 'complete', taskId: task.id, status: 'completed', files });
              return;
            } else if (status === 'failed') {
              const error = history[promptId]?.errors?.[0]?.message || 'Execution failed';
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
        wsPush({ type: 'error', taskId: task.id, error: 'Timeout' });
      };
      
      poll();
    } catch (error) {
      taskManager.updateTask(task.id, { status: 'failed', error: error.message });
      wsPush({ type: 'error', taskId: task.id, error: error.message });
    }

    res.status(201).json(task);
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