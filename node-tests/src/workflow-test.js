/**
 * PainterI2V Workflow Test
 * 
 * 功能：调用 ComfyUI 执行 Painter I2V (图生视频) 工作流
 * 
 * 使用方式：
 *   cd node-tests && pnpm install
 *   pnpm test:workflow
 * 
 * 工作流文件：
 *   - workflow/PainterI2V-base-api.json  (API 格式，用于提交)
 *   - workflow/PainterI2V-base.json     (完整格式，用于 extra_pnginfo)
 * 
 * 可配置参数：
 *   - prompt:       视频提示词 (ImpactWildcardProcessor_1st_Positive)
 *   - seconds:      视频时长秒数 (1st_Second)
 *   - inputImage:   输入图片文件名 (Load Image_1st)
 *   - width:        视频宽度 (Preset_Resolution_Width)
 *   - height:       视频高度 (Preset_Resolution_Height)
 *   - seed:         随机种子
 * 
 * 执行流程：
 *   1. 加载工作流 JSON 文件
 *   2. 连接 ComfyUI 服务
 *   3. 修改工作流参数
 *   4. 提交任务到队列
 *   5. 轮询等待任务完成
 *   6. 复制输出文件到 comfyui_result 目录
 * 
 * ComfyUI 依赖：
 *   - ComfyUI 运行在 127.0.0.1:8188
 *   - 安装了 rgthree-comfy (Seed 节点需要完整 workflow 信息)
 * 
 * 输出目录搜索路径：
 *   - F:\ComfyUI_windows_portable\ComfyUI\output\Video
 */

import { Client } from "@stable-canvas/comfyui-client";
import WebSocket from "ws";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMFYUI_HOST = "127.0.0.1:8188";
const OUTPUT_DIR = path.join(__dirname, "comfyui_result");

function getFilenamePrefix(inputImage) {
  const name = inputImage.replace(/\.[^.]+$/, "");
  const now = new Date();
  const pad = n => n.toString().padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const MM = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `Video/${name}_${yyyy}-${mm}-${dd}-${HH}-${MM}-${ss}`;
}

const params = {
  prompt: "A beautiful woman with long hair, walking in a forest, detailed, high quality",
  seconds: 2,
  inputImage: "kiss03 抓奶，kiss1.png",
  width: 360,
  height: 240,
};

params.filenamePrefix = getFilenamePrefix(params.inputImage);

console.log("=== PainterI2V Workflow Test ===");
console.log("Parameters:", params);

function findNodeByTitle(workflow, title) {
  for (const nodeId in workflow) {
    const node = workflow[nodeId];
    if (node._meta && node._meta.title === title) {
      return node;
    }
  }
  return null;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`  Copied: ${path.basename(src)}`);
    return true;
  } catch (err) {
    console.error(`  Failed to copy ${src}: ${err.message}`);
    return false;
  }
}

async function waitForCompletion(promptId, client) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout waiting for completion"));
    }, 600000);

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://${COMFYUI_HOST}/history/${promptId}`);
        if (response.ok) {
          const history = await response.json();
          if (history[promptId]) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve(history[promptId]);
          } else {
            console.log(`  Waiting... (prompt_id: ${promptId.substring(0, 8)}...)`);
          }
        } else {
          console.log(`  History response not ok: ${response.status}`);
        }
      } catch (err) {
        console.log("  Error checking status, retrying...");
      }
    }, 5000);
  });
}

async function copyOutputFiles(filenamePrefix, outputDir) {
  ensureDir(outputDir);

  const pathsToCheck = [
    path.join("F:", "ComfyUI_windows_portable", "ComfyUI", "output", "Video"),
  ];

  let comfyOutputDir = null;
  for (const testPath of pathsToCheck) {
    if (fs.existsSync(testPath)) {
      comfyOutputDir = testPath;
      break;
    }
  }

  if (!comfyOutputDir) {
    console.log("  Could not find ComfyUI output directory");
    return;
  }

  console.log(`  Output dir: ${comfyOutputDir}`);

  const files = fs.readdirSync(comfyOutputDir);
  const prefixName = filenamePrefix.split("/").pop();

  const matchingFiles = files.filter(f => f.startsWith(prefixName));
  console.log(`  Found ${matchingFiles.length} output file(s)`);

  for (const file of matchingFiles) {
    const src = path.join(comfyOutputDir, file);
    const dest = path.join(outputDir, file);
    copyFile(src, dest);
  }
}

async function runWorkflow() {
  const workflowApiPath = path.join(__dirname, "workflow", "PainterI2V-base-api.json");
  const workflowFullPath = path.join(__dirname, "workflow", "PainterI2V-base.json");

  if (!fs.existsSync(workflowApiPath)) {
    console.error(`Workflow API file not found: ${workflowApiPath}`);
    return;
  }

  const workflowData = JSON.parse(fs.readFileSync(workflowApiPath, "utf-8"));
  const workflowFull = JSON.parse(fs.readFileSync(workflowFullPath, "utf-8"));

  const nodes = {
    prompt: findNodeByTitle(workflowData, "ImpactWildcardProcessor_1st_Positive"),
    seconds: findNodeByTitle(workflowData, "1st_Second"),
    inputImage: findNodeByTitle(workflowData, "Load Image_1st"),
    width: findNodeByTitle(workflowData, "Preset_Resolution_Width"),
    height: findNodeByTitle(workflowData, "Preset_Resolution_Height"),
    videoOutput: findNodeByTitle(workflowData, "Video Combine 1st"),
  };

  for (const [name, node] of Object.entries(nodes)) {
    if (!node) {
      console.error(`Node not found: ${name}`);
      return;
    }
  }

  nodes.prompt.inputs.wildcard_text = params.prompt;
  nodes.prompt.inputs.populated_text = params.prompt;

  nodes.seconds.inputs.value = params.seconds;

  nodes.inputImage.inputs.image = params.inputImage;

  nodes.width.inputs.value = params.width;
  nodes.height.inputs.value = params.height;

  nodes.videoOutput.inputs.filename_prefix = params.filenamePrefix;

  console.log(`\nLoaded workflow, Total nodes: ${Object.keys(workflowData).length}`);

  const client = new Client({
    api_host: COMFYUI_HOST,
    WebSocket,
    fetch,
  });

  try {
    console.log("\nConnecting to ComfyUI...");
    const [stats, isConnected] = await Promise.all([
      client.getSystemStats(),
      client.connect(),
    ]);

    console.log("ComfyUI:", stats.system.comfyui_version, "| GPU:", stats.devices[0].name);
    console.log("WebSocket:", isConnected);

    console.log("\nStep 1: Submitting workflow...");
    const result = await client.queuePrompt(-1, {
      prompt: workflowData,
      workflow: workflowFull,
    });
    const promptId = result.prompt_id;
    console.log(`  ✅ Submitted! Prompt ID: ${promptId}`);

    console.log("\nStep 2: Waiting for completion (checking every 5s)...");
    await waitForCompletion(promptId, client);
    console.log("  ✅ Execution completed!");

    console.log("\nStep 3: Copying output files...");
    await copyOutputFiles(params.filenamePrefix, OUTPUT_DIR);

    console.log("\n✅ All done!");

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    client.close();
  }
}

runWorkflow();