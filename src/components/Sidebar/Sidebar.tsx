import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, List, ListItem, ListItemPrefix, Typography, Button } from '@material-tailwind/react';
import SwitchDarkMode from '../SwitchDarkMode';
import SelectLanguage from '../SelectLanguage';
import SettingsModal from '../SettingsModal';
import './sidebar.css';

const MTCard = Card as React.ComponentType<any>;
const MTList = List as React.ComponentType<any>;
const MTListItem = ListItem as React.ComponentType<any>;
const MTListItemPrefix = ListItemPrefix as React.ComponentType<any>;
const MTTypography = Typography as React.ComponentType<any>;
const MTButton = Button as React.ComponentType<any>;

interface SidebarProps {
  setCurrentPage: (page: string) => void;
}

function Sidebar({ setCurrentPage }: SidebarProps) {
  const { t } = useTranslation();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('wallhaven');

  const handleNavigate = (page: string) => {
    setActiveItem(page);
    setCurrentPage(page);
  };

  return (
    <MTCard shadow={false} className="sidebar-card">
      <MTTypography variant="h5" className="sidebar-title">
        Tool Collection
      </MTTypography>
      <MTList className="sidebar-menu min-w-[100px]">
        <MTListItem
          data-selected={activeItem === 'wallhaven'}
          onClick={() => handleNavigate('wallhaven')}
          className="sidebar-item"
        >
          <MTListItemPrefix>
            <span className="sidebar-icon">W</span>
          </MTListItemPrefix>
          <MTTypography variant="h6" className="sidebar-label">
            {t('menu.wallhavenDownload')}
          </MTTypography>
        </MTListItem>
        <MTListItem
          data-selected={activeItem === 'kline'}
          onClick={() => handleNavigate('kline')}
          className="sidebar-item"
        >
          <MTListItemPrefix>
            <span className="sidebar-icon">K</span>
          </MTListItemPrefix>
          <MTTypography variant="h6" className="sidebar-label">
            {t('menu.viewKLine')}
          </MTTypography>
        </MTListItem>
        <MTListItem
          data-selected={activeItem === 'folder-tools'}
          onClick={() => handleNavigate('folder-tools')}
          className="sidebar-item"
        >
          <MTListItemPrefix>
            <span className="sidebar-icon">F</span>
          </MTListItemPrefix>
          <MTTypography variant="h6" className="sidebar-label">
            {t('menu.folderTools')}
          </MTTypography>
        </MTListItem>
      </MTList>
      <div className="sidebar-footer">
        <div className="sidebar-control">
          <SwitchDarkMode />
        </div>
        <SelectLanguage />
        <MTButton variant="gradient" color="blue" fullWidth onClick={() => setSettingsOpen(true)}>
          {t('menu.settings')}
        </MTButton>
      </div>
      {isSettingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </MTCard>
  );
}

export default Sidebar;
