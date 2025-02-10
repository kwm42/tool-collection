import { app } from 'electron';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logDir = join(app.getPath('userData'), 'logs');
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const logFile = createWriteStream(join(logDir, 'app.log'), { flags: 'a' });

export function log(message: string) {
  const timestamp = new Date().toISOString();
  logFile.write(`[${timestamp}] ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
}
