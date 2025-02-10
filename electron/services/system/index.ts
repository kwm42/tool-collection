import { ipcMain, dialog, shell, app } from 'electron';

ipcMain.handle('select-path', async (_event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('open-folder', async (_event, folderPath: string) => {
  try {
    await shell.openPath(folderPath);
    return true;
  } catch (error) {
    console.error('Failed to open folder:', error);
    return false;
  }
});

ipcMain.handle('open-app-path', async () => {
  try {
    await shell.openPath(app.getAppPath());
    return true;
  } catch (error) {
    console.error('Failed to open app path:', error);
    return false;
  }
});

ipcMain.handle('open-user-data-path', async () => {
  try {
    await shell.openPath(app.getPath('userData'));
    return true;
  } catch (error) {
    console.error('Failed to open user data path:', error);
    return false;
  }
});

ipcMain.handle('get-app-path', async () => {
  return app.getAppPath();
});

ipcMain.handle('get-user-data-path', async () => {
  return app.getPath('userData');
});
