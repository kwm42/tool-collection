export type SitemapScheduleType = 'daily' | 'interval';

export interface SitemapSchedule {
  type: SitemapScheduleType;
  value: number;
}

export interface SitemapSiteState {
  id: string;
  name: string;
  url: string;
  lastRun?: string;
  nextRun?: string;
}

export interface SitemapHistoryEntry {
  siteId: string;
  timestamp: string;
  status: 'success' | 'error';
  durationMs: number;
  newUrls: string[];
  filePath: string;
  previousFilePath?: string;
  urlsJsonPath?: string;
  errorMessage?: string;
}

export interface SitemapSettings {
  schedule: SitemapSchedule;
}

export interface SitemapStore {
  sites: SitemapSiteState[];
  history: SitemapHistoryEntry[];
  settings: SitemapSettings;
}

export const createDefaultSitemapStore = (): SitemapStore => ({
  sites: [],
  history: [],
  settings: {
    schedule: {
      type: 'interval',
      value: 6
    }
  }
});
