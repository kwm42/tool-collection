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

import type { DimensionPreset } from '../types';

export const dimensionPresets: Record<string, DimensionPreset> = {
  appearance: appearanceData as DimensionPreset,
  hairstyle: hairstyleData as DimensionPreset,
  body: bodyData as DimensionPreset,
  action: actionData as DimensionPreset,
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
