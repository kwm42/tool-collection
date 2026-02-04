import { BrowserWindow, ipcMain } from 'electron';
import { existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { join } from 'path';
import axios from 'axios';
import sitesConfig from './sites.json';
import { loadSitemapStore, saveSitemapStore } from '../../dataManager';
import { logMessage as log } from '../../logger';
import { SitemapHistoryEntry, SitemapSchedule, SitemapSiteState, SitemapStore } from '../../types/sitemaps';

const { writeFile, readFile, readdir, unlink } = fsPromises;

const SITEMAP_ROOT = (appPath: string) => join(appPath, 'sitemaps');

const RESCAN_INTERVAL = 60 * 1000; // check schedules every minute
const HISTORY_LIMIT = 10;

interface StaticSiteConfig {
  url: string;
  name: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildStaticSites = (config: StaticSiteConfig[]): SitemapSiteState[] => {
  const seen = new Set<string>();
  return config.map((site, index) => {
    const base = slugify(site.name) || `site-${index + 1}`;
    let candidate = base;
    let suffix = 1;
    while (seen.has(candidate)) {
      candidate = `${base}-${suffix++}`;
    }
    seen.add(candidate);
    return {
      id: candidate,
      name: site.name,
      url: site.url
    };
  });
};

const parseSitemapXml = async (xmlString: string): Promise<string[]> => {
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({ ignoreAttributes: false });
  const json = parser.parse(xmlString);
  const urls: string[] = [];
  const collect = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }
    if (typeof node === 'object') {
      if (node.loc && typeof node.loc === 'string') {
        urls.push(node.loc);
      }
      Object.values(node).forEach(collect);
    }
  };
  collect(json);
  return Array.from(new Set(urls));
};

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const difference = (current: string[], previous: string[]): string[] => {
  const previousSet = new Set(previous);
  return current.filter((url) => !previousSet.has(url));
};

const loadPreviousUrls = async (jsonPath?: string): Promise<string[]> => {
  if (!jsonPath) return [];
  try {
    const content = await readFile(jsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log(`Failed to read previous sitemap json: ${error}`);
    return [];
  }
};

const storeUrlsJson = async (dir: string, timestamp: string, urls: string[]) => {
  const jsonPath = join(dir, `${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(urls, null, 2), 'utf-8');
  return jsonPath;
};

const trimHistoryFiles = async (dir: string, limit: number) => {
  const entries = await readdir(dir).catch(() => []);
  const xmlFiles = entries.filter((name) => name.endsWith('.xml')).sort();
  if (xmlFiles.length <= limit) return;
  const toRemove = xmlFiles.slice(0, xmlFiles.length - limit);
  await Promise.all(
    toRemove.map(async (name) => {
      await unlink(join(dir, name)).catch(() => undefined);
      const jsonName = name.replace(/\.xml$/, '.json');
      await unlink(join(dir, jsonName)).catch(() => undefined);
    })
  );
};

class SitemapScheduler {
  private store: SitemapStore;

  private timers: Map<string, NodeJS.Timeout> = new Map();

  private userDataPath: string;

  private staticSites: SitemapSiteState[];

  constructor(userDataPath: string) {
    this.userDataPath = userDataPath;
    ensureDir(SITEMAP_ROOT(this.userDataPath));
    this.staticSites = buildStaticSites(sitesConfig as StaticSiteConfig[]);
    this.store = this.initializeStore();
    this.registerIpcHandlers();
    this.bootstrapAll();
    setInterval(() => this.refreshSchedules(), RESCAN_INTERVAL);
  }

  private initializeStore(): SitemapStore {
    const store = loadSitemapStore();
    const previousSites = Array.isArray(store.sites) ? store.sites : [];
    const mergedSites = this.staticSites.map((site) => {
      const existing = previousSites.find((item) => item.url === site.url);
      return {
        ...site,
        lastRun: existing?.lastRun,
        nextRun: existing?.nextRun
      } as SitemapSiteState;
    });
    const idMap = new Map<string, string>();
    previousSites.forEach((item) => {
      const replacement = mergedSites.find((site) => site.url === item.url);
      if (replacement) {
        idMap.set(item.id, replacement.id);
      }
    });
    mergedSites.forEach((site) => idMap.set(site.id, site.id));
    store.history = store.history.map((entry) => {
      const mappedId = idMap.get(entry.siteId);
      return mappedId ? { ...entry, siteId: mappedId } : entry;
    });
    store.sites = mergedSites;
    saveSitemapStore(store);
    return store;
  }

  private bootstrapAll() {
    this.store.sites.forEach((site) => {
      this.scheduleSite(site);
    });
  }

  private refreshSchedules() {
    this.store = this.initializeStore();
    this.rescheduleAll();
  }

  private rescheduleAll() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.store.sites.forEach((site) => this.scheduleSite(site));
  }

  private registerIpcHandlers() {
    ipcMain.handle('sitemap-get-config', () => ({
      sites: this.store.sites,
      settings: this.store.settings
    }));
    ipcMain.handle('sitemap-get-history', () => this.store.history);
    ipcMain.handle('sitemap-run-now', async (_event, siteId: string) => {
      const site = this.store.sites.find((item) => item.id === siteId);
      if (!site) return false;
      await this.runSite(site, true);
      return true;
    });
    ipcMain.handle('sitemap-run-all', async () => {
      await Promise.all(this.store.sites.map((site) => this.runSite(site, true)));
      return true;
    });
    ipcMain.handle('sitemap-set-schedule', async (_event, schedule: SitemapSchedule) => {
      const type: SitemapSchedule['type'] = schedule.type === 'daily' ? 'daily' : 'interval';
      const rawValue = Number(schedule.value);
      const current = this.store.settings.schedule.value;
      const sanitized: SitemapSchedule = {
        type,
        value: type === 'daily'
          ? Math.min(23, Math.max(0, Number.isFinite(rawValue) ? Math.floor(rawValue) : current))
          : Math.max(1, Number.isFinite(rawValue) ? Math.floor(rawValue) : current || 6)
      };
      this.store.settings.schedule = sanitized;
      saveSitemapStore(this.store);
      this.rescheduleAll();
      return this.store.settings;
    });
  }

  private clearTimer(siteId: string) {
    const timer = this.timers.get(siteId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(siteId);
    }
  }

  private scheduleSite(site: SitemapSiteState, force = false) {
    const now = Date.now();
    const nextRun = this.calculateNextRun(this.store.settings.schedule, site.lastRun, force ? now : undefined);
    site.nextRun = new Date(nextRun).toISOString();
    this.updateSiteInStore(site);
    saveSitemapStore(this.store);
    const delay = Math.max(nextRun - now, 0);
    this.clearTimer(site.id);
    const timer = setTimeout(async () => {
      await this.runSite({ ...site });
    }, delay);
    this.timers.set(site.id, timer);
  }

  private updateSiteInStore(site: SitemapSiteState) {
    const index = this.store.sites.findIndex((item) => item.id === site.id);
    if (index !== -1) {
      this.store.sites[index] = { ...this.store.sites[index], ...site } as SitemapSiteState;
    }
  }

  private pruneHistory(siteId: string, limit: number) {
    const relevant = this.store.history
      .filter((entry) => entry.siteId === siteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const toKeep = relevant.slice(0, limit);
    const keepSet = new Set(toKeep.map((entry) => entry.timestamp));
    this.store.history = this.store.history.filter((entry) => {
      if (entry.siteId !== siteId) return true;
      return keepSet.has(entry.timestamp);
    });
  }

  private calculateNextRun(schedule: SitemapSchedule, lastRun?: string, forceNow?: number) {
    const base = forceNow ?? Date.now();
    if (schedule.type === 'daily') {
      const date = new Date(base);
      date.setHours(schedule.value, 0, 0, 0);
      if (date.getTime() <= base) {
        date.setDate(date.getDate() + 1);
      }
      return date.getTime();
    }
    if (lastRun) {
      const last = new Date(lastRun).getTime();
      return last + schedule.value * 60 * 60 * 1000;
    }
    return base + schedule.value * 60 * 60 * 1000;
  }

  private getLatestHistory(siteId: string) {
    return this.store.history
      .filter((item) => item.siteId === siteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  private async runSite(site: SitemapSiteState, manual = false) {
    log(`Running sitemap fetch for ${site.name}`);
    const window = BrowserWindow.getAllWindows()[0];
    const start = Date.now();
    this.clearTimer(site.id);
    window?.webContents.send('sitemap-status', { siteId: site.id, status: 'running', manual });

    const dir = join(SITEMAP_ROOT(this.userDataPath), site.id);
    ensureDir(dir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const xmlPath = join(dir, `${timestamp}.xml`);
    const previousEntry = this.getLatestHistory(site.id);
    const jsonPrevPath = previousEntry?.urlsJsonPath;
    try {
      const response = await axios.get<string>(site.url, {
        responseType: 'text'
      });
      await writeFile(xmlPath, response.data, 'utf-8');
      const urls = await parseSitemapXml(response.data);
      const previousUrls = await loadPreviousUrls(jsonPrevPath);
      const newUrls = difference(urls, previousUrls);
      const urlsJsonPath = await storeUrlsJson(dir, timestamp, urls);

      const entry: SitemapHistoryEntry = {
        siteId: site.id,
        timestamp: new Date().toISOString(),
        status: 'success',
        durationMs: Date.now() - start,
        newUrls,
        filePath: xmlPath,
        previousFilePath: previousEntry?.filePath,
        urlsJsonPath
      };
      this.store.history.push(entry);
      site.lastRun = entry.timestamp;
      this.updateSiteInStore(site);
      this.pruneHistory(site.id, HISTORY_LIMIT);
      saveSitemapStore(this.store);
      await trimHistoryFiles(dir, HISTORY_LIMIT);
      window?.webContents.send('sitemap-result', entry);
    } catch (error: any) {
      const entry: SitemapHistoryEntry = {
        siteId: site.id,
        timestamp: new Date().toISOString(),
        status: 'error',
        durationMs: Date.now() - start,
        newUrls: [],
        filePath: xmlPath,
        previousFilePath: previousEntry?.filePath,
        errorMessage: error?.message ?? 'Unknown error'
      };
      this.store.history.push(entry);
      site.lastRun = entry.timestamp;
      this.updateSiteInStore(site);
      this.pruneHistory(site.id, HISTORY_LIMIT);
      saveSitemapStore(this.store);
      window?.webContents.send('sitemap-result', entry);
      log(`Sitemap fetch failed for ${site.name}: ${entry.errorMessage}`);
    } finally {
      this.scheduleSite(site, true);
      window?.webContents.send('sitemap-status', { siteId: site.id, status: 'idle', manual });
    }
  }
}

export const createSitemapScheduler = (userDataPath: string) => {
  return new SitemapScheduler(userDataPath);
};
