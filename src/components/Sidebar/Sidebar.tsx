import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SwitchDarkMode from '../SwitchDarkMode';
import SelectLanguage from '../SelectLanguage';
import SettingsModal from '../SettingsModal';
import './sidebar.css';

interface SidebarProps {
  setCurrentPage: (page: string) => void;
}

function Sidebar({ setCurrentPage }: SidebarProps) {
  const { t } = useTranslation();
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="sidebar">
      <ul>
        <li>
          <a href="#wallhaven" onClick={() => setCurrentPage('wallhaven')}>
            {t('menu.wallhavenDownload')}
          </a>
        </li>
        <li>
          <a href="#kline" onClick={() => setCurrentPage('kline')}>
            {t('menu.viewKLine')}
          </a>
        </li>
        <li>
          <a href="#folder-tools" onClick={() => setCurrentPage('folder-tools')}>
            {t('menu.folderTools')}
          </a>
        </li>
      </ul>
      <div className="sidebar-bottom">
        <SwitchDarkMode />
        <SelectLanguage />
        <a href="#settings" onClick={() => setSettingsOpen(true)}>
          {t('menu.settings')}
        </a>
      </div>
      {isSettingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

export default Sidebar;
