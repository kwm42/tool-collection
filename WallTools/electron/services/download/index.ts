import { join } from 'path';
import { createWriteStream, existsSync } from 'fs';
import { ipcMain } from 'electron';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { loadData } from '../../dataManager';
import { logMessage as log } from '../../logger';

interface DownloadItem {
  url: string;
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  retryCount: number;
}

const downloadQueue: DownloadItem[] = [];
const maxConcurrentDownloads = 3;
let activeDownloads = 0;

const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7897');

const getDownloadPath = () => {
  const settings = loadData('settings');
  console.log(settings)
  return settings?.downloadPath || 'F:/';
};

const startDownload = async (item: DownloadItem) => {
  if (activeDownloads >= maxConcurrentDownloads) {
    return;
  }

  const filePath = join(getDownloadPath(), item.filename);
  console.log(filePath, existsSync(filePath));
  if (existsSync(filePath)) {
    item.status = 'completed';
    ipcMain.emit('download-status', item);
    log('文件已存在，跳过下载' + item.filename);
    processQueue();
    return;
  }

  activeDownloads++;
  item.status = 'downloading';
  ipcMain.emit('download-status', item);
  log('开始下载' + item.filename);

  try {
    const response = await axios({
      url: item.url,
      method: 'GET',
      responseType: 'stream',
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
    });

    console.log(filePath);
    const fileStream = createWriteStream(filePath);
    response.data.pipe(fileStream);

    response.data.on('error', (error: any) => {
      item.status = 'failed';
      activeDownloads--;
      ipcMain.emit('download-status', item);
      log('下载失败' + item.filename + error.message);
      processQueue();
    });

    fileStream.on('finish', () => {
      item.status = 'completed';
      activeDownloads--;
      ipcMain.emit('download-status', item);
      log('下载完成' + item.filename);
      processQueue();
    });
  } catch (error) {
    item.status = 'failed';
    activeDownloads--;
    ipcMain.emit('download-status', item);
    log('下载失败' + item.filename);
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

ipcMain.on('download-file', (_event, url: string, filename: string) => {
  const downloadItem: DownloadItem = {
    url,
    filename,
    status: 'pending',
    retryCount: 0,
  };

  log('排队下载' + downloadItem.filename);
  downloadQueue.push(downloadItem);
  ipcMain.emit('download-status', downloadItem);
  processQueue();
});

ipcMain.on('retry-download', (_event: any, url: string) => {
  const item = downloadQueue.find((item) => item.url === url && item.status === 'failed');
  if (item) {
    item.status = 'pending';
    item.retryCount++;
    log('重试下载' + item.filename);
    ipcMain.emit('download-status', item);
    processQueue();
  }
});

export const getDownloadStatus = () => {
  return downloadQueue;
};
