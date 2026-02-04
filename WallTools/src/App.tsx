import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import WallhavenDownload from './pages/WallhavenDownload';
import ViewKLine from './pages/ViewKLine';
import DownloadCenter from './pages/DownloadCenter';
import FolderTool from './pages/FolderTool'; // Add this line
import SitemapMonitor from './pages/SitemapMonitor';
import './App.css'; // Add this line to import the CSS file

function App() {
  console.log(window.ipcRenderer);

  const [isOpen, setOpen] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('wallhaven');
  const [isDownloadCenterVisible, setDownloadCenterVisible] = useState(false);
  const { t } = useTranslation();

  const handleToggle = () => {
    if (isOpen) {
      setOpen(false);
      setSent(false);
    } else {
      setOpen(true);
      setFromMain(null);
    }
  };
  const sendMessageToElectron = () => {
    if (window.Main) {
      window.Main.sendMessage(t('common.helloElectron'));
    } else {
      setFromMain(t('common.helloBrowser'));
    }
    setSent(true);
  };

  const toggleDownloadCenter = () => {
    setDownloadCenterVisible(!isDownloadCenterVisible);
  };

  useEffect(() => {
    window.Main.removeLoading();
  }, []);

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  const renderPage = () => {
    switch (currentPage) {
      case 'wallhaven':
        return <WallhavenDownload />;
      case 'kline':
        return <ViewKLine />;
      case 'folder-tools':
        return <FolderTool />;
      case 'sitemap-monitor':
        return <SitemapMonitor />;
      default:
        return <WallhavenDownload />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar setCurrentPage={setCurrentPage} />
      <div className="content-container">
        <div className="content">{renderPage()}</div>
      </div>
      <button className="floating-button" onClick={toggleDownloadCenter}>
        {isDownloadCenterVisible ? t('common.closeDownloadCenter') : t('common.openDownloadCenter')}
      </button>
      {isDownloadCenterVisible && <DownloadCenter />}
    </div>
  );
}

export default App;
