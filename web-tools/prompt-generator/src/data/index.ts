import appearanceData from './presets/appearance.json';
import hairstyleData from './presets/hairstyle.json';
import bodyData from './presets/body.json';
import actionData from './presets/action.json';
import clothingData from './presets/clothing.json';
import timeData from './presets/time.json';
import sceneData from './presets/scene.json';
import weatherData from './presets/weather.json';
import lightingData from './presets/lighting.json';
import compositionData from './presets/composition.json';
import propsData from './presets/props.json';
import qualityData from './presets/quality.json';
import stylesData from './styles.json';
import checkpointsData from './checkpoints.json';
import actionNsfwData from './presets/action_nsfw.json';

import type { DimensionPreset, Preset } from '../types';

function transformNsfwPresets(nsfwData: Record<string, Array<{ key: string; en_prompt: string; zh_desc: string }>>): Preset[] {
  const presets: Preset[] = [];
  let index = 1000;
  
  for (const items of Object.values(nsfwData)) {
    for (const item of items) {
      presets.push({
        id: `nsfw_${index++}`,
        name: `[NSFW] ${item.zh_desc}`,
        prompt: item.en_prompt,
        weight: 1.0,
      });
    }
  }
  
  return presets;
}

const mergedActionPresets = [
  ...actionData.presets,
  ...transformNsfwPresets(actionNsfwData),
];

const mergedActionData: DimensionPreset = {
  ...actionData,
  presets: mergedActionPresets,
};

export const dimensionPresets: Record<string, DimensionPreset> = {
  appearance: appearanceData as DimensionPreset,
  hairstyle: hairstyleData as DimensionPreset,
  body: bodyData as DimensionPreset,
  action: mergedActionData,
  clothing: clothingData as DimensionPreset,
  time: timeData as DimensionPreset,
  scene: sceneData as DimensionPreset,
  weather: weatherData as DimensionPreset,
  lighting: lightingData as DimensionPreset,
  composition: compositionData as DimensionPreset,
  props: propsData as DimensionPreset,
  quality: qualityData as DimensionPreset,
};

export const dimensionOrder = [
  'appearance',
  'hairstyle',
  'body',
  'action',
  'clothing',
  'time',
  'scene',
  'weather',
  'lighting',
  'props',
  'composition',
  'quality',
];

export {
  appearanceData,
  hairstyleData,
  bodyData,
  actionData,
  clothingData,
  timeData,
  sceneData,
  weatherData,
  lightingData,
  compositionData,
  propsData,
  qualityData,
};

export const styles = stylesData;
export const checkpoints = checkpointsData;
