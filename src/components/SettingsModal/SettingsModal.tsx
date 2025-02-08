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

  return (
    <div className="settings-modal">
      <div className="settings-modal-content">
        <h2>{t('settings.title')}</h2>
        <div className="settings-item">
          <label>{t('settings.downloadPath')}:</label>
          <input
            type="text"
            value={downloadPath}
            onChange={(e) => setDownloadPath(e.target.value)}
          />
        </div>
        <div className="settings-item">
          <label>{t('settings.autoStart')}:</label>
          <input
            type="checkbox"
            checked={isAutoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
          />
        </div>
        <button onClick={handleSave}>{t('settings.save')}</button>
        <button onClick={onClose}>{t('settings.close')}</button>
      </div>
    </div>
  );
}

export default SettingsModal;
