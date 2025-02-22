import { ipcMain, dialog, shell, app } from 'electron';
import { readdirSync, statSync, unlinkSync, renameSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

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

const findDuplicates = (dir: string, fileNames: { [key: string]: string[] }, folderDuplicates: { [key: string]: number }) => {
  const files = readdirSync(dir);
  const subDirs: string[] = [];

  // First, list all files and collect subdirectories
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      subDirs.push(filePath);
    } else {
      if (fileNames[file]) {
        fileNames[file].push(filePath);
        folderDuplicates[dir] = (folderDuplicates[dir] || 0) + 1;
      } else {
        fileNames[file] = [filePath];
      }
    }
  });

  // Then, process each subdirectory
  subDirs.forEach((subDir) => {
    findDuplicates(subDir, fileNames, folderDuplicates);
  });
};

let detectedDuplicates: { [key: string]: string[] } = {};

ipcMain.on('detect-duplicates', (event, folderPath: string) => {
  const fileNames: { [key: string]: string[] } = {};
  const folderDuplicates: { [key: string]: number } = {};
  findDuplicates(folderPath, fileNames, folderDuplicates);
  detectedDuplicates = Object.fromEntries(Object.entries(fileNames).filter(([_, paths]) => paths.length > 1));
  event.sender.send('duplicates-detected', { duplicates: detectedDuplicates, folderDuplicates });
});

ipcMain.on('open-file-location', (_event, filePath: string) => {
  shell.showItemInFolder(filePath);
});

ipcMain.on('delete-duplicates', (event, folderPath: string) => {
  console.log(`Deleting duplicates in folder: ${folderPath}`);

  Object.entries(detectedDuplicates).forEach(([fileName, paths]) => {
    console.log(`Duplicate file: ${fileName}`);
    if (paths[0].startsWith(folderPath)) {
      paths.slice(1).forEach((filePath) => {
        try {
          unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete file: ${filePath}`, error);
        }
      });
    }
  });

  event.sender.send('duplicates-deleted', folderPath);
});

ipcMain.on('move-duplicates', (event, folderPath: string) => {
  console.log(`Moving duplicates in folder: ${folderPath}`);
  const targetDir = 'F://duplicate';

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir);
  }

  Object.entries(detectedDuplicates).forEach(([fileName, paths]) => {
    console.log(`Duplicate file: ${fileName} ${JSON.stringify(paths)} ${folderPath}`);
    paths.forEach((filePath) => {
      console.log(`Duplicate file111: ${filePath} ${folderPath}`);
      if (filePath.includes(folderPath)) {
        try {
          const targetPath = join(targetDir, basename(filePath));
          renameSync(filePath, targetPath);
          console.log(`Moved file: ${filePath} to ${targetPath}`);
        } catch (error) {
          console.error(`Failed to move file: ${filePath}`, error);
        }
      }
    })
  });

  event.sender.send('duplicates-moved', folderPath);
});
