import { Client } from '@stable-canvas/comfyui-client';
import WebSocket from 'ws';
import fetch from 'node-fetch';
import { readFileSync, copyFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMFYUI_INPUT_DIR = 'F:\\ComfyUI_windows_portable\\ComfyUI\\input';

/**
 * ComfyUIService - ComfyUI API 包装器
 * 处理与 ComfyUI 服务器的通信
 */
export class ComfyUIService {
  #client;
  #outputDir;
  #resultDir;

  /**
   * @param {Object} config - 配置
   * @param {string} config.host - ComfyUI 服务器地址
   * @param {string} config.outputDir - ComfyUI 输出目录
   */
  constructor({ host, outputDir, resultDir }) {
    this.#client = new Client({
      api_host: host,
      WebSocket,
      fetch,
    });
    this.#outputDir = outputDir;
    this.#resultDir = resultDir || join(dirname(__dirname), '..', 'comfyui_result');

    if (!existsSync(this.#resultDir)) {
      mkdirSync(this.#resultDir, { recursive: true });
    }
  }

  /**
   * 提交 prompt 到 ComfyUI
   * @param {string} workflow - 工作流名称
   * @param {Object} params - prompt 参数
   * @returns {Promise<Object>} ComfyUI 返回的结果
   */
  async submitPrompt(workflow, params) {
    let workflowApiPath, workflowFullPath;
    
    const workflowsDir = join(dirname(__dirname), '..', 'workflows');
    const categoryDir = join(workflowsDir, 'category');
    
    const wfApiName = workflow.endsWith(' api') ? workflow : `${workflow} api`;
    const apiPath = join(categoryDir, `${wfApiName}.json`);
    const wfFullName = workflow.replace(' api', '');
    const fullPath = join(categoryDir, `${wfFullName}.json`);
    
    if (existsSync(apiPath)) {
      workflowApiPath = apiPath;
      workflowFullPath = existsSync(fullPath) ? fullPath : apiPath;
    } else {
      throw new Error(`Workflow not found: ${workflow}`);
    }

    const workflowData = JSON.parse(readFileSync(workflowApiPath, 'utf-8'));
    const workflowFull = JSON.parse(readFileSync(workflowFullPath, 'utf-8'));

    const nodeNames = {
      prompt: 'ImpactWildcardProcessor_1st_Positive',
      seconds: '1st_Second',
      inputImage: 'Load Image_1st',
      width: 'Preset_Resolution_Width',
      height: 'Preset_Resolution_Height',
    };

    for (const [key, title] of Object.entries(nodeNames)) {
      const nodeId = this.findNodeByTitle(workflowData, title);
      if (nodeId && params[key] !== undefined) {
        if (key === 'prompt') {
          workflowData[nodeId].inputs.wildcard_text = params[key];
          workflowData[nodeId].inputs.populated_text = params[key];
          workflowData[nodeId].inputs.seed = params.seed || Math.floor(Math.random() * 2 ** 32);
        } else if (key === 'seconds' || key === 'width' || key === 'height') {
          workflowData[nodeId].inputs.value = params[key];
        } else if (key === 'inputImage') {
          const inputImagePath = params[key];
          const filename = inputImagePath.split(/[\\/]/).pop();
          if (existsSync(inputImagePath)) {
            const destPath = join(COMFYUI_INPUT_DIR, filename);
            copyFileSync(inputImagePath, destPath);
            workflowData[nodeId].inputs.image = filename;
          } else {
            workflowData[nodeId].inputs.image = inputImagePath;
          }
        }
      }
    }

    if (params.inputImage || params.filenamePrefix) {
      console.log('[comfyui submitPrompt] inputImage:', params.inputImage, 'filenamePrefix:', params.filenamePrefix);
      let filenamePrefix = params.filenamePrefix;
      if (!filenamePrefix) {
        const name = params.inputImage.split(/[\\/]/).pop().replace(/\.[^.]+$/, '');
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const HH = pad(now.getHours());
        const MM = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        filenamePrefix = `Video/${name}_${yyyy}-${mm}-${dd}-${HH}-${MM}-${ss}`;
      }
      const videoNodeId = this.findNodeByTitle(workflowData, 'Video Combine 1st');
      if (videoNodeId) {
        workflowData[videoNodeId].inputs.filename_prefix = filenamePrefix;
      }
    }

    return await this.#client.queuePrompt(-1, {
      prompt: workflowData,
      workflow: workflowFull,
    });
  }

  findNodeByTitle(workflow, title) {
    for (const [nodeId, node] of Object.entries(workflow)) {
      if (node._meta && node._meta.title === title) {
        return nodeId;
      }
    }
    return null;
  }

  /**
   * 获取 prompt 执行历史
   * @param {string} promptId - Prompt ID
   * @returns {Promise<Object>} 历史记录
   */
  async getHistory(promptId) {
    const response = await fetch(`http://${this.#client.api_host}/history/${promptId}`);
    const data = await response.json();
    return data;
  }

  /**
   * 复制输出文件到结果目录
   * @param {string} promptId - Prompt ID
   * @param {string} inputImage - 输入图片路径
   * @returns {Promise<string[]>} 复制后的文件路径数组
   */
  async copyOutputFiles(promptId, inputImage) {
    const outputFiles = [];

    if (!existsSync(this.#outputDir)) {
      return outputFiles;
    }

    const name = inputImage.split(/[\\/]/).pop().replace(/\.[^.]+$/, '');
    const prefix = `Video/${name}_`;
    const files = readdirSync(this.#outputDir).filter(f => f.startsWith(prefix) && f.endsWith('.mp4'));

    if (files.length === 0) {
      return outputFiles;
    }

    const inputDir = inputImage ? dirname(inputImage) : this.#resultDir;

    for (const file of files) {
      const src = join(this.#outputDir, file);
      const dest = join(inputDir, `${promptId}_${file}`);
      copyFileSync(src, dest);
      outputFiles.push(dest);
    }

    return outputFiles;
  }

  /**
   * 删除输入图片文件
   * @param {string} filename - 文件名
   */
  deleteInputFile(filename) {
    const filepath = join(COMFYUI_INPUT_DIR, filename);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }
}