import { Client } from '@stable-canvas/comfyui-client';
import { readFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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