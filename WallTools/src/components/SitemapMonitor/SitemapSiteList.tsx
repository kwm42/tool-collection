import React from 'react';
import { Card, IconButton, Typography } from '@material-tailwind/react';
import { SitemapSite } from '../../types/sitemap';

interface Props {
  sites: SitemapSite[];
  selectedSiteId?: string;
  onSelect: (siteId: string) => void;
  onRunNow: (site: SitemapSite) => void;
  statusMap: Record<string, 'running' | 'idle'>;
  scheduleSummary: string;
}

const MTCard = Card as React.ComponentType<any>;
const MTTypography = Typography as React.ComponentType<any>;
const MTIconButton = IconButton as React.ComponentType<any>;

const SitemapSiteList: React.FC<Props> = ({
  sites,
  selectedSiteId,
  onSelect,
  onRunNow,
  statusMap,
  scheduleSummary
}) => {
  return (
    <div className="h-full flex flex-col gap-4 text-slate-100">
      <div className="flex justify-between items-center">
        <MTTypography variant="h5" className="text-slate-100">
          站点列表
        </MTTypography>
      </div>
      <div className="text-xs text-slate-400">调度：{scheduleSummary}</div>
      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {sites.length === 0 && <div className="text-slate-400">暂无站点，请检查配置。</div>}
        {sites.map((site) => {
          const isActive = site.id === selectedSiteId;
          const status = statusMap[site.id] ?? 'idle';
          return (
            <MTCard
              key={site.id}
              className={`bg-slate-800 text-slate-100 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer ${
                isActive ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onSelect(site.id)}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <MTTypography variant="h6" className="text-slate-100">
                      {site.name}
                    </MTTypography>
                    <div className="text-xs text-slate-300 break-all">{site.url}</div>
                  </div>
                  <div className="flex gap-2">
                    <MTIconButton
                      size="sm"
                      color="blue"
                      className="bg-blue-600"
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        onRunNow(site);
                      }}
                    >
                      ▶
                    </MTIconButton>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>调度：{scheduleSummary}</span>
                  <span className={status === 'running' ? 'text-emerald-400' : 'text-slate-200'}>
                    状态：{status === 'running' ? '执行中' : '空闲'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>上次：{site.lastRun ? new Date(site.lastRun).toLocaleString() : '--'}</div>
                  <div>下次：{site.nextRun ? new Date(site.nextRun).toLocaleString() : '--'}</div>
                </div>
              </div>
            </MTCard>
          );
        })}
      </div>
    </div>
  );
};

export default SitemapSiteList;
