import { useCallback, useState, useMemo } from 'react';
import {
  Header,
  GenerateButton,
  PreviewPanel,
  DimensionRow,
  Drawer,
  PresetSelector,
  HistoryPanel,
} from './components';
import {
  dimensionPresets,
  dimensionOrder,
} from './data';
import {
  usePromptGenerator,
  useDrawer,
  useHistory,
  useClipboard,
  useTheme,
} from './hooks';

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

  const {
    dimensions,
    currentPrompt,
    generate,
    randomDimension,
    clearDimension,
    toggleLock,
    selectPreset,
    getCurrentSummary,
    getDimensionPromptForCopy,
  } = usePromptGenerator();

  const { isOpen, currentDimension, openDrawer, closeDrawer } = useDrawer();
  const { history, addHistory, removeHistory, clearHistory } = useHistory();
  const { copied, copy } = useClipboard();
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const handleGenerate = useCallback(() => {
    generate();
    
    const summary: Record<string, string> = {};
    for (const key of dimensionOrder) {
      summary[key] = getCurrentSummary(key);
    }
    addHistory(
      currentPrompt.positive || 'generating...',
      currentPrompt.negative,
      summary
    );
  }, [generate, getCurrentSummary, addHistory, currentPrompt]);

  const handleCopy = useCallback(() => {
    copy(currentPrompt.positive);
  }, [copy, currentPrompt.positive]);

  const currentDimensionConfig = currentDimension 
    ? dimensionPresets[currentDimension] 
    : null;

  const currentDimensionState = currentDimension 
    ? dimensions[currentDimension] 
    : null;

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
      
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-padding py-gap-lg space-y-gap-lg">
          <GenerateButton onGenerate={handleGenerate} />
          
          <PreviewPanel
            positivePrompt={currentPrompt.positive}
            positiveChinese={currentPrompt.positiveChinese}
            negativePrompt={currentPrompt.negative}
            onCopy={handleCopy}
            copied={copied}
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
          
          <div className="space-y-gap-sm">
            <span className="text-section-title text-text-secondary">
              维度配置
            </span>
            {dimensionOrder.map((key) => {
              const config = dimensionPresets[key];
              const state = dimensions[key];
              return (
                <DimensionRow
                  key={key}
                  config={config}
                  state={state}
                  currentSummary={getCurrentSummary(key)}
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
      </main>

      {currentDimensionConfig && currentDimensionState && (
        <Drawer
          isOpen={isOpen}
          onClose={closeDrawer}
          title={currentDimensionConfig.label}
          icon={currentDimensionConfig.icon}
          onRandom={() => currentDimension && randomDimension(currentDimension)}
        >
          <PresetSelector
            config={currentDimensionConfig}
            selectedId={currentDimensionState.selectedPresetId}
            onSelect={(id) => currentDimension && selectPreset(currentDimension, id)}
            onClear={() => currentDimension && clearDimension(currentDimension)}
            onRandom={() => currentDimension && randomDimension(currentDimension)}
          />
        </Drawer>
      )}
    </div>
  );
}

export default App;
