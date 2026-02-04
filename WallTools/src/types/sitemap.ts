export type SitemapScheduleType = 'daily' | 'interval';

export interface SitemapSchedule {
  type: SitemapScheduleType;
  value: number;
}

export interface SitemapSite {
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

export interface SitemapStatusPayload {
  siteId: string;
  status: 'running' | 'idle';
  manual?: boolean;
}

export interface SitemapResultPayload extends SitemapHistoryEntry {}

export interface SitemapSettings {
  schedule: SitemapSchedule;
}

export interface SitemapConfig {
  sites: SitemapSite[];
  settings: SitemapSettings;
}
