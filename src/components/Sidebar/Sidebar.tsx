import React from 'react';
import { useTranslation } from 'react-i18next';
import SwitchDarkMode from '../SwitchDarkMode';
import SelectLanguage from '../SelectLanguage';
import './sidebar.css';

interface SidebarProps {
  setCurrentPage: (page: string) => void;
}

function Sidebar({ setCurrentPage }: SidebarProps) {
  const { t } = useTranslation();

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
      </ul>
      <div className="sidebar-bottom">
        <SwitchDarkMode />
        <SelectLanguage />
      </div>
    </div>
  );
}

export default Sidebar;
