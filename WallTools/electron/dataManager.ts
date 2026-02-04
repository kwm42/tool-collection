import { app } from 'electron';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createDefaultSitemapStore, SitemapStore } from './types/sitemaps';

const dataFilePath = join(app.getPath('userData'), 'appData.json');

export function saveData(key: string, value: any) {
  let data: { [key: string]: any } = {};
  if (existsSync(dataFilePath)) {
    const fileContent = readFileSync(dataFilePath, 'utf-8');
    data = JSON.parse(fileContent);
  }
  data[key] = value;
  writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function loadData(key: string) {
  if (existsSync(dataFilePath)) {
    const fileContent = readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data[key] !== undefined ? data[key] : null;
  }
  return null;
}

const ensureDataFile = () => {
  const dir = app.getPath('userData');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(dataFilePath)) {
    writeFileSync(dataFilePath, JSON.stringify({}, null, 2));
  }
};

export const loadSitemapStore = (): SitemapStore => {
  ensureDataFile();
  const raw = loadData('sitemaps');
  if (!raw) {
    const initial = createDefaultSitemapStore();
    saveData('sitemaps', initial);
    return initial;
  }
  const store: SitemapStore = {
    sites: Array.isArray(raw.sites) ? raw.sites : [],
    history: Array.isArray(raw.history) ? raw.history : [],
    settings: raw.settings && raw.settings.schedule
      ? {
          schedule: {
            type: raw.settings.schedule.type === 'daily' ? 'daily' : 'interval',
            value: Number(raw.settings.schedule.value) || 6
          }
        }
      : createDefaultSitemapStore().settings
  };
  return store;
};

export const saveSitemapStore = (store: SitemapStore) => {
  ensureDataFile();
  saveData('sitemaps', store);
};
