import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './settings_modal.css';

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const [downloadPath, setDownloadPath] = useState('');
  const [isAutoStart, setAutoStart] = useState(false);

  useEffect(() => {
    window.Main.send('load-data', 'settings');
    window.Main.on('data-loaded', (key, value) => {
      console.log('data-loaded', key, value);
      if (key === 'settings' && value) {
        setDownloadPath(value.downloadPath || '');
        setAutoStart(value.isAutoStart || false);
      }
    });
  }, []);

  const handleSave = () => {
    const settings = { downloadPath, isAutoStart };
    window.Main.send('save-data', 'settings', settings);
    onClose();
  };

  const handleSelectPath = async () => {
    if (window.Main) {
      const path = await window.Main.invoke('select-path');
      if (path) {
        setDownloadPath(path);
      }
    } else {
      console.error('window.Main is not available');
    }
  };

  const handleOpenFolder = async () => {
    if (window.Main) {
      const success = await window.Main.openFolder(downloadPath);
      if (!success) {
        console.error('Failed to open folder');
      }
    } else {
      console.error('window.Main is not available');
    }
  };

  const handleOpenAppPath = async () => {
    if (window.Main) {
      const appPath = await window.Main.invoke('get-app-path');
      const success = await window.Main.openFolder(appPath);
      if (!success) {
        console.error('Failed to open app path');
      }
    } else {
      console.error('window.Main is not available');
    }
  };

  const handleOpenUserDataPath = async () => {
    if (window.Main) {
      const userDataPath = await window.Main.invoke('get-user-data-path');
      const success = await window.Main.openFolder(userDataPath);
      if (!success) {
        console.error('Failed to open user data path');
      }
    } else {
      console.error('window.Main is not available');
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-modal-content">
        <h2>{t('settings.title')}</h2>
        <div className="settings-item">
          <label>{t('settings.downloadPath')}:</label>
          <input
            type="text"
            value={downloadPath}
            readOnly
          />
          <button onClick={handleSelectPath}>{t('common.selectPath')}</button>
        </div>
        <div className="settings-item">
          <label>{t('settings.autoStart')}:</label>
          <input
            type="checkbox"
            checked={isAutoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
          />
        </div>
        <div className='flex gap-2 flex-wrap'>
          <button onClick={handleSave}>{t('settings.save')}</button>
          <button onClick={onClose}>{t('settings.close')}</button>
          <button onClick={handleOpenAppPath}>{t('common.openAppPath')}</button>
          <button onClick={handleOpenUserDataPath}>{t('common.openUserDataPath')}</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
