import type {
  ComfyUIPromptResult,
  ComfyUIHistoryItem,
} from '../types/comfyui';

const SERVER_BASE = 'http://127.0.0.1:8188';

export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_BASE}/system_stats`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function queuePrompt(
  theme: string,
  character: string,
  negativePrompt: string,
  steps: number,
  cfg: number,
  width: number,
  height: number,
  seed: number
): Promise<ComfyUIPromptResult | null> {
  try {
    const workflow = {
      "3": {
        "inputs": {
          "seed": seed,
          "steps": steps,
          "cfg": cfg,
          "sampler_name": "dpmpp_2m",
          "scheduler": "karras",
          "denoise": 1,
          "model": ["183", 0],
          "positive": ["137", 0],
          "negative": ["7", 0],
          "latent_image": ["36", 0]
        },
        "class_type": "KSampler"
      },
      "6": {
        "inputs": {
          "text": "",
          "clip": ["183", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "7": {
        "inputs": {
          "text": negativePrompt,
          "clip": ["183", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["23", 2]
        },
        "class_type": "VAEDecode"
      },
      "23": {
        "inputs": {
          "ckpt_name": "Illustrious\\oneObsessionBranch_matureMAXEPS.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
      },
      "36": {
        "inputs": {
          "width": width,
          "height": height,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "83": {
        "inputs": {
          "lora_name": "illustrious\\addition\\addDetail_Aesthetic.safetensors",
          "strength_model": 0.5,
          "strength_clip": 0.5,
          "model": ["92", 0],
          "clip": ["92", 1]
        },
        "class_type": "LoraLoader"
      },
      "84": {
        "inputs": {
          "images": ["8", 0]
        },
        "class_type": "PreviewImage"
      },
      "92": {
        "inputs": {
          "lora_name": "illustrious\\anime_style\\雷火剑 artstyle.safetensors",
          "strength_model": 0.85,
          "strength_clip": 0.8,
          "model": ["23", 0],
          "clip": ["184", 0]
        },
        "class_type": "LoraLoader"
      },
      "132": {
        "inputs": {
          "inputcount": 4,
          "delimiter": ",,",
          "return_list": false,
          "string_1": ["177", 0],
          "string_2": ["166", 0],
          "string_3": ["194", 0]
        },
        "class_type": "JoinStringMulti"
      },
      "137": {
        "inputs": {
          "text": ["132", 0],
          "clip": ["183", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "166": {
        "inputs": {
          "string": theme
        },
        "class_type": "String Literal (Image Saver)"
      },
      "168": {
        "inputs": {
          "preview_markdown": `embedding:lazypos\n,${character}`,
          "preview_text": `embedding:lazypos\n,${character}`,
          "source": ["132", 0]
        },
        "class_type": "PreviewAny"
      },
      "177": {
        "inputs": {
          "string": "embedding:lazypos\n"
        },
        "class_type": "String Literal (Image Saver)"
      },
      "183": {
        "inputs": {
          "lora_name": "illustrious\\concept\\sagging-vpred-v0.7.safetensors",
          "strength_model": 0.5,
          "strength_clip": 0.5,
          "model": ["83", 0],
          "clip": ["83", 1]
        },
        "class_type": "LoraLoader"
      },
      "184": {
        "inputs": {
          "stop_at_clip_layer": -2,
          "clip": ["23", 1]
        },
        "class_type": "CLIPSetLastLayer"
      },
      "194": {
        "inputs": {
          "string": character
        },
        "class_type": "String Literal (Image Saver)"
      },
      "197": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["8", 0]
        },
        "class_type": "SaveImage"
      }
    };
    
    const response = await fetch(`${SERVER_BASE}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Queue prompt failed:', error);
    throw error;
  }
}

export async function getHistory(
  promptId: string
): Promise<ComfyUIHistoryItem | null> {
  try {
    const response = await fetch(`${SERVER_BASE}/history/${promptId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data[promptId] || null;
  } catch (error) {
    console.error('Get history failed:', error);
    return null;
  }
}

export async function getImageBlob(
  filename: string,
  subfolder: string = ''
): Promise<Blob | null> {
  try {
    const params = new URLSearchParams({ filename });
    if (subfolder) {
      params.append('subfolder', subfolder);
    }
    
    const response = await fetch(`${SERVER_BASE}/view?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Get image failed:', error);
    return null;
  }
}

export async function pollForCompletion(
  promptId: string,
  onProgress: (elapsed: number) => void,
  maxWait: number = 300000,
  interval: number = 2000
): Promise<{ success: boolean; imageUrl?: string; imageBlob?: Blob }> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    onProgress(Math.floor((Date.now() - startTime) / 1000));

    const history = await getHistory(promptId);
    if (history?.outputs) {
      for (const output of Object.values(history.outputs) as Array<{ images?: Array<{ filename: string; subfolder: string }> }>) {
        if (output.images && output.images.length > 0) {
          const image = output.images[0];
          const blob = await getImageBlob(image.filename, image.subfolder);
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            return { success: true, imageUrl, imageBlob: blob };
          }
        }
      }
    }
  }

  return { success: false };
}
