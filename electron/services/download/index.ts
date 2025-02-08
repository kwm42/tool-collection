import { join } from 'path';
import { createWriteStream } from 'fs';
import { ipcMain } from 'electron';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface DownloadItem {
  url: string;
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  retryCount: number;
}

const downloadQueue: DownloadItem[] = [];
const maxConcurrentDownloads = 3;
let activeDownloads = 0;

const downloadPath = 'D:/';

const log = (message: string, ...args: any[]) => {
  console.log(`[Download Service] ${message}`, ...args);
};

const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7897');

const startDownload = async (item: DownloadItem) => {
  if (activeDownloads >= maxConcurrentDownloads) {
    return;
  }

  activeDownloads++;
  item.status = 'downloading';
  ipcMain.emit('download-status', item);
  log('Starting download', item);

  try {
    const response = await axios({
      url: item.url,
      method: 'GET',
      responseType: 'stream',
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
    });

    const fileStream = createWriteStream(join(downloadPath, item.filename));
    response.data.pipe(fileStream);

    response.data.on('error', (error) => {
      item.status = 'failed';
      activeDownloads--;
      ipcMain.emit('download-status', item);
      log('Download failed', item, error);
      processQueue();
    });

    fileStream.on('finish', () => {
      item.status = 'completed';
      activeDownloads--;
      ipcMain.emit('download-status', item);
      log('Download completed', item);
      processQueue();
    });
  } catch (error) {
    item.status = 'failed';
    activeDownloads--;
    ipcMain.emit('download-status', item);
    log('Download failed', item, error);
    processQueue();
  }
};

const processQueue = () => {
  while (activeDownloads < maxConcurrentDownloads && downloadQueue.length > 0) {
    const nextItem = downloadQueue.shift();
    if (nextItem) {
      startDownload(nextItem);
    }
  }
};

ipcMain.on('download-file', (event, url: string, filename: string) => {
  const downloadItem: DownloadItem = {
    url,
    filename,
    status: 'pending',
    retryCount: 0,
  };

  log('Queueing download', downloadItem);
  downloadQueue.push(downloadItem);
  ipcMain.emit('download-status', downloadItem);
  processQueue();
});

ipcMain.on('retry-download', (event, url: string) => {
  const item = downloadQueue.find((item) => item.url === url && item.status === 'failed');
  if (item) {
    item.status = 'pending';
    item.retryCount++;
    log('Retrying download', item);
    ipcMain.emit('download-status', item);
    processQueue();
  }
});
