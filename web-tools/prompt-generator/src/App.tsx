import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  Header,
  GenerateButton,
  PreviewPanel,
  DimensionRow,
  Drawer,
  PresetSelector,
  HistoryPanel,
  ComfyUISettings,
  FavoritesDrawer,
  DimensionPresetPanel,
  DimensionPresetsDrawer,
  SavePresetModal,
} from './components';
import {
  dimensionPresets,
  dimensionOrder,
  styles,
} from './data';
import {
  usePromptGenerator,
  useDrawer,
  useHistory,
  useClipboard,
  useTheme,
  useComfyUI,
  useFavorites,
  useDimensionPresets,
  useNsfwToggle,
} from './hooks';
import type { FavoriteItem } from './hooks/useFavorites';
import { blobUrlToDataUrl, compressImageToBase64 } from './utils/image';

import bg1 from './assets/images/bg-1.png';
import bg2 from './assets/images/bg-2.png';
import bg3 from './assets/images/bg-3.png';
import bg4 from './assets/images/bg-4.png';
import bg5 from './assets/images/bg-5.png';

const backgrounds = [bg1, bg2, bg3, bg4, bg5];

function App() {
  const { isDark } = useTheme();
  
  const backgroundImage = useMemo(() => {
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, []);

  const { nsfwEnabled, toggleNsfw } = useNsfwToggle();

  const {
    dimensions,
    currentPrompt,
    generate,
    randomDimension,
    clearDimension,
    toggleLock,
    setLock,
    lockAll,
    unlockAll,
    clearAll,
    selectPreset,
    getCurrentSummary,
    getDimensionPromptForCopy,
  } = usePromptGenerator(nsfwEnabled);

  const { isOpen, currentDimension, openDrawer, closeDrawer } = useDrawer();
  const { history, addHistory, removeHistory, clearHistory } = useHistory();
  const { favorites, addFavorite, removeFavorite, clearFavorites } = useFavorites();
  const { presets: dimensionCustomPresets, savePreset: saveDimensionPreset, deletePreset: deleteDimensionPreset, clearPresets: clearDimensionPresets } = useDimensionPresets();
  const { copied, copy } = useClipboard();

  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);
  const [dimensionPresetsDrawerOpen, setDimensionPresetsDrawerOpen] = useState(false);
  const [savePresetModalOpen, setSavePresetModalOpen] = useState(false);

  const [comfyUISettingsOpen, setComfyUISettingsOpen] = useState(false);

  const {
    connected,
    params: comfyUIParams,
    state: comfyUIState,
    testConnection,
    generate: comfyUIGenerate,
    isGenerating,
    updateParams: updateComfyUIParams,
  } = useComfyUI();

  const lastLKeyTime = useRef<number>(0);
  const currentPromptRef = useRef(currentPrompt);

  useEffect(() => {
    currentPromptRef.current = currentPrompt;
  }, [currentPrompt]);

  const handleGenerate = useCallback(() => {
    generate();
    
    if (comfyUIParams.randomStyle) {
      const styleKeys = Object.keys(styles);
      const randomStyleKey = styleKeys[Math.floor(Math.random() * styleKeys.length)];
      updateComfyUIParams({ style: randomStyleKey });
    }
    
    const summary: Record<string, string> = {};
    for (const key of dimensionOrder) {
      summary[key] = getCurrentSummary(key);
    }
    addHistory(
      currentPrompt.positive || 'generating...',
      currentPrompt.negative,
      summary
    );
  }, [generate, getCurrentSummary, addHistory, currentPrompt, comfyUIParams.randomStyle, updateComfyUIParams, nsfwEnabled]);

  const handleCopy = useCallback(() => {
    copy(currentPrompt.positive);
  }, [copy, currentPrompt.positive]);

  const handleComfyUIGenerate = useCallback(() => {
    if (!currentPrompt.positive) return;
    const character = currentPrompt.positiveChinese.split('\n')[0] || '';
    comfyUIGenerate(
      currentPrompt.positive,
      character,
      currentPrompt.negative
    );
  }, [comfyUIGenerate, currentPrompt]);

  const handleComfyUISettingsOpen = useCallback(() => {
    setComfyUISettingsOpen(true);
  }, []);

  const handleApplyBuiltInPreset = useCallback((preset: { locks: Record<string, boolean> }) => {
    for (const key of dimensionOrder) {
      const shouldLock = preset.locks[key];
      if (dimensions[key].locked !== shouldLock) {
        toggleLock(key);
      }
    }
  }, [dimensions, toggleLock]);

  const handleAddFavorite = useCallback(async () => {
    const summary: Record<string, string> = {};
    for (const key of dimensionOrder) {
      summary[key] = getCurrentSummary(key);
    }
    const name = [
      summary.appearance,
      summary.hairstyle,
      summary.body,
      summary.clothing,
    ].filter(Boolean).join(' + ');
    
    let previewImage: string | undefined;
    if (comfyUIState.imageUrl) {
      const dataUrl = await blobUrlToDataUrl(comfyUIState.imageUrl);
      if (dataUrl) {
        previewImage = await compressImageToBase64(dataUrl);
      }
    }
    
    addFavorite(
      name,
      currentPrompt.positive,
      currentPrompt.negative,
      summary,
      { style: comfyUIParams.style, checkpoint: comfyUIParams.checkpoint },
      previewImage
    );
  }, [addFavorite, getCurrentSummary, currentPrompt, comfyUIParams, comfyUIState.imageUrl]);

  const handleApplyFavorite = useCallback((item: FavoriteItem) => {
    for (const key of dimensionOrder) {
      const summaryName = item.dimensionSummary[key];
      const dimConfig = dimensionPresets[key];
      if (summaryName && dimConfig) {
        const preset = dimConfig.presets.find((p) => p.name === summaryName);
        if (preset) {
          selectPreset(key, preset.id, true);
        }
      }
    }
    if (item.generationParams) {
      updateComfyUIParams(item.generationParams);
    }
    setFavoritesDrawerOpen(false);
  }, [selectPreset, updateComfyUIParams]);

  const handleImportFavorites = useCallback((importedFavorites: FavoriteItem[]) => {
    for (const fav of importedFavorites) {
      const existing = favorites.find((f) => f.name === fav.name);
      if (existing) {
        removeFavorite(existing.id);
      }
    }
    for (const fav of importedFavorites) {
      addFavorite(
        fav.name,
        fav.positivePrompt,
        fav.negativePrompt,
        fav.dimensionSummary,
        fav.generationParams,
        fav.previewImage
      );
    }
  }, [favorites, addFavorite, removeFavorite]);

  const handleSaveDimensionPreset = useCallback((name: string) => {
    saveDimensionPreset(name, dimensions, Object.fromEntries(
      dimensionOrder.map(key => [key, dimensions[key]?.locked || false])
    ));
  }, [dimensions, saveDimensionPreset]);

  const handleApplyDimensionPreset = useCallback((preset: { dimensions: Record<string, import('./types').DimensionState>; locks: Record<string, boolean> }) => {
    for (const key of dimensionOrder) {
      if (preset.dimensions[key]?.selectedPresetId) {
        selectPreset(key, preset.dimensions[key].selectedPresetId);
      } else {
        clearDimension(key);
      }
    }
    setTimeout(() => {
      for (const key of dimensionOrder) {
        const shouldLock = preset.locks[key] ?? false;
        setLock(key, shouldLock);
      }
    }, 0);
    setDimensionPresetsDrawerOpen(false);
  }, [selectPreset, clearDimension, setLock]);

  const currentDimensionConfig = currentDimension 
    ? dimensionPresets[currentDimension] 
    : null;

  const currentDimensionState = currentDimension 
    ? dimensions[currentDimension] 
    : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        const now = Date.now();
        if (now - lastLKeyTime.current < 500) {
          if (!isGenerating) {
            generate();
            setTimeout(() => {
              const prompt = currentPromptRef.current;
              const summary: Record<string, string> = {};
              for (const key of dimensionOrder) {
                summary[key] = getCurrentSummary(key);
              }
              
              addHistory(prompt.positive, prompt.negative, summary);
              
              if (connected && prompt.positive) {
                const character = prompt.positiveChinese.split('\n')[0] || '';
                comfyUIGenerate(prompt.positive, character, prompt.negative);
              }
            }, 100);
          }
          lastLKeyTime.current = 0;
        } else {
          lastLKeyTime.current = now;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, connected, generate, addHistory, getCurrentSummary]);

  return (
    <div className="h-screen flex flex-col">
      <div
        className="fixed inset-0 bg-background-page -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {isDark && <div className="fixed inset-0 bg-black/40 -z-10" />}
      
      <Header onOpenComfyUISettings={handleComfyUISettingsOpen} connected={connected} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto px-padding py-gap-lg space-y-gap-lg">
          <GenerateButton onGenerate={handleGenerate} />
          
          <PreviewPanel
            positivePrompt={currentPrompt.positive}
            positiveChinese={currentPrompt.positiveChinese}
            negativePrompt={currentPrompt.negative}
            onCopy={handleCopy}
            copied={copied}
            onOpenSettings={handleComfyUISettingsOpen}
            comfyUIEnabled={true}
            generationState={comfyUIState}
            generationParams={comfyUIParams}
            onGenerate={handleComfyUIGenerate}
            onRegenerate={handleComfyUIGenerate}
            onUpdateParams={updateComfyUIParams}
            dimensions={dimensions}
            dimensionOrder={dimensionOrder}
            onOpenDimension={openDrawer}
            onAddFavorite={handleAddFavorite}
            onOpenFavorites={() => setFavoritesDrawerOpen(true)}
            favoritesCount={favorites.length}
          />
          
          <HistoryPanel
            history={history}
            isExpanded={historyExpanded}
            onToggle={() => setHistoryExpanded(!historyExpanded)}
            onApply={(item) => {
              console.log('Apply history:', item);
            }}
            onCopy={(item) => {
              copy(item.positivePrompt);
            }}
            onDelete={removeHistory}
            onClear={clearHistory}
          />
          
          <DimensionPresetPanel
            dimensionOrder={dimensionOrder.map(key => ({
              key,
              label: dimensionPresets[key].label,
              icon: dimensionPresets[key].icon,
            }))}
            locks={Object.fromEntries(
              dimensionOrder.map(key => [key, dimensions[key]?.locked || false])
            )}
            onToggleLock={toggleLock}
            onApplyPreset={handleApplyBuiltInPreset}
            onClearAll={clearAll}
            onLockAll={lockAll}
            onUnlockAll={unlockAll}
            onSavePreset={() => setSavePresetModalOpen(true)}
            onOpenPresets={() => setDimensionPresetsDrawerOpen(true)}
            customPresetsCount={dimensionCustomPresets.length}
          />
          
          <div className="space-y-gap-sm">
            <span className="text-section-title text-text-secondary">
              维度配置
            </span>
            <div className="max-w-[1000px] mx-auto space-y-gap-sm">
              {dimensionOrder.map((key) => {
                const config = dimensionPresets[key];
                const state = dimensions[key];
                return (
                  <DimensionRow
                    key={key}
                    dimensionKey={key}
                    config={config}
                    state={state}
                    currentSummary={getCurrentSummary(key)}
                    nsfwEnabled={nsfwEnabled}
                    onToggleNsfw={toggleNsfw}
                    onToggleLock={() => toggleLock(key)}
                    onRandom={() => randomDimension(key)}
                    onClear={() => clearDimension(key)}
                    onOpen={() => openDrawer(key)}
                    onCopy={() => {
                      const prompt = getDimensionPromptForCopy(key);
                      if (prompt) copy(prompt);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {currentDimensionConfig && currentDimensionState && (
        <Drawer
          isOpen={isOpen}
          onClose={closeDrawer}
          title={currentDimensionConfig.label}
          icon={currentDimensionConfig.icon}
          isLocked={currentDimensionState.locked}
        >
          <PresetSelector
            config={currentDimensionConfig}
            selectedId={currentDimensionState.selectedPresetId}
            onSelect={(id) => currentDimension && selectPreset(currentDimension, id)}
            onClear={() => currentDimension && clearDimension(currentDimension)}
            onRandom={() => currentDimension && randomDimension(currentDimension)}
            isLocked={currentDimensionState.locked}
            onToggleLock={() => currentDimension && toggleLock(currentDimension)}
            nsfwEnabled={nsfwEnabled}
            onToggleNsfw={toggleNsfw}
          />
        </Drawer>
      )}

      <ComfyUISettings
        isOpen={comfyUISettingsOpen}
        onClose={() => setComfyUISettingsOpen(false)}
        connected={connected}
        isTesting={isGenerating}
        onTestConnection={testConnection}
      />

      <FavoritesDrawer
        isOpen={favoritesDrawerOpen}
        onClose={() => setFavoritesDrawerOpen(false)}
        favorites={favorites}
        onApply={handleApplyFavorite}
        onDelete={removeFavorite}
        onClear={clearFavorites}
        onImport={handleImportFavorites}
      />

      <DimensionPresetsDrawer
        isOpen={dimensionPresetsDrawerOpen}
        onClose={() => setDimensionPresetsDrawerOpen(false)}
        presets={dimensionCustomPresets}
        onApply={handleApplyDimensionPreset}
        onDelete={deleteDimensionPreset}
        onClear={clearDimensionPresets}
      />

      <SavePresetModal
        isOpen={savePresetModalOpen}
        onClose={() => setSavePresetModalOpen(false)}
        onConfirm={handleSaveDimensionPreset}
      />
    </div>
  );
}

export default App;
