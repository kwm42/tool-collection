import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './download_center.css';

const DownloadCenter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    const fetchDownloadStatus = async () => {
      const status = await window.Main.getDownloadStatus();
      setDownloads(status);
    };

    fetchDownloadStatus();
    const interval = setInterval(fetchDownloadStatus, 1000); // Refresh every second

    window.Main.onDownloadStatus((status) => {
      setDownloads((prevDownloads) => {
        const updatedDownloads = prevDownloads.map((download) =>
          download.url === status.url ? status : download
        );
        if (!updatedDownloads.find((download) => download.url === status.url)) {
          updatedDownloads.push(status);
        }
        return updatedDownloads;
      });
    });

    return () => clearInterval(interval);
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const currentDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'pending');
  const displayDownloads = currentDownloads.slice(0, 10);

  return (
    <div>
      <button className="floating-button" onClick={toggleVisibility}>
        {isVisible ? 'Close' : 'Open'} Download Center
      </button>
      {isVisible && (
        <div className="download-center">
          <h1>{t('common.downloadCenter')}</h1>
          <div className="download-section">
            <h2>{t('common.currentDownloads')} ({currentDownloads.length})</h2>
            <ul>
              {displayDownloads.map((download, index) => (
                <li key={index}>{download.filename} - {download.status}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadCenter;
