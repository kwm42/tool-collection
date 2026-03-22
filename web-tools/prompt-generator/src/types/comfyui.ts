export interface ComfyUIConfig {
  serverAddress: string;
  connected: boolean;
}

export interface GenerationParams {
  width: number;
  height: number;
  style: string;
  checkpoint: string;
  seed?: number;
  useSameSeed: boolean;
}

export type GenerationStatus =
  | 'idle'
  | 'connecting'
  | 'queued'
  | 'generating'
  | 'completed'
  | 'error';

export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  elapsedTime: number;
  error?: string;
  imageUrl?: string;
  imageBlob?: Blob;
  seed?: number;
}

export interface ComfyUIPromptResult {
  prompt_id: string;
  number: number;
}

export interface ComfyUIHistoryItem {
  status: {
    status_str: string;
    completed: boolean;
    messages: unknown[];
  };
  outputs: Record<string, {
    images?: Array<{
      filename: string;
      subfolder: string;
      type: string;
    }>;
  }>;
}

export const DEFAULT_PARAMS: GenerationParams = {
  width: 720,
  height: 1280,
  style: '雷火剑',
  checkpoint: 'oneObsessionBranch_matureMAXEPS',
  useSameSeed: false,
};

export const DEFAULT_CONFIG: ComfyUIConfig = {
  serverAddress: 'localhost:8188',
  connected: false,
};

export const STORAGE_KEYS = {
  SERVER: 'comfyui-server',
  PARAMS: 'comfyui-params',
} as const;
