import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import WallhavenDownload from './pages/WallhavenDownload';
import ViewKLine from './pages/ViewKLine';

function App() {
  console.log(window.ipcRenderer);

  const [isOpen, setOpen] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('wallhaven');
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
      default:
        return <WallhavenDownload />;
    }
  };

  return (
    <div className="flex flex-row h-screen">
      <Sidebar setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-grow flex-1">
        <div className="flex-auto">
          <div className="flex flex-col justify-center items-center h-full">{renderPage()}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
