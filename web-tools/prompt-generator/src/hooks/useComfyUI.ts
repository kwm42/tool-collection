import { useState, useCallback, useEffect, useRef } from 'react';
import {
  testConnection as apiTestConnection,
  queuePrompt,
  pollForCompletion,
} from '../utils/comfyui-api';
import {
  GenerationParams,
  GenerationState,
  DEFAULT_PARAMS,
  STORAGE_KEYS,
} from '../types/comfyui';

interface UseComfyUIReturn {
  connected: boolean;
  params: GenerationParams;
  state: GenerationState;
  updateParams: (params: Partial<GenerationParams>) => void;
  testConnection: () => Promise<boolean>;
  generate: (theme: string, character: string, negativePrompt: string) => void;
  clear: () => void;
  isGenerating: boolean;
}

export function useComfyUI(): UseComfyUIReturn {
  const [connected, setConnected] = useState(false);

  const [params, setParams] = useState<GenerationParams>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PARAMS);
    if (stored) {
      try {
        return { ...DEFAULT_PARAMS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PARAMS;
      }
    }
    return DEFAULT_PARAMS;
  });

  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    elapsedTime: 0,
  });

  const currentSeedRef = useRef<number | undefined>(params.seed);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(params));
  }, [params]);

  const updateParams = useCallback((newParams: Partial<GenerationParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const testConnectionHandler = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, status: 'connecting' }));
    
    const isConnected = await apiTestConnection();
    
    setConnected(isConnected);
    setState((prev) => ({ 
      ...prev, 
      status: isConnected ? 'idle' : 'error',
      error: isConnected ? undefined : '无法连接到 ComfyUI，请检查：\n1. ComfyUI 已启动\n2. 设置中已启用 API\n3. 服务器地址正确'
    }));
    
    return isConnected;
  }, []);

  const generate = useCallback(
    async (theme: string, character: string, negativePrompt: string) => {
      if (state.status !== 'idle' && state.status !== 'completed' && state.status !== 'error') {
        return;
      }

      if (!connected) {
        const isConnected = await apiTestConnection();
        if (!isConnected) {
          setConnected(false);
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: '无法连接到 ComfyUI',
          }));
          return;
        }
        setConnected(true);
      }

      if (state.imageUrl) {
        URL.revokeObjectURL(state.imageUrl);
      }

      let seed = params.seed;
      if (!params.useSameSeed || seed === undefined) {
        seed = Math.floor(Math.random() * 2 ** 32);
      }
      currentSeedRef.current = seed;

      setState({
        status: 'queued',
        progress: 0,
        elapsedTime: 0,
        seed,
      });

      try {
        const result = await queuePrompt(
          theme,
          character,
          negativePrompt,
          params.width,
          params.height,
          seed,
          params.style,
          params.checkpoint
        );

        if (!result?.prompt_id) {
          throw new Error('提交任务失败');
        }

        setState((prev) => ({ ...prev, status: 'generating' }));

        const completion = await pollForCompletion(
          result.prompt_id,
          (elapsed) => {
            setState((prev) => ({ ...prev, elapsedTime: elapsed }));
          }
        );

        if (completion.success && completion.imageUrl) {
          setState({
            status: 'completed',
            progress: 100,
            elapsedTime: state.elapsedTime,
            imageUrl: completion.imageUrl,
            imageBlob: completion.imageBlob,
            seed: currentSeedRef.current,
          });
        } else {
          throw new Error('生成超时或失败');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : '生成失败',
        }));
      }
    },
    [connected, params, state.status, state.imageUrl, state.elapsedTime]
  );

  const clear = useCallback(() => {
    if (state.imageUrl) {
      URL.revokeObjectURL(state.imageUrl);
    }
    setState({
      status: 'idle',
      progress: 0,
      elapsedTime: 0,
    });
  }, [state.imageUrl]);

  const isGenerating = state.status === 'connecting' || 
                      state.status === 'queued' || 
                      state.status === 'generating';

  return {
    connected,
    params,
    state,
    updateParams,
    testConnection: testConnectionHandler,
    generate,
    clear,
    isGenerating,
  };
}
