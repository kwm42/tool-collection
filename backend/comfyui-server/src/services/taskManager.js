import { v4 as uuidv4 } from 'uuid';

/**
 * TaskManager - 任务状态管理器
 * 使用内存 Map 存储任务状态（重启后丢失）
 */
export class TaskManager {
  #tasks;

  constructor() {
    this.#tasks = new Map();
  }

  /**
   * 创建新任务
   * @param {Object} params - 任务参数
   * @param {string} params.prompt - 文本提示
   * @param {number} params.seconds - 视频时长（秒）
   * @param {string} params.inputImage - 输入图片文件名
   * @param {number} params.width - 输出宽度
   * @param {number} params.height - 输出高度
   * @returns {Object} 创建的任务对象
   */
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
        height: params.height,
        filenamePrefix: params.filenamePrefix,
        seed: params.seed
      },
      createdAt: now,
      updatedAt: now,
      result: null,
      error: null
    };
    
    this.#tasks.set(id, task);
    return task;
  }

  /**
   * 获取任务
   * @param {string} id - 任务 ID
   * @returns {Object|null} 任务对象，不存在则返回 null
   */
  getTask(id) {
    return this.#tasks.get(id);
  }

  /**
   * 列出任务
   * @param {Object} [options] - 查询选项
   * @param {string} [options.status] - 按状态过滤
   * @returns {Object[]} 任务数组
   */
  listTasks({ status } = {}) {
    const tasks = Array.from(this.#tasks.values());
    
    if (status) {
      return tasks.filter(t => t.status === status);
    }
    
    return tasks;
  }

  /**
   * 更新任务
   * @param {string} id - 任务 ID
   * @param {Object} updates - 更新内容
   * @returns {Object|null} 更新后的任务对象，不存在则返回 null
   */
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

  /**
   * 删除任务
   * @param {string} id - 任务 ID
   * @returns {boolean} 是否删除成功
   */
  deleteTask(id) {
    return this.#tasks.delete(id);
  }
}