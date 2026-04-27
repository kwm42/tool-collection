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