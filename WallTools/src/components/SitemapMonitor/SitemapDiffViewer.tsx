import React, { useMemo, useState } from 'react';
import { Button, Card, Input, Typography } from '@material-tailwind/react';
import { SitemapHistoryEntry, SitemapSite } from '../../types/sitemap';

interface Props {
  sites: SitemapSite[];
  history: SitemapHistoryEntry[];
  selectedSiteId?: string;
  onExport: (urls: string[], site: SitemapSite | undefined) => void;
}

const MTCard = Card as React.ComponentType<any>;
const MTInput = Input as React.ComponentType<any>;
const MTTypography = Typography as React.ComponentType<any>;
const MTButton = Button as React.ComponentType<any>;

const SitemapDiffViewer: React.FC<Props> = ({ sites, history, selectedSiteId, onExport }) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const siteMap = useMemo(() => {
    const map = new Map<string, SitemapSite>();
    sites.forEach((site) => map.set(site.id, site));
    return map;
  }, [sites]);

  const latestEntry = useMemo(() => {
    if (!selectedSiteId) return null;
    return history
      .filter((entry) => entry.siteId === selectedSiteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] ?? null;
  }, [history, selectedSiteId]);

  const filteredUrls = useMemo(() => {
    if (!latestEntry) return [];
    if (!searchKeyword.trim()) return latestEntry.newUrls;
    const keyword = searchKeyword.trim().toLowerCase();
    return latestEntry.newUrls.filter((url) => url.toLowerCase().includes(keyword));
  }, [latestEntry, searchKeyword]);

  const currentSite = selectedSiteId ? siteMap.get(selectedSiteId) : undefined;

  return (
    <div className="space-y-3 text-slate-100">
      <div className="flex items-center justify-between">
        <MTTypography variant="h5" className="text-slate-100">
          新增网址
        </MTTypography>
        <div className="flex items-center gap-3">
          <MTInput
            label="搜索关键词"
            value={searchKeyword}
            crossOrigin="anonymous"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchKeyword(event.target.value)}
          />
          <MTButton
            color="blue"
            onClick={() => latestEntry && onExport(filteredUrls, currentSite)}
            disabled={!latestEntry || filteredUrls.length === 0}
          >
            导出
          </MTButton>
        </div>
      </div>
      <MTCard className="bg-slate-800 text-slate-100 border border-slate-700">
        <div className="max-h-80 overflow-auto p-4 space-y-2 text-sm">
          {!latestEntry && <div className="text-slate-300">暂无数据，请先选择站点并运行任务。</div>}
          {latestEntry && filteredUrls.length === 0 && <div className="text-slate-300">没有匹配的新增链接。</div>}
          {filteredUrls.map((url) => (
            <div key={url} className="p-2 rounded bg-slate-700/80 hover:bg-slate-600/80 transition-colors break-all">
              {url}
            </div>
          ))}
        </div>
      </MTCard>
    </div>
  );
};

export default SitemapDiffViewer;
