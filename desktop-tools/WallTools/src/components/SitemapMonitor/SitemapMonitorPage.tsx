import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Typography, Select, Option } from '@material-tailwind/react';
import {
  SitemapConfig,
  SitemapHistoryEntry,
  SitemapResultPayload,
  SitemapSchedule,
  SitemapSettings,
  SitemapSite,
  SitemapStatusPayload
} from '../../types/sitemap';
import SitemapSiteList from './SitemapSiteList';
import SitemapHistoryTable from './SitemapHistoryTable';
import SitemapDiffViewer from './SitemapDiffViewer';

const MTCard = Card as React.ComponentType<any>;
const MTTypography = Typography as React.ComponentType<any>;
const MTButton = Button as React.ComponentType<any>;
const MTSelect = Select as React.ComponentType<any>;
const MTOption = Option as React.ComponentType<any>;

const DEFAULT_STATUS_MAP: Record<string, 'running' | 'idle'> = {};

const SitemapMonitorPage: React.FC = () => {
  const [sites, setSites] = useState<SitemapSite[]>([]);
  const [history, setHistory] = useState<SitemapHistoryEntry[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, 'running' | 'idle'>>(DEFAULT_STATUS_MAP);
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = useState<SitemapHistoryEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<SitemapSettings | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<SitemapSchedule | null>(null);
  const [savingSchedule, setSavingSchedule] = useState<boolean>(false);
  const [isScheduleDirty, setScheduleDirty] = useState<boolean>(false);

  const fetchConfig = useCallback(async () => {
    if (!window.Main?.sitemap) return;
    const config = await window.Main.sitemap.getConfig();
    const typedConfig = (config ?? {}) as SitemapConfig;
    const typedSites = Array.isArray(typedConfig.sites) ? (typedConfig.sites as SitemapSite[]) : [];
    setSites(typedSites);
    if (typedConfig.settings) {
      setSettings(typedConfig.settings as SitemapSettings);
      if (!isScheduleDirty) {
        setScheduleDraft((typedConfig.settings as SitemapSettings).schedule ?? null);
        setScheduleDirty(false);
      }
    } else {
      setSettings(null);
      if (!isScheduleDirty) {
        setScheduleDraft(null);
        setScheduleDirty(false);
      }
    }
    if (!selectedSiteId && typedSites.length > 0) {
      setSelectedSiteId(typedSites[0].id);
    }
  }, [selectedSiteId, isScheduleDirty]);

  const fetchHistory = useCallback(async () => {
    if (!window.Main?.sitemap) return;
    const list = await window.Main.sitemap.getHistory();
    setHistory((Array.isArray(list) ? list : []) as SitemapHistoryEntry[]);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchConfig(), fetchHistory()]);
    } finally {
      setLoading(false);
    }
  }, [fetchConfig, fetchHistory]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!window.Main?.on) {
      return () => undefined;
    }

    const statusHandler = (payload: SitemapStatusPayload) => {
      setStatusMap((prev) => ({ ...prev, [payload.siteId]: payload.status }));
    };
    const resultHandler = (payload: SitemapResultPayload) => {
      setHistory((prev) => [payload, ...prev]);
      setStatusMap((prev) => ({ ...prev, [payload.siteId]: 'idle' }));
      setSites((prev) =>
        prev.map((site) => {
          if (site.id !== payload.siteId) return site;
          return { ...site, lastRun: payload.timestamp };
        })
      );
      fetchConfig();
    };

    window.Main.on('sitemap-status', statusHandler);
    window.Main.on('sitemap-result', resultHandler);

    return () => {
      if (window.ipcRenderer?.removeListener) {
        window.ipcRenderer.removeListener('sitemap-status', statusHandler as any);
        window.ipcRenderer.removeListener('sitemap-result', resultHandler as any);
      }
    };
  }, [fetchConfig]);

  const handleRunNow = async (site: SitemapSite) => {
    setStatusMap((prev) => ({ ...prev, [site.id]: 'running' }));
    if (!window.Main?.sitemap) return;
    await window.Main.sitemap.runNow(site.id);
  };

  const handleScheduleTypeChange = useCallback(
    (value: 'daily' | 'interval') => {
      setScheduleDraft((prev) => {
        const current = prev ?? settings?.schedule ?? { type: 'interval', value: 6 };
        const next =
          value === 'daily'
            ? { type: 'daily' as const, value: current.type === 'daily' ? current.value : 9 }
            : { type: 'interval' as const, value: current.type === 'interval' ? current.value : 6 };
        const stored = settings?.schedule;
        setScheduleDirty(
          stored ? stored.type !== next.type || stored.value !== next.value : true
        );
        return next;
      });
    },
    [settings]
  );

  const handleScheduleValueChange = useCallback(
    (value: number) => {
      setScheduleDraft((prev) => {
        const currentType = prev?.type ?? settings?.schedule.type ?? 'interval';
        const next: SitemapSchedule = { type: currentType, value };
        const stored = settings?.schedule;
        setScheduleDirty(
          stored ? stored.type !== next.type || stored.value !== next.value : true
        );
        return next;
      });
    },
    [settings]
  );

  const handleScheduleSave = useCallback(async () => {
    if (!window.Main?.sitemap || !scheduleDraft) return;
    setSavingSchedule(true);
    try {
      const updated = (await window.Main.sitemap.setSchedule(scheduleDraft)) as SitemapSettings | undefined;
      if (updated) {
        setSettings(updated);
        setScheduleDraft(updated.schedule);
        setScheduleDirty(false);
        await fetchConfig();
      }
    } finally {
      setSavingSchedule(false);
    }
  }, [scheduleDraft, fetchConfig]);

  const handleExport = (urls: string[], site: SitemapSite | undefined) => {
    if (urls.length === 0) return;
    const blob = new Blob([urls.join('\n')], { type: 'text/plain;charset=utf-8' });
    const filename = `${site?.name ?? 'sitemap'}-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const selectedSite = useMemo(
    () => sites.find((site) => site.id === selectedSiteId),
    [sites, selectedSiteId]
  );

  const latestEntry = useMemo(() => {
    if (!selectedSiteId) return null;
    return history
      .filter((entry) => entry.siteId === selectedSiteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] ?? null;
  }, [history, selectedSiteId]);

  const scheduleSummary = useMemo(() => {
    const source = scheduleDraft ?? settings?.schedule ?? null;
    if (!source) return '未配置';
    if (source.type === 'daily') {
      const hour = String(source.value).padStart(2, '0');
      return `每日 ${hour}:00 执行`;
    }
    return `每 ${source.value} 小时执行`;
  }, [scheduleDraft, settings]);

  const scheduleType = (scheduleDraft ?? settings?.schedule ?? { type: 'interval' as const }).type;
  const scheduleValue = scheduleDraft?.value ?? settings?.schedule.value ?? 6;
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);
  const intervalOptions = useMemo(() => {
    const base = [1, 2, 3, 4, 6, 8, 12, 24];
    if (scheduleType === 'interval' && !base.includes(scheduleValue)) {
      base.push(scheduleValue);
    }
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }, [scheduleType, scheduleValue]);

  return (
    <div className="h-full p-6 text-slate-100 bg-slate-900 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <MTTypography variant="h4" className="text-white">
            Sitemap 监控
          </MTTypography>
          <div className="text-sm text-slate-400">批量监控站点的 sitemap 更新时间并识别新增页面</div>
        </div>
        <div className="flex gap-3">
          <MTButton
            color="blue"
            variant="gradient"
            onClick={() => window.Main?.sitemap && window.Main.sitemap.runAll()}
          >
            立即全量检查
          </MTButton>
          <MTButton color="gray" variant="text" onClick={refreshAll} disabled={loading}>
            刷新
          </MTButton>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <MTCard className="bg-slate-900 border border-slate-800 shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <MTTypography variant="h5" className="text-slate-100">
                调度设置
              </MTTypography>
              {isScheduleDirty && <span className="text-xs text-amber-400">有未保存的修改</span>}
            </div>
            <div className="grid grid-cols-1 gap-4">
              <MTSelect
                label="调度模式"
                value={scheduleType}
                onChange={(value: string | undefined) =>
                  value && handleScheduleTypeChange(value as 'daily' | 'interval')
                }
              >
                <MTOption value="interval">按间隔</MTOption>
                <MTOption value="daily">每天指定时间</MTOption>
              </MTSelect>
              {scheduleType === 'daily' ? (
                <MTSelect
                  label="执行小时"
                  value={String(scheduleValue)}
                  onChange={(value: string | undefined) =>
                    handleScheduleValueChange(Number(value ?? scheduleValue))
                  }
                >
                  {hourOptions.map((hour) => (
                    <MTOption key={hour} value={String(hour)}>
                      {String(hour).padStart(2, '0')}:00
                    </MTOption>
                  ))}
                </MTSelect>
              ) : (
                <MTSelect
                  label="执行间隔（小时）"
                  value={String(scheduleValue)}
                  onChange={(value: string | undefined) =>
                    handleScheduleValueChange(Number(value ?? scheduleValue))
                  }
                >
                  {intervalOptions.map((hours) => (
                    <MTOption key={hours} value={String(hours)}>
                      {hours}
                    </MTOption>
                  ))}
                </MTSelect>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>站点列表来源：electron/services/sitemap/sites.json</span>
              <span>{scheduleSummary}</span>
            </div>
            <div className="flex justify-end">
              <MTButton
                color="blue"
                variant="gradient"
                onClick={handleScheduleSave}
                disabled={savingSchedule || !scheduleDraft}
              >
                {savingSchedule ? '保存中…' : '保存调度'}
              </MTButton>
            </div>
          </MTCard>
          <MTCard className="bg-slate-900 border border-slate-800 shadow-lg">
            <SitemapSiteList
              sites={sites}
              selectedSiteId={selectedSiteId}
              onSelect={(id) => {
                setSelectedSiteId(id);
                setSelectedEntry(null);
              }}
              onRunNow={handleRunNow}
              statusMap={statusMap}
              scheduleSummary={scheduleSummary}
            />
          </MTCard>
        </div>
        <div className="xl:col-span-2 space-y-6">
          <MTCard className="bg-slate-900 border border-slate-700 shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SitemapHistoryTable
                history={history}
                sites={sites}
                selectedEntry={selectedEntry ?? latestEntry ?? undefined}
                onSelect={(entry) => {
                  setSelectedEntry(entry);
                  setSelectedSiteId(entry.siteId);
                }}
              />
              <SitemapDiffViewer
                sites={sites}
                history={history}
                selectedSiteId={selectedSiteId}
                onExport={handleExport}
              />
            </div>
          </MTCard>
          {selectedSite && selectedEntry && (
            <MTCard className="bg-slate-900 border border-slate-700 shadow-lg p-6 space-y-4">
              <MTTypography variant="h6" className="text-slate-100">
                详细信息
              </MTTypography>
              <div className="text-sm text-slate-200">站点：{selectedSite.name}</div>
              <div className="text-sm text-slate-200">执行时间：{new Date(selectedEntry.timestamp).toLocaleString()}</div>
              <div className="text-sm text-slate-200">新增数量：{selectedEntry.newUrls.length}</div>
              {selectedEntry.errorMessage && <div className="text-sm text-rose-400">错误：{selectedEntry.errorMessage}</div>}
              <div className="text-xs text-slate-400 break-all">文件：{selectedEntry.filePath}</div>
            </MTCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitemapMonitorPage;
