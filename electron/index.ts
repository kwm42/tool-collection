// Native
import { join } from 'path';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, nativeTheme, shell } from 'electron';
import isDev from 'electron-is-dev';
import { saveData, loadData } from './dataManager';
import './services/index';
import { logMessage as log } from './logger';
import { getDownloadStatus } from './services/download';

const height = 900;
const width = 1500;

function createWindow() {
  log('Creating main window');
  // Create the browser window.
  const window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: true,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../dist-vite/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  log('Main window created and URL loaded');
  // Open the DevTools.
  // window.webContents.openDevTools();

  // For AppBar
  ipcMain.on('minimize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
    log('Window minimized');
  });
  ipcMain.on('maximize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMaximized() ? window.restore() : window.maximize();
    log('Window maximized');
  });

  ipcMain.on('close', () => {
    log('Window closed');
    window.close();
  });

  ipcMain.on('save-data', (event, key, value) => {
    saveData(key, value);
    event.sender.send('data-saved', key);
    log(`Data saved: ${key}`);
  });

  ipcMain.on('load-data', (event, key) => {
    const value = loadData(key);
    console.log('load-data', key, value);
    event.sender.send('data-loaded', key, value);
    log(`Data loaded: ${key}`);
  });

  ipcMain.on('open-download-folder', () => {
    const downloadPath = loadData('settings')?.downloadPath || 'F:/';
    shell.openPath(downloadPath);
  });

  nativeTheme.themeSource = 'dark';
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  log('App is ready');
  createWindow();

  app.on('activate', () => {
    log('App activated');
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  log(`Message received: ${message}`);
  console.log(message);
  setTimeout(() => event.sender.send('message', 'common.hiElectron'), 500);
});

ipcMain.handle('get-download-status', async () => {
  return getDownloadStatus();
});

ipcMain.on('open-url', (_event, url: string) => {
  shell.openExternal(url);
});
