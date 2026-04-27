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

  app.delete('/api/tasks/:id', (req, res) => {
    const deleted = taskManager.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  });
}