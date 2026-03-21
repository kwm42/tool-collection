import React, { useMemo, useState } from 'react';
import { Card, Typography, Chip, Select, Option } from '@material-tailwind/react';
import { SitemapHistoryEntry, SitemapSite } from '../../types/sitemap';

interface Props {
  history: SitemapHistoryEntry[];
  sites: SitemapSite[];
  onSelect: (entry: SitemapHistoryEntry) => void;
  selectedEntry?: SitemapHistoryEntry | null;
}

const MTCard = Card as React.ComponentType<any>;
const MTTypography = Typography as React.ComponentType<any>;
const MTChip = Chip as React.ComponentType<any>;
const MTSelect = Select as React.ComponentType<any>;
const MTOption = Option as React.ComponentType<any>;

const STATUS_COLOR: Record<SitemapHistoryEntry['status'], string> = {
  success: 'green',
  error: 'red'
};

const SitemapHistoryTable: React.FC<Props> = ({ history, sites, onSelect, selectedEntry }) => {
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(50);

  const filteredHistory = useMemo(() => {
    const subset = selectedSiteFilter === 'all' ? history : history.filter((entry) => entry.siteId === selectedSiteFilter);
    return subset
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [history, limit, selectedSiteFilter]);

  const siteMap = useMemo(() => {
    const map = new Map<string, SitemapSite>();
    sites.forEach((site) => map.set(site.id, site));
    return map;
  }, [sites]);

  return (
    <div className="space-y-3 text-slate-100">
      <div className="flex items-center justify-between">
        <MTTypography variant="h5" className="text-slate-100">
          执行记录
        </MTTypography>
        <div className="flex gap-3">
          <MTSelect
            label="站点筛选"
            value={selectedSiteFilter}
            onChange={(value: string | undefined) => setSelectedSiteFilter(value ?? 'all')}
          >
            <MTOption value="all">全部站点</MTOption>
            {sites.map((site) => (
              <MTOption key={site.id} value={site.id}>
                {site.name}
              </MTOption>
            ))}
          </MTSelect>
          <MTSelect
            label="展示数量"
            value={String(limit)}
            onChange={(value: string | undefined) => setLimit(Number(value ?? 50))}
          >
            {['20', '50', '100'].map((value) => (
              <MTOption key={value} value={value}>
                {value}
              </MTOption>
            ))}
          </MTSelect>
        </div>
      </div>
      <MTCard className="bg-slate-800 text-slate-100 border border-slate-700">
        <div className="max-h-80 overflow-auto divide-y divide-slate-700">
          {filteredHistory.length === 0 && <div className="p-4 text-slate-300">暂无历史记录。</div>}
          {filteredHistory.map((entry, index) => {
            const site = siteMap.get(entry.siteId);
            const isActive = entry.timestamp === selectedEntry?.timestamp && entry.siteId === selectedEntry?.siteId;
            return (
              <button
                key={`${entry.siteId}-${entry.timestamp}-${index}`}
                className={`w-full text-left p-4 flex justify-between items-center transition-colors ${
                  isActive ? 'bg-blue-600/40' : 'hover:bg-slate-700/60'
                }`}
                onClick={() => onSelect(entry)}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-100">{site?.name ?? '未知站点'}</div>
                  <div className="text-xs text-slate-300">{new Date(entry.timestamp).toLocaleString()}</div>
                  <div className="text-xs text-slate-400">耗时：{entry.durationMs} ms</div>
                </div>
                <div className="flex items-center gap-3">
                  <MTChip color={STATUS_COLOR[entry.status]} value={entry.status === 'success' ? '成功' : '失败'} />
                  <div className="text-sm text-slate-200">新增：{entry.newUrls.length}</div>
                </div>
              </button>
            );
          })}
        </div>
      </MTCard>
    </div>
  );
};

export default SitemapHistoryTable;
