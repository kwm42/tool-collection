import { app } from 'electron';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const dataFilePath = join(app.getPath('userData'), 'appData.json');

export function saveData(key: string, value: any) {
  let data: { [key: string]: any } = {};
  if (existsSync(dataFilePath)) {
    const fileContent = readFileSync(dataFilePath, 'utf-8');
    data = JSON.parse(fileContent);
  }
  data[key] = value;
  writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function loadData(key: string) {
  if (existsSync(dataFilePath)) {
    const fileContent = readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data[key] !== undefined ? data[key] : null;
  }
  return null;
}
